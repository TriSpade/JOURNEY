import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { listDestinations } from "@/lib/destinations";
import { cleanText, requireUser } from "@/lib/http";

const validStatuses = new Set(["wishlist", "planned", "visited"]);

function cleanVideoUrls(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.slice(0, 20).map((item) => cleanText(item, 500)).filter((text) => {
    try { const url = new URL(text); return url.protocol === "http:" || url.protocol === "https:"; }
    catch { return false; }
  }).map((text) => new URL(text).toString()))];
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
  const result = db.prepare(`
    INSERT INTO destinations (title, location, planned_date, status, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, cleanText(body.location, 160), cleanText(body.plannedDate, 10) || null, status, cleanText(body.notes, 1500), auth.user.id);
  const id = Number(result.lastInsertRowid);
  const insertVideo = db.prepare("INSERT OR IGNORE INTO destination_media (destination_id, type, value, label, created_by) VALUES (?, 'video', ?, ?, ?)");
  for (const url of cleanVideoUrls(body.videoUrls)) insertVideo.run(id, url, title, auth.user.id);
  return NextResponse.json({ id }, { status: 201 });
}
