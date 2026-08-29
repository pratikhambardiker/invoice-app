"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClientForm } from "@/components/ClientForm";
import { useStore } from "@/components/StoreProvider";

export function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, clients, saveClient } = useStore();
  const client = useMemo(
    () => clients.find((item) => item.id === id),
    [clients, id],
  );

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white/70" />;
  }

  if (!client) {
    return (
      <div className="card p-10 text-center">
        <p className="font-serif text-2xl">Client not found</p>
        <Link href="/clients" className="btn-primary mt-6 inline-flex">
          Back to clients
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Edit
      </p>
      <h1 className="mt-1 font-serif text-4xl tracking-tight">{client.name}</h1>
      <p className="mt-2 mb-8 text-sm text-muted">
        Existing invoices keep the details they were saved with.
      </p>
      <ClientForm initial={client} isNew={false} onSave={saveClient} />
    </div>
  );
}
