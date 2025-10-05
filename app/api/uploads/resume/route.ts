import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// POST /api/uploads/resume
// Accepts a single PDF (max 5MB) and uploads using Cloudinary resource_type 'raw'.
export async function POST(req: Request) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json({ success: false, message: 'Cloudinary not configured' }, { status: 500 });
    }
    const form = await req.formData();
    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, message: 'Only PDF files allowed' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File too large (max 5MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          folder: 'theratreat/resumes',
          resource_type: 'raw',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          invalidate: false,
          format: 'pdf'
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
    console.error('Resume upload error:', e?.message);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
