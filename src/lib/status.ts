import { isPastDue } from "./dates";
import type { DisplayStatus, Invoice } from "./types";

export function displayStatus(invoice: Invoice): DisplayStatus {
  if (invoice.status === "sent" && isPastDue(invoice.dueDate)) return "overdue";
  return invoice.status;
}

export const STATUS_LABEL: Record<DisplayStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
};
