import { mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";

const databasePath = process.env.DATABASE_PATH ?? join(process.cwd(), "data", "journey.db");
export const uploadDirectory = join(dirname(databasePath), "uploads");

export async function ensureUploadDirectory() {
  await mkdir(uploadDirectory, { recursive: true });
}

export function safeUploadPath(name: string) {
  if (!/^[a-f0-9-]+\.(?:jpg|png|webp)$/.test(name)) return null;
  return join(uploadDirectory, name);
}

export async function deleteUploadedPhoto(name: string | null | undefined) {
  if (!name) return;
  const path = safeUploadPath(name);
  if (path) await rm(path, { force: true });
}
