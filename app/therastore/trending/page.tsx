'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingCart, 
  Star,
  ArrowLeft,
  Award,
  Zap,
  Filter,
  LayoutGrid,
  List
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
  isFeatured: boolean;
  fastDelivery: boolean;
}

export default function TrendingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchTrendingProducts();
  }, [sortBy]);

  const fetchTrendingProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('sortBy', sortBy);
      params.append('sortOrder', 'desc');
      params.append('limit', '24');

      const res = await fetch(`/api/therastore/products?${params}`);
      const data = await res.json();
      if (data.success) {
        // Filter to show only products with ratings or high review counts
        const trending = data.data
          .filter((p: Product) => p.rating > 0 || p.reviewCount > 0)
          .sort((a: Product, b: Product) => {
            // Sort by rating first, then by review count
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.reviewCount - a.reviewCount;
          });
        setProducts(trending);
      }
    } catch (error) {
      console.error('Error fetching trending products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('therastore_cart') || '[]');
    const existingItem = cart.find((item: any) => item._id === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('therastore_cart', JSON.stringify(cart));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 animate-in fade-in slide-in-from-top-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Hot Right Now</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 animate-in fade-in slide-in-from-left-4">
            Trending Products
          </h1>
          <p className="text-xl text-white/90 max-w-2xl animate-in fade-in slide-in-from-left-6">
            Discover what's hot right now - the most popular and highly-rated products
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-[#228B22] hover:bg-[#2d5016]' : ''}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-[#228B22] hover:bg-[#2d5016]' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="border-0">
                <div className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="border-0">
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No trending products yet</h3>
              <p className="text-muted-foreground mb-4">Products with ratings will appear here</p>
              <Link href="/therastore/products">
                <Button className="bg-[#228B22] hover:bg-[#2d5016]">Browse All Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {products.map((product, idx) => (
              <Card
                key={product._id}
                className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden cursor-pointer relative hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
                onClick={() => router.push(`/therastore/products/${product._id}`)}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {idx < 3 && (
                  <Badge className="absolute top-3 left-3 z-10 bg-orange-500 text-white">
                    #{idx + 1} Trending
                  </Badge>
                )}
                <div className="relative aspect-square">
                  <Image
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.isFeatured && (
                    <Badge className="absolute top-3 right-3 bg-[#228B22] text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                  <h3 className="font-semibold line-clamp-2 mb-2 text-sm">{product.name}</h3>
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{product.rating || 0}</span>
                    <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#228B22]">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through ml-1">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#228B22] hover:bg-[#2d5016] text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      <ShoppingCart className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

