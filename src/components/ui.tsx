import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3 py-2.5 text-[15px] text-ink shadow-none outline-none transition placeholder:text-muted/70 focus:border-forest focus:ring-2 focus:ring-forest/15";

export const selectClass = `${inputClass} appearance-none bg-[length:1rem] bg-[right_0.7rem_center] bg-no-repeat pr-9`;

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium tracking-wide text-ink">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-xs leading-5 text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      {description ? (
        <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted">{description}</p>
      ) : null}
    </div>
  );
}
