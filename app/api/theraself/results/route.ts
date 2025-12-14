import { NextResponse } from "next/server";
import db from "@/lib/database";
// Try to associate saved results with the authenticated user automatically
// Falls back gracefully if auth is not present
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AuthMiddleware = require("@/lib/middleware");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      childId,
      childName,
      ageYears,
      testId,
      answers,
      rawInattention,
      rawHyperactivity,
      rawImpulsivity,
      scaledInattention,
      scaledHyperactivity,
      scaledImpulsivity,
      overallTheraScore,
      level,
      durationMonths,
      multiSetting,
      functionalImpairment,
      notes,
    } = body || {};

    if (!testId || !answers) {
      return NextResponse.json({ error: "Missing testId or answers" }, { status: 400 });
    }

    const col = await db.getCollection("theraself_results");

    // Attach authenticated userId if available and not already provided
    let authUserId: string | null = null;
    try {
      const authUser = await AuthMiddleware.authenticate(req as any);
      authUserId = String(authUser?._id || "");
    } catch {}
    const doc = {
      userId: (userId ?? authUserId) || null,
      childId: childId || null,
      childName: childName || null,
      ageYears: ageYears !== undefined && ageYears !== null ? Number(ageYears) : null,
      testId: String(testId),
      answers,
      rawInattention: Number(rawInattention ?? 0),
      rawHyperactivity: Number(rawHyperactivity ?? 0),
      rawImpulsivity: Number(rawImpulsivity ?? 0),
      scaledInattention: Number(scaledInattention ?? 0),
      scaledHyperactivity: Number(scaledHyperactivity ?? 0),
      scaledImpulsivity: Number(scaledImpulsivity ?? 0),
      overallTheraScore: Number(overallTheraScore ?? 0),
      level: level || "low",
      durationMonths: durationMonths ?? null,
      multiSetting: Boolean(multiSetting ?? false),
      functionalImpairment: Boolean(functionalImpairment ?? false),
      notes: notes || null,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    const r = await col.insertOne(doc as any);
    const idStr = (r.insertedId && (r.insertedId.toString ? r.insertedId.toString() : r.insertedId)) || null;
    return NextResponse.json({ ok: true, id: idStr, doc: { ...doc, _id: r.insertedId } });
  } catch (err: any) {
    console.error("[theraself/results][POST]", err?.message || err);
    return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const col = await db.getCollection("theraself_results");
    const items = await col.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    return NextResponse.json(items || []);
  } catch (err: any) {
    console.error("[theraself/results][GET]", err?.message || err);
    return NextResponse.json([], { status: 200 });
  }
}