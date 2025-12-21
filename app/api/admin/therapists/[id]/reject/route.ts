import { NextResponse } from "next/server";
import db from "@/lib/database.js";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const col = await db.getCollection("therapists");
    const oid = db.toObjectId(id);
    await col.updateOne(
      { _id: oid },
      { $set: { verified: false, status: "rejected", rejected: true, rejectedAt: new Date().toISOString() } }
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[admin/therapists/reject] error", err?.message || err);
    return NextResponse.json({ ok: false, error: "reject_failed" }, { status: 500 });
  }
}
