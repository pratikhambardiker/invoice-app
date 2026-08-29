"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { upsertClientFromInvoice } from "@/lib/clients";
import { addDays, todayISO } from "@/lib/dates";
import { formatInvoiceNumber, nextSequenceFromNumber } from "@/lib/format";
import { uid } from "@/lib/id";
import { createSeedState, defaultSettings } from "@/lib/seed";
import { loadState, saveState } from "@/lib/storage";
import type { AppState, Client, Invoice, InvoiceStatus, Settings } from "@/lib/types";

type Store = {
  ready: boolean;
  settings: Settings;
  invoices: Invoice[];
  clients: Client[];
  hasSampleData: boolean;
  revision: number;
  saveSettings: (settings: Settings) => void;
  saveInvoice: (invoice: Invoice, options?: { bumpSequence?: boolean }) => void;
  deleteInvoice: (id: string) => void;
  duplicateInvoice: (id: string) => Invoice | null;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  saveClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  clearSampleData: () => void;
  resetAll: () => void;
};

const StoreContext = createContext<Store | null>(null);

const SERVER_STATE: AppState = {
  settings: defaultSettings(),
  invoices: [],
  clients: [],
};

let memory: AppState | null = null;
let revision = 0;
const listeners = new Set<() => void>();

function snapshot(): AppState {
  if (!memory) memory = loadState();
  return memory;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function commit(next: AppState) {
  memory = next;
  saveState(next);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function bumpSequenceIfNeeded(settings: Settings, invoiceNumber: string): Settings {
  const parsed = nextSequenceFromNumber(invoiceNumber, settings.invoiceNumberPrefix);
  if (!Number.isFinite(parsed)) return settings;
  if (parsed < settings.nextInvoiceSequence) return settings;
  return { ...settings, nextInvoiceSequence: parsed + 1 };
}

const noopSubscribe = () => () => {};

export function StoreProvider({ children }: { children: ReactNode }) {
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const state = useSyncExternalStore(subscribe, snapshot, () => SERVER_STATE);

  const saveSettings = useCallback((settings: Settings) => {
    commit({ ...snapshot(), settings });
  }, []);

  const saveInvoice = useCallback(
    (invoice: Invoice, options?: { bumpSequence?: boolean }) => {
      const prev = snapshot();
      const upserted = upsertClientFromInvoice(prev.clients, invoice);
      const saved = { ...invoice, clientId: upserted.clientId };
      const exists = prev.invoices.some((item) => item.id === saved.id);
      const invoices = exists
        ? prev.invoices.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...prev.invoices];
      const settings = options?.bumpSequence
        ? bumpSequenceIfNeeded(prev.settings, saved.number)
        : prev.settings;
      commit({ ...prev, settings, invoices, clients: upserted.clients });
    },
    [],
  );

  const deleteInvoice = useCallback((id: string) => {
    const prev = snapshot();
    commit({
      ...prev,
      invoices: prev.invoices.filter((item) => item.id !== id),
    });
  }, []);

  const duplicateInvoice = useCallback((id: string): Invoice | null => {
    const prev = snapshot();
    const source = prev.invoices.find((item) => item.id === id);
    if (!source) return null;
    const issueDate = todayISO();
    const copy: Invoice = {
      ...source,
      id: uid(),
      number: formatInvoiceNumber(
        prev.settings.invoiceNumberPrefix,
        prev.settings.nextInvoiceSequence,
      ),
      status: "draft",
      issueDate,
      dueDate: addDays(issueDate, prev.settings.defaultDueInDays || 0),
      items: source.items.map((item) => ({ ...item, id: uid() })),
      isSample: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: undefined,
      paidAt: undefined,
    };
    commit({
      ...prev,
      settings: {
        ...prev.settings,
        nextInvoiceSequence: prev.settings.nextInvoiceSequence + 1,
      },
      invoices: [copy, ...prev.invoices],
    });
    return copy;
  }, []);

  const setInvoiceStatus = useCallback((id: string, status: InvoiceStatus) => {
    const prev = snapshot();
    commit({
      ...prev,
      invoices: prev.invoices.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          status,
          updatedAt: new Date().toISOString(),
          sentAt:
            status === "sent"
              ? item.sentAt || todayISO()
              : status === "draft"
                ? undefined
                : item.sentAt,
          paidAt: status === "paid" ? todayISO() : undefined,
        };
      }),
    });
  }, []);

  const saveClient = useCallback((client: Client) => {
    const prev = snapshot();
    const exists = prev.clients.some((item) => item.id === client.id);
    const clients = exists
      ? prev.clients.map((item) => (item.id === client.id ? client : item))
      : [client, ...prev.clients];
    commit({ ...prev, clients });
  }, []);

  const deleteClient = useCallback((id: string) => {
    const prev = snapshot();
    commit({
      ...prev,
      clients: prev.clients.filter((item) => item.id !== id),
      invoices: prev.invoices.map((item) =>
        item.clientId === id ? { ...item, clientId: undefined } : item,
      ),
    });
  }, []);

  const clearSampleData = useCallback(() => {
    const prev = snapshot();
    const sampleClientIds = new Set(
      prev.clients.filter((item) => item.isSample).map((item) => item.id),
    );
    commit({
      ...prev,
      invoices: prev.invoices
        .filter((item) => !item.isSample)
        .map((item) =>
          item.clientId && sampleClientIds.has(item.clientId)
            ? { ...item, clientId: undefined }
            : item,
        ),
      clients: prev.clients.filter((item) => !item.isSample),
    });
  }, []);

  const resetAll = useCallback(() => {
    revision += 1;
    commit(createSeedState());
  }, []);

  const value = useMemo<Store>(
    () => ({
      ready,
      settings: state.settings,
      invoices: state.invoices,
      clients: state.clients,
      hasSampleData:
        state.invoices.some((item) => item.isSample) ||
        state.clients.some((item) => item.isSample),
      revision,
      saveSettings,
      saveInvoice,
      deleteInvoice,
      duplicateInvoice,
      setInvoiceStatus,
      saveClient,
      deleteClient,
      clearSampleData,
      resetAll,
    }),
    [
      ready,
      state,
      saveSettings,
      saveInvoice,
      deleteInvoice,
      duplicateInvoice,
      setInvoiceStatus,
      saveClient,
      deleteClient,
      clearSampleData,
      resetAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
