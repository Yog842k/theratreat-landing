import { NextRequest, NextResponse } from "next/server";
import { getDb, ContactMessage } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, phone, subject } = body ?? {};

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // simple email check
    const emailOk = /.+@.+\..+/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const db = await getDb();
    const doc: ContactMessage = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      subject: subject ? String(subject).trim() : undefined,
      message: String(message).trim(),
      createdAt: new Date(),
    };

    const result = await db.collection<ContactMessage>("contact_messages").insertOne(doc);

    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (err: any) {
    console.error("/api/contact error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const adminHeader = req.headers.get("x-admin-key");
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) {
      console.warn("ADMIN_KEY not set; blocking GET /api/contact");
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }
    if (!adminHeader || adminHeader !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const items = await db
      .collection<ContactMessage>("contact_messages")
      .find({}, { projection: { _id: 1, name: 1, email: 1, phone: 1, subject: 1, message: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (err: any) {
    console.error("GET /api/contact error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
