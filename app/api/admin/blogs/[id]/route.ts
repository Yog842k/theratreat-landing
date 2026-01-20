import { NextRequest, NextResponse } from "next/server";
import { getBlogsCollection, mapBlog } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const col = await getBlogsCollection();
    const _id = new ObjectId(id);
    const existing = await col.findOne({ _id });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.slug && body.slug !== existing.slug) {
      const dup = await col.findOne({ slug: body.slug });
      if (dup) return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const updateDoc: any = { ...body, updatedAt: new Date() };
    if (body.scheduledFor !== undefined) {
      updateDoc.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
    }
    const res = await col.findOneAndUpdate(
      { _id },
      { $set: updateDoc },
      { returnDocument: "after" }
    );
    const updated = res?.value;
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapBlog(updated));
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to update blog" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const col = await getBlogsCollection();
    const _id = new ObjectId(id);
    const res = await col.deleteOne({ _id });
    if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }
}
