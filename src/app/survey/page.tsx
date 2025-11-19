"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { isValidStudentIdentifier } from "@/lib/identifiers";
import studentNamesData from "@/data/studentNames.json";

interface StudentData {
  first_name: string;
  last_name: string;
  email: string;
  user_id: string;
}

interface StudentDisplay {
  name: string;
  email: string;
  user_id: string;
}

const CLASS_YEARS = ["2025", "2026", "2027", "2028", "2029", "2030"];
const DORM_OPTIONS = [
  "Crothers",
  "FloMo",
  "Casper Quad",
  "FroSoCo",
  "Branner",
  "GovCo",
  "West Lag",
  "Stern",
  "Wilbur",
  "Roble",
  "Toyon",
  "Ujamaa",
  "Off Campus",
];
const MIN_FRIENDS = 5;
const MAX_FRIENDS = 20;

function SurveyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawStudentId = searchParams.get("studentId");
  const normalizedStudentId = rawStudentId?.trim() ?? null;
  const studentId =
    normalizedStudentId && isValidStudentIdentifier(normalizedStudentId)
      ? normalizedStudentId
      : null;

  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [sex, setSex] = useState("");
  const [dorm, setDorm] = useState("");
  const [friendInput, setFriendInput] = useState("");
  const [closeFriends, setCloseFriends] = useState<string[]>([]);
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [allStudentData, setAllStudentData] = useState<StudentDisplay[]>([]);
  const [ucBerkeleyChoice, setUcBerkeleyChoice] = useState("");
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

      if (student.first_name) {
        setFirstName(student.first_name);
      }
      if (student.last_name) {
        setLastName(student.last_name);
      }
      if (student.grad_year) {
        setGradYear(String(student.grad_year));
      }
      if (student.sex) {
        setSex(student.sex);
      }
      if (student.dorm) {
        setDorm(student.dorm);
      }
      if (student.close_friends) {
        setCloseFriends(student.close_friends);
      }
      if (student.uc_berkeley_choice) {
        setUcBerkeleyChoice(student.uc_berkeley_choice);
      }

      setStatus("idle");
    };

    fetchStudent();
  }, [studentId]);

  useEffect(() => {
    // Load static student names from JSON
    const staticStudents: StudentDisplay[] = (studentNamesData as StudentData[]).map(
      (student) => ({
        name: `${student.first_name} ${student.last_name}`.trim(),
        email: student.email,
        user_id: student.user_id,
      })
    );

    const fetchNames = async () => {
      const response = await fetch("/api/students");
      const payload = await response.json();

      const apiStudents: StudentDisplay[] = [];
      if (response.ok && payload.students) {
        apiStudents.push(
          ...(payload.students ?? []).map(
            (student: {
              first_name: string | null;
              last_name: string | null;
              email: string;
              user_id?: string | null;
            }) => {
              const fullName = [student.first_name, student.last_name]
                .filter(Boolean)
                .join(" ")
                .trim();
              return {
                name: fullName.length ? fullName : student.email,
                email: student.email,
                user_id: student.user_id || "",
              };
            }
          )
        );
      }

      // Combine static and API students, removing duplicates by email
      const emailSet = new Set<string>();
      const combined: StudentDisplay[] = [];

      [...staticStudents, ...apiStudents].forEach((student) => {
        if (!emailSet.has(student.email)) {
          emailSet.add(student.email);
          combined.push(student);
        }
      });

      setAllStudentData(combined);

      // Keep existingNames for backward compatibility
      const names = combined.map((s) => s.name);
      const unique = Array.from(new Set(names));
      setExistingNames(unique);
    };

    fetchNames();
  }, []);

  const friendSuggestions = useMemo(() => {
    if (!friendInput.trim()) {
      return [];
    }

    const normalized = friendInput.toLowerCase().trim();
    const closeFriendsSet = new Set(closeFriends);

    // Filter and score suggestions
    const scored = allStudentData
      .filter((student) => !closeFriendsSet.has(student.name))
      .map((student) => {
        const nameLower = student.name.toLowerCase();
        const emailLower = student.email.toLowerCase();
        
        // Check if input matches name or email
        const nameMatch = nameLower.includes(normalized);
        const emailMatch = emailLower.includes(normalized);
        
        if (!nameMatch && !emailMatch) {
          return null;
        }

        // Calculate score for sorting (exact matches first, then starts with, then contains)
        let score = 0;
        if (nameLower === normalized || emailLower === normalized) {
          score = 100; // Exact match
        } else if (nameLower.startsWith(normalized) || emailLower.startsWith(normalized)) {
          score = 50; // Starts with
        } else {
          score = 10; // Contains
        }

        // Boost score if name matches (prefer name matches over email matches)
        if (nameMatch && !emailMatch) {
          score += 5;
        }

        return { student, score };
      })
      .filter((item): item is { student: StudentDisplay; score: number } => item !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.student);

    return scored;
  }, [allStudentData, friendInput, closeFriends]);

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

    // Validate all required fields
    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }

    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }

    if (!gradYear) {
      setError("Please select your class year.");
      return;
    }

    if (!sex) {
      setError("Please select your sex.");
      return;
    }

    if (!dorm) {
      setError("Please select your dorm.");
      return;
    }

    if (closeFriends.length < MIN_FRIENDS) {
      setError(`Please add at least ${MIN_FRIENDS} close friends.`);
      return;
    }

    if (closeFriends.length > MAX_FRIENDS) {
      setError(`You can add up to ${MAX_FRIENDS} friends.`);
      return;
    }

    if (!ucBerkeleyChoice) {
      setError("Please answer the UC Berkeley question.");
      return;
    }

    setStatus("loading");
    setError(null);

    const response = await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        grad_year: Number(gradYear),
        sex,
        dorm,
        close_friends: closeFriends,
        uc_berkeley_choice: ucBerkeleyChoice,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setStatus("error");
      setError(payload.error ?? "We could not save your survey. Please try again.");
      return;
    }

    setStatus("success");
    router.push("/whats-next");
  };

  const isSubmitDisabled =
    status === "loading" ||
    !firstName.trim() ||
    !lastName.trim() ||
    !gradYear ||
    !sex ||
    !dorm ||
    closeFriends.length < MIN_FRIENDS ||
    closeFriends.length > MAX_FRIENDS ||
    !ucBerkeleyChoice;

  if (!studentId) {
    return (
      <main className="min-h-screen bg-[#f4f4fb] px-6 py-16 text-slate-900">
        <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-lg font-semibold text-amber-900">
            We need a signup link to load your survey.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-50 transition hover:bg-slate-900"
          >
            Go to signup
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4fb] px-6 py-16 text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div>
          <Link
            href="/"
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
          >
            ← Back to landing page
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
            Tell us about yourself
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Drop your homies. Literally takes one minute.
          </p>``
          {email && (
            <p className="mt-2 text-sm text-slate-500">
              Logged in as <span className="font-semibold text-slate-700">{email}</span>
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#d3d3ec] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-800">
              First name
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                placeholder="Enter your first name"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <label className="text-sm font-medium text-slate-800">
              Last name
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                placeholder="Enter your last name"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-800">
              Class year
              <select
                value={gradYear}
                onChange={(event) => setGradYear(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select year</option>
                {CLASS_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-800">
              Sex
              <select
                value={sex}
                onChange={(event) => setSex(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select option</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </label>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-slate-800">
              Dorm
              <select
                value={dorm}
                onChange={(event) => setDorm(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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

          <div className="mt-8">
            <p className="text-sm font-medium text-slate-800">Name 5-20 close friends</p>
            <p className="text-xs text-slate-500">
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
                    if (friendSuggestions.length > 0) {
                      handleFriendAdd(friendSuggestions[0].name);
                    } else if (friendInput.trim()) {
                      handleFriendAdd(friendInput);
                    }
                  }
                }}
                placeholder="Add a friend"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />

              {friendSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white text-sm shadow-lg">
                  {friendSuggestions.map((student) => (
                    <li key={`${student.name}-${student.email}`}>
                      <button
                        type="button"
                        onClick={() => handleFriendAdd(student.name)}
                        className="flex w-full flex-col items-start px-4 py-2.5 text-left text-slate-700 transition hover:bg-indigo-50"
                      >
                        <span className="font-medium">{student.name}</span>
                        <span className="text-xs text-slate-500">{student.email}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Added {closeFriends.length} / {MAX_FRIENDS} friends (minimum {MIN_FRIENDS}).
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {closeFriends.map((friend) => (
                <span
                  key={friend}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800"
                >
                  {friend}
                  <button
                    type="button"
                    onClick={() => handleFriendRemove(friend)}
                    className="text-xs text-indigo-600"
                    aria-label={`Remove ${friend}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <label className="text-sm font-medium text-slate-800">
              Would you rather have no friends or go to UC Berkeley?
              <select
                value={ucBerkeleyChoice}
                onChange={(event) => setUcBerkeleyChoice(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select an option</option>
                <option value="no_friends">No friends</option>
                <option value="uc_berkeley">Go to UC Berkeley</option>
              </select>
            </label>
          </div>

          {error && (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-50 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Saving your survey..." : "Submit survey"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function SurveyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f4f4fb] px-6 py-16 text-slate-900">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-[#d3d3ec] bg-white p-8 text-center">
              <p className="text-base text-slate-600">Loading survey...</p>
            </div>
          </div>
        </main>
      }
    >
      <SurveyPageContent />
    </Suspense>
  );
}

