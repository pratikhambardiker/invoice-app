"use client";

import { useState } from "react";
import { InvoiceForm } from "@/components/InvoiceForm";
import { useStore } from "@/components/StoreProvider";
import { blankInvoice } from "@/lib/seed";
import type { Invoice } from "@/lib/types";

export function NewInvoicePage() {
  const { ready, settings, saveInvoice } = useStore();
  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white/70" />;
  }
  return (
    <NewInvoiceForm
      settings={settings}
      saveInvoice={saveInvoice}
    />
  );
}

function NewInvoiceForm({
  settings,
  saveInvoice,
}: {
  settings: ReturnType<typeof useStore>["settings"];
  saveInvoice: ReturnType<typeof useStore>["saveInvoice"];
}) {
  const [draft] = useState<Invoice>(() => blankInvoice(settings));

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Create
      </p>
      <h1 className="mt-1 font-serif text-4xl tracking-tight">New invoice</h1>
      <p className="mt-2 mb-8 max-w-xl text-sm leading-6 text-muted">
        Your saved business details are filled in. Add the client and line items —
        the total updates as you type.
      </p>
      <InvoiceForm
        initial={draft}
        isNew
        defaultDueInDays={settings.defaultDueInDays}
        onSave={saveInvoice}
      />
    </div>
  );
}
