"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/signups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save signup");
      }

      setEmail("");
      setStatus("success");
      setMessage("You're on the list! We'll reach out soon with next steps.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-6 py-16 text-zinc-900">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div>
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-500"
          >
            ← Back to landing page
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-950">Join the beta</h1>
          <p className="mt-3 text-base text-zinc-600">
            Leave your Stanford email and we&apos;ll follow up with onboarding instructions when
            ASES Mutuals opens to new members.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <label htmlFor="email" className="text-sm font-medium text-zinc-800">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@stanford.edu"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <p className="mt-2 text-xs text-zinc-500">
            We&apos;ll only use this to share beta access and onboarding info.
          </p>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Submitting..." : "Request access"}
          </button>

          {message && (
            <p
              className={`mt-4 text-sm ${
                status === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}


