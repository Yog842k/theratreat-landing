import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

function ensureCloudinaryConfigured() {
  const hasUrl = !!process.env.CLOUDINARY_URL;
  const hasTriplet = !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET;
  if (!hasUrl && !hasTriplet) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET');
  }
  if (!hasUrl) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  } else {
    cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
  }
}

async function uploadBuffer(buf: Buffer, filename?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'therastore/products', resource_type: 'image', filename_override: filename },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error('No secure_url from Cloudinary'));
        resolve(result.secure_url);
      }
    );
    stream.end(buf);
  });
}

export async function POST(req: NextRequest) {
  try {
    ensureCloudinaryConfigured();
    const form = await req.formData();
    const files = form.getAll('files');
    if (!files || files.length === 0) {
      return Response.json({ success: false, error: 'No files provided' }, { status: 400 });
    }

    const urls: string[] = [];
    for (const f of files) {
      if (typeof f === 'string') continue;
      const file = f as unknown as File;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const url = await uploadBuffer(buffer, file.name);
      urls.push(url);
    }

    return Response.json({ success: true, urls });
  } catch (e: any) {
    return Response.json({ success: false, error: e?.message || 'Upload failed' }, { status: 500 });
  }
}
