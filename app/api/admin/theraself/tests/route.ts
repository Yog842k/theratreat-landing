import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";

export async function GET() {
  const col = await db.getCollection("theraself_tests");
  const items = await col.find({}).toArray();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.slug || !body.title) {
      return NextResponse.json({ error: "Missing slug or title" }, { status: 400 });
    }
    const col = await db.getCollection("theraself_tests");
    const existing = await col.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    const doc = {
      slug: String(body.slug),
      title: String(body.title),
      description: body.description ? String(body.description) : undefined,
      category: body.category ? String(body.category) : undefined,
      questions: Array.isArray(body.questions) ? body.questions : [],
      questionSets: Array.isArray(body.questionSets) ? body.questionSets : [],
      scoring: body.scoring ?? undefined,
      updatedAt: new Date().toISOString(),
    };
    const r = await col.insertOne(doc as any);
    return NextResponse.json({ _id: r.insertedId, ...doc }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
 
