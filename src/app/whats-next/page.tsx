"use client";

import Link from "next/link";
import { Mail, Clock, Calendar, ArrowLeft, Sparkles, CheckCircle } from "lucide-react";

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

export default function WhatsNextPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <style>{styles}</style>
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      </div>

      <main className="relative min-h-screen px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to landing page
            </Link>
            <Logo className="mb-6" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-float">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tight text-slate-900">
                  What&apos;s Next?
                </h1>
                <p className="mt-2 text-lg text-slate-600 font-medium">
                  Thanks for completing the survey! Here&apos;s what happens next.
                </p>
              </div>
            </div>
          </div>

          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-indigo-400 rounded-3xl transform translate-x-2 translate-y-2 transition-transform group-hover:translate-x-4 group-hover:translate-y-4 border-2 border-slate-900"></div>
            <div className="relative bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="space-y-8">
                <section className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-100 border-2 border-pink-300 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                      A couple of email updates
                    </h2>
                    <p className="text-base text-slate-600 font-medium">
                      To match you with people you will vibe with, we will slightly extend our survey questions and ask you to fill it out.
                    </p>
                  </div>
                </section>

                <section className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 border-2 border-indigo-300 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                      Wait for your matches
                    </h2>
                    <p className="text-base text-slate-600 font-medium">
                      We will start the matching process after the break. Get hyped.
                    </p>
                  </div>
                </section>

                <section className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 border-2 border-purple-300 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                      Events on campus
                    </h2>
                    <p className="text-base text-slate-600 font-medium">
                      We will give you the perfect chance to have fun with your matches in person.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Back to Home
            </Link>
            <Link
              href="/survey"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-bold px-6 py-3 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#e2e8f0] shadow-[4px_4px_0px_0px_#e2e8f0]"
            >
              Update Survey
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

