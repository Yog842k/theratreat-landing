"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  ShoppingBag, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'

type CartItem = { productId: string; name: string; quantity: number; price: number; gstPercent?: number }
type Shipping = { name: string; phone: string; address: string; city: string; state: string; pincode: string }

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [shipping, setShipping] = useState<Shipping>({ name: '', phone: '', address: '', city: '', state: '', pincode: '' })
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // -- EXISTING LOGIC PRESERVED --
  const getToken = () => {
    if (typeof window === 'undefined') return null
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('access_token')
    )
  }

  useEffect(() => {
    ;(async () => {
      try {
        const token = getToken()
        const [cartRes, addrRes] = await Promise.all([
          fetch('/api/therastore/cart', { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }),
          fetch('/api/user/address', { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }),
        ])
        if (cartRes.ok) {
          const cart = await cartRes.json()
          setItems(cart.items || [])
        }
        if (addrRes.ok) {
          const addr = await addrRes.json()
          if (addr) setShipping({
            name: addr.name || '',
            phone: addr.phone || '',
            address: addr.address || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
          })
        }
      } catch {}
    })()
  }, [])

  const handleInputChange = async (key: keyof Shipping, value: string) => {
    const next = { ...shipping, [key]: value }
    setShipping(next)
    // Debounced save logic omitted for brevity, keeping original structure
    try {
        const token = getToken()
        await fetch('/api/user/address', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, 
            body: JSON.stringify(next) 
        })
    } catch {}
  }

  const submitCheckout = async () => {
    try {
      setLoading(true)
      setStatus('Processing checkout...')
      const token = getToken()
      const res = await fetch('/api/therastore/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ items, shipping, paymentMethod }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.error || 'Checkout failed')
        setLoading(false)
        return
      }
      setOrderId(data.orderId)

      // Helper to save order to localStorage for My Orders page
      const saveOrderToLocal = (order: any) => {
        try {
          const prev = JSON.parse(localStorage.getItem('therastore_orders') || '[]');
          prev.push(order);
          localStorage.setItem('therastore_orders', JSON.stringify(prev));
        } catch {}
      };

      const finalizeOrder = async () => {
         setStatus('Confirming order...')
         await fetch('/api/therastore/orders', {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
           body: JSON.stringify({ id: data.orderId, update: { paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending', status: 'processing' } }),
         })

         let shiprocketNote = ''
         try {
           setStatus('Creating shipment...')
           const srRes = await fetch('/api/shiprocket/order', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
             body: JSON.stringify({ orderId: data.orderId }),
           })
           const srData = await srRes.json().catch(() => ({}))
           if (!srRes.ok || srData?.error) {
             shiprocketNote = srData?.error || 'Shiprocket request failed'
           } else if (srData?.shiprocket?.awb) {
             shiprocketNote = `AWB ${srData.shiprocket.awb}`
           } else if (srData?.shiprocket?.shipment_id) {
             shiprocketNote = `Shipment ${srData.shiprocket.shipment_id}`
           }
         } catch (srErr: any) {
           shiprocketNote = srErr?.message || 'Shiprocket request failed'
         }

         await fetch('/api/therastore/cart', { method: 'DELETE', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } })

         // Save order to localStorage for My Orders page
         saveOrderToLocal({
           items: items.map(it => ({
             _id: it.productId,
             name: it.name,
             price: it.price,
             quantity: it.quantity
           })),
           shipping,
           total: items.reduce((s, it) => s + it.price * it.quantity, 0) + items.reduce((s, it) => s + ((it.gstPercent || 0) * it.price * it.quantity) / 100, 0),
           paymentMethod,
           orderDate: new Date().toISOString(),
           status: 'pending',
           shiprocket: shiprocketNote,
         });

         setStatus(shiprocketNote ? `Order confirmed. ${shiprocketNote}` : 'Order confirmed')
         router.push('/therastore/orders');
      }

      if (data.next === 'razorpay') {
        const rp = await fetch('/api/therastore/payments/razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ orderId: data.orderId }),
        })
        const rpData = await rp.json()
        if (!rp.ok) {
          setStatus(rpData.error || 'Payment init failed')
          setLoading(false)
          return
        }
        if (!(window as any).Razorpay) {
            // Load script logic (simplified for UI demo)
            const s = document.createElement('script')
            s.src = 'https://checkout.razorpay.com/v1/checkout.js'
            document.body.appendChild(s)
            await new Promise(r => s.onload = r)
        }
        
        const options: any = {
          key: rpData.keyId,
          amount: rpData.razorpayOrder.amount,
          currency: rpData.razorpayOrder.currency,
          name: 'TheraStore',
          description: 'Order Payment',
          order_id: rpData.razorpayOrder.id,
          handler: finalizeOrder,
          prefill: { name: shipping.name, contact: shipping.phone },
          theme: { color: '#059669' }, // Emerald 600
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      } else {
        await finalizeOrder()
      }
    } catch (e: any) {
      setStatus(e?.message || 'Checkout failed')
      setLoading(false)
    }
  }

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)
  const tax = items.reduce((s, it) => s + ((it.gstPercent || 0) * it.price * it.quantity) / 100, 0)
  const total = subtotal + tax

  // -- UI COMPONENTS --

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-900 mb-8 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-emerald-600" /> 
          Checkout
        </h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          
          {/* LEFT COLUMN: FORMS */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Shipping Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-emerald-100/50 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <MapPin size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Shipping Details</h2>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <InputGroup label="Full Name" value={shipping.name} onChange={(v) => handleInputChange('name', v)} placeholder="John Doe" />
                <InputGroup label="Phone Number" value={shipping.phone} onChange={(v) => handleInputChange('phone', v)} placeholder="+91 98765 43210" />
                <div className="sm:col-span-2">
                  <InputGroup label="Address" value={shipping.address} onChange={(v) => handleInputChange('address', v)} placeholder="Flat / House No / Street" />
                </div>
                <InputGroup label="City" value={shipping.city} onChange={(v) => handleInputChange('city', v)} placeholder="Mumbai" />
                <InputGroup label="State" value={shipping.state} onChange={(v) => handleInputChange('state', v)} placeholder="Maharashtra" />
                <div className="sm:col-span-2">
                   <InputGroup label="Pincode" value={shipping.pincode} onChange={(v) => handleInputChange('pincode', v)} placeholder="400001" />
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-emerald-100/50 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-4">
                <PaymentOption 
                  id="cod"
                  title="Cash on Delivery"
                  description="Pay swiftly upon receipt of your order."
                  icon={<Truck className="w-5 h-5" />}
                  selected={paymentMethod === 'cod'}
                  onSelect={() => setPaymentMethod('cod')}
                />
                <PaymentOption 
                  id="razorpay"
                  title="Online Payment"
                  description="Secure payment via UPI, Credit/Debit Card, or Netbanking."
                  icon={<CreditCard className="w-5 h-5" />}
                  selected={paymentMethod === 'razorpay'}
                  onSelect={() => setPaymentMethod('razorpay')}
                />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden sticky top-8">
              <div className="p-6 bg-emerald-600">
                <h2 className="text-lg font-medium text-white">Order Summary</h2>
                <p className="text-emerald-100 text-sm mt-1">{items.length} Items in cart</p>
              </div>

              <div className="p-6 space-y-6">
                {items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Your cart is empty.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 max-h-60 overflow-auto custom-scrollbar">
                    {items.map((it, idx) => (
                      <li key={idx} className="py-3 flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">{it.name}</p>
                          <p className="text-xs text-gray-500">Qty: {it.quantity}</p>
                        </div>
                        <span className="font-medium text-gray-900">₹{(it.price * it.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>GST / Taxes</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-emerald-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={submitCheckout}
                  disabled={loading || items.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-4 rounded-xl shadow-emerald-200 shadow-lg transition-all flex justify-center items-center gap-2 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
                  {!loading && <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                </button>

                {status && (
                  <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${status.includes('failed') || status.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {status}
                  </div>
                )}
                
                <div className="text-center">
                   <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                      <LockIcon /> Secure SSL Encrypted Transaction
                   </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// -- SUBCOMPONENTS FOR CLEANER JSX --

function InputGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-300"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function PaymentOption({ id, title, description, icon, selected, onSelect }: any) {
  return (
    <div 
      onClick={onSelect}
      className={`relative cursor-pointer flex items-center gap-4 p-4 rounded-xl border transition-all ${
        selected 
          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' 
          : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
      }`}
    >
      <div className={`p-2 rounded-full ${selected ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className={`font-semibold ${selected ? 'text-emerald-900' : 'text-gray-700'}`}>{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selected ? 'border-emerald-500' : 'border-gray-300'}`}>
        {selected && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
      </div>
    </div>
  )
}

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
)