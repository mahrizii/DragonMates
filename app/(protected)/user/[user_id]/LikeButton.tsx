"use client";

import { useState } from "react";

export default function LikeButton({
  likedId,
  initiallyLiked,
}: {
  likedId: string;
  initiallyLiked: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "liked" | "error">(
    initiallyLiked ? "liked" : "idle",
  );

  async function handleLike() {
    setStatus("loading");
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liked_id: likedId }),
    });
    if (res.ok || res.status === 409) {
      setStatus("liked");
    } else {
      setStatus("error");
    }
  }

  if (status === "liked") {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 font-semibold rounded-lg">
        <span>❤️</span> Liked!
      </div>
    );
  }

  return (
    <button
      onClick={handleLike}
      disabled={status === "loading"}
      className="px-6 py-3 bg-gradient-to-r from-[#07294d] to-[#0a3a6e] text-white font-semibold rounded-lg hover:from-[#0a3a6e] hover:to-[#07294d] transition-all shadow-md disabled:opacity-50">
      {status === "loading"
        ? "Sending…"
        : status === "error"
          ? "Try again"
          : "🤝 Like"}
    </button>
  );
}
