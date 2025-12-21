import { NextResponse } from "next/server";
import db from "@/lib/database.js";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const col = await db.getCollection("therapists");
    const oid = db.toObjectId(id);
    const doc = await col.findOne({ _id: oid });
    if (!doc) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    return NextResponse.json(doc);
  } catch (err: any) {
    console.error("[admin/therapists/get] error", err?.message || err);
    return NextResponse.json({ ok: false, error: "get_failed" }, { status: 500 });
  }
}
