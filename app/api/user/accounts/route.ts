import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export function GET(req: NextRequest) {
  const userId = req.cookies.get("zonke_auth")?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storeIds = db.userAccounts.get(userId) ?? [];
  const accounts = db.stores.filter((s) => storeIds.includes(s.id));
  const user = db.users.find((u) => u.id === userId);

  return NextResponse.json({ username: user?.username ?? "", accounts });
}

export async function POST(req: NextRequest) {
  const userId = req.cookies.get("zonke_auth")?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeIds } = await req.json();
  db.userAccounts.set(userId, storeIds);

  return NextResponse.json({ ok: true });
}