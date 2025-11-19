"use client";

import Link from "next/link";

export default function WhatsNextPage() {
  return (
    <main className="min-h-screen bg-[#f4f4fb] px-6 py-16 text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            What&apos;s Next?
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Thanks for completing the survey! Here&apos;s what happens next.
          </p>
        </div>

        <div className="rounded-3xl border border-[#d3d3ec] bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                A couple of email updates
              </h2>
              <p className="mt-2 text-base text-slate-600">
                To match you with people you will vibe with, we will slightly extend our survey questions and ask you to fill it out.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                Wait for your matches
              </h2>
              <p className="mt-2 text-base text-slate-600">
                We will start the matrching process after the break. Get hyped.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900">
                Events on campus
              </h2>
              <p className="mt-2 text-base text-slate-600">
                We will give you the perfect chance to have fun with your matches in person.
              </p>
            </section>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-50 transition hover:bg-slate-900"
          >
            Back to Home
          </Link>
          <Link
            href="/survey"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Update Survey
          </Link>
        </div>
      </div>
    </main>
  );
}

