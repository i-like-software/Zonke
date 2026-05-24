import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { username, password, idNumber, cellphone } = await req.json();

  if (db.users.find((u) => u.username === username)) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const user = { id: crypto.randomUUID(), username, password, idNumber, cellphone };
  db.users.push(user);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("zonke_auth", user.id, { path: "/", sameSite: "strict" });
  return res;
}