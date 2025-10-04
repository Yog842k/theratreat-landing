import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

// Expect these in .env.local
// CLOUDINARY_CLOUD_NAME=...
// CLOUDINARY_API_KEY=...
// CLOUDINARY_API_SECRET=...

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

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
    if (file.size > 2 * 1024 * 1024) { // 2MB
      return NextResponse.json({ success: false, message: 'File too large (max 2MB)' }, { status: 400 });
    }
    // Validate MIME
    const valid = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!valid.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Unsupported file type' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        {
          folder: 'theratreat/profile',
          resource_type: 'image',
          transformation: [
            { width: 512, height: 512, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' },
            { quality: 'auto:good' }
          ],
          overwrite: true,
          invalidate: true
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
    console.error('Profile upload error:', e?.message);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
