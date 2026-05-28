"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function DismissButton({ userId }: { userId: string }) {
  const router = useRouter();

  async function handleDismiss() {
    await fetch("/api/dismissals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed_id: userId }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={handleDismiss}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-400 text-white shadow-md shadow-amber-200 transition hover:from-amber-500 hover:to-yellow-500 cursor-pointer"
      aria-label="Dismiss suggestion"
      title="Dismiss"
    >
      <X size={14} strokeWidth={2.5} />
    </button>
  );
}
