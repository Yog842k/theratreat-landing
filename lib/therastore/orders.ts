export type OrderStatus = 'completed' | 'in_transit' | 'yet_to_dispatch' | 'out_of_stock' | 'cancelled' | 'refund_initiated' | 'refund_completed' | 'yet_to_collect';

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
}

export interface StoreOrder {
  id: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

const STORAGE_KEY = 'therastore_orders';

const sample: StoreOrder[] = [
  { id: 'ORD-1001', customer: 'Riya Sharma', items: [{ sku: 'TS-REHAB-01', name: 'Rehab Band Set', qty: 2 }], total: 1398, status: 'yet_to_dispatch', createdAt: new Date().toISOString() },
  { id: 'ORD-1002', customer: 'Amit Verma', items: [{ sku: 'TS-BRACE-11', name: 'Knee Brace', qty: 1 }], total: 999, status: 'in_transit', createdAt: new Date().toISOString() },
  { id: 'ORD-1003', customer: 'Neha Gupta', items: [{ sku: 'TS-MASS-02', name: 'Massage Roller', qty: 1 }], total: 499, status: 'completed', createdAt: new Date().toISOString() },
  { id: 'ORD-1004', customer: 'Sanjay Kumar', items: [{ sku: 'TS-FOOT-07', name: 'Foot Orthotic', qty: 1 }], total: 1299, status: 'cancelled', createdAt: new Date().toISOString() },
  { id: 'ORD-1005', customer: 'Priya Singh', items: [{ sku: 'TS-PACK-23', name: 'Hot & Cold Pack', qty: 3 }], total: 1197, status: 'refund_initiated', createdAt: new Date().toISOString() },
  { id: 'ORD-1006', customer: 'Rohit Mehra', items: [{ sku: 'TS-CANE-09', name: 'Walking Cane', qty: 1 }], total: 799, status: 'yet_to_collect', createdAt: new Date().toISOString() },
];

export function getOrders(): StoreOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
      return sample;
    }
    return JSON.parse(raw);
  } catch {
    return sample;
  }
}

export function setOrders(orders: StoreOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const orders = getOrders();
  const next = orders.map(o => (o.id === id ? { ...o, status } : o));
  setOrders(next);
  return next.find(o => o.id === id) || null;
}

export const statusLabels: Record<OrderStatus, string> = {
  completed: 'Completed',
  in_transit: 'In Transit',
  yet_to_dispatch: 'Yet to Dispatch',
  out_of_stock: 'Out of Stock',
  cancelled: 'Cancelled',
  refund_initiated: 'Refund Initiated',
  refund_completed: 'Refund Completed',
  yet_to_collect: 'Yet to Collect',
};
