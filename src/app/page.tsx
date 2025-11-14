import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-6 py-16 text-zinc-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Stanford ASES Mutuals
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-950">
            Next.js + Supabase starter for friendships, students, and matches
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-zinc-600">
            This workspace is wired for a Vercel-hosted Next.js frontend, API Routes
            that deploy as serverless functions, and a Supabase Postgres backend.
            Plug in your credentials, run the SQL migration, and you can start
            sending data through the entire stack immediately.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">Ready to get matched?</h2>
            <p className="mt-2 text-sm text-zinc-700">
              Drop your email to join the first cohort of ASES Mutuals beta testers.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Join the waitlist
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Next.js frontend",
              body: "App Router + Tailwind for rapid UI. All networking happens through internal API Routes so the browser never touches your service role key.",
              action: "src/app/page.tsx",
            },
            {
              title: "API Routes",
              body: "Serverless endpoints at /api/students, /api/friendships, and /api/matches use zod validation and Supabase service clients.",
              action: "src/app/api/*",
            },
            {
              title: "Supabase",
              body: "SQL migration under supabase/migrations mirrors the students → friendships → matches graph with enums and indexes.",
              action: "supabase/migrations/0001_init.sql",
            },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-zinc-900">{card.title}</h2>
              <p className="mt-3 text-sm text-zinc-600">{card.body}</p>
              <p className="mt-4 text-xs font-mono uppercase tracking-wide text-emerald-600">
                {card.action}
              </p>
            </article>
          ))}
        </div>

        <section className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm">
          <h3 className="text-2xl font-semibold text-zinc-950">Try the API locally</h3>
          <p className="mt-2 text-sm text-zinc-600">
            After adding Supabase credentials, run
            <code className="mx-2 rounded bg-zinc-900 px-2 py-1 text-xs text-white">
              npm run dev
            </code>
            and exercise the endpoints:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-800">
            <li>
              <span className="font-semibold">POST /api/students</span> → upsert student
              profiles.
            </li>
            <li>
              <span className="font-semibold">POST /api/friendships</span> → record
              requests and acceptances.
            </li>
            <li>
              <span className="font-semibold">POST /api/matches</span> → persist match
              decisions and scores.
            </li>
          </ul>
          <p className="mt-4 text-sm text-zinc-600">
            Each route returns structured JSON that the React client can consume using
            <code className="mx-2 rounded bg-zinc-900 px-2 py-1 text-xs text-white">
              {`fetch("/api/...", { cache: "no-store" })`}
            </code>
            so it plays nicely with ISR on Vercel.
          </p>
        </section>
      </section>
    </main>
  );
}
