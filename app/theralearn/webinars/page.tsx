"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Video } from "lucide-react";

interface WebinarItem {
  id: string;
  title: string;
  startTime?: string;
  durationMinutes?: number;
  category?: string | null;
  level?: string | null;
  status?: string;
  hostName?: string;
  isPaid?: boolean;
  price?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function formatPrice(webinar: WebinarItem) {
  if (!webinar.isPaid) return "Free";
  const amount = typeof webinar.price === "number" ? webinar.price : Number(webinar.price || 0);
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function WebinarDirectoryPage() {
  const router = useRouter();
  const [webinars, setWebinars] = useState<WebinarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/theralearn/webinars?upcoming=true", { cache: "no-store" });
        const data: ApiResponse<any[]> = await res.json();
        if (!res.ok || !data?.success) throw new Error(data?.message || "Could not load webinars");
        const mapped = (data.data || []).map((w: any) => ({
          id: String(w._id || w.id),
          title: w.title ?? "Webinar",
          startTime: w.startTime,
          durationMinutes: w.durationMinutes ?? 0,
          category: w.category ?? null,
          level: w.level ?? null,
          status: w.status ?? "scheduled",
          hostName: w.hostName ?? "Instructor",
          isPaid: Boolean(w.isPaid),
          price: typeof w.price === "number" ? w.price : Number(w.price) || 0,
        }));
        setWebinars(mapped);
      } catch (err: any) {
        setError(err?.message || "Could not load webinars");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-700"><Loader2 className="w-5 h-5 animate-spin" /> Loading webinars…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-6">
        <Alert className="max-w-xl w-full" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold">TheraLearn Webinars</p>
            <h1 className="text-3xl font-bold text-slate-900">Upcoming live sessions</h1>
            <p className="text-slate-600 text-sm">Browse organizer-hosted webinars and register in one click.</p>
          </div>
        </div>

        {webinars.length === 0 ? (
          <Card className="border-orange-100">
            <CardContent className="p-6 text-sm text-slate-700">No webinars available right now. Check back soon.</CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {webinars.map((webinar) => {
              const start = webinar.startTime ? new Date(webinar.startTime) : null;
              const startLabel = start && !Number.isNaN(start.getTime()) ? start.toLocaleString() : "";
              const amountLabel = formatPrice(webinar);
              return (
                <Card key={webinar.id} className="border-orange-100">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-orange-100 text-orange-700 border-none">{webinar.category || "Webinar"}</Badge>
                      {webinar.status && <span className="text-xs text-gray-500">{webinar.status}</span>}
                    </div>
                    <div className="text-lg font-bold text-gray-900 leading-tight">{webinar.title}</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Video className="w-4 h-4 text-orange-600" />
                      <span>{startLabel}</span>
                      {webinar.durationMinutes ? <span>• {webinar.durationMinutes} mins</span> : null}
                    </div>
                    <div className="text-xs text-gray-600">Host: {webinar.hostName || "Instructor"}</div>
                    <div className="text-sm font-semibold text-orange-700">{amountLabel}</div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="border-orange-200 text-orange-700"
                        onClick={() => router.push(`/theralearn/webinars/${webinar.id}`)}
                      >
                        View details
                      </Button>
                      <Button
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() => router.push(`/theralearn/webinars/${webinar.id}`)}
                      >
                        Register
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
