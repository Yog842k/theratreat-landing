import { NextRequest } from 'next/server';
import database from '@/lib/database';
import { ObjectId } from 'mongodb';
import { ok, notFound, badRequest, serverError, withRequestHeaders } from '@/lib/api-helpers';

// GET /api/therastore/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await database.connect();
    const collection = await database.getCollection('products');
    
    const { id } = await context.params;

    let product: any = null;
    if (ObjectId.isValid(id)) {
      product = await collection.findOne({ _id: new ObjectId(id) });
    } else {
      // Fallback: allow non-ObjectId identifiers like numeric IDs, SKU, or slug
      const idNum = Number(id);
      const numericQuery = Number.isFinite(idNum) ? [
        { id: idNum },
        { productId: idNum }
      ] : [];
      product = await collection.findOne({ $or: [
        { id },
        { sku: id },
        { slug: id },
        ...numericQuery
      ]});
    }

    if (!product) {
      return notFound('Product not found');
    }

    return ok(product, { headers: Object.fromEntries(withRequestHeaders(request)) });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return serverError(error.message || 'Failed to fetch product');
  }
}

// PUT /api/therastore/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await database.connect();
    const body = await request.json();

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return badRequest('Invalid product ID');
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice ? parseFloat(body.originalPrice) : null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory;
    if (body.images !== undefined) updateData.images = Array.isArray(body.images) ? body.images : [];
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.features !== undefined) updateData.features = Array.isArray(body.features) ? body.features : [];
    if (body.specifications !== undefined) updateData.specifications = body.specifications;
    if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.fastDelivery !== undefined) updateData.fastDelivery = body.fastDelivery;
    if (body.weight !== undefined) updateData.weight = body.weight;
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions;
    if (body.warranty !== undefined) updateData.warranty = body.warranty;

    const collection = await database.getCollection('products');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return notFound('Product not found');
    }

    const updatedProduct = await collection.findOne({ _id: new ObjectId(id) });

    return ok(updatedProduct, { headers: Object.fromEntries(withRequestHeaders(request)) });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return serverError(error.message || 'Failed to update product');
  }
}

// DELETE /api/therastore/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await database.connect();

    const { id } = await context.params;
    if (!ObjectId.isValid(id)) {
      return badRequest('Invalid product ID');
    }

    const collection = await database.getCollection('products');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return notFound('Product not found');
    }

    return ok({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return serverError(error.message || 'Failed to delete product');
  }
}

