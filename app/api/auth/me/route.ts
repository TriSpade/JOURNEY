import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";

export function GET(request: NextRequest) {
  const user = getRequestUser(request);
  return user ? NextResponse.json({ user }) : NextResponse.json({ error: "Belum login." }, { status: 401 });
}
