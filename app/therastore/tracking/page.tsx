'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Search
} from 'lucide-react';

interface TrackingStatus {
  status: 'ordered' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  date: string;
  location?: string;
  description: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  tracking: TrackingStatus[];
  estimatedDelivery?: string;
}

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = (id: string) => {
    setLoading(true);
    try {
      const orders = JSON.parse(localStorage.getItem('therastore_orders') || '[]');
      const foundOrder = orders.find((o: any) => o._id === id || o.orderNumber === id);
      if (foundOrder) {
        setOrder(foundOrder);
        setTrackingId(foundOrder.trackingNumber || foundOrder.orderNumber);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      loadOrder(trackingId.trim());
    }
  };

  const getStatusIcon = (status: string, currentStatus: string) => {
    const statusOrder = ['ordered', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);

    if (statusIndex < currentIndex) {
      return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
    } else if (statusIndex === currentIndex) {
      return <Clock className="w-6 h-6 text-emerald-600 animate-pulse" />;
    } else {
      return <Clock className="w-6 h-6 text-gray-300" />;
    }
  };

  const getStatusColor = (status: string, currentStatus: string) => {
    const statusOrder = ['ordered', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);

    if (statusIndex < currentIndex) {
      return 'bg-emerald-600';
    } else if (statusIndex === currentIndex) {
      return 'bg-emerald-600';
    } else {
      return 'bg-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-2">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Track Your Order
          </h1>
          <p className="text-xl text-gray-600">
            Enter your order number or tracking ID to track your shipment
          </p>
        </div>

        {/* Search Form */}
        {!order && (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8 shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Number / Tracking ID
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="Enter order number or tracking ID"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all"
              >
                Track Order
              </button>
            </form>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
                  <p className="text-gray-600 mt-1">
                    Placed on {new Date(order.tracking[0]?.date || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-2 rounded-full font-semibold capitalize ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
                  <div className="text-gray-600">
                    <p>{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Order Total</h3>
                  <p className="text-2xl font-extrabold text-emerald-600">₹{order.total.toLocaleString()}</p>
                  {order.estimatedDelivery && (
                    <p className="text-sm text-gray-600 mt-2">
                      Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tracking Information</h3>
              <div className="relative">
                {order.tracking.map((status, index) => (
                  <div key={index} className="relative pb-8 last:pb-0">
                    {index < order.tracking.length - 1 && (
                      <div className={`absolute left-3 top-8 w-0.5 h-full ${
                        getStatusColor(status.status, order.status) === 'bg-emerald-600' ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}></div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        getStatusColor(status.status, order.status) === 'bg-emerald-600' ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        {getStatusIcon(status.status, order.status)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 capitalize mb-1">
                          {status.status.replace('_', ' ')}
                        </h4>
                        <p className="text-gray-600 text-sm mb-1">{status.description}</p>
                        <p className="text-gray-500 text-xs">{new Date(status.date).toLocaleString()}</p>
                        {status.location && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{status.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-emerald-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Link href="/therastore/orders" className="flex-1">
                <button className="w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition-all">
                  View All Orders
                </button>
              </Link>
              <button
                onClick={() => {
                  setOrder(null);
                  setTrackingId('');
                }}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold transition-all"
              >
                Track Another Order
              </button>
            </div>
          </div>
        )}

        {!order && !loading && (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-full mb-6">
              <Truck className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Track Your Order</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Enter your order number or tracking ID above to see the status of your shipment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}







