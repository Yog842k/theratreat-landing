import database from '@/lib/database';
import { ok, serverError } from '@/lib/api-helpers';
import { therastoreCategories } from '@/constants/app-data';

// GET /api/therastore/categories - Get all categories
export async function GET() {
  try {
    await database.connect();
    // Prefer dedicated categories collection if present
    const categoriesCollection = await database.getCollection('categories');
    // Use projection via options for compatibility with mock drivers that don't support cursor.project()
    const cursor = categoriesCollection.find({ active: { $ne: false } }, { projection: { _id: 0, name: 1, key: 1, count: 1 } });
    const existing = typeof (cursor as any).toArray === 'function'
      ? await (cursor as any).toArray()
      : Array.isArray(cursor)
        ? cursor
        : [];
    if (existing && existing.length > 0) {
      return ok(existing.map(c => ({ name: c.name, count: c.count || 0 })));
    }

    // Fallback: derive from products aggregation
    const products = await database.getCollection('products');
    const pipeline = [
      { $match: { isActive: true, category: { $exists: true, $ne: '' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
      { $sort: { name: 1 } }
    ];
    const categoryData = await products.aggregate(pipeline).toArray();
    if (categoryData && categoryData.length > 0) {
      return ok(categoryData);
    }

    // Final fallback: static constants
    const fallback = therastoreCategories.map(cat => ({ name: cat.label, count: 0 }));
    return ok(fallback);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    // As last resort, serve static constants
    try {
      const fallback = therastoreCategories.map(cat => ({ name: cat.label, count: 0 }));
      return ok(fallback);
    } catch {}
    return serverError(error.message || 'Failed to fetch categories');
  }
}

// POST /api/therastore/categories - Seed or upsert categories into DB
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = Array.isArray(body?.categories) ? body.categories : therastoreCategories.map(cat => ({
      key: cat.key,
      name: cat.label,
      subcategories: cat.subcategories,
      count: 0,
      active: true,
    }));

    await database.connect();
    const categories = await database.getCollection('categories');

    // Upsert each category by key
    for (const c of input) {
      await categories.updateOne(
        { key: c.key },
        { $set: { name: c.name, key: c.key, subcategories: c.subcategories || [], active: c.active !== false }, $setOnInsert: { count: c.count || 0, createdAt: new Date() } },
        { upsert: true }
      );
    }

    const saved = await categories.find({}).project({ _id: 0, name: 1, key: 1, count: 1 }).toArray();
    return ok({ message: 'Categories upserted', categories: saved });
  } catch (error: any) {
    console.error('Error seeding categories:', error);
    return serverError(error.message || 'Failed to seed categories');
  }
}

