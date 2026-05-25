"use client";

import { useState } from "react";
import { Heart, Handshake, Loader2 } from "lucide-react";

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

  // Handle Like function; runs when like button is clicked and isn't already "liked"
  async function handleLike() {
    // set loading status and no error
    setStatus("loading");
    setErrMsg(null);
    
    // try sending like request to API (/api/likes)
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked_id: likedId }),
      });

      // if response is ok or already liked (409), set status to liked
      if (res.ok || res.status === 409) {
        setStatus("liked");
      } else if (res.status === 401) {
        setStatus("unauth"); // return 401 if user is not authenticated
      } 
      // for other errors, parse message and set error status
      else {
        const body = await res.json().catch(() => ({}));
        setErrMsg(body.error ?? `Error ${res.status}`);
        setStatus("error");
      }
    } 
    // catch network erros and set error status
    catch {
      setErrMsg("Network error");
      setStatus("error");
    }
  }

  async function handleUnlike() {
    setStatus("loading");
    setErrMsg(null);
    try {
      const res = await fetch("/api/likes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked_id: likedId }),
      });
      if (res.ok) {
        setStatus("idle");
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
  onClick={status === "liked" ? handleUnlike : handleLike}
  disabled={status === "loading"}
  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#07294d] transition hover:bg-[#0a3a6e] disabled:opacity-50"
  aria-label={status === "liked" ? "Unlike" : "Like"}
>
  {status === "liked" ? <Heart size={18} className="text-rose-600 fill-rose-600" /> : status === "loading" ? <Loader2 size={18} className="animate-spin text-[#ffc600]" /> : <Handshake size={18} className="text-[#ffc600]" />}
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
      <div className="flex flex-col gap-1">
        <button
          onClick={handleUnlike}
          disabled={false}
          className="flex items-center gap-2 rounded-lg bg-green-100 px-6 py-3 font-semibold text-green-700 transition hover:bg-red-50 hover:text-red-600"
        >
          <Heart size={16} className="fill-rose-600 text-rose-600" /> Liked!
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleLike}
        disabled={status === "loading"}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#07294d] to-[#0a3a6e] px-6 py-3 font-semibold text-white shadow-md transition-all hover:from-[#0a3a6e] hover:to-[#07294d] disabled:opacity-50"      >
        {status === "loading" ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Handshake size={16} className="text-[#ffc600]" /> Like</>}
      </button>
      {status === "error" && errMsg && (
        <p className="text-xs text-red-500">{errMsg}</p>
      )}
    </div>
  );
}
