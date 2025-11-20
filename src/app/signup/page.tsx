"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const requestBody = {
        email: email.trim().toLowerCase(),
        password,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(instagram.trim()
          ? {
              instagram_handle: instagram.trim().startsWith("@")
                ? instagram.trim()
                : `@${instagram.trim()}`,
            }
          : {}),
      };

      const response = await fetch("/api/signups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type");
      const text = await response.text();
      
      type SignupResponse = {
        student?: { id?: string };
        surveyPath?: string;
        error?: string;
      };
      let responsePayload: SignupResponse = {};
      if (text && contentType?.includes("application/json")) {
        try {
          responsePayload = JSON.parse(text);
        } catch {
          throw new Error("Invalid response from server. Please try again.");
        }
      } else {
        // If response is not JSON or is empty, create a payload with error
        responsePayload = text 
          ? { error: text } 
          : { error: "Unable to save signup. Please try again." };
      }

      if (!response.ok) {
        throw new Error(responsePayload.error ?? "Unable to save signup");
      }

      if (!responsePayload?.student?.id) {
        throw new Error("Unable to create your account. Please try again.");
      }

      router.push(
        responsePayload.surveyPath ?? `/survey?studentId=${responsePayload.student.id}`,
      );
      setEmail("");
      setPassword("");
      setPhone("");
      setInstagram("");
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

          <label htmlFor="password" className="mt-6 block text-sm font-medium text-slate-800">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <p className="mt-2 text-xs text-slate-500">
            A simple password protects your survey responses until Stanford SSO logins ship.
          </p>

          <label htmlFor="phone" className="mt-6 block text-sm font-medium text-slate-800">
            Phone number <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(650) 555-1234"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />

          <label htmlFor="instagram" className="mt-6 block text-sm font-medium text-slate-800">
            Instagram handle <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="instagram"
            type="text"
            autoComplete="off"
            placeholder="@cardinal"
            value={instagram}
            onChange={(event) => setInstagram(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          
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


