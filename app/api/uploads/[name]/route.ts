import { readFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireUser } from "@/lib/http";
import { safeUploadPath } from "@/lib/uploads";

const types: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const name = (await params).name;
  const path = safeUploadPath(name);
  if (!path) return NextResponse.json({ error: "File tidak valid." }, { status: 400 });
  const referenced = db.prepare("SELECT 1 FROM destination_media WHERE type='photo' AND value=?").get(name);
  if (!referenced) return NextResponse.json({ error: "Foto tidak ditemukan." }, { status: 404 });
  try {
    const data = await readFile(path);
    const extension = name.split(".").pop() ?? "jpg";
    return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": types[extension] ?? "application/octet-stream", "Cache-Control": "private, max-age=3600" } });
  } catch {
    return NextResponse.json({ error: "Foto tidak ditemukan." }, { status: 404 });
  }
}
