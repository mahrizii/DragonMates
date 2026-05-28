"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function SuggestedShell({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);

  function handleDismiss() {
    setDismissed(true);
    fetch("/api/dismissals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed_id: userId }),
    });
  }

  if (dismissed) {
    return (
      <div className="relative rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
        {children}
      </div>
    );
  }

  return (
    <div className="relative mt-4 rounded-[28px] border-2 border-amber-400 bg-white p-6 shadow-sm shadow-amber-100 transition duration-300 hover:-translate-y-1 hover:shadow-amber-200">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-4 py-1.5 text-xs font-bold tracking-wide text-white shadow-md shadow-amber-200">
          ⭐ Suggested for you
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute -right-3 -top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-400 text-white shadow-md shadow-amber-200 transition hover:from-amber-500 hover:to-yellow-500"
        aria-label="Dismiss suggestion"
        title="Dismiss"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
      {children}
    </div>
  );
}
