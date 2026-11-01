import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { cleanText, requireUser } from "@/lib/http";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const destinationId = Number((await params).id);
  const body = await request.json().catch(() => ({}));
  const message = cleanText(body.body, 500);
  if (!message) return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
  const result = db.prepare("INSERT INTO messages (destination_id, user_id, body) VALUES (?, ?, ?)").run(destinationId, auth.user.id, message);
  return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}
