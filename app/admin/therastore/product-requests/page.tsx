"use client"
import { useEffect, useState } from 'react'

export default function AdminProductRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('auth_token') || localStorage.getItem('access_token')) : null

  const load = async () => {
    if (!token) return
    const res = await fetch('/api/therastore/admin/product-requests', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setRequests(data.data || [])
  }

  useEffect(() => { load() }, [])

  const act = async (id: string, approve: boolean) => {
    if (!token) return
    const res = await fetch('/api/therastore/admin/product-requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, approve }),
    })
    await res.json()
    await load()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <h1 className="text-2xl font-semibold">Product Requests</h1>
      <ul className="space-y-3">
        {requests.map((r:any) => (
          <li key={r._id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm sm:text-base whitespace-normal break-words font-medium">
                {r.name} • {r.brand} • ₹{r.price}
              </span>
              <span className="text-xs sm:text-sm px-2 py-1 rounded bg-slate-100 text-slate-700 w-fit">{r.status}</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 mt-1">Vendor: {r.vendorId}</div>
            <div className="flex flex-wrap gap-2 mt-3">
              {r.status === 'pending' && (
                <>
                  <button className="bg-emerald-600 text-white px-3 py-1.5 rounded-md text-sm" onClick={() => act(String(r._id), true)}>Approve & Publish</button>
                  <button className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm" onClick={() => act(String(r._id), false)}>Reject</button>
                </>
              )}
              {r.productId && <span className="text-xs sm:text-sm">Published: {String(r.productId)}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
