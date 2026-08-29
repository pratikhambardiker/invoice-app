import { addDays, todayISO } from "./dates";
import { formatInvoiceNumber } from "./format";
import { uid } from "./id";
import { partyFromClient } from "./clients";
import type { AppState, Client, Invoice, Settings } from "./types";

export function defaultSettings(): Settings {
  return {
    business: {
      name: "Mina Studio",
      email: "hello@minastudio.ae",
      address: "Alserkal Avenue, Warehouse 23\nAl Quoz 1, Dubai, UAE",
    },
    currency: "AED",
    defaultTaxPercent: 5,
    defaultDueInDays: 14,
    invoiceNumberPrefix: "INV-",
    nextInvoiceSequence: 1044,
  };
}

export function createSeedState(): AppState {
  const settings = defaultSettings();
  const today = todayISO();

  const palm: Client = {
    id: uid(),
    name: "Palm Court Hotels",
    email: "accounts@palmcourt.ae",
    address: "Palm Jumeirah, East Crescent\nDubai, UAE",
    isSample: true,
  };
  const harbor: Client = {
    id: uid(),
    name: "Bright Harbor Ventures",
    email: "finance@brightharbor.com",
    address: "Index Tower, Unit 2304\nDIFC, Dubai, UAE",
    isSample: true,
  };
  const noor: Client = {
    id: uid(),
    name: "Noor Wellness Clinic",
    email: "ops@noorwellness.ae",
    address: "Jumeirah Beach Road, Villa 18\nDubai, UAE",
    isSample: true,
  };
  const clients = [palm, harbor, noor];

  const invoices: Invoice[] = [
    {
      id: uid(),
      number: "INV-1041",
      status: "paid",
      issueDate: addDays(today, -42),
      dueDate: addDays(today, -28),
      currency: "AED",
      business: { ...settings.business },
      clientId: palm.id,
      client: partyFromClient(palm),
      items: [
        {
          id: uid(),
          description: "Brand identity refresh — logo, colour, type",
          quantity: 1,
          unitPrice: 8500,
        },
        {
          id: uid(),
          description: "Guest-facing print suite (menu, keycard, signage)",
          quantity: 1,
          unitPrice: 3200,
        },
      ],
      taxPercent: 5,
      discount: 0,
      notes: "Thank you for a lovely collaboration on the Palm Court refresh.",
      paymentTerms: "Payment due within 14 days. Bank transfer preferred.",
      isSample: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: addDays(today, -42),
      paidAt: addDays(today, -30),
    },
    {
      id: uid(),
      number: "INV-1042",
      status: "sent",
      issueDate: addDays(today, -6),
      dueDate: addDays(today, 8),
      currency: "AED",
      business: { ...settings.business },
      clientId: harbor.id,
      client: partyFromClient(harbor),
      items: [
        {
          id: uid(),
          description: "Marketing website design and build",
          quantity: 1,
          unitPrice: 14000,
        },
        {
          id: uid(),
          description: "CMS training session (2 hours)",
          quantity: 2,
          unitPrice: 450,
        },
      ],
      taxPercent: 5,
      discount: 500,
      notes: "",
      paymentTerms: "Payment due within 14 days. Bank transfer preferred.",
      isSample: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: addDays(today, -6),
    },
    {
      id: uid(),
      number: "INV-1043",
      status: "sent",
      issueDate: addDays(today, -32),
      dueDate: addDays(today, -11),
      currency: "AED",
      business: { ...settings.business },
      clientId: noor.id,
      client: partyFromClient(noor),
      items: [
        {
          id: uid(),
          description: "On-location photography — clinic interiors",
          quantity: 1,
          unitPrice: 2800,
        },
        {
          id: uid(),
          description: "Portrait session — practitioners",
          quantity: 1,
          unitPrice: 1600,
        },
        {
          id: uid(),
          description: "Retouching and delivery (20 selects)",
          quantity: 1,
          unitPrice: 900,
        },
      ],
      taxPercent: 5,
      discount: 0,
      notes: "Selects delivered via Dropbox on the shoot date.",
      paymentTerms: "Payment due within 14 days. Bank transfer preferred.",
      isSample: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: addDays(today, -32),
    },
  ];

  return { settings, invoices, clients };
}

export function blankLineItem() {
  return { id: uid(), description: "", quantity: 1, unitPrice: 0 };
}

export function blankClient(): Client {
  return { id: uid(), name: "", email: "", address: "", notes: "" };
}

export function blankInvoice(settings: Settings, client?: Client): Invoice {
  const issueDate = todayISO();
  return {
    id: uid(),
    number: formatInvoiceNumber(settings.invoiceNumberPrefix, settings.nextInvoiceSequence),
    status: "draft",
    issueDate,
    dueDate: addDays(issueDate, settings.defaultDueInDays || 0),
    currency: settings.currency,
    business: { ...settings.business },
    clientId: client?.id,
    client: client
      ? partyFromClient(client)
      : { name: "", email: "", address: "" },
    items: [blankLineItem()],
    taxPercent: settings.defaultTaxPercent,
    discount: 0,
    notes: "",
    paymentTerms:
      settings.defaultDueInDays > 0
        ? `Payment is due within ${settings.defaultDueInDays} days of the invoice date.`
        : "Payment is due upon receipt.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
