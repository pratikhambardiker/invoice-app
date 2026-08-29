export const CURRENCIES = [
  { code: "AED", label: "UAE Dirham", locale: "en-AE" },
  { code: "USD", label: "US Dollar", locale: "en-US" },
  { code: "EUR", label: "Euro", locale: "en-IE" },
  { code: "GBP", label: "British Pound", locale: "en-GB" },
  { code: "INR", label: "Indian Rupee", locale: "en-IN" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export type InvoiceStatus = "draft" | "sent" | "paid";
export type DisplayStatus = InvoiceStatus | "overdue";

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Party = {
  name: string;
  email: string;
  address: string;
  logoDataUrl?: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  address: string;
  notes?: string;
  isSample?: boolean;
};

export type Invoice = {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  business: Party;
  clientId?: string;
  client: Party;
  items: LineItem[];
  taxPercent: number;
  discount: number;
  notes: string;
  paymentTerms: string;
  isSample?: boolean;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  paidAt?: string;
};

export type Settings = {
  business: Party;
  currency: CurrencyCode;
  defaultTaxPercent: number;
  defaultDueInDays: number;
  invoiceNumberPrefix: string;
  nextInvoiceSequence: number;
};

export type AppState = {
  settings: Settings;
  invoices: Invoice[];
  clients: Client[];
};

export const STORAGE_KEY = "quill-invoices-v1";
