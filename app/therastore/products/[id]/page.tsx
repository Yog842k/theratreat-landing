'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Heart, 
  Star,
  Plus,
  Minus,
  Truck,
  Shield,
  Package,
  ArrowLeft,
  Check
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
  subcategory?: string;
  condition: string;
  stock: number;
  fastDelivery: boolean;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  warranty?: string;
  weight?: string;
  dimensions?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchProduct();
    }
  }, [params?.id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/therastore/products/${String(params?.id)}`);
      const data = await res.json();
      if (data.success) {
        setProduct(data.data);
        setSelectedImage(0);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('therastore_cart') || '[]');
    const existingItem = cart.find((item: any) => item._id === product._id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    
    localStorage.setItem('therastore_cart', JSON.stringify(cart));
    router.push('/therastore/cart');
  };

  const buyNow = () => {
    addToCart();
    router.push('/therastore/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#228B22]"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Product not found</h3>
            <Button onClick={() => router.push('/therastore')} className="mt-4 bg-[#228B22] hover:bg-[#2d5016]">
              Back to Store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop'];
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-gray-100 rounded-full transition-all hover:scale-105 animate-in fade-in slide-in-from-left-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid gap-12 lg:grid-cols-2 mb-12 animate-in fade-in slide-in-from-bottom-4">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-2xl group animate-in fade-in slide-in-from-right-4">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-[#228B22] shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
            <div>
              <Badge className="mb-4 bg-[#228B22]/10 text-[#228B22] border-[#228B22]/20">{product.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">{product.name}</h1>
              <p className="text-xl text-muted-foreground font-medium">{product.brand}</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{product.rating || 0}</span>
                <span className="text-muted-foreground">({product.reviewCount || 0} reviews)</span>
              </div>
              <Badge variant={product.condition === 'New' ? 'secondary' : 'outline'}>
                {product.condition}
              </Badge>
            </div>

            <div className="space-y-3 p-6 bg-gradient-to-br from-[#228B22]/5 to-[#2d5016]/5 rounded-2xl border border-[#228B22]/10">
              <div className="flex items-center space-x-4">
                <span className="text-5xl font-bold text-[#228B22]">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-3xl text-muted-foreground line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                    <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                      {discount}% OFF
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-muted-foreground text-sm">Inclusive of all taxes</p>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Key Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-[#228B22]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Specifications:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center space-x-2 border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock} available
                </span>
              </div>

            <div className="flex space-x-4">
              <Button
                className="flex-1 bg-[#228B22] hover:bg-[#2d5016] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 rounded-full"
                onClick={addToCart}
                disabled={product.stock === 0}
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsInWishlist(!isInWishlist)}
                size="lg"
                className="border-2 hover:bg-red-50 rounded-full transition-all hover:scale-105"
              >
                <Heart className={`w-5 h-5 transition-all ${isInWishlist ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
              </Button>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-[#228B22] to-[#2d5016] hover:from-[#2d5016] hover:to-[#1a3d0f] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 rounded-full"
              size="lg"
              onClick={buyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </Button>
            </div>

            {product.fastDelivery && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-[#228B22]" />
                  <span className="font-semibold text-[#228B22]">Fast Delivery Available</span>
                </div>
                <p className="text-sm text-green-700 mt-1">Get it delivered within 24-48 hours</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
              <div className="text-center">
                <Truck className="w-6 h-6 text-[#228B22] mx-auto mb-2" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders above ₹2,000</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-[#228B22] mx-auto mb-2" />
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% secure</p>
              </div>
              <div className="text-center">
                <Package className="w-6 h-6 text-[#228B22] mx-auto mb-2" />
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Product Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {product.description || 'No description available.'}
            </p>
            {product.warranty && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold">Warranty:</p>
                <p className="text-muted-foreground">{product.warranty}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

