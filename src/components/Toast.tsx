"use client";

import { useEffect, useState } from "react";

export function Toast({
  message,
  onClear,
}: {
  message: string | null;
  onClear: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClear, 2800);
    return () => window.clearTimeout(timer);
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div className="no-print pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="rounded-full bg-ink px-4 py-2 text-sm text-cream shadow-lg">
        {message}
      </div>
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  return {
    message,
    show: setMessage,
    clear: () => setMessage(null),
  };
}
