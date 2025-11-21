import path from "node:path";
import { promises as fs } from "node:fs";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { Match, Student } from "@/types/domain";

const DATA_DIR = path.join(process.cwd(), "src", "matching", "data");
const DEFAULT_DATA_FILE = path.join(DATA_DIR, "local_dataset.json");

export type MatchingDataset = {
  students: Student[];
  matches: Match[];
};

function getClient() {
  return createServiceRoleClient();
}

async function fetchTable<T>(tableName: string): Promise<T[]> {
  const client = getClient();
  const { data, error } = await client.from(tableName).select("*");

  if (error) {
    throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
  }

  return (data ?? []) as T[];
}

export async function fetchMatchingDataset(): Promise<MatchingDataset> {
  const [students, matches] = await Promise.all([
    fetchTable<Student>("students"),
    fetchTable<Match>("matches"),
  ]);

  return {
    students,
    matches,
  };
}

export async function saveDatasetLocally(
  dataset: MatchingDataset,
  filePath = DEFAULT_DATA_FILE,
) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(dataset, null, 2), "utf-8");
  return filePath;
}

export async function fetchAndStoreDataset(filePath = DEFAULT_DATA_FILE) {
  const dataset = await fetchMatchingDataset();
  await saveDatasetLocally(dataset, filePath);
  return { filePath, counts: mapDatasetCounts(dataset) };
}

function mapDatasetCounts(dataset: MatchingDataset) {
  return {
    students: dataset.students.length,
    matches: dataset.matches.length,
  };
}

/**
 * Collects all unique friend email identifiers from all students' close_friends lists.
 * Returns a set of unique email identifiers.
 */
function findMutualFriends(students: Student[]): Set<string> {
  const allFriends = new Set<string>();

  for (const student of students) {
    if (!student.close_friends || student.close_friends.length === 0) {
      continue;
    }

    // Add all friends from this student's close_friends list
    for (const friendId of student.close_friends) {
      allFriends.add(friendId);
    }
  }

  return allFriends;
}

/**
 * Saves the list of all mutual friends' email addresses to a new file.
 * Each call creates a new file with a timestamp.
 * Email format: {identifier}@stanford.edu
 */
export async function saveMutualFriendsList(): Promise<string> {
  const students = await fetchTable<Student>("students");
  const mutualFriends = findMutualFriends(students);

  // Convert identifiers to full email addresses
  const emailList = Array.from(mutualFriends)
    .map((identifier) => `${identifier}@stanford.edu`)
    .sort();

  // Create filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `mutual_friends_${timestamp}.txt`;
  const filePath = path.join(DATA_DIR, fileName);

  // Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Write emails to file (one per line)
  await fs.writeFile(filePath, emailList.join("\n") + "\n", "utf-8");

  return filePath;
}
