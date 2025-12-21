"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/NewAuthContext';
import { getOrders, type StoreOrder } from '@/lib/therastore/orders';
import { DashboardTabs } from '@/components/therastore/DashboardTabs';
import { OrderList } from '@/components/therastore/OrderList';

export default function SellerDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState('orders');
  const [orders, setOrders] = useState<StoreOrder[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    // Role-based guard: only sellers allowed here
    if (user && user.userType && user.userType !== 'seller') {
      router.push('/therastore');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const metrics = useMemo(() => {
    const revenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
    const inTransit = orders.filter(o => o.status === 'in_transit').length;
    const pending = orders.filter(o => o.status === 'yet_to_dispatch').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const refunds = orders.filter(o => o.status === 'refund_initiated' || o.status === 'refund_completed').length;
    return { revenue, inTransit, pending, cancelled, refunds };
  }, [orders]);

  const counts = { orders: orders.length, cancellations: metrics.cancelled, refunds: metrics.refunds };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Seller Dashboard</h1>
      <p className="text-slate-600 mb-4">Manage your orders and view sales metrics.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="p-4 border rounded-xl">
          <div className="text-xs text-slate-500">Revenue</div>
          <div className="text-lg font-bold">₹{metrics.revenue}</div>
        </div>
        <div className="p-4 border rounded-xl">
          <div className="text-xs text-slate-500">In Transit</div>
          <div className="text-lg font-bold">{metrics.inTransit}</div>
        </div>
        <div className="p-4 border rounded-xl">
          <div className="text-xs text-slate-500">Yet to Dispatch</div>
          <div className="text-lg font-bold">{metrics.pending}</div>
        </div>
        <div className="p-4 border rounded-xl">
          <div className="text-xs text-slate-500">Cancelled</div>
          <div className="text-lg font-bold">{metrics.cancelled}</div>
        </div>
        <div className="p-4 border rounded-xl">
          <div className="text-xs text-slate-500">Refunds</div>
          <div className="text-lg font-bold">{metrics.refunds}</div>
        </div>
      </div>

      <DashboardTabs active={active} setActive={setActive} counts={counts} />
      {active === 'orders' && (
        <OrderList orders={orders.filter(o => o.status !== 'cancelled')} onChange={setOrders} />
      )}
      {active === 'cancellations' && (
        <OrderList orders={orders.filter(o => o.status === 'cancelled')} onChange={setOrders} />
      )}
      {active === 'refunds' && (
        <OrderList orders={orders.filter(o => o.status === 'refund_initiated' || o.status === 'refund_completed')} onChange={setOrders} />
      )}
      {active === 'inventory' && (
        <div className="p-4 border rounded-xl">
          <h2 className="font-semibold mb-2">Inventory Overview</h2>
          <p className="text-sm text-slate-600">Product-level stock dashboard can be integrated here later.</p>
        </div>
      )}
    </div>
  );
}
