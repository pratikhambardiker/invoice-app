"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { invoicesForClient, outstandingForInvoices } from "@/lib/clients";
import { formatTotals } from "@/lib/totals";

export function ClientsPage() {
  const { ready, clients, invoices, settings } = useStore();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients
      .filter((client) => {
        if (!q) return true;
        return (
          client.name.toLowerCase().includes(q) ||
          client.email.toLowerCase().includes(q)
        );
      })
      .map((client) => {
        const related = invoicesForClient(invoices, client);
        return {
          client,
          count: related.length,
          outstanding: formatTotals(
            outstandingForInvoices(related),
            settings.currency,
          ),
        };
      });
  }, [clients, invoices, query, settings.currency]);

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-2xl bg-white/70" />;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Directory
          </p>
          <h1 className="mt-1 font-serif text-4xl tracking-tight">Clients</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Save the people you invoice so you don’t retype them. Open a client to
            see what they owe.
          </p>
        </div>
        <Link href="/clients/new" className="btn-primary">
          New client
        </Link>
      </div>

      <div className="mt-6">
        <input
          className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 sm:max-w-sm"
          placeholder="Search name or email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center ring-1 ring-line">
          <p className="font-serif text-2xl">No clients yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            {clients.length === 0
              ? "Add a client here, or they’ll be saved automatically when you create an invoice."
              : "Nothing matches that search."}
          </p>
          {clients.length === 0 ? (
            <Link href="/clients/new" className="btn-primary mt-6 inline-flex">
              Add client
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-2xl bg-white ring-1 ring-line md:block">
            <table className="w-full text-sm">
              <thead className="bg-paper/80 text-left text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Invoices</th>
                  <th className="px-4 py-3 font-medium">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ client, count, outstanding }) => (
                  <tr key={client.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${client.id}`} className="font-medium hover:underline">
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{client.email || "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{count}</td>
                    <td className="px-4 py-3 tabular-nums">{outstanding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {rows.map(({ client, count, outstanding }) => (
              <Link key={client.id} href={`/clients/${client.id}`} className="card block p-4">
                <p className="font-medium">{client.name}</p>
                <p className="mt-1 text-sm text-muted">{client.email || "No email"}</p>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-muted">
                    {count} invoice{count === 1 ? "" : "s"}
                  </span>
                  <span className="font-serif text-lg">{outstanding}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
