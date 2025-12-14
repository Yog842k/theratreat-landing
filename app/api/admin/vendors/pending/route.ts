import { NextResponse } from "next/server";

export async function GET() {
  try {
    const dbModule = await import("@/lib/database.js");
    const dbHelper = (dbModule as any).default || (dbModule as any);
    const db = await dbHelper.connect();
    const col = db.collection("vendors");
    const all = await col.find().toArray();
    const pending = all
      .filter((v: any) => !v.verified)
      .map((v: any) => ({ id: String(v._id), name: v.name || v.vendorName || v.email || "Unknown", submittedAt: v.createdAt || v.submittedAt || "" }));
    return NextResponse.json(pending);
  } catch (err: any) {
    console.error("[admin/vendors/pending] error", err?.message || err);
    return NextResponse.json([], { status: 200 });
  }
}
