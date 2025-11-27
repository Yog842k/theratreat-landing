import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';

// GET /api/therastore/categories - Get all categories
export async function GET() {
  try {
    await database.connect();
    const collection = await database.getCollection('products');

    // Use aggregation to compute distinct categories with counts
    const pipeline = [
      { $match: { isActive: true, category: { $exists: true, $ne: '' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
      { $sort: { name: 1 } }
    ];
    const categoryData = await collection.aggregate(pipeline).toArray();

    return NextResponse.json({
      success: true,
      data: categoryData || []
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories', data: [] },
      { status: 500 }
    );
  }
}

