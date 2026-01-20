import { NextResponse } from "next/server";
import { getBlogsCollection, mapBlog } from "@/lib/mongo";

export async function GET() {
  const col = await getBlogsCollection();
  const docs = await col.find({ status: "published" }).sort({ updatedAt: -1 }).toArray();
  return NextResponse.json(docs.map(mapBlog));
}
