import { calcTotals } from "./calc";
import { uid } from "./id";
import { displayStatus } from "./status";
import { addAmount } from "./totals";
import type { AppState, Client, CurrencyCode, Invoice, Party } from "./types";

export function clientKey(name: string, email: string): string {
  return `${name.trim().toLowerCase()}|${email.trim().toLowerCase()}`;
}

export function partyFromClient(client: Client): Party {
  return {
    name: client.name,
    email: client.email,
    address: client.address,
  };
}

export function outstandingForInvoices(invoices: Invoice[]): Map<CurrencyCode, number> {
  const totals = new Map<CurrencyCode, number>();
  for (const invoice of invoices) {
    const status = displayStatus(invoice);
    if (status === "sent" || status === "overdue") {
      addAmount(totals, invoice.currency, calcTotals(invoice).total);
    }
  }
  return totals;
}

export function invoicesForClient(invoices: Invoice[], client: Client): Invoice[] {
  return invoices.filter((invoice) => {
    if (invoice.clientId && invoice.clientId === client.id) return true;
    if (invoice.clientId) return false;
    return clientKey(invoice.client.name, invoice.client.email) === clientKey(client.name, client.email);
  });
}

export function upsertClientFromInvoice(
  clients: Client[],
  invoice: Invoice,
): { clients: Client[]; clientId?: string } {
  const name = invoice.client.name.trim();
  if (!name) return { clients, clientId: invoice.clientId };

  const snapshot = {
    name: invoice.client.name.trim(),
    email: invoice.client.email.trim(),
    address: invoice.client.address,
  };

  if (invoice.clientId) {
    const existing = clients.find((item) => item.id === invoice.clientId);
    if (existing) {
      return {
        clients: clients.map((item) =>
          item.id === existing.id ? { ...item, ...snapshot } : item,
        ),
        clientId: existing.id,
      };
    }
  }

  const key = clientKey(snapshot.name, snapshot.email);
  const match = clients.find((item) => clientKey(item.name, item.email) === key);
  if (match) {
    return {
      clients: clients.map((item) =>
        item.id === match.id ? { ...item, ...snapshot } : item,
      ),
      clientId: match.id,
    };
  }

  const created: Client = { id: uid(), ...snapshot };
  return { clients: [created, ...clients], clientId: created.id };
}

export function ensureClients(state: AppState): AppState {
  const clients = Array.isArray(state.clients) ? [...state.clients] : [];
  const invoices = state.invoices.map((invoice) => {
    if (invoice.clientId && clients.some((item) => item.id === invoice.clientId)) {
      return invoice;
    }
    const name = invoice.client?.name?.trim() ?? "";
    if (!name) return { ...invoice, clientId: undefined };
    const key = clientKey(name, invoice.client.email ?? "");
    let found = clients.find((item) => clientKey(item.name, item.email) === key);
    if (!found) {
      found = {
        id: uid(),
        name: invoice.client.name,
        email: invoice.client.email,
        address: invoice.client.address,
        isSample: invoice.isSample,
      };
      clients.push(found);
    }
    return { ...invoice, clientId: found.id };
  });
  return { ...state, clients, invoices };
}
