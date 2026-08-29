"use client";

import { useState } from "react";
import { ClientForm } from "@/components/ClientForm";
import { useStore } from "@/components/StoreProvider";
import { blankClient } from "@/lib/seed";
import type { Client } from "@/lib/types";

export function NewClientPage() {
  const { ready, saveClient } = useStore();
  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white/70" />;
  }
  return <NewClientForm saveClient={saveClient} />;
}

function NewClientForm({
  saveClient,
}: {
  saveClient: (client: Client) => void;
}) {
  const [draft] = useState(() => blankClient());
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Create
      </p>
      <h1 className="mt-1 font-serif text-4xl tracking-tight">New client</h1>
      <p className="mt-2 mb-8 max-w-xl text-sm leading-6 text-muted">
        You’ll be able to pick this client when you write an invoice.
      </p>
      <ClientForm initial={draft} isNew onSave={saveClient} />
    </div>
  );
}
