import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { listDestinations } from "@/lib/destinations";
import { cleanText, requireUser } from "@/lib/http";

const validStatuses = new Set(["wishlist", "planned", "visited"]);

function cleanVideoUrl(value: unknown) {
  const text = cleanText(value, 500);
  if (!text) return null;
  try { const url = new URL(text); return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null; }
  catch { return null; }
}

export function GET(request: NextRequest) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  return NextResponse.json({ destinations: listDestinations(auth.user.id) });
}

export async function POST(request: NextRequest) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const body = await request.json().catch(() => ({}));
  const title = cleanText(body.title, 120);
  if (!title) return NextResponse.json({ error: "Nama destinasi wajib diisi." }, { status: 400 });
  const status = validStatuses.has(body.status) ? body.status : "wishlist";
  const videoUrl = cleanVideoUrl(body.videoUrl);
  const result = db.prepare(`
    INSERT INTO destinations (title, location, planned_date, status, notes, video_url, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, cleanText(body.location, 160), cleanText(body.plannedDate, 10) || null, status, cleanText(body.notes, 1500), videoUrl, auth.user.id);
  return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}
