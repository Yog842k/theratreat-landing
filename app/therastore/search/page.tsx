'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  ShoppingCart, 
  Star,
  Filter,
  X,
  SlidersHorizontal,
  TrendingUp,
  Award,
  Zap,
  Heart
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  condition: string;
  stock: number;
  isFeatured: boolean;
  fastDelivery: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    }
  }, [query]);

  const fetchSearchResults = async (searchTerm: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/therastore/products?search=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/therastore/search?q=${encodeURIComponent(searchQuery.trim())}`);
      fetchSearchResults(searchQuery.trim());
    }
  };

  const addToCart = (product: Product) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="w-full pl-14 pr-32 py-4 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-emerald-600 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Header */}
        {query && (
          <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-left-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Search Results for "{query}"
              </h1>
              <p className="text-gray-600">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border-2 border-gray-200 hover:border-emerald-600 rounded-full font-semibold transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-full font-semibold focus:outline-none focus:border-emerald-600"
              >
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        ) : !query ? (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <Search className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Search</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Enter a product name, brand, or category to find what you're looking for
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No products found</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search terms or browse our categories
            </p>
            <Link href="/therastore/categories">
              <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105">
                Browse Categories
                <TrendingUp className="inline w-5 h-5 ml-2" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, idx) => {
              const discount = product.originalPrice
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : 0;
              const imageUrl = product.images?.[0] || 'https://via.placeholder.com/400';

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => router.push(`/therastore/products/${product._id}`)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {discount > 0 && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {discount}% OFF
                      </span>
                    )}

                    {product.isFeatured && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Featured
                      </span>
                    )}

                    {product.fastDelivery && (
                      <span className="absolute bottom-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Fast
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Wishlist functionality
                        }}
                        className="p-3 bg-white rounded-full hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="p-3 bg-white rounded-full hover:bg-emerald-600 hover:text-white transition-colors"
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
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        disabled={product.stock === 0}
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}







