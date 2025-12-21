"use client";
import React from 'react';
import { statusLabels, type StoreOrder, type OrderStatus, updateOrderStatus } from '@/lib/therastore/orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusClass: Record<OrderStatus, string> = {
  completed: 'bg-emerald-600 text-white',
  in_transit: 'bg-blue-600 text-white',
  yet_to_dispatch: 'bg-amber-500 text-white',
  out_of_stock: 'bg-red-600 text-white',
  cancelled: 'bg-gray-600 text-white',
  refund_initiated: 'bg-purple-600 text-white',
  refund_completed: 'bg-indigo-600 text-white',
  yet_to_collect: 'bg-teal-600 text-white',
};

export function OrderList({ orders, onChange }: { orders: StoreOrder[]; onChange?: (next: StoreOrder[]) => void }) {
  const handleStatus = (id: string, status: OrderStatus) => {
    const updated = updateOrderStatus(id, status);
    if (onChange) onChange(JSON.parse(localStorage.getItem('therastore_orders') || '[]'));
  };

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="font-semibold">{o.id} • {o.customer}</div>
            <div className="text-sm text-slate-600">{o.items.map(i => `${i.name} x${i.qty}`).join(', ')}</div>
            <div className="text-sm text-slate-500">Total: ₹{o.total}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusClass[o.status]}>{statusLabels[o.status]}</Badge>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleStatus(o.id, 'in_transit')}>Mark In Transit</Button>
              <Button size="sm" variant="secondary" onClick={() => handleStatus(o.id, 'yet_to_dispatch')}>Yet to Dispatch</Button>
              <Button size="sm" variant="secondary" onClick={() => handleStatus(o.id, 'completed')}>Mark Completed</Button>
              <Button size="sm" variant="destructive" onClick={() => handleStatus(o.id, 'out_of_stock')}>Out of Stock</Button>
              <Button size="sm" variant="secondary" onClick={() => handleStatus(o.id, 'cancelled')}>Cancel</Button>
              <Button size="sm" variant="secondary" onClick={() => handleStatus(o.id, 'refund_initiated')}>Refund Initiated</Button>
              <Button size="sm" variant="secondary" onClick={() => handleStatus(o.id, 'refund_completed')}>Refund Completed</Button>
              <Button size="sm" variant="secondary" onClick={() => handleStatus(o.id, 'yet_to_collect')}>Yet to Collect</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
