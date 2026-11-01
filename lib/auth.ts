import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import db from "./db";
import type { UserIdentity } from "./types";

export const SESSION_COOKIE = "journey_session";
const MAX_AGE = 60 * 60 * 24 * 30;

type SessionPayload = UserIdentity & { exp: number };
type UserRow = { id: number; username: string; display_name: string; password_hash: string };

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET minimal 32 karakter belum dikonfigurasi.");
  return value;
}

function sign(encoded: string) {
  return createHmac("sha256", secret()).update(encoded).digest("base64url");
}

export function createSession(user: UserIdentity) {
  const payload: SessionPayload = { ...user, exp: Math.floor(Date.now() / 1000) + MAX_AGE };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${encoded}.${sign(encoded)}`, maxAge: MAX_AGE };
}

export function readSession(token?: string): UserIdentity | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: payload.id, username: payload.username, displayName: payload.displayName };
  } catch {
    return null;
  }
}

export function getRequestUser(request: NextRequest) {
  return readSession(request.cookies.get(SESSION_COOKIE)?.value);
}

export function verifyCredentials(username: string, password: string): UserIdentity | null {
  const row = db.prepare("SELECT id, username, display_name, password_hash FROM users WHERE username = ?").get(username.toLowerCase()) as UserRow | undefined;
  if (!row) return null;
  const [salt, stored] = row.password_hash.split(":");
  if (!salt || !stored) return null;
  const candidate = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(stored, "hex");
  if (candidate.length !== storedBuffer.length || !timingSafeEqual(candidate, storedBuffer)) return null;
  return { id: row.id, username: row.username, displayName: row.display_name };
}
