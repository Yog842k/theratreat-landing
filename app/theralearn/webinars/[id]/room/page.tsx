"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TheraLearnWebinarRoom } from "@/components/video-call/TheraLearnWebinarRoom";
import { useAuth } from "@/components/auth/NewAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, Video } from "lucide-react";

interface WebinarDoc {
  _id: string;
  title: string;
  description?: string;
  startTime?: string;
  isPaid?: boolean;
  price?: number;
}

export default function WebinarRoomPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const [webinar, setWebinar] = useState<WebinarDoc | null>(null);
  const [role, setRole] = useState<"host" | "guest">("guest");
  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (isLoading) return;
    if (!token) return; // auth required
    const load = async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
        const res = await fetch(`/api/theralearn/webinars/${id}/join`, {
          method: "POST",
          headers,
        });
        const text = await res.text();
        let data: any = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { raw: text };
        }
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || data?.error || data?.raw || `Could not join webinar (${res.status})`);
        }
        setWebinar(data.data?.webinar || null);
        setRoomToken(data.data?.token || null);
        setRoomId(data.data?.roomId || null);
        setRole((data.data?.role as "host" | "guest") || "guest");
      } catch (err: any) {
        setError(err?.message || "Could not load webinar");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, isLoading]);

  const displayName = user?.name || (role === "host" ? "Host" : "Guest");

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Video className="w-5 h-5 text-orange-600" /> Login required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>Please sign in to join this webinar.</p>
            <Button className="w-full" onClick={() => router.push("/auth/login")}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-600"><Loader2 className="w-5 h-5 animate-spin" /> Loading webinar...</div>
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

  if (!roomId) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-6">
        <Alert className="max-w-xl w-full" variant="destructive">
          <AlertDescription>Room ID missing for this webinar. Please recreate the webinar or contact support.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!roomToken) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-6">
        <Alert className="max-w-xl w-full" variant="destructive">
          <AlertDescription>Could not fetch webinar token. Please retry.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold">TheraLearn Webinar</p>
            <h1 className="text-2xl font-bold text-slate-900">{webinar?.title || "Live Session"}</h1>
            {webinar?.startTime && (
              <p className="text-sm text-slate-600">{new Date(webinar.startTime).toLocaleString()}</p>
            )}
          </div>
          <div className="text-sm text-slate-600">
            Role: <span className="font-semibold text-slate-900 capitalize">{role}</span>
          </div>
        </div>

        <TheraLearnWebinarRoom
          token={roomToken}
          userName={displayName}
          role={role}
          onLeave={() => router.push(`/theralearn/webinars/${id}`)}
        />
      </div>
    </main>
  );
}
