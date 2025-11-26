import { NextRequest, NextResponse } from 'next/server';
import database from '@/lib/database';

// GET /api/therastore/categories - Get all categories
export async function GET() {
  try {
    await database.connect();
    const collection = await database.getCollection('products');
    
    // Get distinct categories
    const categories = await collection.distinct('category', { isActive: true });
    
    // Get category counts
    const categoryData = await Promise.all(
      categories.map(async (category) => {
        const count = await collection.countDocuments({ 
          category, 
          isActive: true 
        });
        return { name: category, count };
      })
    );

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

