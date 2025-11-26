'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';

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
  status: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('therastore_orders') || '[]');
    const orderId = parseInt(params.id as string);
    if (orders[orderId]) {
      setOrder(orders[orderId]);
    }
    setLoading(false);
  }, [params.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#228B22]"></div>
          <p className="mt-4 text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Order not found</h3>
            <Button onClick={() => router.push('/therastore/orders')} className="mt-4 bg-[#228B22] hover:bg-[#2d5016]">
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 2000 ? 0 : 99;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden mb-8">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10 rounded-full mb-4 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 animate-in fade-in slide-in-from-top-4">
            <Package className="w-4 h-4" />
            <span className="text-sm font-medium">Order Details</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 animate-in fade-in slide-in-from-left-4">
            Order Details
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">

        <div className="space-y-6">
          {/* Order Status */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                {getStatusIcon(order.status)}
                <div>
                  <h2 className="text-xl font-semibold">Order #{parseInt(params.id as string) + 1}</h2>
                  <p className="text-muted-foreground">
                    Placed on {new Date(order.orderDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge className={`ml-auto ${
                  order.status === 'delivered' ? 'bg-green-500' :
                  order.status === 'shipped' ? 'bg-blue-500' :
                  order.status === 'cancelled' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 stagger-1">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 stagger-2">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Name:</strong> {order.shipping.name}</p>
              <p><strong>Email:</strong> {order.shipping.email}</p>
              <p><strong>Phone:</strong> {order.shipping.phone}</p>
              <p><strong>Address:</strong></p>
              <p className="text-muted-foreground ml-4">
                {order.shipping.address}<br />
                {order.shipping.city && `${order.shipping.city}, `}
                {order.shipping.state && `${order.shipping.state} `}
                {order.shipping.pincode}
              </p>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 stagger-3">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-[#228B22]">₹{order.total.toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Payment Method:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

