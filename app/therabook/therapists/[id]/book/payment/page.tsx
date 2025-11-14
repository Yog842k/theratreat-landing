'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { bookingService, type Booking } from "@/lib/booking-service";
import { useAuth } from "@/components/auth/NewAuthContext";

interface PaymentPageProps {}

const bookingFallback = {
  therapist: {
    name: "Therapist",
    title: "Licensed Professional",
    image: "/api/placeholder/100/100",
  },
  session: {
    type: "Session",
    date: "—",
    time: "—",
    duration: "50 minutes",
    price: 0,
  }
};

export default function PaymentPage({}: PaymentPageProps) {
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gatewayMode, setGatewayMode] = useState<string>('');
  const [diagnosticsUrl] = useState<string>('/api/payments/razorpay/diag');
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams?.get('bookingId');
  const routeParams = useParams();
  const id = Array.isArray(routeParams?.id) ? (routeParams?.id?.[0] as string) : ((routeParams?.id as string) || "");
  const { token } = useAuth();

  // Wait for auth token to be known before attempting booking fetch
  useEffect(() => {
    if (!bookingId) {
      setIsLoading(false);
      setError('Missing booking ID');
      return;
    }
    // Auth context may still be initializing; if token is undefined (adjust if your context uses a different flag), wait.
    if (token === undefined) return; // do not mark loading false yet
    if (!token) {
      setIsLoading(false);
      setError('Login required to access this booking');
      return;
    }
    loadBooking();

    // Load gateway config (non-blocking, independent of auth)
    fetch('/api/payments/razorpay/config').then(async r => {
      const json = await r.json().catch(() => null);
      const mode = json?.data?.mode || json?.mode;
      if (mode) setGatewayMode(mode);
    }).catch(() => {});
  }, [bookingId, token]);

  const loadBooking = async () => {
    if (!bookingId) return; 
    if (!token) {
      setError('Login required to access this booking');
      setIsLoading(false);
      return;
    }
    try {
      const data = await bookingService.getBooking(bookingId, token || undefined);
      setBooking(data);
      // If already paid, go straight to confirmation
      if ((data as any)?.paymentStatus === 'paid') {
        router.replace(`/therabook/therapists/${id}/book/confirmation?bookingId=${bookingId}`);
        return;
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load booking');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRazorpayScript = () => new Promise<boolean>((resolve) => {
    if (document.getElementById('razorpay-js')) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.id = 'razorpay-js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    if (!bookingId) return;
    setIsProcessing(true);
    setError(null);
    try {
      // Create order on server
      const res = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ bookingId })
      });
      // Read response as text to allow parsing even on non-OK
      const text = await res.text();
      let parsed: any = null;
      try { parsed = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) {
        const code = parsed?.code;
        const serverMsg = parsed?.message || parsed?.error || text || 'Failed to initialize payment';
        let friendly = serverMsg;
        if (code === 'RAZORPAY_NO_CREDENTIALS') {
          friendly = 'Payment gateway not configured on server. Add test key & secret to server env and restart.';
        } else if (code === 'RAZORPAY_PREFIX_MISMATCH') {
          friendly = serverMsg + ' (Key ID prefix does not match selected mode)';
        } else if (code === 'RAZORPAY_WEAK_SECRET') {
          friendly = 'Razorpay secret looks truncated. Re-copy full secret from dashboard and restart server.';
        } else if (code === 'RAZORPAY_AUTH') {
          friendly = 'Gateway authentication failed. Verify key id & secret pair for the active mode and restart server. Use Diagnostics below.';
        }
        const enhanced = `[${code || 'ERR'}] ${friendly}`;
        throw new Error(enhanced);
      }
      const { data } = parsed || {};
      const { order, keyId, simulated } = data || {};
      if (!order?.id || !keyId) throw new Error('Invalid order response');

      const amountRupees = (order.amount || 0) / 100;

      // If server is running in fake mode, bypass Razorpay and auto-verify
      if (simulated) {
        try {
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              bookingId,
              razorpay_payment_id: 'pay_FAKE',
              razorpay_order_id: order.id,
              razorpay_signature: 'sig_FAKE',
            })
          });
          if (!verifyRes.ok) throw new Error('Verification failed');
          router.push(`/therabook/therapists/${id}/book/confirmation?bookingId=${bookingId}`);
          return;
        } catch (e) {
          console.error(e);
          setError('Payment verification failed (simulated). Please contact support.');
          setIsProcessing(false);
          return;
        }
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load');

      const options: any = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'TheraBook',
        description: 'Therapy session payment',
        order_id: order.id,
        prefill: {
          name: (booking as any)?.user?.name || '',
          email: (booking as any)?.user?.email || '',
        },
        notes: { bookingId },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                bookingId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              })
            });
            if (!verifyRes.ok) throw new Error('Verification failed');
            router.push(`/therabook/therapists/${id}/book/confirmation?bookingId=${bookingId}`);
          } catch (e) {
            console.error(e);
            setError('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false)
        },
        theme: { color: '#2563eb' }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error('handlePayment error:', e);
      const msg = e?.message || '';
      if (/Failed to fetch|NetworkError/i.test(msg)) {
        setError('Could not reach the server. Ensure the dev server is running on this same origin (e.g., http://localhost:3000), then try again.');
      } else {
        setError(msg || 'Payment failed. Please try again.');
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
  <Link href={`/therabook/therapists/${id}/book`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment {gatewayMode && <span className="text-sm font-normal ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700 align-middle">mode: {gatewayMode}</span>}</h1>
            <p className="text-gray-600">Complete your booking by paying securely via Razorpay</p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Step 5 of 6</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking...</p>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm space-y-2">
          <div>{error}</div>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={() => window.open(diagnosticsUrl, '_blank')}
              className="text-xs underline text-blue-700 hover:text-blue-900"
            >Open Diagnostics</button>
            <button
              type="button"
              onClick={() => handlePayment()}
              disabled={isProcessing}
              className="text-xs underline text-blue-700 hover:text-blue-900 disabled:opacity-50"
            >Retry</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2 text-green-600" />
                Secure Payment
              </CardTitle>
              <CardDescription>
                Your payment information is encrypted and secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <Label className="text-base font-semibold">Payment Method</Label>
                <div className="grid grid-cols-1 gap-4 mt-3">
                  <div className={`p-4 border-2 rounded-lg ${paymentMethod === 'razorpay' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'} flex items-center justify-between`}>
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium">Razorpay</span>
                    </div>
                    <span className="text-xs text-blue-700">Recommended</span>
                  </div>
                </div>
              </div>

              {/* Card Details Form */}
              <div className="text-sm text-gray-600">
                You will be redirected to Razorpay secure checkout to complete your payment.
              </div>

              {/* Billing Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Billing Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" className="mt-1" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" className="mt-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
        {/* Therapist Info */}
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16">
          <AvatarImage src={bookingFallback.therapist.image} alt={(bookingFallback.therapist.name)} />
          <AvatarFallback>TB</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{(booking as any)?.therapist?.name || bookingFallback.therapist.name}</h3>
                  <p className="text-sm text-gray-600">{(booking as any)?.therapist?.profile?.specializations?.[0] || bookingFallback.therapist.title}</p>
                </div>
              </div>

              <Separator />

              {/* Session Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{booking ? new Date(booking.appointmentDate).toLocaleDateString() : bookingFallback.session.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{booking?.appointmentTime || bookingFallback.session.time} (50 min)</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Session Type: </span>
                  <span className="font-medium">{booking?.sessionType || bookingFallback.session.type}</span>
                </div>
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Session Fee</span>
                  <span className="text-sm">₹{booking?.totalAmount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Platform Fee</span>
                  <span className="text-sm">₹5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tax</span>
                  <span className="text-sm">₹10</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{(booking?.totalAmount || 0) + 15}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Opening Razorpay...
                  </>
                ) : (
                  `Pay ₹${(booking?.totalAmount || 0) + 15}`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
