'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  ShoppingCart, 
  Star,
  Trash2,
  ArrowRight,
  Package,
  X
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
  stock: number;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (userId) {
          const res = await fetch(`/api/therastore/wishlist?userId=${encodeURIComponent(userId)}`, { credentials: 'include' });
          const json = await res.json();
          if (json?.data) {
            const items = json.data.items || [];
            setWishlist(items);
            try { localStorage.setItem('therastore_wishlist', JSON.stringify(items)); } catch {}
            setLoading(false);
            return;
          }
        }
        // Fallback to localStorage
        const saved = localStorage.getItem('therastore_wishlist');
        if (saved) setWishlist(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading wishlist:', error);
        try {
          const saved = localStorage.getItem('therastore_wishlist');
          if (saved) setWishlist(JSON.parse(saved));
        } catch {}
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const removeFromWishlist = async (productId: string) => {
    try {
      const updated = wishlist.filter(item => item._id !== productId);
      setWishlist(updated);
      localStorage.setItem('therastore_wishlist', JSON.stringify(updated));
      const userId = localStorage.getItem('user_id');
      if (userId) {
        await fetch('/api/therastore/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId, action: 'remove', productId }),
        });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                My Wishlist
              </h1>
              <p className="text-xl text-gray-600">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <Link href="/therastore/products">
              <button className="px-6 py-3 text-emerald-600 font-semibold hover:bg-emerald-50 rounded-full transition-colors border border-emerald-200 flex items-center gap-2">
                Continue Shopping
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <Heart className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Start adding products you love to your wishlist
            </p>
            <Link href="/therastore/products">
              <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105">
                Explore Products
                <ArrowRight className="inline w-5 h-5 ml-2" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product, idx) => {
              const discount = product.originalPrice
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : 0;
              const imageUrl = product.images?.[0] || 'https://via.placeholder.com/400';

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${idx * 0.05}s` }}
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

                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={() => router.push(`/therastore/products/${product._id}`)}
                        className="p-3 bg-white rounded-full hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        <Package className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="p-3 bg-white rounded-full hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-50"
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
                      <h3 
                        className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-emerald-600 transition-colors cursor-pointer"
                        onClick={() => router.push(`/therastore/products/${product._id}`)}
                      >
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
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      <Link href={`/therastore/products/${product._id}`} className="block text-center mt-2 text-sm text-emerald-700 hover:underline">View Details</Link>
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







