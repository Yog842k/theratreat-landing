import { NextResponse } from "next/server";
import db from "@/lib/database.js";

export async function GET() {
  try {
    const col = await db.getCollection("therapists");
    // Pending = not verified, not rejected, and not approved in status
    const docs = await col.find({
      $and: [
        { $or: [
            { isVerified: { $exists: false } },
            { isVerified: false },
            { verified: { $exists: false } },
            { verified: false }
        ] },
        { $or: [{ rejected: { $exists: false } }, { rejected: false }] },
        { $or: [{ status: { $exists: false } }, { status: { $ne: "approved" } }] }
      ]
    }).toArray();
    const pending = docs.map((t: any) => ({
      id: String(t._id),
      name: t.name || t.fullName || t.email || "Unknown",
      submittedAt: t.createdAt || t.submittedAt || ""
    }));
    return NextResponse.json(pending);
  } catch (err: any) {
    console.error("[admin/therapists/pending] error", err?.message || err);
    return NextResponse.json([], { status: 200 });
  }
}
