import { NextResponse } from "next/server";
import db from "@/lib/database";
import type { ObjectId } from "mongodb";
let MongoObjectId: any = null;
try {
  // Lazy import to avoid bundling issues if driver differs
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MongoObjectId = require("mongodb").ObjectId;
} catch {}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const col = await db.getCollection("theraself_results");
    let objId: ObjectId | null = null;
    try {
      objId = (await (db as any).toObjectId?.(id)) || null;
    } catch {}
    if (!objId && MongoObjectId) {
      try {
        objId = new MongoObjectId(id);
      } catch {}
    }
    let item = null as any;
    if (objId) {
      item = await col.findOne({ _id: objId });
    }
    if (!item) {
      // Fallback: try raw string id
      item = await col.findOne({ _id: id as any });
    }
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (err: any) {
    console.error("[theraself/results/:id][GET]", err?.message || err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { reportText, childName, ageYears, heuristics } = body || {};
    const col = await db.getCollection("theraself_results");
    const { id } = await params;
    let objId: any = null;
    try {
      objId = await (db as any).toObjectId?.(id);
    } catch {}
    if (!objId && MongoObjectId) {
      try { objId = new MongoObjectId(id); } catch {}
    }
    const query = objId ? { _id: objId } : { _id: id as any };
    const r = await col.updateOne(query, { $set: { reportText: reportText || null, childName: childName || null, ageYears: ageYears ?? null, heuristics: heuristics || null, modifiedAt: new Date() } });
    return NextResponse.json({ ok: true, modified: r.modifiedCount === 1 });
  } catch (err: any) {
    console.error("[theraself/results/:id][PUT]", err?.message || err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}