import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { cleanText, requireUser } from "@/lib/http";
import { deleteUploadedPhoto } from "@/lib/uploads";

const validStatuses = new Set(["wishlist", "planned", "visited"]);

function cleanVideoUrl(value: unknown) {
  const text = cleanText(value, 500);
  if (!text) return null;
  try { const url = new URL(text); return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null; }
  catch { return null; }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Destinasi tidak valid." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const title = cleanText(body.title, 120);
  if (!title) return NextResponse.json({ error: "Nama destinasi wajib diisi." }, { status: 400 });
  const status = validStatuses.has(body.status) ? body.status : "wishlist";
  const result = db.prepare(`
    UPDATE destinations SET title=?, location=?, planned_date=?, status=?, notes=?, video_url=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
  `).run(title, cleanText(body.location, 160), cleanText(body.plannedDate, 10) || null, status, cleanText(body.notes, 1500), cleanVideoUrl(body.videoUrl), id);
  return result.changes ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Destinasi tidak ditemukan." }, { status: 404 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const id = Number((await params).id);
  const existing = db.prepare("SELECT photo_path FROM destinations WHERE id = ?").get(id) as { photo_path: string | null } | undefined;
  const result = db.prepare("DELETE FROM destinations WHERE id = ?").run(id);
  if (result.changes) await deleteUploadedPhoto(existing?.photo_path);
  return result.changes ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Destinasi tidak ditemukan." }, { status: 404 });
}
