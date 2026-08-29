"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "@/components/ui";
import type { Client } from "@/lib/types";

const textareaClass = `${inputClass} min-h-[96px] resize-y`;

export function ClientForm({
  initial,
  isNew,
  onSave,
}: {
  initial: Client;
  isNew: boolean;
  onSave: (client: Client) => void;
}) {
  const router = useRouter();
  const [client, setClient] = useState<Client>(initial);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!client.name.trim()) {
      setError("Add a name before saving.");
      return;
    }
    onSave({
      ...client,
      name: client.name.trim(),
      email: client.email.trim(),
    });
    router.push(`/clients/${client.id}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="card p-5 sm:p-6">
        <div className="grid gap-4">
          <Field label="Name">
            <input
              className={inputClass}
              value={client.name}
              onChange={(event) => setClient({ ...client, name: event.target.value })}
              placeholder="Studio, company, or person"
            />
          </Field>
          <Field label="Email">
            <input
              className={inputClass}
              type="email"
              value={client.email}
              onChange={(event) => setClient({ ...client, email: event.target.value })}
            />
          </Field>
          <Field label="Address">
            <textarea
              className={textareaClass}
              value={client.address}
              onChange={(event) => setClient({ ...client, address: event.target.value })}
            />
          </Field>
          <Field label="Notes" hint="Only you see this. It does not appear on invoices.">
            <textarea
              className={textareaClass}
              value={client.notes ?? ""}
              onChange={(event) => setClient({ ...client, notes: event.target.value })}
            />
          </Field>
        </div>
      </section>
      {error ? <p className="text-sm text-terracotta">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={handleSave}>
          {isNew ? "Save client" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
