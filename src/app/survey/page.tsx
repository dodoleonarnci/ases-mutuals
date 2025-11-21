"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, User, GraduationCap, Users, Home, ArrowLeft, Sparkles, CheckCircle } from "lucide-react";

import { isValidStudentIdentifier, deriveStudentIdentifier } from "@/lib/identifiers";

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

interface StudentData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  user_id: string;
}

interface StudentDisplay {
  name: string;
  email: string;
  user_id: string;
  emailIdentifier: string; // email without @stanford.edu
}

const CLASS_YEARS = ["2026", "2027", "2028", "2029"];
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
  "Mirrielees",
  "Ujamaa",
  "Off Campus",
];
const MIN_FRIENDS = 5;

/**
 * Helper function to set student names with fallback logic.
 * Prioritizes CSV data, falls back to database values.
 */
function setStudentNames(
  csvStudent: StudentData | undefined,
  dbStudent: { first_name: string | null; last_name: string | null },
  setFirstName: (name: string) => void,
  setLastName: (name: string) => void,
) {
  const firstName = csvStudent?.first_name || dbStudent.first_name || "";
  const lastName = csvStudent?.last_name || dbStudent.last_name || "";
  setFirstName(firstName);
  setLastName(lastName);
}

/**
 * Extracts first and last name from a full name (excluding middle name).
 */
function getFirstLastName(fullName: string): string {
  const nameParts = fullName.trim().split(/\s+/).filter((part) => part.length > 0);
  if (nameParts.length === 0) {
    return "";
  }
  if (nameParts.length === 1) {
    return nameParts[0];
  }
  // Return first name and last name only
  return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
}

/**
 * Converts close_friends from names to email identifiers.
 * Returns the converted array, or null if no conversion is needed.
 */
function convertFriendsToIdentifiers(
  friends: string[],
  emailToNameMap: Map<string, string>,
  allStudentData: StudentDisplay[],
): string[] | null {
  if (emailToNameMap.size === 0 || friends.length === 0) {
    return null;
  }

  // Check if conversion is needed (if any friend is not an email identifier)
  const needsConversion = friends.some((friend) => {
    // Check if it's already an email identifier (exists in map or matches pattern)
    const isEmailIdentifier =
      emailToNameMap.has(friend) ||
      (/^[a-z0-9._-]+$/i.test(friend) && !friend.includes(" "));

    // If it's a name (contains space or doesn't match identifier pattern), needs conversion
    return !isEmailIdentifier;
  });

  if (!needsConversion) {
    return null;
  }

  const converted = friends
    .map((friend) => {
      // If already an email identifier, keep it
      if (emailToNameMap.has(friend)) {
        return friend;
      }

      // Try to find by name
      const student = allStudentData.find(
        (s) =>
          s.name.toLowerCase() === friend.toLowerCase() ||
          s.email.toLowerCase() === friend.toLowerCase(),
      );

      if (student) {
        return student.emailIdentifier;
      }

      // If not found, try to derive from email format
      if (friend.includes("@")) {
        return deriveStudentIdentifier(friend);
      }

      // If still not found, keep original (will be filtered out on submit)
      return friend;
    })
    .filter((id) => emailToNameMap.has(id)); // Only keep valid identifiers

  // Only return if conversion actually changed something
  if (
    converted.length !== friends.length ||
    converted.some((id, idx) => id !== friends[idx])
  ) {
    return converted;
  }

  return null;
}

function SurveyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawStudentId = searchParams.get("studentId");
  const normalizedStudentId = rawStudentId?.trim() ?? null;
  const urlStudentId =
    normalizedStudentId && isValidStudentIdentifier(normalizedStudentId)
      ? normalizedStudentId
      : null;

  const [studentId, setStudentId] = useState<string | null>(urlStudentId);
  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [sex, setSex] = useState("");
  const [dorm, setDorm] = useState("");
  const [friendInput, setFriendInput] = useState("");
  const [closeFriends, setCloseFriends] = useState<string[]>([]); // Store email identifiers
  const [csvStudentData, setCsvStudentData] = useState<StudentData[]>([]); // Raw CSV data
  const [allStudentData, setAllStudentData] = useState<StudentDisplay[]>([]);
  const [emailToNameMap, setEmailToNameMap] = useState<Map<string, string>>(new Map()); // Map email identifier to display name
  const [ucBerkeleyChoice, setUcBerkeleyChoice] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (studentId) {
        // Already have studentId from URL, skip session check
        return;
      }

      try {
        const response = await fetch("/api/session");
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.student?.id) {
            setStudentId(data.student.id);
            setEmail(data.student.email);
          }
        }
      } catch (error) {
        console.error("Failed to check session:", error);
      }
    };

    checkSession();
  }, [studentId]);

  // Fetch CSV data once on mount
  useEffect(() => {
    const fetchCsvData = async () => {
      const csvResponse = await fetch("/api/student-names");
      const csvPayload = await csvResponse.json();
      
      if (csvResponse.ok && csvPayload.studentNames) {
        const students = csvPayload.studentNames as StudentData[];
        setCsvStudentData(students);
        
        // Build display data and email-to-name map
        const csvStudents: StudentDisplay[] = [];
        const emailToName = new Map<string, string>();
        
        students.forEach((student) => {
          // Build full name including middle name
          const nameParts = [student.first_name];
          if (student.middle_name?.trim()) {
            nameParts.push(student.middle_name.trim());
          }
          nameParts.push(student.last_name);
          const name = nameParts.join(" ").trim();
          const emailIdentifier = deriveStudentIdentifier(student.email);
          // Map email identifier to display name
          emailToName.set(emailIdentifier, name);
          csvStudents.push({
            name,
            email: student.email,
            user_id: student.user_id,
            emailIdentifier,
          });
        });
        
        setAllStudentData(csvStudents);
        setEmailToNameMap(emailToName);
      }
    };

    fetchCsvData();
  }, []);

  useEffect(() => {
    if (!studentId || csvStudentData.length === 0) {
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

      // Use CSV data to auto-fill first and last name
      const csvStudent = csvStudentData.find(
        (s) => s.email.toLowerCase() === student.email?.toLowerCase()
      );
      
      setStudentNames(csvStudent, student, setFirstName, setLastName);

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
        // Store raw close_friends - will be converted to email identifiers in another useEffect
        setCloseFriends(student.close_friends);
      }
      if (student.uc_berkeley_choice) {
        setUcBerkeleyChoice(student.uc_berkeley_choice);
      }

      setStatus("idle");
    };

    fetchStudent();
  }, [studentId, csvStudentData]);


  // Convert close_friends from names to email identifiers (for backward compatibility)
  useEffect(() => {
    const converted = convertFriendsToIdentifiers(
      closeFriends,
      emailToNameMap,
      allStudentData,
    );
    if (converted !== null) {
      setCloseFriends(converted);
    }
  }, [emailToNameMap, allStudentData, closeFriends]);

  const friendSuggestions = useMemo(() => {
    if (!friendInput.trim()) {
      return [];
    }

    const normalized = friendInput.toLowerCase().trim();
    const closeFriendsSet = new Set(closeFriends); // closeFriends contains email identifiers
    const inputWords = normalized.split(/\s+/).filter((word) => word.length > 0);

    // Filter and score suggestions - only from CSV students
    const scored = allStudentData
      .filter((student) => !closeFriendsSet.has(student.emailIdentifier))
      .map((student) => {
        const nameLower = student.name.toLowerCase();
        const emailLower = student.email.toLowerCase();
        const emailIdentifierLower = student.emailIdentifier.toLowerCase();
        
        // Parse student name into parts for smarter matching
        const nameParts = nameLower.split(/\s+/).filter((part) => part.length > 0);
        const firstName = nameParts[0] || "";
        const lastName = nameParts[nameParts.length - 1] || "";
        
        // Create search name without middle name (first + last only)
        const searchName = `${firstName} ${lastName}`.trim().toLowerCase();
        
        // Check different matching strategies
        let nameMatch = false;
        let firstNameMatch = false;
        let lastNameMatch = false;
        let firstLastMatch = false;
        
        // Check if input matches search name (first + last, no middle)
        nameMatch = searchName.includes(normalized);
        
        // Check if input matches first name only
        if (inputWords.length === 1 && firstName === normalized) {
          firstNameMatch = true;
        }
        
        // Check if input matches last name only
        if (inputWords.length === 1 && lastName === normalized) {
          lastNameMatch = true;
        }
        
        // Check if input matches "First Last" format (even if student has middle name)
        if (inputWords.length >= 2) {
          const inputFirst = inputWords[0];
          const inputLast = inputWords[inputWords.length - 1];
          
          // Check if first word matches first name and last word matches last name
          if (firstName === inputFirst && lastName === inputLast) {
            firstLastMatch = true;
          }
        }
        
        const emailMatch = emailLower.includes(normalized);
        const identifierMatch = emailIdentifierLower.includes(normalized);
        
        // Consider it a match if any of these conditions are true
        const isMatch = nameMatch || firstNameMatch || lastNameMatch || firstLastMatch || emailMatch || identifierMatch;
        
        if (!isMatch) {
          return null;
        }

        // Calculate score for sorting (exact matches first, then starts with, then contains)
        let score = 0;
        
        // Exact matches get highest priority (using searchName without middle name)
        if (searchName === normalized || emailLower === normalized || emailIdentifierLower === normalized) {
          score = 100;
        } 
        // First Last match gets high priority (even with middle name)
        else if (firstLastMatch) {
          score = 90;
        }
        // Starts with matches (using searchName without middle name)
        else if (searchName.startsWith(normalized) || emailLower.startsWith(normalized) || emailIdentifierLower.startsWith(normalized)) {
          score = 50;
        }
        // First or last name exact match
        else if (firstNameMatch || lastNameMatch) {
          score = 40;
        }
        // Contains matches
        else {
          score = 10;
        }

        // Boost score if name matches (prefer name matches over email matches)
        if ((nameMatch || firstNameMatch || lastNameMatch || firstLastMatch) && !emailMatch && !identifierMatch) {
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

  const handleFriendAdd = (nameOrEmail: string) => {
    if (!nameOrEmail.trim()) {
      setFriendInput("");
      return;
    }

    // Find the student by name or email identifier
    const normalized = nameOrEmail.trim().toLowerCase();
    const inputWords = normalized.split(/\s+/).filter((word) => word.length > 0);
    
    const student = allStudentData.find((s) => {
      const nameLower = s.name.toLowerCase();
      const emailLower = s.email.toLowerCase();
      const emailIdentifierLower = s.emailIdentifier.toLowerCase();
      
      // Parse student name into parts for smarter matching
      const nameParts = nameLower.split(/\s+/).filter((part) => part.length > 0);
      const firstName = nameParts[0] || "";
      const lastName = nameParts[nameParts.length - 1] || "";
      
      // Create search name without middle name (first + last only)
      const searchName = `${firstName} ${lastName}`.trim().toLowerCase();
      
      // Check exact matches first (search name without middle, email, identifier)
      if (searchName === normalized || emailLower === normalized || emailIdentifierLower === normalized) {
        return true;
      }
      
      // Check if input matches "First Last" format (even if student has middle name)
      if (inputWords.length >= 2) {
        const inputFirst = inputWords[0];
        const inputLast = inputWords[inputWords.length - 1];
        
        // Check if first word matches first name and last word matches last name
        if (firstName === inputFirst && lastName === inputLast) {
          return true;
        }
      }
      
      // Check if input matches first name only
      if (inputWords.length === 1 && firstName === normalized) {
        return true;
      }
      
      // Check if input matches last name only
      if (inputWords.length === 1 && lastName === normalized) {
        return true;
      }
      
      // Check if input is contained in search name (without middle), email, or identifier
      if (searchName.includes(normalized) || emailLower.includes(normalized) || emailIdentifierLower.includes(normalized)) {
        return true;
      }
      
      return false;
    });

    if (!student) {
      setError("This person is not in the Stanford undergraduate directory. Please only add friends who are Stanford undergraduates.");
      setFriendInput("");
      return;
    }

    const emailIdentifier = student.emailIdentifier;

    if (closeFriends.includes(emailIdentifier)) {
      setFriendInput("");
      return;
    }

    setCloseFriends((prev) => [...prev, emailIdentifier]);
    setFriendInput("");
    setError(null);
  };

  const handleFriendRemove = (emailIdentifier: string) => {
    setCloseFriends((prev) => prev.filter((friend) => friend !== emailIdentifier));
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
      setError(`Please add at least ${MIN_FRIENDS} students.`);
      return;
    }

    if (!ucBerkeleyChoice) {
      setError("Please answer the UC Berkeley question.");
      return;
    }

    // Validate that all close friends are valid email identifiers from the CSV
    const invalidFriends = closeFriends.filter(
      (emailIdentifier) => !emailToNameMap.has(emailIdentifier)
    );

    if (invalidFriends.length > 0) {
      setError(
        "Some close friends are not in the Stanford undergraduate directory. Please remove them and add only Stanford undergraduates."
      );
      return;
    }

    setStatus("loading");
    setError(null);

    // All close friends should already be email identifiers at this point
    const closeFriendsIdentifiers = closeFriends;

    const response = await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        grad_year: Number(gradYear),
        sex,
        dorm,
        close_friends: closeFriendsIdentifiers,
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
    !ucBerkeleyChoice;

  if (!studentId) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
        <style>{styles}</style>
        <main className="min-h-screen flex items-center justify-center px-6 py-16">
          <div className="relative group max-w-xl w-full">
            <div className="absolute inset-0 bg-amber-400 rounded-3xl transform translate-x-2 translate-y-2 border-2 border-slate-900"></div>
            <div className="relative bg-white border-2 border-slate-900 rounded-3xl p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xl font-black text-amber-900 mb-6">
                We need a signup link to load your survey.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Go to signup
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-4">
              Tell us about yourself
            </h1>
            <p className="text-lg text-slate-600 font-medium mb-2">
              Drop your homies. Literally takes one minute.
            </p>
            {email && (
              <p className="text-sm text-slate-500 font-medium">
                Logged in as <span className="font-bold text-slate-700">{email}</span>
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative group"
          >
            <div className="absolute inset-0 bg-purple-400 rounded-3xl transform translate-x-2 translate-y-2 transition-transform group-hover:translate-x-4 group-hover:translate-y-4 border-2 border-slate-900"></div>
            <div className="relative bg-white border-2 border-slate-900 rounded-3xl p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-bold text-slate-900">First name</span>
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    placeholder="Enter your first name"
                    className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3.5 text-base text-slate-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </label>

                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-bold text-slate-900">Last name</span>
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    placeholder="Enter your last name"
                    className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3.5 text-base text-slate-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </label>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-bold text-slate-900">Class year</span>
                  </div>
                  <select
                    value={gradYear}
                    onChange={(event) => setGradYear(event.target.value)}
                    required
                    className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3.5 text-base text-slate-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  >
                    <option value="">Select year</option>
                    {CLASS_YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-bold text-slate-900">Sex</span>
                  </div>
                  <select
                    value={sex}
                    onChange={(event) => setSex(event.target.value)}
                    required
                    className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3.5 text-base text-slate-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  >
                    <option value="">Select option</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-bold text-slate-900">Dorm</span>
                  </div>
                  <select
                    value={dorm}
                    onChange={(event) => setDorm(event.target.value)}
                    required
                    className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3.5 text-base text-slate-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
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

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <p className="text-sm font-bold text-slate-900">Name Stanford students that you know</p>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Start typing to see suggestions. Only Stanford undergraduates from the directory can be added.
                </p>

                <div className="relative">
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
                    className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3.5 text-base text-slate-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />

                  {friendSuggestions.length > 0 && (
                    <ul className="absolute z-10 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl border-2 border-slate-900 bg-white text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {friendSuggestions.map((student) => (
                        <li key={`${student.name}-${student.email}`}>
                          <button
                            type="button"
                            onClick={() => handleFriendAdd(student.name)}
                            className="flex w-full flex-col items-start px-4 py-2.5 text-left text-slate-700 transition hover:bg-indigo-50 font-medium"
                          >
                            <span className="font-bold">{student.name}</span>
                            <span className="text-xs text-slate-500">{student.email}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-500 font-bold">
                  Added {closeFriends.length} friends (minimum {MIN_FRIENDS}).
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {closeFriends.map((emailIdentifier) => {
                    // Display name without middle name if available, otherwise show email identifier
                    const fullName = emailToNameMap.get(emailIdentifier);
                    const displayName = fullName ? getFirstLastName(fullName) : emailIdentifier;
                    return (
                      <span
                        key={emailIdentifier}
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-100 border-2 border-indigo-300 px-3 py-1.5 text-sm font-bold text-indigo-800"
                      >
                        {displayName}
                        <button
                          type="button"
                          onClick={() => handleFriendRemove(emailIdentifier)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                          aria-label={`Remove ${displayName}`}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block">
                  <span className="text-sm font-bold text-slate-900 mb-2 block">
                    Would you rather have no friends or go to UC Berkeley?
                  </span>
                  <select
                    value={ucBerkeleyChoice}
                    onChange={(event) => setUcBerkeleyChoice(event.target.value)}
                    required
                    className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3.5 text-base text-slate-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
                  >
                    <option value="">Select an option</option>
                    <option value="no_friends">No friends</option>
                    <option value="uc_berkeley">Go to UC Berkeley</option>
                  </select>
                </label>
              </div>

              {error && (
                <div className="rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving your survey...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Submit survey
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
          <style>{styles}</style>
          <main className="min-h-screen flex items-center justify-center px-6 py-16">
            <div className="relative group max-w-xl w-full">
              <div className="absolute inset-0 bg-indigo-400 rounded-3xl transform translate-x-2 translate-y-2 border-2 border-slate-900"></div>
              <div className="relative bg-white border-2 border-slate-900 rounded-3xl p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-lg font-black text-slate-900">Loading survey...</p>
              </div>
            </div>
          </main>
        </div>
      }
    >
      <SurveyPageContent />
    </Suspense>
  );
}

