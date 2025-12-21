import { NextResponse } from "next/server";
import db from "@/lib/database.js";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const col = await db.getCollection("therapists");
    const oid = db.toObjectId(id);
    await col.updateOne(
      { _id: oid },
      { $set: { verified: true, status: "approved", verifiedAt: new Date().toISOString(), rejected: false } }
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[admin/therapists/approve] error", err?.message || err);
    return NextResponse.json({ ok: false, error: "approve_failed" }, { status: 500 });
  }
}
