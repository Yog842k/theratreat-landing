import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ success: false, message: "Cloudinary not configured" }, { status: 500 });
    }                       

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ success: false, message: "Unsupported file type" }, { status: 400 });
    }

    const maxSizeMb = 5;
    if (file.size > maxSizeMb * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "File too large (max 5MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          folder: "theralearn/webinars",
          resource_type: "image",
          format: undefined,
          overwrite: false,
          invalidate: true,
          transformation: [{ width: 1600, height: 900, crop: "limit", quality: "auto", fetch_format: "auto" }],
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ success: true, data: { url: uploaded.secure_url, publicId: uploaded.public_id } });
  } catch (e: any) {
    console.error("Webinar thumbnail upload error:", e?.message || e);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}
