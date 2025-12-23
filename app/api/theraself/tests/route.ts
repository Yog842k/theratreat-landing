import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dbModule = await import("@/lib/database.js");
    const dbHelper = (dbModule as any).default || (dbModule as any);
    const db = await dbHelper.connect();
    const col = db.collection("theraself_tests");
    const items = await col.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(items || []);
  } catch (err: any) {
    console.error("[theraself/tests][GET]", err?.message || err);
    return NextResponse.json([], { status: 200 });
  }
}
