"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { addDays, todayISO } from "@/lib/dates";
import { formatInvoiceNumber, nextSequenceFromNumber } from "@/lib/format";
import { uid } from "@/lib/id";
import { createSeedState, defaultSettings } from "@/lib/seed";
import { loadState, saveState } from "@/lib/storage";
import type { AppState, Invoice, InvoiceStatus, Settings } from "@/lib/types";

type Store = {
  ready: boolean;
  settings: Settings;
  invoices: Invoice[];
  hasSampleData: boolean;
  revision: number;
  saveSettings: (settings: Settings) => void;
  saveInvoice: (invoice: Invoice, options?: { bumpSequence?: boolean }) => void;
  deleteInvoice: (id: string) => void;
  duplicateInvoice: (id: string) => Invoice | null;
  setInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  clearSampleData: () => void;
  resetAll: () => void;
};

const StoreContext = createContext<Store | null>(null);

const SERVER_STATE: AppState = {
  settings: defaultSettings(),
  invoices: [],
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
      const exists = prev.invoices.some((item) => item.id === invoice.id);
      const invoices = exists
        ? prev.invoices.map((item) => (item.id === invoice.id ? invoice : item))
        : [invoice, ...prev.invoices];
      const settings = options?.bumpSequence
        ? bumpSequenceIfNeeded(prev.settings, invoice.number)
        : prev.settings;
      commit({ settings, invoices });
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

  const clearSampleData = useCallback(() => {
    const prev = snapshot();
    commit({
      ...prev,
      invoices: prev.invoices.filter((item) => !item.isSample),
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
      hasSampleData: state.invoices.some((item) => item.isSample),
      revision,
      saveSettings,
      saveInvoice,
      deleteInvoice,
      duplicateInvoice,
      setInvoiceStatus,
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
