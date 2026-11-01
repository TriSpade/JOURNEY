import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
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
  if (!db.prepare("SELECT 1 FROM destinations WHERE id=?").get(id)) return NextResponse.json({ error: "Destinasi tidak ditemukan." }, { status: 404 });
  const currentCount = (db.prepare("SELECT COUNT(*) AS count FROM destination_media WHERE destination_id=? AND type='photo'").get(id) as { count: number }).count;
  const form = await request.formData();
  const files = form.getAll("photos").filter((item): item is File => item instanceof File);
  if (!files.length) return NextResponse.json({ error: "Pilih foto terlebih dahulu." }, { status: 400 });
  if (currentCount + files.length > 12) return NextResponse.json({ error: "Maksimal 12 foto per destinasi." }, { status: 400 });
  for (const file of files) {
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Foto harus berformat JPG, PNG, atau WebP." }, { status: 400 });
    if (file.size > maxBytes) return NextResponse.json({ error: `Foto ${file.name} melebihi 8 MB.` }, { status: 400 });
  }
  await ensureUploadDirectory();
  const saved: Array<{ filename: string; url: string }> = [];
  try {
    for (const file of files) {
      const filename = `${randomUUID()}${allowedTypes.get(file.type)}`;
      const target = safeUploadPath(filename);
      if (!target) throw new Error("Nama file tidak valid.");
      await writeFile(target, Buffer.from(await file.arrayBuffer()));
      db.prepare("INSERT INTO destination_media (destination_id, type, value, created_by) VALUES (?, 'photo', ?, ?)").run(id, filename, auth.user.id);
      saved.push({ filename, url: `/api/uploads/${filename}` });
    }
    return NextResponse.json({ photos: saved.map((item) => item.url) });
  } catch (error) {
    await Promise.all(saved.map((item) => deleteUploadedPhoto(item.filename)));
    throw error;
  }
}
