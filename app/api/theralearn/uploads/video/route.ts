import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ success: false, message: "No file provided" }), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "videos");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${safeName}`;
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, buffer);

    const url = `/uploads/videos/${filename}`;
    return new Response(JSON.stringify({ success: true, url }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[upload video]", e?.message || e);
    return new Response(JSON.stringify({ success: false, message: "Upload failed" }), { status: 500 });
  }
}
