"use client"
import { useEffect, useState } from 'react'

export default function VendorDashboard() {
  const [vendor, setVendor] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [form, setForm] = useState<any>({ name: '', brand: '', price: '', gstPercent: '', category: '', description: '' })
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('auth_token') || localStorage.getItem('access_token')) : null

  useEffect(() => {
    (async () => {
      if (!token) return
      try {
        const prof = await fetch('/api/vendor/auth', { headers: { Authorization: `Bearer ${token}` } })
        const p = await prof.json()
        setVendor(p.vendor || null)
      } catch {}
      try {
        const res = await fetch('/api/therastore/vendor/product-requests', { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setRequests(data.data || [])
      } catch {}
    })()
  }, [token])

  const submitRequest = async () => {
    if (!token) return
    try {
      const payload = {
        name: form.name,
        brand: form.brand,
        price: Number(form.price || 0),
        gstPercent: Number(form.gstPercent || 0),
        category: form.category,
        description: form.description,
      }
      const res = await fetch('/api/therastore/vendor/product-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const ok = await res.json()
      if (ok?.id) {
        setForm({ name: '', brand: '', price: '', gstPercent: '', category: '', description: '' })
        const list = await (await fetch('/api/therastore/vendor/product-requests', { headers: { Authorization: `Bearer ${token}` } })).json()
        setRequests(list.data || [])
      }
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Vendor Dashboard</h1>
      {vendor ? (
        <div className="border rounded p-3">
          <div className="font-semibold">{vendor.name || vendor.email}</div>
          {vendor.pickupAddress && (
            <div className="text-sm text-slate-600">Pickup: {vendor.pickupAddress.address}, {vendor.pickupAddress.city}, {vendor.pickupAddress.state} - {vendor.pickupAddress.pincode}</div>
          )}
        </div>
      ) : (
        <p>Please sign in as vendor to view dashboard.</p>
      )}

      <div className="space-y-2 border rounded p-3">
        <h2 className="text-lg font-medium">Request a Product</h2>
        {['name','brand','price','gstPercent','category','description'].map((k) => (
          <input key={k} className="w-full border rounded p-2" placeholder={k} value={form[k]}
                 onChange={(e) => setForm((f:any) => ({ ...f, [k]: e.target.value }))} />
        ))}
        <button className="bg-emerald-600 text-white px-4 py-2 rounded" onClick={submitRequest}>Submit</button>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">My Requests</h2>
        <ul className="space-y-2">
          {requests.map((r:any) => (
            <li key={r._id} className="border rounded p-3">
              <div className="flex justify-between"><span>{r.name}</span><span>{r.status}</span></div>
              {r.notes && <div className="text-sm text-slate-600">Notes: {r.notes}</div>}
              {r.productId && <div className="text-sm">Published as: {String(r.productId)}</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
