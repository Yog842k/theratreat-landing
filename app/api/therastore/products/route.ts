import { NextRequest } from 'next/server';
import database from '@/lib/database';
import { ok, serverError, badRequest, withRequestHeaders } from '@/lib/api-helpers';

// GET /api/therastore/products - Get all products with filters
export async function GET(request: NextRequest) {
  try {
    await database.connect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const search = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('minPrice') || undefined;
    const maxPrice = searchParams.get('maxPrice') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const condition = searchParams.get('condition') || undefined;
    const featured = searchParams.get('featured') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const pageStr = searchParams.get('page') || '1';
    const limitStr = searchParams.get('limit') || '20';
    const page = Math.max(1, parseInt(pageStr));
    const limit = Math.min(100, Math.max(1, parseInt(limitStr)));
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { isActive: true };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (brand) filter.brand = brand;
    if (condition) filter.condition = condition;
    if (featured === 'true') filter.isFeatured = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort
    const sort: any = {};
    const orderNum = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'price') sort.price = orderNum;
    else if (sortBy === 'rating') sort.rating = orderNum;
    else if (sortBy === 'name') sort.name = orderNum;
    else sort.createdAt = orderNum;

    const collection = await database.getCollection('products');
    // Use an aggregation pipeline to support our collection shim
    const pipeline: any[] = [
      { $match: filter },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ];
    const products = await collection.aggregate(pipeline).toArray();

    const totalAgg = await collection
      .aggregate([{ $match: filter }, { $count: 'count' }])
      .toArray();
    const total = totalAgg.length ? totalAgg[0].count : 0;

    return ok(products || [], {
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit)
      },
      headers: Object.fromEntries(withRequestHeaders(request)),
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return serverError(error.message || 'Failed to fetch products');
  }
}

// POST /api/therastore/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    await database.connect();
    const body = await request.json();
    if (!body || !body.name || !body.price || !body.category) {
      return badRequest('Missing required fields: name, price, category');
    }

    const productData = {
      name: body.name,
      description: body.description || '',
      brand: body.brand || '',
      price: typeof body.price === 'string' ? parseFloat(body.price) : body.price,
      originalPrice: body.originalPrice ? (typeof body.originalPrice === 'string' ? parseFloat(body.originalPrice) : body.originalPrice) : null,
      category: body.category,
      subcategory: body.subcategory || '',
      images: Array.isArray(body.images) ? body.images : [],
      stock: typeof body.stock === 'string' ? parseInt(body.stock) : (body.stock ?? 0),
      sku: body.sku || `SKU-${Date.now()}`,
      condition: body.condition || 'New',
      rating: 0,
      reviewCount: 0,
      features: Array.isArray(body.features) ? body.features : [],
      specifications: body.specifications || {},
      tags: Array.isArray(body.tags) ? body.tags : [],
      isActive: body.isActive !== undefined ? body.isActive : true,
      isFeatured: body.isFeatured || false,
      fastDelivery: body.fastDelivery || false,
      weight: body.weight,
      dimensions: body.dimensions,
      warranty: body.warranty,
      seller: body.seller,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const collection = await database.getCollection('products');
    const result = await collection.insertOne(productData);

    return ok({ ...productData, _id: result.insertedId }, { status: 201, headers: Object.fromEntries(withRequestHeaders(request)) });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return serverError(error.message || 'Failed to create product');
  }
}

