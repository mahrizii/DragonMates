"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
];

const STEPS = [
  { label: "Account", description: "Create login credentials" },
  { label: "About", description: "Tell us where you call home" },
];

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  home_town: string;
  home_state: string;
  social_links: string[];
};

const INITIAL_FORM_STATE: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  confirm_password: "",
  home_town: "",
  home_state: "",
  social_links: [""],
};

export default function SignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM_STATE });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSocialChange(index: number, value: string) {
    setForm((prev) => {
      const updated = [...prev.social_links];
      updated[index] = value;
      return { ...prev, social_links: updated };
    });
  }

  function addSocialLink() {
    setForm((prev) => ({
      ...prev,
      social_links: [...prev.social_links, ""],
    }));
  }

  function removeSocialLink(index: number) {
    setForm((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }));
  }

  function validateStepOne(): string {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      return "Please enter your full name.";
    }

    if (!form.email.includes("@")) {
      return "Please use a valid email address.";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (form.password !== form.confirm_password) {
      return "Passwords do not match.";
    }

    return "";
  }

  function nextStep() {
    const validationError = validateStepOne();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.home_town.trim() || !form.home_state) {
      setError("Please tell us where you're from.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          social_links: form.social_links.filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      router.push("/profile/create");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const stepInfo = STEPS.map((item, index) => ({
    ...item,
    completed: index + 1 <= step,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6fa]">
      <header className="bg-[#07294d] px-6 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#ffc600]">DragonMates</h1>
            <p className="text-sm text-blue-200">Sign up and find your perfect roommate.</p>
          </div>
          <span className="text-sm text-blue-100">
            Step {step} of {STEPS.length}
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-4xl">
          <div className="rounded-[32px] border border-blue-900/20 bg-white shadow-xl shadow-blue-900/10">
            <div className="p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2 sm:items-center">
                {stepInfo.map((info, index) => (
                  <div key={info.label} className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                        info.completed
                          ? "bg-[#07294d] text-white"
                          : "border border-blue-100 text-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">{info.label}</p>
                      <p className="text-slate-500">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-8 sm:px-8">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      <span>First Name</span>
                      <input
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        placeholder="Jane"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#07294d] focus:outline-none focus:ring-2 focus:ring-[#07294d]"/>
                      </label>
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      <span>Last Name</span>
                      <input
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        placeholder="Smith"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#07294d] focus:outline-none focus:ring-2 focus:ring-[#07294d]"/>
                    </label>
                  </div>

                  <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    <span>Email</span>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@drexel.edu"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#07294d] focus:outline-none focus:ring-2 focus:ring-[#07294d]"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      <span>Password</span>
                      <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#07294d] focus:outline-none focus:ring-2 focus:ring-[#07294d]"
                      />
                    </label>
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      <span>Confirm Password</span>
                      <input
                        name="confirm_password"
                        type="password"
                        value={form.confirm_password}
                        onChange={handleChange}
                        placeholder="Repeat password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#07294d] focus:outline-none focus:ring-2 focus:ring-[#07294d]"
                      />
                    </label>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      <span>Hometown</span>
                      <input
                        name="home_town"
                        value={form.home_town}
                        onChange={handleChange}
                        placeholder="Philadelphia"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#07294d] focus:outline-none focus:ring-2 focus:ring-[#07294d]"
                      />
                    </label>
                    <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      <span>Home State</span>
                      <select
                        name="home_state"
                        value={form.home_state}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#07294d] focus:outline-none focus:ring-2 focus:ring-[#07294d]"
                      >
                        <option value="">Select...</option>
                        {US_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        Social Links
                      </p>
                      <button
                        type="button"
                        onClick={addSocialLink}
                        className="text-xs font-semibold text-[#07294d] transition hover:text-amber-500"
                      >
                        + Add another
                      </button>
                    </div>

                    <div className="space-y-3">
                      {form.social_links.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            value={link}
                            onChange={(e) => handleSocialChange(index, e.target.value)}
                            placeholder="https://instagram.com/yourhandle"
                            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-[#07294d] focus:outline-none focus:ring-2 focus:ring-[#07294d]"
                          />
                          {form.social_links.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSocialLink(index)}
                              className="h-fit rounded-2xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                )}

                {step === 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 rounded-2xl bg-[#07294d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3a6e]"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-[#ffc600] px-5 py-3 text-sm font-semibold text-[#07294d] transition hover:bg-[#e6b200] disabled:opacity-60"
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </button>
                )}
              </div>

              <p className="text-center text-xs uppercase tracking-[0.3em] text-slate-400">
                Already have an account? Contact your admin to access it.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
