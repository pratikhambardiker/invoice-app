import { initials } from "@/lib/format";

export function LogoAvatar({
  name,
  logoDataUrl,
  size = "md",
}: {
  name: string;
  logoDataUrl?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dimensions = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
  }[size];

  if (logoDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoDataUrl}
        alt={name ? `${name} logo` : "Business logo"}
        className={`${dimensions} rounded-full object-cover ring-1 ring-line`}
      />
    );
  }

  return (
    <div
      className={`${dimensions} flex items-center justify-center rounded-full bg-forest text-cream`}
      aria-hidden
    >
      <span className="font-serif">{initials(name)}</span>
    </div>
  );
}
