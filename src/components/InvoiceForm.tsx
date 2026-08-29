"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { useStore } from "@/components/StoreProvider";
import { Field, inputClass } from "@/components/ui";
import { calcTotals } from "@/lib/calc";
import { partyFromClient } from "@/lib/clients";
import { addDays } from "@/lib/dates";
import { fileToLogoDataUrl } from "@/lib/image";
import { formatMoney } from "@/lib/money";
import { blankLineItem } from "@/lib/seed";
import { CURRENCIES, type CurrencyCode, type Invoice } from "@/lib/types";

const textareaClass = `${inputClass} min-h-[96px] resize-y`;

export function InvoiceForm({
  initial,
  isNew,
  defaultDueInDays,
  onSave,
}: {
  initial: Invoice;
  isNew: boolean;
  defaultDueInDays: number;
  onSave: (invoice: Invoice, options?: { bumpSequence?: boolean }) => void;
}) {
  const router = useRouter();
  const { clients } = useStore();
  const [invoice, setInvoice] = useState<Invoice>(initial);
  const [dueDirty, setDueDirty] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const totals = useMemo(() => calcTotals(invoice), [invoice]);

  function patch(partial: Partial<Invoice>) {
    setInvoice((prev) => ({
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString(),
    }));
  }

  function patchBusiness(partial: Partial<Invoice["business"]>) {
    setInvoice((prev) => ({
      ...prev,
      business: { ...prev.business, ...partial },
      updatedAt: new Date().toISOString(),
    }));
  }

  function patchClient(partial: Partial<Invoice["client"]>) {
    setInvoice((prev) => ({
      ...prev,
      client: { ...prev.client, ...partial },
      updatedAt: new Date().toISOString(),
    }));
  }

  function updateItem(id: string, partial: Partial<Invoice["items"][number]>) {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...partial } : item)),
      updatedAt: new Date().toISOString(),
    }));
  }

  async function onLogo(file: File | undefined) {
    if (!file) return;
    setLogoError(null);
    try {
      const logoDataUrl = await fileToLogoDataUrl(file);
      patchBusiness({ logoDataUrl });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Could not use that image.");
    }
  }

  function handleIssueDate(issueDate: string) {
    if (!dueDirty) {
      patch({ issueDate, dueDate: addDays(issueDate, defaultDueInDays || 0) });
      return;
    }
    patch({ issueDate });
  }

  function handleSave() {
    if (!invoice.client.name.trim()) {
      setError("Add a client name before saving.");
      return;
    }
    const items = invoice.items.filter(
      (item) => item.description.trim() || item.unitPrice || item.quantity !== 1,
    );
    if (items.length === 0) {
      setError("Add at least one line item.");
      return;
    }
    setError(null);
    onSave(
      { ...invoice, items, status: invoice.status || "draft" },
      { bumpSequence: isNew },
    );
    router.push(`/invoices/${invoice.id}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
      <div className="space-y-8">
        <section className="card p-5 sm:p-6">
          <h2 className="font-serif text-xl">Your business</h2>
          <p className="mt-1 text-sm text-muted">
            This appears at the top of the invoice.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Business name">
              <input
                className={inputClass}
                value={invoice.business.name}
                onChange={(event) => patchBusiness({ name: event.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                className={inputClass}
                type="email"
                value={invoice.business.email}
                onChange={(event) => patchBusiness({ email: event.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <textarea
                  className={textareaClass}
                  value={invoice.business.address}
                  onChange={(event) => patchBusiness({ address: event.target.value })}
                />
              </Field>
            </div>
            <Field label="Logo" hint="Optional. A square image works best. If you skip this, we use your initials.">
              <input
                className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-forest file:px-3 file:py-1.5 file:text-sm file:text-cream"
                type="file"
                accept="image/*"
                onChange={(event) => onLogo(event.target.files?.[0])}
              />
            </Field>
            {invoice.business.logoDataUrl ? (
              <div className="flex items-end">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => patchBusiness({ logoDataUrl: undefined })}
                >
                  Remove logo
                </button>
              </div>
            ) : null}
          </div>
          {logoError ? <p className="mt-3 text-sm text-terracotta">{logoError}</p> : null}
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-serif text-xl">Client</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {clients.length > 0 ? (
              <div className="sm:col-span-2">
                <Field
                  label="Choose client"
                  hint="Picking a saved client fills the fields. You can still edit them for this invoice."
                >
                  <select
                    className={inputClass}
                    value={invoice.clientId ?? ""}
                    onChange={(event) => {
                      const id = event.target.value;
                      if (!id) {
                        patch({
                          clientId: undefined,
                          client: { name: "", email: "", address: "" },
                        });
                        return;
                      }
                      const chosen = clients.find((item) => item.id === id);
                      if (!chosen) return;
                      patch({
                        clientId: chosen.id,
                        client: partyFromClient(chosen),
                      });
                    }}
                  >
                    <option value="">New client — type the details below</option>
                    {clients.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                        {item.email ? ` · ${item.email}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            ) : null}
            <Field label="Client name">
              <input
                className={inputClass}
                value={invoice.client.name}
                onChange={(event) => patchClient({ name: event.target.value })}
                placeholder="Studio, company, or person"
              />
            </Field>
            <Field label="Email">
              <input
                className={inputClass}
                type="email"
                value={invoice.client.email}
                onChange={(event) => patchClient({ email: event.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <textarea
                  className={textareaClass}
                  value={invoice.client.address}
                  onChange={(event) => patchClient({ address: event.target.value })}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-serif text-xl">Invoice details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Invoice number">
              <input
                className={inputClass}
                value={invoice.number}
                onChange={(event) => patch({ number: event.target.value })}
              />
            </Field>
            <Field label="Currency">
              <select
                className={inputClass}
                value={invoice.currency}
                onChange={(event) =>
                  patch({ currency: event.target.value as CurrencyCode })
                }
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} — {currency.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Issue date">
              <input
                className={inputClass}
                type="date"
                value={invoice.issueDate}
                onChange={(event) => handleIssueDate(event.target.value)}
              />
            </Field>
            <Field label="Due date">
              <input
                className={inputClass}
                type="date"
                value={invoice.dueDate}
                onChange={(event) => {
                  setDueDirty(true);
                  patch({ dueDate: event.target.value });
                }}
              />
            </Field>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-serif text-xl">Line items</h2>
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => patch({ items: [...invoice.items, blankLineItem()] })}
            >
              Add item
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {invoice.items.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-[1fr_5.5rem_8rem_auto]"
              >
                <Field label={index === 0 ? "Description" : "Description"}>
                  <input
                    className={inputClass}
                    value={item.description}
                    placeholder="What was the work?"
                    onChange={(event) =>
                      updateItem(item.id, { description: event.target.value })
                    }
                  />
                </Field>
                <Field label="Qty">
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.id, { quantity: Number(event.target.value) })
                    }
                  />
                </Field>
                <Field label="Unit price">
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) =>
                      updateItem(item.id, { unitPrice: Number(event.target.value) })
                    }
                  />
                </Field>
                <div className="flex items-end">
                  <button
                    type="button"
                    className="btn-ghost text-sm"
                    onClick={() =>
                      patch({
                        items:
                          invoice.items.length === 1
                            ? [blankLineItem()]
                            : invoice.items.filter((row) => row.id !== item.id),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-serif text-xl">Tax, discount & notes</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Tax %" hint="Use 0 if you don’t charge tax. UAE VAT is often 5%.">
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={invoice.taxPercent}
                onChange={(event) => patch({ taxPercent: Number(event.target.value) })}
              />
            </Field>
            <Field label="Discount" hint={`Optional amount in ${invoice.currency}, taken off before tax.`}>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={invoice.discount}
                onChange={(event) => patch({ discount: Number(event.target.value) })}
              />
            </Field>
            <Field label="Notes">
              <textarea
                className={textareaClass}
                value={invoice.notes}
                onChange={(event) => patch({ notes: event.target.value })}
                placeholder="Say thank you, or add a project name."
              />
            </Field>
            <Field label="Payment terms">
              <textarea
                className={textareaClass}
                value={invoice.paymentTerms}
                onChange={(event) => patch({ paymentTerms: event.target.value })}
              />
            </Field>
          </div>
        </section>

        {error ? <p className="text-sm text-terracotta">{error}</p> : null}

        <div className="no-print flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            {isNew ? "Save invoice" : "Save changes"}
          </button>
        </div>
      </div>

      <aside className="no-print lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Live total
          </p>
          <p className="mt-2 font-serif text-3xl">
            {formatMoney(totals.total, invoice.currency)}
          </p>
          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(totals.subtotal, invoice.currency)}</dd>
            </div>
            {totals.discount > 0 ? (
              <div className="flex justify-between text-muted">
                <dt>Discount</dt>
                <dd className="tabular-nums">
                  −{formatMoney(totals.discount, invoice.currency)}
                </dd>
              </div>
            ) : null}
            {invoice.taxPercent > 0 ? (
              <div className="flex justify-between text-muted">
                <dt>Tax ({invoice.taxPercent}%)</dt>
                <dd className="tabular-nums">{formatMoney(totals.tax, invoice.currency)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="mt-4 hidden overflow-hidden rounded-2xl ring-1 ring-line lg:block">
          <div className="origin-top scale-[0.92]">
            <InvoiceDocument invoice={invoice} compact />
          </div>
        </div>
      </aside>

      <div className="no-print sticky bottom-0 -mx-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Total</p>
            <p className="font-serif text-xl">
              {formatMoney(totals.total, invoice.currency)}
            </p>
          </div>
          <button type="button" className="btn-primary" onClick={handleSave}>
            {isNew ? "Save invoice" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
