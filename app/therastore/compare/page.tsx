'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ShoppingCart, 
  Star,
  Trash2,
  ArrowRight,
  Package,
  Check,
  XCircle
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
  features?: string[];
  specifications?: Record<string, string>;
}

export default function ComparePage() {
  const router = useRouter();
  const [compareList, setCompareList] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('therastore_compare');
      if (saved) {
        const items = JSON.parse(saved);
        setCompareList(items);
      }
    } catch (error) {
      console.error('Error loading compare list:', error);
    }
  }, []);

  const removeFromCompare = (productId: string) => {
    try {
      const updated = compareList.filter(item => item._id !== productId);
      setCompareList(updated);
      localStorage.setItem('therastore_compare', JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing from compare:', error);
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
      router.push('/therastore/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const getSpecValue = (product: Product, key: string) => {
    if (product.specifications && product.specifications[key]) {
      return product.specifications[key];
    }
    return '-';
  };

  const allSpecKeys = compareList.reduce((acc, product) => {
    if (product.specifications) {
      Object.keys(product.specifications).forEach(key => {
        if (!acc.includes(key)) {
          acc.push(key);
        }
      });
    }
    return acc;
  }, [] as string[]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                Compare Products
              </h1>
              <p className="text-xl text-gray-600">
                Compare up to 4 products side by side
              </p>
            </div>
            <Link href="/therastore/products">
              <button className="px-6 py-3 text-emerald-600 font-semibold hover:bg-emerald-50 rounded-full transition-colors border border-emerald-200 flex items-center gap-2">
                Add More Products
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>

        {compareList.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <Package className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No products to compare</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Add products to compare their features and specifications
            </p>
            <Link href="/therastore/products">
              <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105">
                Browse Products
                <ArrowRight className="inline w-5 h-5 ml-2" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compareList.length + 1}, minmax(280px, 1fr))` }}>
                {/* Header Row */}
                <div className="sticky left-0 z-10 bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Specifications</h3>
                </div>
                {compareList.map((product) => (
                  <div key={product._id} className="bg-white rounded-2xl p-6 border border-gray-200 relative animate-in fade-in slide-in-from-bottom-4">
                    <button
                      onClick={() => removeFromCompare(product._id)}
                      className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="aspect-square mb-4 rounded-xl overflow-hidden">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/400'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 
                      className="font-bold text-lg mb-2 hover:text-emerald-600 transition-colors cursor-pointer"
                      onClick={() => router.push(`/therastore/products/${product._id}`)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{product.brand}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{product.rating}</span>
                      <span className="text-sm text-gray-500">({product.reviewCount})</span>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-600 mb-4">
                      ₹{product.price.toLocaleString()}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                ))}

                {/* Price Row */}
                <div className="sticky left-0 z-10 bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900">Price</h3>
                </div>
                {compareList.map((product) => (
                  <div key={`price-${product._id}`} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="text-2xl font-extrabold text-emerald-600">
                      ₹{product.price.toLocaleString()}
                    </div>
                    {product.originalPrice && (
                      <div className="text-sm text-gray-400 line-through mt-1">
                        ₹{product.originalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}

                {/* Rating Row */}
                <div className="sticky left-0 z-10 bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900">Rating</h3>
                </div>
                {compareList.map((product) => (
                  <div key={`rating-${product._id}`} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{product.rating}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{product.reviewCount} reviews</p>
                  </div>
                ))}

                {/* Condition Row */}
                <div className="sticky left-0 z-10 bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900">Condition</h3>
                </div>
                {compareList.map((product) => (
                  <div key={`condition-${product._id}`} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full">
                      {product.condition}
                    </span>
                  </div>
                ))}

                {/* Stock Row */}
                <div className="sticky left-0 z-10 bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900">Stock</h3>
                </div>
                {compareList.map((product) => (
                  <div key={`stock-${product._id}`} className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2">
                      {product.stock > 0 ? (
                        <>
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-green-600">{product.stock} available</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="font-semibold text-red-600">Out of Stock</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Features Row */}
                {compareList.some(p => p.features && p.features.length > 0) && (
                  <>
                    <div className="sticky left-0 z-10 bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="font-bold text-gray-900">Key Features</h3>
                    </div>
                    {compareList.map((product) => (
                      <div key={`features-${product._id}`} className="bg-white rounded-2xl p-6 border border-gray-200">
                        <ul className="space-y-2">
                          {product.features && product.features.length > 0 ? (
                            product.features.slice(0, 5).map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-400">-</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </>
                )}

                {/* Specifications Rows */}
                {allSpecKeys.map((specKey) => (
                  <div key={specKey}>
                    <div className="sticky left-0 z-10 bg-white rounded-2xl p-6 border border-gray-200">
                      <h3 className="font-bold text-gray-900">{specKey}</h3>
                    </div>
                    {compareList.map((product) => (
                      <div key={`${specKey}-${product._id}`} className="bg-white rounded-2xl p-6 border border-gray-200">
                        <p className="text-gray-700">{getSpecValue(product, specKey)}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}







