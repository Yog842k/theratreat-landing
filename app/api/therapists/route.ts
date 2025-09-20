import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const adminHeader = req.headers.get("x-admin-key");
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) {
      console.warn("ADMIN_KEY not set; blocking GET /api/therapists");
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }
    if (!adminHeader || adminHeader !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const items = await db
      .collection("therapist_applications")
      .find({}, {
        projection: {
          _id: 1,
          createdAt: 1,
          status: 1,
          "personalInfo.firstName": 1,
          "personalInfo.lastName": 1,
          "personalInfo.email": 1,
          "personalInfo.phone": 1,
          "professionalInfo.licenseNumber": 1,
          "professionalInfo.primarySpecialty": 1,
          "practiceDetails.serviceTypes": 1,
          "location.primaryAddress": 1,
        }
      })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (err: any) {
    console.error("GET /api/therapists error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
