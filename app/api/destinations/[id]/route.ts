import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { cleanText, requireUser } from "@/lib/http";
import { deleteUploadedPhoto } from "@/lib/uploads";

const validStatuses = new Set(["wishlist", "planned", "visited"]);

function cleanVideoUrls(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.slice(0, 20).map((item) => cleanText(item, 500)).filter((text) => {
    try { const url = new URL(text); return url.protocol === "http:" || url.protocol === "https:"; }
    catch { return false; }
  }).map((text) => new URL(text).toString()))];
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
    UPDATE destinations SET title=?, location=?, planned_date=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
  `).run(title, cleanText(body.location, 160), cleanText(body.plannedDate, 10) || null, status, cleanText(body.notes, 1500), id);
  if (result.changes) {
    const replaceVideos = db.transaction((urls: string[]) => {
      db.prepare("DELETE FROM destination_media WHERE destination_id=? AND type='video'").run(id);
      const insert = db.prepare("INSERT OR IGNORE INTO destination_media (destination_id, type, value, created_by) VALUES (?, 'video', ?, ?)");
      for (const url of urls) insert.run(id, url, auth.user.id);
    });
    replaceVideos(cleanVideoUrls(body.videoUrls));
  }
  return result.changes ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Destinasi tidak ditemukan." }, { status: 404 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const id = Number((await params).id);
  const photos = db.prepare("SELECT value FROM destination_media WHERE destination_id=? AND type='photo'").all(id) as Array<{ value: string }>;
  const result = db.prepare("DELETE FROM destinations WHERE id = ?").run(id);
  if (result.changes) await Promise.all(photos.map((photo) => deleteUploadedPhoto(photo.value)));
  return result.changes ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Destinasi tidak ditemukan." }, { status: 404 });
}
