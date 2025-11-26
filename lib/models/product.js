const database = require('../database');

class Product {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.brand = data.brand;
    this.price = data.price;
    this.originalPrice = data.originalPrice;
    this.category = data.category;
    this.subcategory = data.subcategory;
    this.images = data.images || [];
    this.stock = data.stock || 0;
    this.sku = data.sku;
    this.condition = data.condition || 'New'; // New, Refurbished, Used
    this.rating = data.rating || 0;
    this.reviewCount = data.reviewCount || 0;
    this.features = data.features || [];
    this.specifications = data.specifications || {};
    this.tags = data.tags || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isFeatured = data.isFeatured || false;
    this.fastDelivery = data.fastDelivery || false;
    this.weight = data.weight;
    this.dimensions = data.dimensions;
    this.warranty = data.warranty;
    this.seller = data.seller; // User ID or seller info
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async create(data) {
    const product = new Product(data);
    const result = await database.insertOne('products', product);
    return { ...product, _id: result.insertedId };
  }

  static async findById(id) {
    const { ObjectId } = require('mongodb');
    return await database.findOne('products', { _id: new ObjectId(id) });
  }

  static async findAll(filter = {}, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    const collection = await database.getCollection('products');
    return await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  static async update(id, data) {
    const { ObjectId } = require('mongodb');
    data.updatedAt = new Date();
    return await database.updateOne(
      'products',
      { _id: new ObjectId(id) },
      { $set: data }
    );
  }

  static async delete(id) {
    const { ObjectId } = require('mongodb');
    return await database.deleteOne('products', { _id: new ObjectId(id) });
  }

  static async search(query, filters = {}) {
    const collection = await database.getCollection('products');
    const searchFilter = {
      isActive: true,
      ...filters
    };

    if (query) {
      searchFilter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    return await collection.find(searchFilter).toArray();
  }

  static async getByCategory(category, limit = 20) {
    return await this.findAll(
      { category, isActive: true },
      { limit, sort: { createdAt: -1 } }
    );
  }

  static async getFeatured(limit = 10) {
    return await this.findAll(
      { isFeatured: true, isActive: true },
      { limit, sort: { rating: -1 } }
    );
  }
}

module.exports = Product;

