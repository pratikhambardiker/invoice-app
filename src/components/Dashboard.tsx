"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Toast, useToast } from "@/components/Toast";
import { useStore } from "@/components/StoreProvider";
import { calcTotals } from "@/lib/calc";
import { invoicesToCsv, downloadCsv } from "@/lib/csv";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { reminderEmail } from "@/lib/reminder";
import { displayStatus } from "@/lib/status";
import type { CurrencyCode, DisplayStatus, Invoice } from "@/lib/types";

const FILTERS: { id: "all" | DisplayStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "paid", label: "Paid" },
  { id: "overdue", label: "Overdue" },
];

export function Dashboard() {
  const router = useRouter();
  const {
    ready,
    settings,
    invoices,
    hasSampleData,
    clearSampleData,
    deleteInvoice,
    duplicateInvoice,
    setInvoiceStatus,
  } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const status = displayStatus(invoice);
      if (filter !== "all" && status !== filter) return false;
      if (!q) return true;
      return (
        invoice.client.name.toLowerCase().includes(q) ||
        invoice.number.toLowerCase().includes(q)
      );
    });
  }, [invoices, query, filter]);

  const stats = useMemo(() => {
    const outstanding = new Map<CurrencyCode, number>();
    const paid = new Map<CurrencyCode, number>();
    let overdueCount = 0;
    for (const invoice of invoices) {
      const total = calcTotals(invoice).total;
      const status = displayStatus(invoice);
      if (status === "paid") addAmount(paid, invoice.currency, total);
      if (status === "sent" || status === "overdue") {
        addAmount(outstanding, invoice.currency, total);
      }
      if (status === "overdue") overdueCount += 1;
    }
    return { outstanding, paid, overdueCount };
  }, [invoices]);

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-2xl bg-white/70" />;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Overview
          </p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight">Invoices</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Create, send, and keep track of what you’re owed. Everything stays in this
            browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              downloadCsv("invoices.csv", invoicesToCsv(invoices));
              toast.show("CSV downloaded");
            }}
            disabled={invoices.length === 0}
          >
            Export CSV
          </button>
          <Link href="/invoices/new" className="btn-primary">
            New invoice
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Outstanding"
          value={formatTotals(stats.outstanding, settings.currency)}
        />
        <Stat
          label="Paid (all time)"
          value={formatTotals(stats.paid, settings.currency)}
        />
        <Stat
          label="Overdue"
          value={`${stats.overdueCount} invoice${stats.overdueCount === 1 ? "" : "s"}`}
        />
      </div>

      {hasSampleData ? (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-dashed border-forest/30 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-ink">
            These are sample invoices so you can look around. Clear them when you’re
            ready to use your own.
          </p>
          <button type="button" className="btn-secondary shrink-0" onClick={clearSampleData}>
            Clear sample data
          </button>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 sm:max-w-sm"
          placeholder="Search client or invoice number"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                filter === item.id
                  ? "bg-ink text-cream"
                  : "bg-white text-muted ring-1 ring-line hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center ring-1 ring-line">
          <p className="font-serif text-2xl">No invoices yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {invoices.length === 0
              ? "Create your first invoice. It will be saved in this browser."
              : "Nothing matches that search or filter."}
          </p>
          {invoices.length === 0 ? (
            <Link href="/invoices/new" className="btn-primary mt-6 inline-flex">
              Create invoice
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-2xl bg-white ring-1 ring-line md:block">
            <table className="w-full text-sm">
              <thead className="bg-paper/80 text-left text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link href={`/invoices/${invoice.id}`} className="font-medium hover:underline">
                        {invoice.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{invoice.client.name}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatMoney(calcTotals(invoice).total, invoice.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={displayStatus(invoice)} />
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        invoice={invoice}
                        onDelete={() => setPendingDelete(invoice)}
                        onDuplicate={() => {
                          const copy = duplicateInvoice(invoice.id);
                          if (copy) {
                            toast.show("Duplicated as a draft");
                            router.push(`/invoices/${copy.id}/edit`);
                          }
                        }}
                        onStatus={(status) => {
                          setInvoiceStatus(invoice.id, status);
                          toast.show(
                            status === "paid"
                              ? "Marked as paid"
                              : status === "sent"
                                ? "Marked as sent"
                                : "Moved back to draft",
                          );
                        }}
                        onReminder={async () => {
                          const { subject, body } = reminderEmail(invoice);
                          await navigator.clipboard.writeText(`${subject}\n\n${body}`);
                          toast.show("Reminder copied");
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {visible.map((invoice) => (
              <article key={invoice.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/invoices/${invoice.id}`} className="font-medium">
                      {invoice.number}
                    </Link>
                    <p className="mt-1 text-sm text-muted">{invoice.client.name}</p>
                  </div>
                  <StatusBadge status={displayStatus(invoice)} />
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-sm text-muted">Due {formatDate(invoice.dueDate)}</p>
                  <p className="font-serif text-xl">
                    {formatMoney(calcTotals(invoice).total, invoice.currency)}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/invoices/${invoice.id}`} className="btn-secondary text-sm">
                    View
                  </Link>
                  <Link href={`/invoices/${invoice.id}/edit`} className="btn-secondary text-sm">
                    Edit
                  </Link>
                  {invoice.status !== "paid" ? (
                    <button
                      type="button"
                      className="btn-secondary text-sm"
                      onClick={() => setInvoiceStatus(invoice.id, "paid")}
                    >
                      Mark paid
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn-ghost text-sm"
                    onClick={() => setPendingDelete(invoice)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this invoice?"
        body={
          pendingDelete
            ? `${pendingDelete.number} for ${pendingDelete.client.name || "this client"} will be removed from this browser. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete invoice"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteInvoice(pendingDelete.id);
          toast.show("Invoice deleted");
        }}
      />
      <Toast message={toast.message} onClear={toast.clear} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}

function RowActions({
  invoice,
  onDelete,
  onDuplicate,
  onStatus,
  onReminder,
}: {
  invoice: Invoice;
  onDelete: () => void;
  onDuplicate: () => void;
  onStatus: (status: Invoice["status"]) => void;
  onReminder: () => void;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2 text-sm">
      <Link href={`/invoices/${invoice.id}`} className="text-ink underline-offset-2 hover:underline">
        View
      </Link>
      <Link
        href={`/invoices/${invoice.id}/edit`}
        className="text-ink underline-offset-2 hover:underline"
      >
        Edit
      </Link>
      {invoice.status === "draft" ? (
        <button type="button" className="text-ink underline-offset-2 hover:underline" onClick={() => onStatus("sent")}>
          Mark sent
        </button>
      ) : null}
      {invoice.status !== "paid" ? (
        <button type="button" className="text-ink underline-offset-2 hover:underline" onClick={() => onStatus("paid")}>
          Mark paid
        </button>
      ) : null}
      <button type="button" className="text-ink underline-offset-2 hover:underline" onClick={onDuplicate}>
        Duplicate
      </button>
      {invoice.status !== "draft" && invoice.status !== "paid" ? (
        <button type="button" className="text-ink underline-offset-2 hover:underline" onClick={onReminder}>
          Copy reminder
        </button>
      ) : null}
      <button type="button" className="text-terracotta underline-offset-2 hover:underline" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}

function addAmount(
  totals: Map<CurrencyCode, number>,
  currency: CurrencyCode,
  amount: number,
) {
  totals.set(currency, (totals.get(currency) ?? 0) + amount);
}

function formatTotals(
  totals: Map<CurrencyCode, number>,
  fallback: CurrencyCode,
): string {
  if (totals.size === 0) return formatMoney(0, fallback);
  return [...totals.entries()]
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" · ");
}
