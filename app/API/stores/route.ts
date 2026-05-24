import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export function GET() {
  return NextResponse.json(db.stores);
}