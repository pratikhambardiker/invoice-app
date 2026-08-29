import { LogoAvatar } from "@/components/LogoAvatar";
import { calcTotals, lineTotal } from "@/lib/calc";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import type { Invoice } from "@/lib/types";

export function InvoiceDocument({
  invoice,
  compact = false,
}: {
  invoice: Invoice;
  compact?: boolean;
}) {
  const totals = calcTotals(invoice);
  const pad = compact ? "p-6 sm:p-8" : "p-8 sm:p-12";

  return (
    <article
      className={`invoice-sheet bg-white text-ink ${pad}`}
      aria-label={`Invoice ${invoice.number || "draft"}`}
    >
      <header className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <LogoAvatar
            name={invoice.business.name || "You"}
            logoDataUrl={invoice.business.logoDataUrl}
            size="lg"
          />
          <div>
            <p className="font-serif text-xl leading-tight">
              {invoice.business.name || "Your business"}
            </p>
            {invoice.business.address ? (
              <p className="mt-2 whitespace-pre-line text-[13px] leading-5 text-muted">
                {invoice.business.address}
              </p>
            ) : null}
            {invoice.business.email ? (
              <p className="mt-1 text-[13px] text-muted">{invoice.business.email}</p>
            ) : null}
          </div>
        </div>
        <div className="text-right">
          <p className="font-serif text-4xl tracking-tight text-ink">Invoice</p>
          <p className="mt-2 font-medium text-ink">{invoice.number || "—"}</p>
        </div>
      </header>

      <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            Bill to
          </p>
          <p className="mt-2 font-medium">{invoice.client.name || "Client name"}</p>
          {invoice.client.address ? (
            <p className="mt-1 whitespace-pre-line text-[13px] leading-5 text-muted">
              {invoice.client.address}
            </p>
          ) : null}
          {invoice.client.email ? (
            <p className="mt-1 text-[13px] text-muted">{invoice.client.email}</p>
          ) : null}
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:justify-self-end sm:text-right">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              Issued
            </dt>
            <dd className="mt-1">{formatDate(invoice.issueDate)}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              Due
            </dt>
            <dd className="mt-1">{formatDate(invoice.dueDate)}</dd>
          </div>
        </dl>
      </div>

      <table className="mt-10 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-ink/80 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            <th className="py-2 pr-3 font-medium">Description</th>
            <th className="py-2 px-3 text-right font-medium">Qty</th>
            <th className="py-2 px-3 text-right font-medium">Price</th>
            <th className="py-2 pl-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.items.length ? invoice.items : [{ id: "empty", description: "", quantity: 0, unitPrice: 0 }]).map(
            (item) => (
              <tr key={item.id} className="border-b border-line">
                <td className="py-3 pr-3 align-top">
                  {item.description || <span className="text-muted">Item</span>}
                </td>
                <td className="py-3 px-3 text-right align-top tabular-nums">
                  {item.quantity || 0}
                </td>
                <td className="py-3 px-3 text-right align-top tabular-nums">
                  {formatMoney(item.unitPrice || 0, invoice.currency)}
                </td>
                <td className="py-3 pl-3 text-right align-top tabular-nums">
                  {formatMoney(lineTotal(item), invoice.currency)}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <dl className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between gap-8">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{formatMoney(totals.subtotal, invoice.currency)}</dd>
          </div>
          {totals.discount > 0 ? (
            <div className="flex justify-between gap-8">
              <dt className="text-muted">Discount</dt>
              <dd className="tabular-nums">
                −{formatMoney(totals.discount, invoice.currency)}
              </dd>
            </div>
          ) : null}
          {invoice.taxPercent > 0 ? (
            <div className="flex justify-between gap-8">
              <dt className="text-muted">Tax ({invoice.taxPercent}%)</dt>
              <dd className="tabular-nums">{formatMoney(totals.tax, invoice.currency)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-8 border-t border-ink pt-3 font-medium">
            <dt>Total due</dt>
            <dd className="font-serif text-xl tabular-nums">
              {formatMoney(totals.total, invoice.currency)}
            </dd>
          </div>
        </dl>
      </div>

      {(invoice.notes || invoice.paymentTerms) && (
        <footer className="mt-12 grid gap-6 border-t border-line pt-6 text-[13px] leading-6 text-muted sm:grid-cols-2">
          {invoice.notes ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink">
                Notes
              </p>
              <p className="mt-2 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          ) : (
            <div />
          )}
          {invoice.paymentTerms ? (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink">
                Payment terms
              </p>
              <p className="mt-2 whitespace-pre-wrap">{invoice.paymentTerms}</p>
            </div>
          ) : null}
        </footer>
      )}
    </article>
  );
}
