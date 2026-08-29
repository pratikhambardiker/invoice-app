import { calcTotals } from "./calc";
import { formatDate } from "./dates";
import { formatMoney } from "./money";
import type { Invoice } from "./types";

export function reminderEmail(invoice: Invoice): { subject: string; body: string } {
  const total = formatMoney(calcTotals(invoice).total, invoice.currency);
  const due = formatDate(invoice.dueDate);
  const subject = `Reminder: invoice ${invoice.number} is due ${due}`;
  const greeting = invoice.client.name
    ? `Hello ${invoice.client.name.split(" ")[0]},`
    : "Hello,";
  const body = [
    greeting,
    "",
    `This is a friendly reminder that invoice ${invoice.number} for ${total} is due on ${due}.`,
    "",
    invoice.paymentTerms ? `${invoice.paymentTerms}` : "",
    "",
    "Please let me know if you have already sent payment, or if you need a copy of the invoice.",
    "",
    "Thank you,",
    invoice.business.name || "Your name",
  ]
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .join("\n")
    .trim();

  return { subject, body };
}
