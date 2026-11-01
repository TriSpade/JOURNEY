import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireUser } from "@/lib/http";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const id = Number((await params).id);
  const result = db.prepare("DELETE FROM messages WHERE id=? AND user_id=?").run(id, auth.user.id);
  return result.changes ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Pesan tidak ditemukan atau bukan milikmu." }, { status: 404 });
}
