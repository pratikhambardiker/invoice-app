"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { useStore } from "@/components/StoreProvider";
import { invoicesForClient, outstandingForInvoices } from "@/lib/clients";
import { calcTotals } from "@/lib/calc";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { displayStatus } from "@/lib/status";
import { formatTotals } from "@/lib/totals";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, clients, invoices, settings, deleteClient } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const client = useMemo(
    () => clients.find((item) => item.id === id),
    [clients, id],
  );
  const related = useMemo(
    () => (client ? invoicesForClient(invoices, client) : []),
    [client, invoices],
  );
  const outstanding = useMemo(
    () => formatTotals(outstandingForInvoices(related), settings.currency),
    [related, settings.currency],
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
      <Link href="/clients" className="text-sm text-muted hover:text-ink">
        ← Clients
      </Link>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">{client.name}</h1>
          {client.email ? (
            <p className="mt-2 text-sm text-muted">{client.email}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/invoices/new?client=${client.id}`} className="btn-primary">
            New invoice
          </Link>
          <Link href={`/clients/${client.id}/edit`} className="btn-secondary">
            Edit
          </Link>
          <button
            type="button"
            className="btn-ghost text-terracotta"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Outstanding
          </p>
          <p className="mt-2 font-serif text-2xl">{outstanding}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Invoices
          </p>
          <p className="mt-2 font-serif text-2xl">{related.length}</p>
        </div>
      </div>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="font-serif text-xl">Details</h2>
        {client.address ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">
            {client.address}
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">No address saved.</p>
        )}
        {client.notes ? (
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              Notes
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{client.notes}</p>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl">Invoices</h2>
        {related.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No invoices for this client yet.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <table className="w-full text-sm">
              <thead className="bg-paper/80 text-left text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {related.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link href={`/invoices/${invoice.id}`} className="font-medium hover:underline">
                        {invoice.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatMoney(calcTotals(invoice).total, invoice.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={displayStatus(invoice)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this client?"
        body="Invoices stay in your list. This only removes them from the client directory."
        confirmLabel="Delete client"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteClient(client.id);
          router.push("/clients");
        }}
      />
    </div>
  );
}
