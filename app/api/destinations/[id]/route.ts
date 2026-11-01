import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { cleanText, requireUser } from "@/lib/http";

const validStatuses = new Set(["wishlist", "planned", "visited"]);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Destinasi tidak valid." }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const title = cleanText(body.title, 120);
  if (!title) return NextResponse.json({ error: "Nama destinasi wajib diisi." }, { status: 400 });
  const status = validStatuses.has(body.status) ? body.status : "wishlist";
  const budget = body.budget === "" || body.budget == null ? null : Math.max(0, Math.round(Number(body.budget)));
  const result = db.prepare(`
    UPDATE destinations SET title=?, location=?, planned_date=?, status=?, budget=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
  `).run(title, cleanText(body.location, 160), cleanText(body.plannedDate, 10) || null, status, Number.isFinite(budget) ? budget : null, cleanText(body.notes, 1500), id);
  return result.changes ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Destinasi tidak ditemukan." }, { status: 404 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireUser(request);
  if (!auth.user) return auth.response;
  const id = Number((await params).id);
  const result = db.prepare("DELETE FROM destinations WHERE id = ?").run(id);
  return result.changes ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Destinasi tidak ditemukan." }, { status: 404 });
}
