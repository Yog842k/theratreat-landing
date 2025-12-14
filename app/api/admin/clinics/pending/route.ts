import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dbModule = await import("@/lib/database.js");
    const dbHelper = (dbModule as any).default || (dbModule as any);
    const db = await dbHelper.connect();
    const col = db.collection("clinics");
    const all = await col.find().toArray();
    const pending = all
      .filter((c: any) => !c.verified)
      .map((c: any) => ({ id: String(c._id), name: c.name || c.clinicName || c.email || "Unknown", submittedAt: c.createdAt || c.submittedAt || "" }));
    return NextResponse.json(pending);
  } catch (err: any) {
    console.error("[admin/clinics/pending] error", err?.message || err);
    return NextResponse.json([], { status: 200 });
  }
}
