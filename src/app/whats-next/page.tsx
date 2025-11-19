"use client";

import Link from "next/link";

export default function WhatsNextPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-6 py-16 text-zinc-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-950">
            What&apos;s Next?
          </h1>
          <p className="mt-3 text-base text-zinc-600">
            Thanks for completing the survey! Here&apos;s what happens next.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-zinc-900">
                [Section Title 1]
              </h2>
              <p className="mt-2 text-base text-zinc-600">
                [Add your content here. This is a template section that you can customize with information about what happens next in the matching process.]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-zinc-900">
                [Section Title 2]
              </h2>
              <p className="mt-2 text-base text-zinc-600">
                [Add your content here. You can include details about when matches will be available, how to access them, or any other relevant information.]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-zinc-900">
                [Section Title 3]
              </h2>
              <p className="mt-2 text-base text-zinc-600">
                [Add your content here. This could include information about updating your profile, connecting with matches, or other next steps.]
              </p>
            </section>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Back to Home
          </Link>
          <Link
            href="/survey"
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
          >
            Update Survey
          </Link>
        </div>
      </div>
    </main>
  );
}

