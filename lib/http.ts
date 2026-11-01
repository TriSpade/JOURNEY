import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRequestUser } from "./auth";

export function requireUser(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return { user: null, response: NextResponse.json({ error: "Silakan login dahulu." }, { status: 401 }) };
  return { user, response: null };
}

export function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
