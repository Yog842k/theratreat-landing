import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const col = await db.getCollection("theraself_tests");
  const { id } = await params;
  const doc = await col.findOne({ $or: [{ _id: db.toObjectId(id) }, { slug: id }] });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json().catch(() => ({}));
    const col = await db.getCollection("theraself_tests");
    const { id } = await params;
    const filter = { $or: [{ _id: db.toObjectId(id) }, { slug: id }] } as any;
    const update: any = { $set: { updatedAt: new Date().toISOString() } };
    if (body.title) update.$set.title = String(body.title);
    if (typeof body.description !== "undefined") update.$set.description = body.description ? String(body.description) : undefined;
    if (typeof body.category !== "undefined") update.$set.category = body.category ? String(body.category) : undefined;
    if (Array.isArray(body.questions)) update.$set.questions = body.questions;
    if (Array.isArray(body.questionSets)) update.$set.questionSets = body.questionSets;
    if (typeof body.scoring !== "undefined") update.$set.scoring = body.scoring;
    const r = await col.updateOne(filter, update);
    if (!r.matchedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const doc = await col.findOne(filter);
    return NextResponse.json(doc);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const col = await db.getCollection("theraself_tests");
  const { id } = await params;
  const r = await col.deleteOne({ $or: [{ _id: db.toObjectId(id) }, { slug: id }] } as any);
  if (!r.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
 
