"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { StatusBadge } from "@/components/StatusBadge";
import { Toast, useToast } from "@/components/Toast";
import { useStore } from "@/components/StoreProvider";
import { reminderEmail } from "@/lib/reminder";
import { displayStatus } from "@/lib/status";

export function InvoicePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, invoices, deleteInvoice, duplicateInvoice, setInvoiceStatus } =
    useStore();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const invoice = useMemo(
    () => invoices.find((item) => item.id === id),
    [invoices, id],
  );

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white/70" />;
  }

  if (!invoice) {
    return (
      <div className="card p-10 text-center">
        <p className="font-serif text-2xl">Invoice not found</p>
        <p className="mt-2 text-sm text-muted">
          It may have been deleted, or you’re in a different browser.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Back to invoices
        </Link>
      </div>
    );
  }

  function printInvoice() {
    window.print();
  }

  return (
    <div>
      <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="text-sm text-muted hover:text-ink">
            ← Invoices
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-4xl tracking-tight">{invoice.number}</h1>
            <StatusBadge status={displayStatus(invoice)} />
          </div>
          <p className="mt-2 text-sm text-muted">{invoice.client.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/invoices/${invoice.id}/edit`} className="btn-secondary">
            Edit
          </Link>
          <button type="button" className="btn-secondary" onClick={printInvoice}>
            Print
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={printInvoice}
            title="In the print window, choose Save as PDF"
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="no-print mb-6 flex flex-wrap gap-2">
        {invoice.status === "draft" ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setInvoiceStatus(invoice.id, "sent");
              toast.show("Marked as sent");
            }}
          >
            Mark as sent
          </button>
        ) : null}
        {invoice.status !== "paid" ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setInvoiceStatus(invoice.id, "paid");
              toast.show("Marked as paid");
            }}
          >
            Mark as paid
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setInvoiceStatus(invoice.id, "sent");
              toast.show("Marked unpaid");
            }}
          >
            Mark unpaid
          </button>
        )}
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            const copy = duplicateInvoice(invoice.id);
            if (copy) router.push(`/invoices/${copy.id}/edit`);
          }}
        >
          Duplicate
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={async () => {
            const { subject, body } = reminderEmail(invoice);
            await navigator.clipboard.writeText(`${subject}\n\n${body}`);
            toast.show("Reminder email copied");
          }}
        >
          Copy reminder
        </button>
        <button type="button" className="btn-ghost text-terracotta" onClick={() => setConfirmDelete(true)}>
          Delete
        </button>
      </div>

      <p className="no-print mb-4 text-sm text-muted">
        Download PDF opens the print window — choose “Save as PDF” as the printer.
      </p>

      <div className="overflow-hidden rounded-2xl ring-1 ring-line print:rounded-none print:ring-0">
        <InvoiceDocument invoice={invoice} />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this invoice?"
        body={`${invoice.number} will be removed from this browser. This cannot be undone.`}
        confirmLabel="Delete invoice"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteInvoice(invoice.id);
          router.push("/");
        }}
      />
      <Toast message={toast.message} onClear={toast.clear} />
    </div>
  );
}
