"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { isValidStudentIdentifier } from "@/lib/identifiers";

const CLASS_YEARS = ["2025", "2026", "2027", "2028", "2029", "2030"];
const MAJOR_CATEGORIES = [
  "Engineering",
  "Humanities & Arts",
  "Sciences",
  "Social Sciences",
  "Business & Economics",
  "Undeclared / Other",
];
const DORM_OPTIONS = [
  "Wilbur",
  "Stern",
  "Governor's Corner",
  "Ng House",
  "FroSoCo",
  "Branner",
  "Lagunita",
  "Roble",
  "Mirrielees",
  "Off Campus",
];
const HOBBY_OPTIONS = [
  "Music",
  "Dance",
  "Sports",
  "Fitness",
  "Cooking",
  "Gaming",
  "Volunteering",
  "Photography",
  "Entrepreneurship",
  "Reading",
];

const MAX_HOBBIES = 10;
const MIN_FRIENDS = 5;
const MAX_FRIENDS = 20;

export default function SurveyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawStudentId = searchParams.get("studentId");
  const normalizedStudentId = rawStudentId?.trim() ?? null;
  const studentId =
    normalizedStudentId && isValidStudentIdentifier(normalizedStudentId)
      ? normalizedStudentId
      : null;

  const [email, setEmail] = useState<string | null>(null);
  const [gradYear, setGradYear] = useState("");
  const [sex, setSex] = useState("");
  const [major, setMajor] = useState("");
  const [dorm, setDorm] = useState("");
  const [involvements, setInvolvements] = useState("");
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [otherHobby, setOtherHobby] = useState("");
  const [friendInput, setFriendInput] = useState("");
  const [closeFriends, setCloseFriends] = useState<string[]>([]);
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    const fetchStudent = async () => {
      setStatus("loading");
      setError(null);

      const response = await fetch(`/api/students/${studentId}`);
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to load your survey.");
        setStatus("error");
        return;
      }

      const student = payload.student;
      setEmail(student.email);

      if (student.grad_year) {
        setGradYear(String(student.grad_year));
      }
      if (student.sex) {
        setSex(student.sex);
      }
      if (student.major) {
        setMajor(student.major);
      }
      if (student.dorm) {
        setDorm(student.dorm);
      }
      if (student.interests) {
        setSelectedHobbies(student.interests);
      }
      if (student.involvements) {
        setInvolvements(student.involvements);
      }
      if (student.close_friends) {
        setCloseFriends(student.close_friends);
      }

      setStatus("idle");
    };

    fetchStudent();
  }, [studentId]);

  useEffect(() => {
    const fetchNames = async () => {
      const response = await fetch("/api/students");
      const payload = await response.json();

      if (!response.ok) {
        return;
      }

      const names: string[] = (payload.students ?? [])
        .map((student: { first_name: string | null; last_name: string | null; email: string }) => {
          const fullName = [student.first_name, student.last_name].filter(Boolean).join(" ").trim();
          return fullName.length ? fullName : student.email;
        })
        .filter((name: string): name is string => Boolean(name));

      const unique = Array.from(new Set(names));
      setExistingNames(unique);
    };

    fetchNames();
  }, []);

  const friendSuggestions = useMemo(() => {
    if (!friendInput.trim()) {
      return [];
    }

    const normalized = friendInput.toLowerCase();
    return existingNames
      .filter(
        (name) => name.toLowerCase().includes(normalized) && !closeFriends.includes(name),
      )
      .slice(0, 5);
  }, [existingNames, friendInput, closeFriends]);

  const handleHobbySelection = (value: string) => {
    if (!value || selectedHobbies.includes(value)) {
      return;
    }

    if (selectedHobbies.length >= MAX_HOBBIES) {
      setError(`You can list up to ${MAX_HOBBIES} hobbies.`);
      return;
    }

    setSelectedHobbies((prev) => [...prev, value]);
    setError(null);
  };

  const handleOtherHobbyAdd = () => {
    const trimmed = otherHobby.trim();
    if (!trimmed || selectedHobbies.includes(trimmed)) {
      return;
    }

    if (selectedHobbies.length >= MAX_HOBBIES) {
      setError(`You can list up to ${MAX_HOBBIES} hobbies.`);
      return;
    }

    setSelectedHobbies((prev) => [...prev, trimmed]);
    setOtherHobby("");
    setError(null);
  };

  const handleFriendAdd = (name: string) => {
    if (!name.trim() || closeFriends.includes(name)) {
      setFriendInput("");
      return;
    }

    if (closeFriends.length >= MAX_FRIENDS) {
      setError(`You can add up to ${MAX_FRIENDS} friends.`);
      setFriendInput("");
      return;
    }

    setCloseFriends((prev) => [...prev, name.trim()]);
    setFriendInput("");
    setError(null);
  };

  const handleFriendRemove = (name: string) => {
    setCloseFriends((prev) => prev.filter((friend) => friend !== name));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!studentId) {
      setError("Missing signup information. Please start from the signup page.");
      return;
    }

    if (closeFriends.length < MIN_FRIENDS) {
      setError("Please add at least 5 close friends.");
      return;
    }

    setStatus("loading");
    setError(null);

    const response = await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grad_year: Number(gradYear),
        sex,
        major,
        dorm,
        hobbies: selectedHobbies,
        involvements: involvements.trim(),
        close_friends: closeFriends,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus("error");
      setError(payload.error ?? "We could not save your survey. Please try again.");
      return;
    }

    setStatus("success");
    router.push("/?survey=complete");
  };

  const isSubmitDisabled =
    status === "loading" ||
    !gradYear ||
    !sex ||
    !major ||
    !dorm ||
    !involvements.trim() ||
    selectedHobbies.length === 0 ||
    closeFriends.length < MIN_FRIENDS ||
    closeFriends.length > MAX_FRIENDS;

  if (!studentId) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-6 py-16 text-zinc-900">
        <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-lg font-semibold text-amber-900">
            We need a signup link to load your survey.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Go to signup
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-6 py-16 text-zinc-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div>
          <Link
            href="/"
            className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-500"
          >
            ← Back to landing page
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-950">
            Tell us about yourself
          </h1>
          <p className="mt-3 text-base text-zinc-600">
            This quick survey helps us personalize your mutual matches. It only takes a couple of
            minutes and you can update it later.
          </p>
          {email && (
            <p className="mt-2 text-sm text-zinc-500">
              Logged in as <span className="font-semibold text-zinc-700">{email}</span>
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="text-sm font-medium text-zinc-800">
              Class year
              <select
                value={gradYear}
                onChange={(event) => setGradYear(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select year</option>
                {CLASS_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-zinc-800">
              Sex
              <select
                value={sex}
                onChange={(event) => setSex(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select option</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </label>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <label className="text-sm font-medium text-zinc-800">
              Major
              <select
                value={major}
                onChange={(event) => setMajor(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select major</option>
                {MAJOR_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-zinc-800">
              Dorm
              <select
                value={dorm}
                onChange={(event) => setDorm(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select dorm</option>
                {DORM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-zinc-800">Hobbies</p>
            <p className="text-xs text-zinc-500">Pick from the list or add your own.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <select
                onChange={(event) => {
                  handleHobbySelection(event.target.value);
                  event.target.value = "";
                }}
                className="rounded-2xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value=""
              >
                <option value="">Select hobby</option>
                {HOBBY_OPTIONS.map((hobby) => (
                  <option key={hobby} value={hobby}>
                    {hobby}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={otherHobby}
                  onChange={(event) => setOtherHobby(event.target.value)}
                  placeholder="Other hobby"
                  className="rounded-2xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                <button
                  type="button"
                  onClick={handleOtherHobbyAdd}
                  className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:border-emerald-300 hover:text-emerald-500"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedHobbies.map((hobby) => (
                <span
                  key={hobby}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
                >
                  {hobby}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedHobbies((prev) => prev.filter((item) => item !== hobby))
                    }
                    className="text-xs text-emerald-500"
                    aria-label={`Remove ${hobby}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <label className="text-sm font-medium text-zinc-800">
              On-campus involvements
              <textarea
                value={involvements}
                onChange={(event) => setInvolvements(event.target.value)}
                rows={4}
                required
                placeholder="Clubs, roles, teams, or anything else you're involved in."
                className="mt-2 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          <div className="mt-8">
            <p className="text-sm font-medium text-zinc-800">Name 5-20 close friends</p>
            <p className="text-xs text-zinc-500">
              Start typing to see suggestions pulled from the current student list.
            </p>

            <div className="relative mt-3">
              <input
                type="text"
                value={friendInput}
                onChange={(event) => setFriendInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleFriendAdd(friendSuggestions[0] ?? friendInput);
                  }
                }}
                placeholder="Add a friend"
                className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-base text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />

              {friendSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-2 w-full rounded-2xl border border-zinc-200 bg-white text-sm shadow-lg">
              {friendSuggestions.map((name: string) => (
                    <li key={name}>
                      <button
                        type="button"
                        onClick={() => handleFriendAdd(name)}
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-zinc-700 transition hover:bg-emerald-50"
                      >
                        {name}
                        <span className="text-xs text-zinc-400">Add</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Added {closeFriends.length} / {MAX_FRIENDS} friends (minimum {MIN_FRIENDS}).
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {closeFriends.map((friend) => (
                <span
                  key={friend}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800"
                >
                  {friend}
                  <button
                    type="button"
                    onClick={() => handleFriendRemove(friend)}
                    className="text-xs text-emerald-600"
                    aria-label={`Remove ${friend}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {error && (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Saving your survey..." : "Submit survey"}
          </button>
        </form>
      </div>
    </main>
  );
}

