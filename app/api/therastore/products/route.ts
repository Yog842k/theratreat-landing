import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';
import { ObjectId } from 'mongodb';

// GET /api/therastore/products - Get all products with filters
export async function GET(request: NextRequest) {
  try {
    await database.connect();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const brand = searchParams.get('brand');
    const condition = searchParams.get('condition');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
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
    if (sortBy === 'price') {
      sort.price = sortOrder;
    } else if (sortBy === 'rating') {
      sort.rating = sortOrder;
    } else if (sortBy === 'name') {
      sort.name = sortOrder;
    } else {
      sort.createdAt = sortOrder;
    }

    const collection = await database.getCollection('products');
    const products = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: products || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products', data: [] },
      { status: 500 }
    );
  }
}

// POST /api/therastore/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    await database.connect();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, price, category' },
        { status: 400 }
      );
    }

    const productData = {
      name: body.name,
      description: body.description || '',
      brand: body.brand || '',
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
      category: body.category,
      subcategory: body.subcategory || '',
      images: Array.isArray(body.images) ? body.images : [],
      stock: parseInt(body.stock || '0'),
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

    return NextResponse.json({
      success: true,
      data: { ...productData, _id: result.insertedId }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

