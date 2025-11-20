"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

/* -----------------------------------------------
   NETWORK GRAPH DATA
------------------------------------------------- */

type NodeType = "you" | "friend" | "mutual" | "new";

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  type: NodeType;
}

interface Edge {
  from: string;
  to: string;
  stage: number; // which scroll block reveals this edge
}

const NODES: Node[] = [
  { id: "you", x: 200, y: 260, label: "You", type: "you" },

  { id: "f1", x: 110, y: 185, label: "Jordan", type: "friend" },
  { id: "f2", x: 290, y: 190, label: "Maya", type: "friend" },
  { id: "f3", x: 80, y: 285, label: "Chris", type: "friend" },

  { id: "m1", x: 65, y: 90, label: "Taylor (mutual)", type: "mutual" },
  { id: "m2", x: 210, y: 80, label: "Sam (mutual)", type: "mutual" },
  { id: "m3", x: 335, y: 95, label: "Priya (mutual)", type: "mutual" },

  { id: "new1", x: 320, y: 285, label: "New dinner friend", type: "new" },
];

const EDGES: Edge[] = [
  // Stage 0 – you + close friends
  { from: "you", to: "f1", stage: 0 },
  { from: "you", to: "f2", stage: 0 },
  { from: "you", to: "f3", stage: 0 },

  // Stage 1 – friends → mutuals
  { from: "f1", to: "m1", stage: 1 },
  { from: "f2", to: "m2", stage: 1 },
  { from: "f3", to: "m3", stage: 1 },

  // Stage 2 – mutuals connect (campus fabric)
  { from: "m1", to: "m2", stage: 2 },
  { from: "m2", to: "m3", stage: 2 },

  // Stage 3 – path to someone new
  { from: "m2", to: "new1", stage: 3 },
  { from: "you", to: "new1", stage: 3 },
];

const NETWORK_STORY = [
  {
    id: "circles",
    stage: 0,
    title: "We start with your everyday circle.",
    body: "Your week loops through the same people — your dorm, major, and clubs. mutuals starts by understanding that orbit: who you live with, study with, and always see.",
  },
  {
    id: "mutuals",
    stage: 1,
    title: "Then we look at your friends' circles.",
    body: "Each friend has their own people: classmates, club friends, coworkers. We map those friends-of-friends to see where new connections could come from.",
  },
  {
    id: "algo",
    stage: 2,
    title: "Everyone gets a good match, unlike da****op",
    body: (
      <>
        We use a variant of the{" "}
        <a
          href="https://en.wikipedia.org/wiki/Sinkhorn%27s_theorem"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 underline hover:text-indigo-700"
        >
          Sinkhorn-Knopp algorithm
        </a>{" "}
        from entropic optimal transport to ensure optimized total utility, while meeting individual baselines.
      </>
    ),
  },
  {
    id: "campus-web",
    stage: 3,
    title: "We connect the campus, not just your side.",
    body: "We pay attention to where your world doesn't usually cross — east and west campus, different majors, other social pockets — and look for ways to bridge them through mutuals.",
  },
];

/* -----------------------------------------------
   NETWORK VISUAL COMPONENT
------------------------------------------------- */

function getNodeById(id: string): Node {
  const node = NODES.find((n) => n.id === id);
  if (!node) throw new Error(`Missing node ${id}`);
  return node;
}

const NetworkViz = ({ stage }: { stage: number }) => {
  const visibleEdges = EDGES.filter((e) => e.stage <= stage);

  return (
    <div className="relative mx-auto flex max-w-md justify-center">
      {/* soft brand-colored glow – slightly bolder blue/pink */}
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.45),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(236,72,153,0.45),_transparent_55%)] blur-3xl" />

      <div className="w-full rounded-[2.5rem] border border-slate-200 bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-indigo-800">
            your campus network
          </span>
        </div>

        <div className="relative mx-auto aspect-square max-w-xs">
          <svg viewBox="0 0 400 400" className="h-full w-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(226,232,240,0.85)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            <rect width="400" height="400" fill="url(#grid)" rx={24} />

            {/* edges */}
            {visibleEdges.map((edge, idx) => {
              const from = getNodeById(edge.from);
              const to = getNodeById(edge.to);
              const isIntroEdge =
                edge.stage === 3 &&
                ((edge.from === "you" && edge.to === "new1") ||
                  (edge.from === "new1" && edge.to === "you"));

              return (
                <line
                  key={`${edge.from}-${edge.to}-${idx}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isIntroEdge ? "rgba(56,189,248,0.98)" : "rgba(148,163,184,0.85)"}
                  strokeWidth={isIntroEdge ? 3 : 2}
                  strokeLinecap="round"
                  className={isIntroEdge ? "drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]" : ""}
                />
              );
            })}

            {/* nodes */}
            {NODES.map((node) => {
              const isActive =
                node.id === "you" ||
                (node.type === "friend" && stage >= 0) ||
                (node.type === "mutual" && stage >= 1) ||
                (node.type === "new" && stage >= 3);

              const radiusOuter =
                node.type === "you" ? 15 : node.type === "new" ? 13 : node.type === "mutual" ? 12 : 11;
              const radiusInner = radiusOuter - 4;

              const ringColor =
                node.type === "you"
                  ? "#22c55e" // green ring for you
                  : node.type === "friend"
                  ? "#3b82f6" // blue
                  : node.type === "mutual"
                  ? "#ec4899" // pink
                  : "#f59e0b"; // amber for new intro

              return (
                <g key={node.id} className="transition-all duration-500">
                  {node.id === "you" && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radiusOuter + 8}
                      stroke="rgba(34,197,94,0.85)"
                      strokeWidth={1.7}
                      fill="none"
                      className="animate-pulse"
                    />
                  )}

                  {/* outer ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radiusOuter}
                    fill={ringColor}
                    opacity={isActive ? 0.9 : 0.5}
                  />
                  {/* inner avatar circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radiusInner}
                    fill={isActive ? "#ffffff" : "#f9fafb"}
                  />

                  {/* label text */}
                  {node.id === "you" ? (
                    <text
                      x={node.x}
                      y={node.y + 3}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#16a34a"
                      fontWeight={700}
                    >
                      YOU
                    </text>
                  ) : null}

                  <text
                    x={node.x}
                    y={node.y + radiusOuter + 11}
                    textAnchor="middle"
                    fontSize={9}
                    fill={isActive ? "rgba(30,64,175,0.98)" : "rgba(148,163,184,0.9)"}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

/* -----------------------------------------------
   MAIN PAGE
------------------------------------------------- */

export default function MutualsLanding() {
  const [stage, setStage] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const top = visible.sort(
          (a, b) => (a.boundingClientRect.top || 0) - (b.boundingClientRect.top || 0)
        )[0];
        const idxAttr = top.target.getAttribute("data-network-index");
        const idx = idxAttr ? Number(idxAttr) : 0;
        const section = NETWORK_STORY[idx];
        setStage(section.stage);
      },
      { threshold: 0.4, rootMargin: "-20% 0px -20% 0px" }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f4fb] text-slate-900">
      {/* NAV */}
      <header className="border-b border-[#d3d3ec] bg-[#f4f4fb]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            {/* venn diagram logo */}
            <div className="relative h-8 w-10">
              <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-indigo-500/90" />
              <div className="absolute right-0 top-1 h-6 w-6 rounded-full bg-pink-500/90 mix-blend-multiply" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Mutuals</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="rounded-full border border-slate-400/60 px-4 py-1.5 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hidden rounded-full bg-slate-950 px-4 py-1.5 text-sm font-semibold text-slate-50 shadow-md hover:bg-slate-900 sm:inline-flex"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        {/* HERO */}
        <section className="pt-8">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-tr from-indigo-600 via-sky-500 to-pink-500 shadow-xl">
            <div className="relative h-full w-full px-6 py-8 md:px-10 md:py-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(254,249,195,0.4),_transparent_55%),radial-gradient(circle_at_top,_rgba(248,250,252,0.15),_transparent_60%)] mix-blend-soft-light" />

              <div className="relative max-w-xxl space-y-5 text-slate-50">
                <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                  Meet new people through Mutuals.
                  <span className="block text-slate-100">No more BS matching apps.</span>
                </h1>

                <p className="max-w-lg text-sm leading-relaxed md:text-base">
                  Once a week, Mutuals notifies you and your match to meet up. By signing up, you stay tuned for on campus events to do with your friend match, and get notified when we expand our survey for better matches. <br />
                  <b>Join our endeavor to tighten the Stanford network. </b>
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link href="/signup" className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-slate-50 shadow-md hover:bg-slate-900">
                    Get seated this week
                  </Link>
                  <span className="text-xs text-slate-100/80">
                    Friends don&apos;t have to start as complete strangers.
                  </span>
                </div>
              </div>

              {/* little “people” hint in corner */}
              <div className="pointer-events-none absolute inset-x-6 bottom-4 flex justify-end md:inset-x-10">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-lg">
                  👫
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-lg">
                  🍻
                  </div>
                  <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/70 text-lg md:flex">
                  💬
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mt-16 space-y-8">
          <h2 className="text-center text-2xl font-semibold text-slate-900">How Mutuals works</h2>

          {/* Card 1 – Your circles */}
          <div className="grid gap-6 rounded-[28px] bg-[#e0edff] p-6 shadow-md md:grid-cols-2 md:items-center">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-slate-900">Tell us about your circles</h3>
              <p className="text-sm text-slate-800">
                Your major, year, usual hangout spots, and several close friends. We use this to
                understand your everyday routine — not to keep you in it, but to see where we can
                gently stretch it.
              </p>
            </div>
            <div className="rounded-2xl bg-white/95 p-4 shadow">
              <p className="text-xs font-medium text-slate-500">Your campus orbit</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2">
                  <p className="font-semibold text-slate-900">Where you live</p>
                  <p className="mt-1 text-[11px] text-slate-700">East campus · Wilbur</p>
                </div>
                <div className="rounded-xl border border-pink-100 bg-pink-50 p-2">
                  <p className="font-semibold text-slate-900">Where you usually are</p>
                  <p className="mt-1 text-[11px] text-slate-700">
                    West campus · CoDa, On Call
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs font-medium text-slate-500">People in your core circle</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {["John", "Girlfriend", "Pset buddies", "Dormmates"].map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-800"
                  >
                    <span className="h-4 w-4 rounded-full bg-indigo-400" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3 – Table with pairwise mutuals (second card removed per your request) */}
          <div className="grid gap-6 rounded-[28px] bg-[#ffe2eb] p-6 shadow-md md:grid-cols-2 md:items-center">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-slate-900">
                We set up a small gang through Mutuals.
              </h3>
              <p className="text-sm text-slate-800">
                Mutuals seats you with people connected by mutual friends — not necessarily similar, but all one degree away in
                different directions.
              </p>
            </div>
            <div className="rounded-2xl bg-white/95 p-4 shadow">
              <p className="text-xs font-medium text-slate-500">This week&apos;s gang</p>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                {[
                  { name: "You", via: "…" },
                  { name: "Aanya", via: "via Jordan" },
                  { name: "Leo", via: "via Jordan" },
                  { name: "Miles", via: "via Maya" },
                  { name: "Sara", via: "via Maya" },
                  { name: "Noah", via: "via Maya" },
                ].map((p) => (
                  <div
                    key={p.name + p.via}
                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2 py-2"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-200 text-[11px] font-semibold text-pink-900">
                      {p.name === "You" ? "YOU" : p.name[0]}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-900">{p.name}</p>
                      {p.via !== "…" && (
                        <p className="text-[10px] text-slate-600">{p.via}</p>
                      )}
                      {p.via === "…" && (
                        <p className="text-[10px] text-slate-600">You</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* NETWORK SECTION (renamed from "Under the hood") */}
        <section className="mt-20 border-t border-[#d3d3ec] pt-10">
          <h2 className="text-center text-2xl font-semibold text-slate-900">
            How Mutuals connects you
          </h2>

          <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] md:items-start">
            {/* sticky network visual */}
            <div className="md:sticky md:top-24">
              <NetworkViz stage={stage} />
            </div>

            {/* scroll blocks that advance the network */}
            <div className="space-y-8">
              {NETWORK_STORY.map((block, idx) => (
                <article
                  key={block.id}
                  ref={(el) => {
                    sectionRefs.current[idx] = el;
                  }}
                  data-network-index={idx}
                  className={`rounded-2xl border px-4 py-4 text-sm leading-relaxed md:px-5 md:py-5 ${
                    stage === block.stage
                      ? "border-indigo-400 bg-white shadow-md"
                      : "border-[#d3d3ec] bg-[#f7f5ff]"
                  }`}
                >
                  <h3 className="text-base font-semibold text-slate-900">{block.title}</h3>
                  <p className="mt-2 text-slate-700">{block.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d3d3ec] py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Mutuals
      </footer>
    </div>
  );
}
