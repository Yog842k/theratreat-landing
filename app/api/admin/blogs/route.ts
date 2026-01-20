import { NextResponse } from "next/server";
import { getBlogsCollection, mapBlog } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function GET() {
  const col = await getBlogsCollection();
  const docs = await col.find().sort({ updatedAt: -1 }).toArray();
  return NextResponse.json(docs.map(mapBlog));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.title || !body.slug || !body.content) {
    return NextResponse.json({ error: "title, slug, and content are required" }, { status: 400 });
  }

  try {
    const col = await getBlogsCollection();
    const now = new Date();
    const doc = {
      title: body.title,
      slug: body.slug,
      summary: body.summary || "",
      category: body.category || "General",
      tags: Array.isArray(body.tags) ? body.tags : [],
      coverImage: body.coverImage || "",
      readTime: body.readTime || "",
      content: body.content,
      status: body.status || "draft",
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      author: body.author || "Admin",
      createdAt: now,
      updatedAt: now,
    };
    const existing = await col.findOne({ slug: doc.slug });
    if (existing) return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    const result = await col.insertOne(doc);
    return NextResponse.json(mapBlog({ _id: result.insertedId, ...doc }), { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to create blog" }, { status: 400 });
  }
}
