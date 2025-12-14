import { NextResponse } from "next/server";

export async function POST() {
  try {
    const dbModule = await import("@/lib/database.js");
    const dbHelper = (dbModule as any).default || (dbModule as any);
    const db = await dbHelper.connect();
    const col = db.collection("therapists");

    // Prevent duplicates on repeated calls
    const existing = await col.find().toArray();
    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, seeded: 0, message: "therapists already exist" });
    }

    const now = new Date().toISOString();
    const docs = [
      { name: "Dr. Alice Seed", email: "alice.seed@example.com", verified: false, createdAt: now },
      { name: "Dr. Bob Seed", email: "bob.seed@example.com", verified: false, createdAt: now },
      { name: "Dr. Carol Seed", email: "carol.seed@example.com", verified: false, createdAt: now },
    ];
    const res = await col.insertMany(docs);
    return NextResponse.json({ ok: true, seeded: res.insertedCount });
  } catch (err: any) {
    console.error("[dev/seed-therapists] error", err?.message || err);
    return NextResponse.json({ ok: false, error: "seed_failed" }, { status: 500 });
  }
}
