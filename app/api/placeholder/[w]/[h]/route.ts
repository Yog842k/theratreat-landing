import { NextResponse } from 'next/server';

// Simple solid PNG generator (1x1 scaled) to avoid 404s for placeholder images
function pngBuffer(width: number, height: number, rgba: [number, number, number, number] = [200, 200, 200, 255]) {
  // Minimal 1x1 gray PNG; we won't dynamically draw per pixel to keep it tiny.
  // For simplicity, return a fixed tiny PNG and rely on browser scaling; width/height not embedded.
  // This is acceptable as a placeholder.
  const base64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9m5t4AAAAASUVORK5CYII=';
  return Buffer.from(base64, 'base64');
}

export async function GET(_req: Request, context: { params: Promise<{ w: string; h: string }> }) {
  const { w: wStr, h: hStr } = await context.params;
  const w = parseInt(wStr, 10) || 1;
  const h = parseInt(hStr, 10) || 1;
  const buf = pngBuffer(w, h);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
