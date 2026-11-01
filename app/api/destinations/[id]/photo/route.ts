import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireUser } from "@/lib/http";
import { deleteUploadedPhoto, ensureUploadDirectory, safeUploadPath } from "@/lib/uploads";

const allowedTypes = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"]]);
const maxBytes = 8 * 1024 * 1024;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const id = Number((await params).id);
  const existing = db.prepare("SELECT photo_path FROM destinations WHERE id = ?").get(id) as { photo_path: string | null } | undefined;
  if (!existing) return NextResponse.json({ error: "Destinasi tidak ditemukan." }, { status: 404 });
  const form = await request.formData();
  const file = form.get("photo");
  if (!(file instanceof File)) return NextResponse.json({ error: "Pilih foto terlebih dahulu." }, { status: 400 });
  const extension = allowedTypes.get(file.type) ?? (extname(file.name).toLowerCase() === ".jpg" ? ".jpg" : null);
  if (!extension || !allowedTypes.has(file.type)) return NextResponse.json({ error: "Foto harus berformat JPG, PNG, atau WebP." }, { status: 400 });
  if (file.size > maxBytes) return NextResponse.json({ error: "Ukuran foto maksimal 8 MB." }, { status: 400 });
  const filename = `${randomUUID()}${extension}`;
  await ensureUploadDirectory();
  const target = safeUploadPath(filename);
  if (!target) return NextResponse.json({ error: "Nama file tidak valid." }, { status: 400 });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));
  db.prepare("UPDATE destinations SET photo_path=?, updated_at=CURRENT_TIMESTAMP WHERE id=?").run(filename, id);
  await deleteUploadedPhoto(existing.photo_path);
  return NextResponse.json({ photoUrl: `/api/uploads/${filename}` });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const id = Number((await params).id);
  const existing = db.prepare("SELECT photo_path FROM destinations WHERE id = ?").get(id) as { photo_path: string | null } | undefined;
  if (!existing) return NextResponse.json({ error: "Destinasi tidak ditemukan." }, { status: 404 });
  db.prepare("UPDATE destinations SET photo_path=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
  await deleteUploadedPhoto(existing.photo_path);
  return NextResponse.json({ ok: true });
}
