'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2,
  ArrowLeft,
  CreditCard,
  Package
} from 'lucide-react';

interface CartItem {
  _id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  images: string[];
  quantity: number;
  stock: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('therastore_cart') || '[]');
    setCartItems(cart);
    setLoading(false);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    const cart = JSON.parse(localStorage.getItem('therastore_cart') || '[]');
    const updatedCart = cart.map((item: CartItem) => 
      item._id === id ? { ...item, quantity: Math.max(1, Math.min(newQuantity, item.stock)) } : item
    );
    localStorage.setItem('therastore_cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  const removeItem = (id: string) => {
    const cart = JSON.parse(localStorage.getItem('therastore_cart') || '[]');
    const updatedCart = cart.filter((item: CartItem) => item._id !== id);
    localStorage.setItem('therastore_cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 2000 ? 0 : 99;
  const total = subtotal + deliveryFee;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#228B22]"></div>
          <p className="mt-4 text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden mb-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 animate-in fade-in slide-in-from-top-4">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-medium">Your Cart</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 animate-in fade-in slide-in-from-left-4">
                Shopping Cart
              </h1>
              <p className="text-emerald-50 animate-in fade-in slide-in-from-left-6">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/therastore')}
              className="text-white hover:bg-white/10 rounded-full transition-all hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-4">Add some products to get started</p>
              <Link href="/therastore">
                <Button className="bg-[#228B22] hover:bg-[#2d5016] text-white">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => {
                const imageUrl = item.images?.[0] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop';
                return (
                  <Card 
                    key={item._id} 
                    className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.brand}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-semibold text-lg">₹{item.price.toLocaleString()}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 border rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="px-4 py-2 min-w-[60px] text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item._id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-xl">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="h-fit sticky top-4 border-0 shadow-xl animate-in fade-in slide-in-from-right-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                  </div>
                  {subtotal > 2000 && (
                    <p className="text-sm text-[#228B22] font-medium">
                      🎉 You saved ₹99 on delivery!
                    </p>
                  )}
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-[#228B22]">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                
                <Button
                  className="w-full bg-[#228B22] hover:bg-[#2d5016] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  size="lg"
                  onClick={() => router.push('/therastore/checkout')}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Checkout
                </Button>
                
                <div className="text-center text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <Package className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                  <p>30-day return policy</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

