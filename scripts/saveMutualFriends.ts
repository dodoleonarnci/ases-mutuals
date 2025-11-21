// Load environment variables from .env.local before any other imports
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

import { saveMutualFriendsList } from "@/matching/dataAccess";

async function main() {
  try {
    const filePath = await saveMutualFriendsList();
    console.log(`✅ Saved mutual friends list to: ${filePath}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to save mutual friends list:", error);
    process.exit(1);
  }
}

void main();

