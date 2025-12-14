import mongoose, { Schema, Model, InferSchemaType } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    brand: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    category: { type: String, index: true },
    subcategory: { type: String },
    sku: { type: String, index: true },
    condition: { type: String, enum: ['New', 'Refurbished', 'Used'], default: 'New' },
    stock: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    features: { type: [String], default: [] },
    specifications: { type: Schema.Types.Mixed, default: {} },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    fastDelivery: { type: Boolean, default: false },
    weight: { type: String },
    dimensions: { type: String },
    warranty: { type: String },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    seller: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

export type ProductDocument = InferSchemaType<typeof ProductSchema> & { _id: mongoose.Types.ObjectId };

const Product: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>('Product', ProductSchema);

export default Product;
