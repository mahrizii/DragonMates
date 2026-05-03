"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "liked" | "error" | "unauth";

export default function LikeButton({
  likedId,
  initiallyLiked,
  compact = false,
}: {
  likedId: string;
  initiallyLiked: boolean;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<Status>(initiallyLiked ? "liked" : "idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function handleLike() {
    setStatus("loading");
    setErrMsg(null);
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked_id: likedId }),
      });
      if (res.ok || res.status === 409) {
        setStatus("liked");
      } else if (res.status === 401) {
        setStatus("unauth");
      } else {
        const body = await res.json().catch(() => ({}));
        setErrMsg(body.error ?? `Error ${res.status}`);
        setStatus("error");
      }
    } catch {
      setErrMsg("Network error");
      setStatus("error");
    }
  }

  if (compact) {
    if (status === "unauth") return <span className="text-xs text-gray-400">Log in to like</span>;
    if (status === "error") return (
      <span className="max-w-[120px] text-right text-xs text-red-500" title={errMsg ?? undefined}>
        {errMsg ?? "Error"}
      </span>
    );
    return (
      <button
        onClick={status === "liked" ? undefined : handleLike}
        disabled={status === "loading"}
        className="text-2xl transition-transform hover:scale-110 disabled:opacity-50"
        aria-label={status === "liked" ? "Liked" : "Like"}
      >
        {status === "liked" ? "❤️" : status === "loading" ? "⏳" : "🤝"}
      </button>
    );
  }

  if (status === "unauth") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-500">
        Log in to like
      </div>
    );
  }

  if (status === "liked") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-100 px-6 py-3 font-semibold text-green-700">
        <span>❤️</span> Liked!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleLike}
        disabled={status === "loading"}
        className="rounded-lg bg-gradient-to-r from-[#07294d] to-[#0a3a6e] px-6 py-3 font-semibold text-white shadow-md transition-all hover:from-[#0a3a6e] hover:to-[#07294d] disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "🤝 Like"}
      </button>
      {status === "error" && errMsg && (
        <p className="text-xs text-red-500">{errMsg}</p>
      )}
    </div>
  );
}
