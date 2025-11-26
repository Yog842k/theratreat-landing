'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, Eye, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Order {
  items: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  shipping: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  total: number;
  paymentMethod: string;
  orderDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('therastore_orders') || '[]');
    setOrders(savedOrders.reverse()); // Show newest first
    setLoading(false);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      delivered: 'default',
      shipped: 'secondary',
      confirmed: 'secondary',
      pending: 'outline',
      cancelled: 'destructive'
    };

    const colors: Record<string, string> = {
      delivered: 'bg-green-500',
      shipped: 'bg-blue-500',
      confirmed: 'bg-blue-500',
      pending: 'bg-yellow-500',
      cancelled: 'bg-red-500'
    };

    return (
      <Badge className={colors[status] || 'bg-gray-500'} variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#228B22]"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
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
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Order History</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 animate-in fade-in slide-in-from-left-4">
                My Orders
              </h1>
              <p className="text-emerald-50 animate-in fade-in slide-in-from-left-6">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push('/therastore')}
              className="text-white hover:bg-white/10 rounded-full transition-all hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
              <Link href="/therastore">
                <Button className="bg-[#228B22] hover:bg-[#2d5016] text-white">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-lg">
                          Order #{orders.length - index}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.orderDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Items:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                      <div>
                        <h4 className="font-semibold mb-2">Shipping Address:</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.shipping.name}<br />
                          {order.shipping.address}<br />
                          {order.shipping.city && `${order.shipping.city}, `}
                          {order.shipping.state && `${order.shipping.state} `}
                          {order.shipping.pincode}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Payment:</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                        <p className="text-lg font-bold text-[#228B22] mt-2">
                          Total: ₹{order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4 border-t">
                      <Link href={`/therastore/orders/${index}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
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

