import { NextRequest, NextResponse } from "next/server";
import { getBlogsCollection, mapBlog } from "@/lib/mongo";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const col = await getBlogsCollection();
  const doc = await col.findOne({ slug, status: "published" });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapBlog(doc));
}
