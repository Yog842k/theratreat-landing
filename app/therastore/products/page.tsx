'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingCart, 
  Star,
  LayoutGrid,
  List,
  Filter,
  X,
  Award,
  Zap,
  ChevronDown,
  SlidersHorizontal,
  TrendingUp,
  Package,
  Heart,
  ArrowUpDown
} from 'lucide-react';

// Mock data for demo
const mockProducts = [
  {
    _id: '1',
    name: 'Professional Massage Table with Adjustable Height',
    brand: 'TherapyPro',
    price: 24999,
    originalPrice: 32999,
    rating: 4.8,
    reviewCount: 234,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop'],
    category: 'Therapy Equipment',
    condition: 'New',
    stock: 15,
    isFeatured: true,
    fastDelivery: true
  },
  {
    _id: '2',
    name: 'Electric Therapy Stimulator Device',
    brand: 'MediTech',
    price: 8999,
    originalPrice: 12999,
    rating: 4.6,
    reviewCount: 156,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=600&fit=crop'],
    category: 'Medical Devices',
    condition: 'New',
    stock: 8,
    isFeatured: true,
    fastDelivery: true
  },
  {
    _id: '3',
    name: 'Premium Yoga Mat with Alignment Guide',
    brand: 'WellnessHub',
    price: 2499,
    originalPrice: 3999,
    rating: 4.9,
    reviewCount: 445,
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop'],
    category: 'Wellness',
    condition: 'New',
    stock: 50,
    isFeatured: true,
    fastDelivery: false
  },
  {
    _id: '4',
    name: 'Resistance Bands Professional Set',
    brand: 'FitPro',
    price: 1999,
    rating: 4.7,
    reviewCount: 289,
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop'],
    category: 'Exercise Tools',
    condition: 'New',
    stock: 30,
    isFeatured: false,
    fastDelivery: true
  },
  {
    _id: '5',
    name: 'Ergonomic Wheelchair with Premium Cushion',
    brand: 'MobilityPlus',
    price: 45999,
    originalPrice: 59999,
    rating: 4.8,
    reviewCount: 167,
    images: ['https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&h=600&fit=crop'],
    category: 'Mobility Aids',
    condition: 'New',
    stock: 5,
    isFeatured: true,
    fastDelivery: false
  },
  {
    _id: '6',
    name: 'Heat Therapy Pad with Auto Timer',
    brand: 'TheraCare',
    price: 3499,
    originalPrice: 4999,
    rating: 4.5,
    reviewCount: 312,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop'],
    category: 'Therapy Equipment',
    condition: 'New',
    stock: 20,
    isFeatured: true,
    fastDelivery: true
  },
  {
    _id: '7',
    name: 'Digital Blood Pressure Monitor',
    brand: 'MediTech',
    price: 2999,
    rating: 4.6,
    reviewCount: 543,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=600&fit=crop'],
    category: 'Medical Devices',
    condition: 'New',
    stock: 45,
    isFeatured: false,
    fastDelivery: true
  },
  {
    _id: '8',
    name: 'Foam Roller for Deep Tissue Massage',
    brand: 'WellnessHub',
    price: 1499,
    rating: 4.7,
    reviewCount: 678,
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop'],
    category: 'Wellness',
    condition: 'New',
    stock: 100,
    isFeatured: false,
    fastDelivery: true
  }
];

const mockCategories = [
  { name: 'Therapy Equipment', count: 45 },
  { name: 'Medical Devices', count: 32 },
  { name: 'Wellness', count: 28 },
  { name: 'Exercise Tools', count: 56 },
  { name: 'Mobility Aids', count: 38 },
  { name: 'Rehabilitation', count: 41 }
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(mockProducts);
  const [categories, setCategories] = useState(mockCategories);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || 'all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory, selectedBrand, selectedCondition, priceRange, sortBy, sortOrder, page, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/therastore/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedBrand !== 'all') params.append('brand', selectedBrand);
      if (selectedCondition !== 'all') params.append('condition', selectedCondition);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (searchQuery) params.append('search', searchQuery);
      if (searchParams?.get('featured') === 'true') params.append('featured', 'true');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', page.toString());
      params.append('limit', '24');

      const res = await fetch(`/api/therastore/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Keep using mock data on error
    } finally {
      setLoading(false);
    }
  };


  const brands = Array.from(new Set(products.map(p => p.brand)));
  
  const activeFilters = [
    selectedCategory !== 'all' && { type: 'category', value: selectedCategory },
    selectedBrand !== 'all' && { type: 'brand', value: selectedBrand },
    selectedCondition !== 'all' && { type: 'condition', value: selectedCondition },
    priceRange.min && { type: 'minPrice', value: `Min: ₹${priceRange.min}` },
    priceRange.max && { type: 'maxPrice', value: `Max: ₹${priceRange.max}` },
  ].filter(Boolean);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedCondition('all');
    setPriceRange({ min: '', max: '' });
    setSearchQuery('');
  };

  const removeFilter = (type: string) => {
    if (type === 'category') setSelectedCategory('all');
    else if (type === 'brand') setSelectedBrand('all');
    else if (type === 'condition') setSelectedCondition('all');
    else if (type === 'minPrice') setPriceRange(prev => ({ ...prev, min: '' }));
    else if (type === 'maxPrice') setPriceRange(prev => ({ ...prev, max: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 animate-in fade-in slide-in-from-top-4">
            <Package className="w-5 h-5" />
            <span className="text-sm font-medium">Premium Healthcare Store</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 animate-in fade-in slide-in-from-left-4">
            All Products
          </h1>
          <p className="text-xl text-emerald-50 max-w-2xl animate-in fade-in slide-in-from-left-6">
            Explore our complete collection of certified healthcare and wellness equipment
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by product name, brand, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button className="group px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border-2 border-gray-200 hover:border-emerald-600 hover:text-emerald-600 font-semibold rounded-full transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Conditions</option>
                <option value="New">New</option>
                <option value="Refurbished">Refurbished</option>
                <option value="Used">Used</option>
              </select>

              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-600">Active Filters:</span>
              {activeFilters.map((filter, idx) => {
                if (!filter || typeof filter === 'boolean' || typeof filter === 'string') return null;
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {filter.value}
                    <button
                      onClick={() => removeFilter(filter.type)}
                      className="hover:bg-emerald-100 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-red-600 hover:text-red-700 underline"
              >
                Clear All
              </button>
            </div>
          )}

          {/* View Controls & Sort */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <span className="ml-4 text-sm text-gray-600 font-medium">
                {products.length} Products
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'price-low') {
                    setSortBy('price');
                    setSortOrder('asc');
                  } else if (value === 'price-high') {
                    setSortBy('price');
                    setSortOrder('desc');
                  } else {
                    setSortBy(value === 'newest' ? 'createdAt' : value);
                    setSortOrder('desc');
                  }
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              >
                <option value="createdAt">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12'
                : 'space-y-4 mb-12'
            }>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-full hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all hover:scale-105"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-full font-medium transition-all hover:scale-110 ${
                      page === i + 1
                        ? 'bg-emerald-600 text-white shadow-lg scale-110'
                        : 'border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-full hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all hover:scale-105"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, viewMode }: { product: any; viewMode: 'grid' | 'list' }) {
  const router = useRouter();
  const imageUrl = product.images?.[0];
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem('therastore_cart') || '[]');
      const existingItem = cart.find((item: any) => item._id === product._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem('therastore_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={() => router.push(`/therastore/products/${product._id}`)}
      >
        <div className="flex gap-6 p-6">
          <div className="relative w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden group/image">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {discount}% OFF
              </span>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full mb-3">
                {product.category}
              </span>
              <h3 
                className="text-xl font-bold text-gray-900 mb-2 hover:text-emerald-600 transition-colors cursor-pointer"
                onClick={() => router.push(`/therastore/products/${product._id}`)}
              >
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-sm">{product.rating}</span>
                <span className="text-sm text-gray-500">({product.reviewCount})</span>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                {product.condition}
              </span>
              {product.fastDelivery && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Fast Delivery
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-3xl font-extrabold text-emerald-600">
                  ₹{product.price.toLocaleString()}
                </div>
                {product.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-3 border-2 border-gray-200 hover:border-emerald-600 hover:text-emerald-600 rounded-xl transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
                disabled={product.stock === 0}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onClick={() => router.push(`/therastore/products/${product._id}`)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between">
          {discount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              {discount}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1 ml-auto">
              <Award className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>
        
        {product.fastDelivery && (
          <span className="absolute bottom-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Fast
          </span>
        )}
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button className="p-3 bg-white rounded-full hover:bg-emerald-600 hover:text-white transition-all hover:scale-110 shadow-lg">
            <Heart className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => handleAddToCart(e)}
            className="p-3 bg-white rounded-full hover:bg-emerald-600 hover:text-white transition-all hover:scale-110 shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-5 space-y-3">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full mb-3">
            {product.category}
          </span>
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-sm">{product.rating}</span>
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-xs text-gray-600 font-medium">{product.stock} in stock</span>
        </div>
        
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-2xl font-extrabold text-emerald-600">
                ₹{product.price.toLocaleString()}
              </div>
              {product.originalPrice && (
                <div className="text-sm text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </div>
              )}
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
              {product.condition}
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
            disabled={product.stock === 0}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}