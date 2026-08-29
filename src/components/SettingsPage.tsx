"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Field, inputClass } from "@/components/ui";
import { Toast, useToast } from "@/components/Toast";
import { useStore } from "@/components/StoreProvider";
import { fileToLogoDataUrl } from "@/lib/image";
import { CURRENCIES, type CurrencyCode, type Settings } from "@/lib/types";

const textareaClass = `${inputClass} min-h-[96px] resize-y`;

export function SettingsPage() {
  const store = useStore();
  if (!store.ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-white/70" />;
  }
  return <SettingsEditor key={store.revision} />;
}

function SettingsEditor() {
  const { settings, saveSettings, hasSampleData, clearSampleData, resetAll } =
    useStore();
  const toast = useToast();
  const [form, setForm] = useState<Settings>(settings);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function patch(partial: Partial<Settings>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function patchBusiness(partial: Partial<Settings["business"]>) {
    setForm((prev) => ({ ...prev, business: { ...prev.business, ...partial } }));
  }

  async function onLogo(file: File | undefined) {
    if (!file) return;
    setLogoError(null);
    try {
      patchBusiness({ logoDataUrl: await fileToLogoDataUrl(file) });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Could not use that image.");
    }
  }

  function handleSave() {
    if (!form.business.name.trim()) {
      toast.show("Please add a business name");
      return;
    }
    saveSettings({
      ...form,
      defaultTaxPercent: Number(form.defaultTaxPercent) || 0,
      defaultDueInDays: Math.max(0, Number(form.defaultDueInDays) || 0),
      nextInvoiceSequence: Math.max(1, Number(form.nextInvoiceSequence) || 1),
      invoiceNumberPrefix: form.invoiceNumberPrefix.trim() || "INV-",
    });
    toast.show("Settings saved");
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Preferences
      </p>
      <h1 className="mt-1 font-serif text-4xl tracking-tight">Settings</h1>
      <p className="mt-2 mb-8 text-sm leading-6 text-muted">
        These details are copied onto new invoices. You can still change them on any
        single invoice.
      </p>

      <section className="card p-5 sm:p-6">
        <h2 className="font-serif text-xl">Your business</h2>
        <div className="mt-5 grid gap-4">
          <Field label="Business name">
            <input
              className={inputClass}
              value={form.business.name}
              onChange={(event) => patchBusiness({ name: event.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              className={inputClass}
              type="email"
              value={form.business.email}
              onChange={(event) => patchBusiness({ email: event.target.value })}
            />
          </Field>
          <Field label="Address">
            <textarea
              className={textareaClass}
              value={form.business.address}
              onChange={(event) => patchBusiness({ address: event.target.value })}
            />
          </Field>
          <Field
            label="Logo"
            hint="Optional. Used on invoices, or we’ll show your initials instead."
          >
            <input
              className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-forest file:px-3 file:py-1.5 file:text-sm file:text-cream"
              type="file"
              accept="image/*"
              onChange={(event) => onLogo(event.target.files?.[0])}
            />
          </Field>
          {form.business.logoDataUrl ? (
            <button
              type="button"
              className="btn-ghost w-fit"
              onClick={() => patchBusiness({ logoDataUrl: undefined })}
            >
              Remove logo
            </button>
          ) : null}
          {logoError ? <p className="text-sm text-terracotta">{logoError}</p> : null}
        </div>
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="font-serif text-xl">Invoice defaults</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Default currency">
            <select
              className={inputClass}
              value={form.currency}
              onChange={(event) => patch({ currency: event.target.value as CurrencyCode })}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} — {currency.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Default tax %" hint="UAE VAT is often 5. Use 0 if you don’t charge tax.">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.defaultTaxPercent}
              onChange={(event) =>
                patch({ defaultTaxPercent: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Due in (days)" hint="New invoices set the due date this many days after the issue date.">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="1"
              value={form.defaultDueInDays}
              onChange={(event) =>
                patch({ defaultDueInDays: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Invoice number prefix" hint="Example: INV- becomes INV-1044.">
            <input
              className={inputClass}
              value={form.invoiceNumberPrefix}
              onChange={(event) => patch({ invoiceNumberPrefix: event.target.value })}
            />
          </Field>
          <Field label="Next invoice number" hint="The number used for your next new invoice.">
            <input
              className={inputClass}
              type="number"
              min="1"
              step="1"
              value={form.nextInvoiceSequence}
              onChange={(event) =>
                patch({ nextInvoiceSequence: Number(event.target.value) })
              }
            />
          </Field>
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <button type="button" className="btn-primary" onClick={handleSave}>
          Save settings
        </button>
      </div>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-serif text-xl">Data on this device</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Quill stores invoices only in this browser. They are not uploaded anywhere.
          Clearing your browser data, or opening a different browser, will look empty.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {hasSampleData ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                clearSampleData();
                toast.show("Sample invoices removed");
              }}
            >
              Clear sample data
            </button>
          ) : null}
          <button type="button" className="btn-ghost text-terracotta" onClick={() => setConfirmReset(true)}>
            Reset everything
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all data?"
        body="This replaces your invoices and settings with the original sample data."
        confirmLabel="Reset"
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll();
          toast.show("Reset to sample data");
        }}
      />
      <Toast message={toast.message} onClear={toast.clear} />
    </div>
  );
}
