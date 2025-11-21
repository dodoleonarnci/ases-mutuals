"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowLeft, Sparkles } from "lucide-react";

const styles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
`;

const Logo = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative w-10 h-10 flex-shrink-0">
      <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[#6366f1] mix-blend-multiply opacity-90"></div>
      <div className="absolute right-0 bottom-0 w-7 h-7 rounded-full bg-[#ec4899] mix-blend-multiply opacity-90"></div>
    </div>
    <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">Mutuals</span>
  </div>
);

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
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <style>{styles}</style>
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      </div>

      <main className="relative min-h-screen flex items-center justify-center px-6 py-16">
        <div className="mx-auto flex max-w-2xl w-full gap-12 items-center">
          {/* Left side - Illustration */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-full blur-3xl opacity-30"></div>
              <div className="relative bg-white border-2 border-slate-900 rounded-3xl p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-float">
                    <LogIn className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">Welcome back!</h3>
                    <p className="text-slate-600 font-medium">Ready to connect?</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-pink-100 border-2 border-pink-300 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-pink-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex-1 max-w-md w-full">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to landing page
            </Link>

            <div className="mb-8">
              <Logo className="mb-6" />
              <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4">
                Welcome back
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Sign in with the email and password you used for Mutuals signup. Need an account?{" "}
                <Link href="/signup" className="text-indigo-600 font-bold underline hover:text-indigo-700">
                  Sign up here
                </Link>
                .
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative group"
            >
              <div className="absolute inset-0 bg-indigo-400 rounded-3xl transform translate-x-2 translate-y-2 transition-transform group-hover:translate-x-4 group-hover:translate-y-4 border-2 border-slate-900"></div>
              <div className="relative bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">
                  Email
                </label>
                <div className="relative mb-6">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@stanford.edu"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-300 pl-12 pr-4 py-3.5 text-base text-slate-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </div>

                <label htmlFor="password" className="block text-sm font-bold text-slate-900 mb-2">
                  Password
                </label>
                <div className="relative mb-6">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-300 pl-12 pr-4 py-3.5 text-base text-slate-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </div>

                {message && (
                  <div className={`mb-6 rounded-2xl border-2 px-4 py-3 text-sm font-bold ${
                    status === "success" 
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700" 
                      : "border-red-300 bg-red-50 text-red-700"
                  }`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing you in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign in
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

