'use client';

// NOTE: Removed stray redirect + second default export.
// This page now properly renders the products listing without runtime import ordering issues.

import { useState, useEffect, Suspense } from 'react';
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
import { therastoreCategories, therastoreFilters, therastoreSortOptions } from '@/constants/app-data';

// Removed mockProducts: use API data only
const mockProducts: any[] = [];

const mockCategories: any[] = [];

function ProductsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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

  // Fetch products from API based on current filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedBrand && selectedBrand !== 'all') params.set('brand', selectedBrand);
        if (selectedCondition && selectedCondition !== 'all') params.set('condition', selectedCondition);
        if (priceRange.min) params.set('minPrice', String(priceRange.min));
        if (priceRange.max) params.set('maxPrice', String(priceRange.max));
        if (sortBy) params.set('sortBy', sortBy);
        if (sortOrder) params.set('sortOrder', sortOrder);
        params.set('page', String(page));
        params.set('limit', '20');

        const res = await fetch(`/api/therastore/products?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data || []);
          const pg = data.pagination?.totalPages || 1;
          setTotalPages(pg);
          // Derive categories from current page results if none provided
          const uniqueCats: string[] = Array.from(new Set(((data.data || []) as any[]).map((p: any) => p.category).filter((c: any) => typeof c === 'string')));
          setCategories(uniqueCats.map((n) => ({ name: n })) as any);
        } else {
          setProducts([]);
          setTotalPages(1);
        }
      } catch (e) {
        setProducts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedBrand, selectedCondition, priceRange.min, priceRange.max, sortBy, sortOrder, page]);

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
      // Fallback to static categories if API fails
      const fallback = therastoreCategories.map(cat => ({ name: cat.label, count: 0 }));
      setCategories(fallback);
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
    <Suspense fallback={null}>
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
                {[...therastoreFilters.condition.values].map(v => (
                  <option key={v} value={v}>{v[0].toUpperCase() + v.slice(1)}</option>
                ))}
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
                {therastoreSortOptions.map(opt => (
                  <option key={opt.key} value={opt.key === 'price-asc' ? 'price-low' : opt.key === 'price-desc' ? 'price-high' : opt.key === 'newest' ? 'createdAt' : opt.key}>
                    {opt.label}
                  </option>
                ))}
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
    </Suspense>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductCard({ product, viewMode }: { product: any; viewMode: 'grid' | 'list' }) {
  const router = useRouter();
  const imageUrl = product.images?.[0];
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  const handleAddToCart = async (e?: React.MouseEvent) => {
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

      // Sync to server cart (JWT-based)
      try {
        const token = localStorage.getItem('token')
          || localStorage.getItem('authToken')
          || localStorage.getItem('auth_token')
          || localStorage.getItem('access_token');
        if (token) {
          const qty = (cart.find((i: any) => i._id === product._id)?.quantity) || 1;
          await fetch('/api/therastore/cart', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: String(product._id),
              name: product.name,
              price: Number(product.price || 0),
              quantity: Number(qty),
            }),
          });
        }
      } catch {}
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