"use client"
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function UserOrdersPage() {
  const { data, error } = useSWR('/api/therastore/orders', fetcher)
  if (error) return <div className="p-4">Failed to load orders</div>
  if (!data) return <div className="p-4">Loading...</div>
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">My Orders</h1>
      {data.length === 0 ? <p>No orders yet.</p> : (
        <ul className="space-y-3">
          {data.map((o: any) => (
            <li key={o._id} className="border rounded p-3">
              <div className="flex justify-between"><span>Order</span><span>{o._id}</span></div>
              <div className="flex justify-between"><span>Status</span><span>{o.status}</span></div>
              <div className="flex justify-between"><span>Payment</span><span>{o.paymentMethod} / {o.paymentStatus}</span></div>
              <div className="flex justify-between"><span>Total</span><span>₹{o.total?.toFixed?.(2) ?? o.total}</span></div>
              {o.shiprocket?.awb && <div className="flex justify-between"><span>AWB</span><span>{o.shiprocket.awb}</span></div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
