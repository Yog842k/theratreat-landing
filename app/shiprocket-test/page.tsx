"use client"
import React, { useMemo, useState } from 'react'

type PaymentMethod = 'Prepaid' | 'COD'

type Item = {
  name: string
  sku: string
  units: number
  selling_price: number
}

type FormState = {
  orderId: string
  pickup: string
  payment: PaymentMethod
  customer: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  length: number
  breadth: number
  height: number
  weight: number
  items: Item[]
}

const defaults: FormState = {
  orderId: 'SR-ORDER-001',
  pickup: 'Default',
  payment: 'Prepaid',
  customer: 'Test Customer',
  phone: '9999999999',
  email: 'customer@example.com',
  address: '221B Baker Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  length: 10,
  breadth: 10,
  height: 5,
  weight: 0.8,
  items: [
    { name: 'Sample Item', sku: 'SKU-001', units: 1, selling_price: 499 },
  ],
}

export default function ShiprocketTestPage() {
  const [form, setForm] = useState<FormState>({ ...defaults })
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [awbLoading, setAwbLoading] = useState(false)
  const [awbResult, setAwbResult] = useState<any>(null)
  const [shipmentIdInput, setShipmentIdInput] = useState('')
  const [courierIdInput, setCourierIdInput] = useState('')

  const payload = useMemo(() => {
    const subtotal = form.items.reduce((s, it) => s + (it.selling_price || 0) * (it.units || 0), 0)
    return {
      order_id: form.orderId,
      pickup_location: form.pickup,
      billing_customer_name: form.customer,
      billing_address: form.address,
      billing_city: form.city,
      billing_state: form.state,
      billing_country: 'India',
      billing_pincode: form.pincode,
      billing_phone: form.phone,
      billing_email: form.email,
      shipping_is_billing: true,
      order_items: form.items,
      payment_method: form.payment,
      sub_total: subtotal,
      length: form.length,
      breadth: form.breadth,
      height: form.height,
      weight: form.weight,
    }
  }, [form])

  const setField = (key: keyof FormState, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const setItemField = (index: number, key: keyof Item, value: any) => {
    setForm((prev) => {
      const items = prev.items.map((it, i) => (i === index ? { ...it, [key]: value } : it))
      return { ...prev, items }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setAwbResult(null)

    const required = [
      ['pickup', form.pickup],
      ['customer', form.customer],
      ['address', form.address],
      ['city', form.city],
      ['state', form.state],
      ['pincode', form.pincode],
      ['phone', form.phone],
    ]
    const missing = required.filter(([, v]) => !v || `${v}`.trim() === '').map(([k]) => k)
    if (missing.length) {
      setError(`Please fill: ${missing.join(', ')}`)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/shiprocket/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      })
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Shiprocket error')
        setResult(data)
      } else {
        setResult(data)
      }
    } catch (e: any) {
      setError(e?.message || 'Request failed - check console')
    }
    setLoading(false)
  }

  const handleGenerateAwb = async () => {
    const shipmentId = shipmentIdInput || result?.shipment_id || result?.data?.shipment_id
    if (!shipmentId) {
      setError('Enter a shipment_id or create an order first')
      return
    }
    setAwbLoading(true)
    setError('')
    setAwbResult(null)
    try {
      const res = await fetch('/api/shiprocket/generate-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipment_id: shipmentId, courier_id: courierIdInput || undefined }),
      })
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Shiprocket AWB error')
        setAwbResult(data)
      } else {
        setAwbResult(data)
        setShipmentIdInput('')
        setCourierIdInput('')
      }
    } catch (e: any) {
      setError(e?.message || 'Request failed - check console')
    }
    setAwbLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shiprocket Test Console</h1>
          <p className="text-sm text-gray-600">Craft and send create-order payloads using SHIPROCKET_EMAIL/PASSWORD env.</p>
        </div>
        <div className="flex gap-2 text-sm text-gray-600">
          <span className="px-3 py-1 bg-gray-100 rounded">Auth: env</span>
          <span className="px-3 py-1 bg-gray-100 rounded">Endpoint: /api/shiprocket/create-order</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm font-medium">Order ID</span>
            <input className="mt-1 border px-3 py-2 rounded w-full" value={form.orderId} onChange={(e) => setField('orderId', e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Pickup Location (as in Shiprocket)</span>
            <input className="mt-1 border px-3 py-2 rounded w-full" value={form.pickup} onChange={(e) => setField('pickup', e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Payment Method</span>
            <select className="mt-1 border px-3 py-2 rounded w-full" value={form.payment} onChange={(e) => setField('payment', e.target.value as PaymentMethod)}>
              <option value="Prepaid">Prepaid</option>
              <option value="COD">COD</option>
            </select>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['length', 'breadth', 'height', 'weight'].map((key) => (
              <label className="block" key={key}>
                <span className="block text-sm font-medium">{key === 'weight' ? 'Weight (kg)' : `${key} (cm)`}</span>
                <input
                  type="number"
                  step="0.1"
                  className="mt-1 border px-3 py-2 rounded w-full"
                  value={(form as any)[key]}
                  onChange={(e) => setField(key as keyof FormState, Number(e.target.value))}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm font-medium">Customer Name</span>
            <input className="mt-1 border px-3 py-2 rounded w-full" value={form.customer} onChange={(e) => setField('customer', e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Phone</span>
            <input className="mt-1 border px-3 py-2 rounded w-full" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Email</span>
            <input className="mt-1 border px-3 py-2 rounded w-full" value={form.email} onChange={(e) => setField('email', e.target.value)} />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Address</span>
            <input className="mt-1 border px-3 py-2 rounded w-full" value={form.address} onChange={(e) => setField('address', e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium">City</span>
              <input className="mt-1 border px-3 py-2 rounded w-full" value={form.city} onChange={(e) => setField('city', e.target.value)} />
            </label>
            <label className="block">
              <span className="block text-sm font-medium">State</span>
              <input className="mt-1 border px-3 py-2 rounded w-full" value={form.state} onChange={(e) => setField('state', e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="block text-sm font-medium">Pincode</span>
            <input className="mt-1 border px-3 py-2 rounded w-full" value={form.pincode} onChange={(e) => setField('pincode', e.target.value)} />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Items</h3>
          <button
            className="text-sm bg-gray-200 px-3 py-1 rounded"
            onClick={() => setForm((prev) => ({ ...prev, items: [...prev.items, { name: 'New Item', sku: `SKU-${prev.items.length + 1}`, units: 1, selling_price: 100 }] }))}
          >
            Add item
          </button>
        </div>
        <div className="space-y-2">
          {form.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 items-center border rounded p-3 bg-white">
              <input className="border px-2 py-1 rounded" value={item.name} onChange={(e) => setItemField(idx, 'name', e.target.value)} />
              <input className="border px-2 py-1 rounded" value={item.sku} onChange={(e) => setItemField(idx, 'sku', e.target.value)} />
              <input
                type="number"
                className="border px-2 py-1 rounded"
                value={item.units}
                onChange={(e) => setItemField(idx, 'units', Number(e.target.value))}
              />
              <input
                type="number"
                className="border px-2 py-1 rounded"
                value={item.selling_price}
                onChange={(e) => setItemField(idx, 'selling_price', Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Payload Preview</h3>
          <span className="text-xs text-gray-500">POST /api/shiprocket/create-order</span>
        </div>
        <pre className="p-3 bg-gray-100 rounded text-xs overflow-x-auto border border-gray-300">{JSON.stringify(payload, null, 2)}</pre>
      </div>

      <div className="flex gap-3">
        <button
          className="bg-emerald-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Create Order'}
        </button>
        <span className="text-sm text-gray-600 self-center">Requires SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in env.</span>
      </div>

      <div className="space-y-3 border-t pt-6 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Generate AWB</h3>
          <span className="text-xs text-gray-500">POST /api/shiprocket/generate-awb</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <label className="block">
            <span className="block text-sm font-medium">Shipment ID</span>
            <input
              className="mt-1 border px-3 py-2 rounded w-full"
              placeholder={result?.shipment_id || ''}
              value={shipmentIdInput}
              onChange={(e) => setShipmentIdInput(e.target.value)}
            />
            <span className="text-xs text-gray-500">Use returned shipment_id or enter manually.</span>
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Courier ID (optional)</span>
            <input
              className="mt-1 border px-3 py-2 rounded w-full"
              placeholder="Auto-select if empty"
              value={courierIdInput}
              onChange={(e) => setCourierIdInput(e.target.value)}
            />
            <span className="text-xs text-gray-500">Leave blank to let Shiprocket auto-assign.</span>
          </label>
          <div className="flex items-end">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50 w-full"
              onClick={handleGenerateAwb}
              disabled={awbLoading}
            >
              {awbLoading ? 'Generating...' : 'Generate AWB'}
            </button>
          </div>
        </div>
        {awbResult && (
          <div className="space-y-2">
            <h4 className="font-semibold">AWB Response</h4>
            <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto border border-gray-300">{JSON.stringify(awbResult, null, 2)}</pre>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded border border-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <h3 className="font-semibold">API Response</h3>
          <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto border border-gray-300">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
