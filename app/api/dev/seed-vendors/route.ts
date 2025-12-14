import { NextResponse } from "next/server";

export async function POST() {
  try {
    const dbModule = await import("@/lib/database.js");
    const dbHelper = (dbModule as any).default || (dbModule as any);
    const db = await dbHelper.connect();
    const col = db.collection("vendors");
    const existing = await col.find().toArray();
    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, seeded: 0, message: "vendors already exist" });
    }
    const now = new Date().toISOString();
    const docs = [
      { name: "TheraStore Supplier", email: "vendor1@example.com", verified: false, createdAt: now },
      { name: "Mindful Goods", email: "vendor2@example.com", verified: false, createdAt: now },
    ];
    const res = await col.insertMany(docs);
    return NextResponse.json({ ok: true, seeded: res.insertedCount });
  } catch (err: any) {
    console.error("[dev/seed-vendors] error", err?.message || err);
    return NextResponse.json({ ok: false, error: "seed_failed" }, { status: 500 });
  }
}
