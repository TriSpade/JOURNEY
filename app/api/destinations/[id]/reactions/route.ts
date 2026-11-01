import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { cleanText, requireUser } from "@/lib/http";

const allowed = new Set(["❤️", "😍", "✨", "👍", "🥰"]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const destinationId = Number((await params).id);
  const body = await request.json().catch(() => ({}));
  const emoji = cleanText(body.emoji, 8);
  if (!allowed.has(emoji)) return NextResponse.json({ error: "Reaction tidak valid." }, { status: 400 });
  const existing = db.prepare("SELECT 1 FROM reactions WHERE destination_id=? AND user_id=? AND emoji=?").get(destinationId, auth.user.id, emoji);
  if (existing) db.prepare("DELETE FROM reactions WHERE destination_id=? AND user_id=? AND emoji=?").run(destinationId, auth.user.id, emoji);
  else db.prepare("INSERT INTO reactions (destination_id, user_id, emoji) VALUES (?, ?, ?)").run(destinationId, auth.user.id, emoji);
  return NextResponse.json({ active: !existing });
}
