import { Suspense } from "react";
import { NewInvoicePage } from "@/components/NewInvoicePage";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/70" />}>
      <NewInvoicePage />
    </Suspense>
  );
}
