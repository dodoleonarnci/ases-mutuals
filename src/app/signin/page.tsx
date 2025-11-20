"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const contentType = response.headers.get("content-type");
      const text = await response.text();

      type SigninResponse = {
        student?: { id?: string };
        surveyPath?: string;
        error?: string;
      };

      let responsePayload: SigninResponse = {};
      if (text && contentType?.includes("application/json")) {
        try {
          responsePayload = JSON.parse(text);
        } catch {
          throw new Error("Invalid response from server. Please try again.");
        }
      } else {
        responsePayload = text
          ? { error: text }
          : { error: "Unable to sign you in. Please try again." };
      }

      if (!response.ok) {
        throw new Error(responsePayload.error ?? "Unable to sign you in.");
      }

      if (!responsePayload?.student?.id) {
        throw new Error("We couldn't locate your student profile.");
      }

      router.push("/");
      setStatus("success");
      setEmail("");
      setPassword("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
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
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with the email and password you used for Mutuals signup. Need an account?{" "}
            <Link href="/signup" className="text-indigo-600 underline">
              Sign up here
            </Link>
            .
          </p>
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

          <label htmlFor="password" className="mt-6 block text-sm font-medium text-slate-800">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />

          {message && (
            <p
              className={`mt-4 text-sm ${
                status === "success" ? "text-indigo-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-50 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Signing you in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

