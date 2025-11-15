import { fetchAndStoreDataset } from "@/matching/dataAccess";

async function main() {
  try {
    const result = await fetchAndStoreDataset();
    console.log(
      `✅ Saved dataset to ${result.filePath}. Counts:`,
      JSON.stringify(result.counts),
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to fetch and store dataset:", error);
    process.exit(1);
  }
}

void main();

