import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireUser } from "@/lib/http";
import { deleteUploadedPhoto } from "@/lib/uploads";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const id = Number((await params).id);
  const media = db.prepare("SELECT type, value FROM destination_media WHERE id=?").get(id) as { type: "photo" | "video"; value: string } | undefined;
  if (!media) return NextResponse.json({ error: "Media tidak ditemukan." }, { status: 404 });
  db.prepare("DELETE FROM destination_media WHERE id=?").run(id);
  if (media.type === "photo") await deleteUploadedPhoto(media.value);
  return NextResponse.json({ ok: true });
}
