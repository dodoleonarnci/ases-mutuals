"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

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

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type");
      const text = await response.text();
      
      let payload: any;
      if (text && contentType?.includes("application/json")) {
        try {
          payload = JSON.parse(text);
        } catch (parseError) {
          throw new Error("Invalid response from server. Please try again.");
        }
      } else {
        // If response is not JSON or is empty, create a payload with error
        payload = text 
          ? { error: text } 
          : { error: "Unable to save signup. Please try again." };
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save signup");
      }

      if (!payload?.student?.id) {
        throw new Error("Unable to create your account. Please try again.");
      }

      router.push(payload.surveyPath ?? `/survey?studentId=${payload.student.id}`);
      setEmail("");
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f4fb] px-6 py-16 text-slate-900">
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div>
          <Link
            href="/"
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
          >
            ← Back to landing page
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">Wanna get matched?</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#d3d3ec] bg-white p-6 shadow-sm"
        >
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
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
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <p className="mt-2 text-xs text-slate-500">
            We&apos;ll only use this to share beta access and onboarding info.
          </p>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-50 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Submitting..." : "Sign me up!"}
          </button>

          {message && (
            <p
              className={`mt-4 text-sm ${
                status === "success" ? "text-indigo-600" : "text-red-600"
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


