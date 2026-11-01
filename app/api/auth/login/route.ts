import { NextRequest, NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, verifyCredentials } from "@/lib/auth";
import { cleanText } from "@/lib/http";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const username = cleanText(body.username, 40).toLowerCase();
  const password = cleanText(body.password, 200);
  const user = verifyCredentials(username, password);
  if (!user) return NextResponse.json({ error: "Nama pengguna atau kata sandi salah." }, { status: 401 });
  const { token, maxAge } = createSession(user);
  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
  return response;
}
