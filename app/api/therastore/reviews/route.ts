import { NextResponse } from 'next/server';
import database from '@/lib/database';
import AuthMiddleware from '@/lib/middleware';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    if (!productId) return NextResponse.json({ ok: false, error: 'productId required' }, { status: 400 });
    const reviews = await database.findMany('therastore_reviews', { productId });
    return NextResponse.json({ ok: true, reviews });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await AuthMiddleware.authenticate(req);
    if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { productId, rating, comment } = body;
    if (!productId || !rating) return NextResponse.json({ ok: false, error: 'productId and rating required' }, { status: 400 });
    const doc = {
      productId,
      rating: Number(rating),
      comment: (comment || '').toString().slice(0, 2000),
      userId: user._id?.toString?.() || user.id || user._id,
      userName: user.name || user.fullName || 'Anonymous',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await database.insertOne('therastore_reviews', doc);
    return NextResponse.json({ ok: true, review: doc }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
