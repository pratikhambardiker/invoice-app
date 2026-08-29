"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { InvoiceForm } from "@/components/InvoiceForm";
import { useStore } from "@/components/StoreProvider";

export function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { ready, invoices, settings, saveInvoice } = useStore();
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
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Back to invoices
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Edit
      </p>
      <h1 className="mt-1 font-serif text-4xl tracking-tight">{invoice.number}</h1>
      <p className="mt-2 mb-8 text-sm text-muted">
        Totals update as you type. Save when you’re happy with it.
      </p>
      <InvoiceForm
        initial={invoice}
        isNew={false}
        defaultDueInDays={settings.defaultDueInDays}
        onSave={saveInvoice}
      />
    </div>
  );
}
