import path from "node:path";
import { promises as fs } from "node:fs";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { Friendship, Match, Student } from "@/types/domain";

const DATA_DIR = path.join(process.cwd(), "src", "matching", "data");
const DEFAULT_DATA_FILE = path.join(DATA_DIR, "local_dataset.json");

export type MatchingDataset = {
  students: Student[];
  friendships: Friendship[];
  matches: Match[];
};

const client = createServiceRoleClient();

async function fetchTable<T>(tableName: string): Promise<T[]> {
  const { data, error } = await client.from(tableName).select("*");

  if (error) {
    throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
  }

  return (data ?? []) as T[];
}

export async function fetchMatchingDataset(): Promise<MatchingDataset> {
  const [students, friendships, matches] = await Promise.all([
    fetchTable<Student>("students"),
    fetchTable<Friendship>("friendships"),
    fetchTable<Match>("matches"),
  ]);

  return {
    students,
    friendships,
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
    friendships: dataset.friendships.length,
    matches: dataset.matches.length,
  };
}

fetchAndStoreDataset().then(({ filePath, counts }) => {
    console.log("Saved dataset to", filePath, counts);
  });
