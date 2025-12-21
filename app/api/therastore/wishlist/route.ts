import { NextRequest } from 'next/server';
import database from '@/lib/database';
import { ok, badRequest, serverError, withRequestHeaders } from '@/lib/api-helpers';
import { ObjectId } from 'mongodb';

type ProductSnapshot = {
  _id: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number | null;
  images?: string[];
  category?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
};

// GET /api/therastore/wishlist?userId=...
export async function GET(req: NextRequest) {
  try {
    await database.connect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return badRequest('Missing userId');
    const col = await database.getCollection('therastore_wishlist');
    const wl = await col.findOne({ userId });
    return ok(wl || { userId, items: [] as ProductSnapshot[] }, { headers: Object.fromEntries(withRequestHeaders(req)) });
  } catch (e: any) {
    return serverError(e.message || 'Failed to fetch wishlist');
  }
}

// POST /api/therastore/wishlist
// Body: { userId: string, action: 'add'|'remove', productId: string }
export async function POST(req: NextRequest) {
  try {
    await database.connect();
    const body = await req.json();
    const userId = body?.userId;
    const action = body?.action;
    const productId = body?.productId;
    if (!userId || typeof userId !== 'string') return badRequest('Invalid userId');
    if (!productId || typeof productId !== 'string') return badRequest('Invalid productId');
    if (action !== 'add' && action !== 'remove') return badRequest('Invalid action');

    const wlCol = await database.getCollection('therastore_wishlist');

    if (action === 'remove') {
      // First, pull the item from the array
      await wlCol.updateOne(
        { userId },
        { $pull: { items: { _id: String(productId) } } } as any
      );
      // Then, update the updatedAt field (and set createdAt if not present)
      await wlCol.updateOne(
        { userId },
        { $set: { updatedAt: new Date() }, $setOnInsert: { createdAt: new Date(), userId } },
        { upsert: true }
      );
      const wl = await wlCol.findOne({ userId });
      return ok(wl || { userId, items: [] });
    }

    // action === 'add' → fetch product snapshot
    const products = await database.getCollection('products');
    let prod: any = null;
    try {
      if (ObjectId.isValid(productId)) {
        prod = await products.findOne({ _id: new ObjectId(productId) });
      }
      if (!prod) {
        // fallback by id/sku/slug
        const idNum = Number(productId);
        const or: any[] = [ { id: productId }, { sku: productId }, { slug: productId } ];
        if (Number.isFinite(idNum)) or.push({ id: idNum }, { productId: idNum });
        prod = await products.findOne({ $or: or });
      }
    } catch {}
    if (!prod) return badRequest('Product not found');

    const snapshot: ProductSnapshot = {
      _id: String(prod._id ?? productId),
      name: String(prod.name || ''),
      brand: prod.brand || '',
      price: Number(prod.price) || 0,
      originalPrice: prod.originalPrice != null ? Number(prod.originalPrice) : null,
      images: Array.isArray(prod.images) ? prod.images.slice(0, 4) : [],
      category: prod.category || '',
      stock: Number.isFinite(prod.stock) ? Number(prod.stock) : undefined,
      rating: Number.isFinite(prod.rating) ? Number(prod.rating) : 0,
      reviewCount: Number.isFinite(prod.reviewCount) ? Number(prod.reviewCount) : 0,
    };

    // Ensure uniqueness by _id
    // First, pull the item if it exists
    await wlCol.updateOne(
      { userId },
      { $pull: { items: { _id: String(snapshot._id) } } } as any
    );
    // Then, push the new snapshot and update timestamps
    await wlCol.updateOne(
      { userId },
      { $push: { items: snapshot } as any, $set: { updatedAt: new Date() }, $setOnInsert: { userId, createdAt: new Date() } },
      { upsert: true }
    );
    const wl = await wlCol.findOne({ userId });
    return ok(wl || { userId, items: [] }, { status: 201 });
  } catch (e: any) {
    return serverError(e.message || 'Failed to update wishlist');
  }
}
