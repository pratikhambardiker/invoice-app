import { ensureClients } from "./clients";
import { createSeedState } from "./seed";
import type { AppState } from "./types";
import { STORAGE_KEY } from "./types";

export function loadState(): AppState {
  if (typeof window === "undefined") return createSeedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed?.settings || !Array.isArray(parsed.invoices)) {
      return createSeedState();
    }
    return ensureClients({
      settings: parsed.settings,
      invoices: parsed.invoices,
      clients: Array.isArray(parsed.clients) ? parsed.clients : [],
    });
  } catch {
    return createSeedState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearPersistedState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
