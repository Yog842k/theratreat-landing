"use client"
import React, { useMemo, useState } from 'react'

type Env = 'test' | 'prod'
type PaymentMode = 'Prepaid' | 'COD'

const defaults = {
  pickupName: 'Primary',
  orderId: 'ORDER-001',
  paymentMode: 'Prepaid' as PaymentMode,
  amount: 499,
  quantity: 1,
  weight: 0.5,
  products: 'Sample Product',
  name: 'Test Consignee',
  phone: '9999999999',
  address: '123 Test Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  shippingMode: 'Surface',
}

export default function DelhiveryTestPage() {
  const [env, setEnv] = useState<Env>('test')
  const [form, setForm] = useState({ ...defaults })
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const payload = useMemo(() => {
    const amount = Number(form.amount) || 0
    return {
      pickup_location: { name: form.pickupName },
      shipments: [
        {
          name: form.name,
          add: form.address,
          pin: form.pincode,
          city: form.city,
          state: form.state,
          country: 'India',
          phone: form.phone,
          order: form.orderId,
          payment_mode: form.paymentMode,
          products_desc: form.products,
          total_amount: amount,
          cod_amount: form.paymentMode === 'COD' ? amount : 0,
          quantity: String(form.quantity || 1),
          weight: String(form.weight || 0.5),
          shipping_mode: form.shippingMode,
        },
      ],
    }
  }, [form])

  const hasEndDateBackendError = (() => {
    const msg = typeof result?.message === 'string' ? result.message : ''
    return /NoneType/.test(msg) && /end_date/.test(msg)
  })()

  const setField = (key: keyof typeof form, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleCreateShipment = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/delhivery/create-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ env, payload }),
      })
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Delhivery error')
        setResult(data.details || data)
      } else {
        setResult(data)
      }
    } catch (e: any) {
      setError(e?.message || 'Request failed - check console for details')
    }
    setLoading(false)
  }

  const applyTemplate = (mode: PaymentMode) => {
    setField('paymentMode', mode)
    if (mode === 'COD') {
      setField('orderId', 'ORDER-COD-001')
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delhivery Shipment Creation</h1>
          <p className="text-sm text-gray-600">Use this to craft valid CMU payloads and test fallback handling.</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded font-semibold ${env === 'test' ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setEnv('test')}
          >
            Test
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${env === 'prod' ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setEnv('prod')}
          >
            Prod
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm font-medium">Pickup Location (must match approved warehouse)</span>
            <input
              className="mt-1 border px-3 py-2 rounded w-full"
              value={form.pickupName}
              onChange={(e) => setField('pickupName', e.target.value)}
              placeholder="Primary"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium">Order ID</span>
              <input
                className="mt-1 border px-3 py-2 rounded w-full"
                value={form.orderId}
                onChange={(e) => setField('orderId', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium">Payment Mode</span>
              <select
                className="mt-1 border px-3 py-2 rounded w-full"
                value={form.paymentMode}
                onChange={(e) => setField('paymentMode', e.target.value as PaymentMode)}
              >
                <option value="Prepaid">Prepaid</option>
                <option value="COD">COD</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-sm font-medium">Amount</span>
              <input
                type="number"
                className="mt-1 border px-3 py-2 rounded w-full"
                value={form.amount}
                onChange={(e) => setField('amount', Number(e.target.value))}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium">Qty</span>
              <input
                type="number"
                className="mt-1 border px-3 py-2 rounded w-full"
                value={form.quantity}
                onChange={(e) => setField('quantity', Number(e.target.value))}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium">Weight (kg)</span>
              <input
                type="number"
                step="0.1"
                className="mt-1 border px-3 py-2 rounded w-full"
                value={form.weight}
                onChange={(e) => setField('weight', Number(e.target.value))}
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-sm font-medium">Product Description</span>
            <input
              className="mt-1 border px-3 py-2 rounded w-full"
              value={form.products}
              onChange={(e) => setField('products', e.target.value)}
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium">Shipping Mode</span>
            <select
              className="mt-1 border px-3 py-2 rounded w-full"
              value={form.shippingMode}
              onChange={(e) => setField('shippingMode', e.target.value)}
            >
              <option value="Surface">Surface</option>
              <option value="Air">Air</option>
            </select>
          </label>

          <div className="flex gap-2 text-sm">
            <button
              type="button"
              className="px-3 py-2 bg-gray-200 rounded"
              onClick={() => applyTemplate('Prepaid')}
            >
              Prepaid template
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-gray-200 rounded"
              onClick={() => applyTemplate('COD')}
            >
              COD template
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-gray-200 rounded"
              onClick={() => setForm({ ...defaults })}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="block text-sm font-medium">Consignee Name</span>
            <input
              className="mt-1 border px-3 py-2 rounded w-full"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Phone</span>
            <input
              className="mt-1 border px-3 py-2 rounded w-full"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Address</span>
            <input
              className="mt-1 border px-3 py-2 rounded w-full"
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium">City</span>
              <input
                className="mt-1 border px-3 py-2 rounded w-full"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium">State</span>
              <input
                className="mt-1 border px-3 py-2 rounded w-full"
                value={form.state}
                onChange={(e) => setField('state', e.target.value)}
              />
            </label>
          </div>
          <label className="block">
            <span className="block text-sm font-medium">Pincode</span>
            <input
              className="mt-1 border px-3 py-2 rounded w-full"
              value={form.pincode}
              onChange={(e) => setField('pincode', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Payload Preview</h3>
          <span className="text-xs text-gray-500">Sent as format=json&data=...</span>
        </div>
        <pre className="p-3 bg-gray-100 rounded text-xs overflow-x-auto border border-gray-300">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      <div className="flex gap-3">
        <button
          className="bg-emerald-600 text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
          onClick={handleCreateShipment}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Create Shipment'}
        </button>
        <span className="text-sm text-gray-600 self-center">Uses API /api/delhivery/create-shipment with retry fallback.</span>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded border border-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {hasEndDateBackendError && (
        <div className="p-3 bg-amber-50 text-amber-900 rounded border border-amber-200 space-y-1">
          <div className="font-semibold">Delhivery warehouse issue detected (end_date NoneType)</div>
          <div className="text-sm">This is almost always an unapproved or inactive pickup location.</div>
          <ul className="list-disc ml-6 text-sm space-y-1">
            <li>Set pickup name to an approved warehouse exactly as in Delhivery panel (case-sensitive).</li>
            <li>Or ask Delhivery support to approve/activate the warehouse schedule.</li>
            <li>Fallback: env DELHIVERY_FALLBACK_PICKUP_NAME or omitting pickup_location will be tried automatically.</li>
          </ul>
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">API Response</h3>
            {result.fallbackApplied && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Fallback Applied</span>
            )}
          </div>
          <pre className="p-3 bg-gray-100 rounded text-sm overflow-x-auto border border-gray-300">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}