"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/NewAuthContext';
import { getOrders, type StoreOrder } from '@/lib/therastore/orders';
import { DashboardTabs } from '@/components/therastore/DashboardTabs';
import { OrderList } from '@/components/therastore/OrderList';

export default function VendorDashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState('orders');
  const [orders, setOrders] = useState<StoreOrder[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    // Role-based guard: only vendors allowed here
    if (user && user.userType && user.userType !== 'vendor') {
      router.push('/therastore');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const cancelled = orders.filter(o => o.status === 'cancelled');
  const refunds = orders.filter(o => o.status === 'refund_initiated' || o.status === 'refund_completed');
  const counts = { orders: orders.length, cancellations: cancelled.length, refunds: refunds.length };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Vendor Dashboard</h1>
      <p className="text-slate-600 mb-4">See orders assigned by admin, mark statuses, and track cancellations/refunds.</p>
      <DashboardTabs active={active} setActive={setActive} counts={counts} />
      {active === 'orders' && (
        <OrderList orders={orders.filter(o => o.status !== 'cancelled')} onChange={setOrders} />
      )}
      {active === 'cancellations' && (
        <OrderList orders={cancelled} onChange={setOrders} />
      )}
      {active === 'refunds' && (
        <OrderList orders={refunds} onChange={setOrders} />
      )}
      {active === 'inventory' && (
        <div className="p-4 border rounded-xl">
          <h2 className="font-semibold mb-2">Inventory Actions</h2>
          <p className="text-sm text-slate-600">Mark order items out of stock from Orders tab. Inventory management can be expanded to product-level stock later.</p>
        </div>
      )}
    </div>
  );
}
