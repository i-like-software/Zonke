import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = db.users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("zonke_auth", user.id, { path: "/", sameSite: "strict" });
  return res;
}