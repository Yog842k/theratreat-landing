"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/auth/NewAuthContext";
import { AlertCircle, Calendar, CheckCircle2, Clock, Loader2, Phone, Users } from "lucide-react";

interface CustomQuestion {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
}

interface WebinarDetail {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string | null;
  startTime?: string;
  durationMinutes?: number;
  hostName?: string;
  isPaid?: boolean;
  price?: number;
  attendeeMeetingUrl?: string | null;
  customQuestions?: CustomQuestion[];
}

interface DetailResponse {
  webinar: WebinarDetail;
  attendeeCount: number;
  alreadyRegistered?: boolean;
  attendeeStatus?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

type RazorpayInstance = {
  open: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
};

type RazorpayConstructor = NonNullable<Window["Razorpay"]>;

async function loadRazorpay(): Promise<RazorpayConstructor | null> {
  if (typeof window === "undefined") return null;
  if (window.Razorpay) return window.Razorpay;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(window.Razorpay || null);
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

function formatPrice(isPaid?: boolean, price?: number) {
  if (!isPaid) return "Free";
  return `₹${Number(price || 0).toLocaleString("en-IN")}`;
}

export default function WebinarDetailPage() {
  const params = useParams() as { id?: string | string[] } | null;
  const id = (() => {
    const raw = params?.id;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) return raw[0] || "";
    return "";
  })();
  const { token, user } = useAuth();

  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        if (!id) throw new Error("Missing webinar id");
        const res = await fetch(`/api/theralearn/webinars/${id}` , { headers });
        const data: ApiResponse<DetailResponse> = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Could not load webinar");
        }
        setDetail(data.data);
        setName(user?.name || "");
      } catch (err: any) {
        setLoadError(err?.message || "Could not load webinar");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, user?.name]);
  const webinar = detail?.webinar;
  const attendeeCount = detail?.attendeeCount || 0;
  const questions = useMemo<CustomQuestion[]>(() => {
    if (!webinar?.customQuestions) return [];
    return webinar.customQuestions as CustomQuestion[];
  }, [webinar]);

  const alreadyRegistered = Boolean(detail?.alreadyRegistered || detail?.attendeeStatus) || Boolean(successMessage);
  const joinPath = webinar?._id ? `/theralearn/webinars/${webinar._id}/room` : null;

  useEffect(() => {
    if (!webinar?.startTime) {
      setTimeLeft("");
      return;
    }
    const target = new Date(webinar.startTime).getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft("Live now");
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    };
    update();
    const handle = setInterval(update, 1000);
    return () => clearInterval(handle);
  }, [webinar?.startTime]);

  const handleRegister = async () => {
    if (!webinar) return;
    if (!name.trim() || !phone.trim()) {
      setFormError("Name and phone are required to enroll");
      return;
    }
    setFormError(null);
    setSuccessMessage(null);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const basePayload = {
      name: name.trim(),
      phone: phone.trim(),
      responses,
    };

    // Paid flow uses Razorpay checkout
    if (webinar.isPaid) {
      if (!token) {
        setFormError("Login is required to complete payment for this webinar.");
        return;
      }
      setSubmitting(true);
      try {
        const RazorpayCtor = await loadRazorpay();
        if (!RazorpayCtor) throw new Error("Payment unavailable right now");

        const orderResp: ApiResponse<any> = await (await fetch(`/api/theralearn/webinars/${webinar._id}/pay`, {
          method: "POST",
          headers,
        })).json();

        if (!orderResp?.success || !orderResp.data?.orderId) {
          throw new Error(orderResp?.message || "Could not start payment");
        }

        const order = orderResp.data;
        const rzp = new RazorpayCtor({
          key: order.key,
          amount: order.amount,
          currency: order.currency || "INR",
          name: webinar.title,
          description: "TheraLearn webinar enrollment",
          order_id: order.orderId,
          notes: order.notes,
          prefill: {
            name,
            email: user?.email || undefined,
            contact: phone,
          },
          handler: async (response: any) => {
            try {
              const registerResp = await fetch(`/api/theralearn/webinars/${webinar._id}/register`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  ...basePayload,
                  paymentStatus: "paid",
                  paymentReference: response?.razorpay_payment_id,
                  razorpayPaymentId: response?.razorpay_payment_id,
                  razorpayOrderId: response?.razorpay_order_id,
                  razorpaySignature: response?.razorpay_signature,
                }),
              });
              const data: ApiResponse<any> = await registerResp.json();
              if (!registerResp.ok || !data?.success) {
                throw new Error(data?.message || "Could not confirm enrollment");
              }
              setSuccessMessage("You are enrolled. Join details will be shared before the session.");
              setDetail((prev) =>
                prev
                  ? { ...prev, attendeeCount: prev.attendeeCount + 1 }
                  : { webinar, attendeeCount: 1 }
              );
            } catch (err: any) {
              setFormError(err?.message || "Payment verified but registration failed");
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => setSubmitting(false),
          },
        });

        rzp.open();
      } catch (err: any) {
        setFormError(err?.message || "Payment failed to start");
        setSubmitting(false);
      }
      return;
    }

    // Free webinar registration
    setSubmitting(true);
    try {
      const res = await fetch(`/api/theralearn/webinars/${webinar._id}/register`, {
        method: "POST",
        headers,
        body: JSON.stringify(basePayload),
      });
      const data: ApiResponse<any> = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Could not register");
      }
      setSuccessMessage("You are enrolled for this webinar.");
      setDetail((prev) => (prev ? { ...prev, attendeeCount: prev.attendeeCount + 1 } : { webinar, attendeeCount: 1 }));
    } catch (err: any) {
      setFormError(err?.message || "Could not register");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-700"><Loader2 className="w-5 h-5 animate-spin" /> Loading webinar…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-6">
        <Alert className="max-w-xl w-full" variant="destructive">
          <AlertDescription className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {loadError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!webinar) return null;

  const priceLabel = formatPrice(webinar.isPaid, webinar.price);
  const startLabel = webinar.startTime ? new Date(webinar.startTime).toLocaleString() : "";
  const startDate = webinar.startTime ? new Date(webinar.startTime) : null;
  const heroImage = webinar.thumbnail || "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80";
  const relativeStart = (() => {
    if (!startDate) return "";
    const diff = startDate.getTime() - Date.now();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    if (days > 1) return `Starts in ${days} days`;
    if (days === 1) return "Starts tomorrow";
    if (days === 0) return "Starts today";
    return startLabel;
  })();

  const highlights = [
    "Live Q&A with the host",
    "Practical walkthroughs you can apply immediately",
    "Resource pack shared after the session",
  ];

  const learnings = [
    "Evidence-based approaches to the topic",
    "Case-based examples with clear takeaways",
    "Action checklist you can reuse with clients",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white py-10">
      <div className="max-w-6xl mx-auto px-6 space-y-10">
        <section className="rounded-3xl overflow-hidden bg-slate-900 text-white relative shadow-xl">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.55), rgba(0,0,0,0.2)), url('${heroImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative p-8 md:p-10 flex flex-col gap-6">
            <div className="flex flex-wrap gap-3 items-center text-xs uppercase tracking-wide">
              <Badge className="bg-white/20 text-white border-white/30">TheraLearn Webinar</Badge>
              <Badge className="bg-orange-500 text-white border-orange-400">{priceLabel}</Badge>
              {relativeStart ? <Badge className="bg-white/15 text-white border-white/25">{relativeStart}</Badge> : null}
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">{webinar.title}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-orange-50/90">
                  <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full"><Calendar className="w-4 h-4" /> {startLabel}</span>
                  {webinar.durationMinutes ? (
                    <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full"><Clock className="w-4 h-4" /> {webinar.durationMinutes} mins</span>
                  ) : null}
                  {webinar.hostName ? (
                    <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full"><CheckCircle2 className="w-4 h-4" /> Host: {webinar.hostName}</span>
                  ) : null}
                  <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full"><Users className="w-4 h-4" /> {attendeeCount} already in</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-semibold">{priceLabel}</div>
                  <div className="text-sm text-orange-100">Limited seats, secure yours</div>
                </div>
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50"
                  onClick={() => document.getElementById("enroll-card")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Reserve my seat
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
          <div className="space-y-5">
            <Card className="border-orange-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">What to expect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-slate-700 text-sm">
                <p className="leading-relaxed">{webinar.description || "Live learning session powered by 100ms."}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {highlights.map((item) => (
                    <div key={item} className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-100 px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5" />
                      <span className="text-sm text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">You will learn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                {learnings.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Session details</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Starts at</div>
                  <div className="font-semibold text-slate-900">{startLabel}</div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Duration</div>
                  <div className="font-semibold text-slate-900">{webinar.durationMinutes || 60} mins</div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Format</div>
                  <div className="font-semibold text-slate-900">Live 100ms room</div>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Attendees</div>
                  <div className="font-semibold text-slate-900">{attendeeCount}+ registered</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card id="enroll-card" className="border-orange-200 shadow-lg sticky top-6">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Enroll now</CardTitle>
              <p className="text-sm text-slate-600">Secure your spot in under a minute.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {successMessage ? (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <AlertDescription className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> {successMessage}
                  </AlertDescription>
                </Alert>
              ) : alreadyRegistered ? (
                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
                  <AlertDescription className="flex flex-col gap-1 text-sm">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> You’re enrolled for this webinar.</span>
                    {timeLeft ? <span>Starts in {timeLeft}</span> : null}
                  </AlertDescription>
                </Alert>
              ) : null}
              {formError ? (
                <Alert variant="destructive">
                  <AlertDescription className="text-sm">{formError}</AlertDescription>
                </Alert>
              ) : null}

              {!alreadyRegistered && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Phone number</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
                    </div>
                  </div>
                </div>
              )}

              {questions.length > 0 && !alreadyRegistered && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-700">Additional questions</div>
                  {questions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <label className="text-sm text-slate-700 flex items-center gap-1">
                        {q.label}
                        {q.required ? <span className="text-red-500">*</span> : null}
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Your answer"
                        value={responses[q.id] || ""}
                        onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {alreadyRegistered ? (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      if (joinPath) {
                        window.location.href = joinPath;
                      }
                    }}
                  >
                    {timeLeft ? `Join now (starts in ${timeLeft})` : "Join now"}
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    {timeLeft ? `Starts in ${timeLeft}.` : "You’re enrolled. You can join from here at start time."}
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={handleRegister}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Processing..."
                      : webinar.isPaid
                        ? `Pay & enroll (${priceLabel})`
                        : "Enroll for free"}
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    You’ll get the joining link after a successful enrollment.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
