// Author: Patrick Melan, April 25 2026

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      router.push(`/dashboard/${data.user.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6fa]">
      <header className="bg-[#07294d] px-6 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#ffc600]">DragonMates</h1>
            <p className="text-sm text-blue-200">Find your perfect roommate.</p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-[32px] border border-blue-900/20 bg-white shadow-xl shadow-blue-900/10">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-500">Sign in to your DragonMates account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-8 sm:px-8">
              <label className="block space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@drexel.edu"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#07294d] focus:outline-none focus:ring-2 focus:ring-[#07294d]"
                />
              </label>

              <label className="block space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#07294d] focus:outline-none focus:ring-2 focus:ring-[#07294d]"
                />
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#ffc600] px-5 py-3 text-sm font-semibold text-[#07294d] transition hover:bg-[#e6b200] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <p className="text-center text-xs uppercase tracking-[0.3em] text-slate-400">
                No account?{" "}
                <Link href="/register" className="text-[#07294d] hover:text-amber-500 transition">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
