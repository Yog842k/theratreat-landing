import { NextResponse } from "next/server";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const dbModule = await import("@/lib/database.js");
    const dbHelper = (dbModule as any).default || (dbModule as any);
    const db = await dbHelper.connect();
    const col = db.collection("clinics");
    await col.updateOne({ _id: params.id }, { $set: { verified: true, verifiedAt: new Date().toISOString() } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[admin/clinics/approve] error", err?.message || err);
    return NextResponse.json({ ok: false, error: "approve_failed" }, { status: 500 });
  }
}
