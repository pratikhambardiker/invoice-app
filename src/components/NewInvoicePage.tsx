"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { InvoiceForm } from "@/components/InvoiceForm";
import { useStore } from "@/components/StoreProvider";
import { blankInvoice } from "@/lib/seed";
import type { Client, Invoice, Settings } from "@/lib/types";

export function NewInvoicePage() {
  const { ready, settings, saveInvoice, clients } = useStore();
  const searchParams = useSearchParams();
  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white/70" />;
  }
  const prefill = clients.find((item) => item.id === searchParams.get("client"));
  return (
    <NewInvoiceForm
      settings={settings}
      saveInvoice={saveInvoice}
      prefill={prefill}
    />
  );
}

function NewInvoiceForm({
  settings,
  saveInvoice,
  prefill,
}: {
  settings: Settings;
  saveInvoice: ReturnType<typeof useStore>["saveInvoice"];
  prefill?: Client;
}) {
  const [draft] = useState<Invoice>(() => blankInvoice(settings, prefill));

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
