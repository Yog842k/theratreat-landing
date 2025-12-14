import { NextResponse } from "next/server";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const dbModule = await import("@/lib/database.js");
    const dbHelper = (dbModule as any).default || (dbModule as any);
    const db = await dbHelper.connect();
    const col = db.collection("vendors");
    await col.updateOne({ _id: params.id }, { $set: { verified: false, rejected: true, rejectedAt: new Date().toISOString() } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[admin/vendors/reject] error", err?.message || err);
    return NextResponse.json({ ok: false, error: "reject_failed" }, { status: 500 });
  }
}
