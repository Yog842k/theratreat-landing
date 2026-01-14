"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar as CalendarIcon, Clock, Video, AlertCircle } from "lucide-react";
import { TheraLearnWebinarRoom } from "@/components/video-call/TheraLearnWebinarRoom";
import { useAuth } from "@/components/auth/NewAuthContext";

interface WebinarDoc {
  _id: string;
  title: string;
  description?: string;
  startTime?: string;
  durationMinutes?: number;
  isPaid?: boolean;
  price?: number;
  status?: string;
  hostName?: string;
}

export default function WebinarJoinPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { token, user, isAuthenticated, isLoading } = useAuth();

  const [webinar, setWebinar] = useState<WebinarDoc | null>(null);
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [joining, setJoining] = useState(false);
  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [role, setRole] = useState<"host" | "guest">("guest");

  const displayName = useMemo(() => {
    if (user?.name) return user.name;
    return role === "host" ? "Host" : "Attendee";
  }, [user?.name, role]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoadingInfo(true);
        const res = await fetch(`/api/theralearn/webinars/${id}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || data?.error || "Failed to load webinar");
        }
        setWebinar(data.data?.webinar || data.webinar || null);
        setAttendeeCount(data.data?.attendeeCount || data.attendeeCount || 0);
      } catch (err: any) {
        setError(err?.message || "Failed to load webinar");
      } finally {
        setLoadingInfo(false);
      }
    };
    load();
  }, [id]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!token) {
      setError("Authentication token missing. Please re-login.");
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const res = await fetch(`/api/theralearn/webinars/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || data?.raw || "Failed to join webinar");
      }
      setRoomToken(data.data?.token || null);
      setRoomId(data.data?.roomId || null);
      setRole((data.data?.role as "host" | "guest") || "guest");
    } catch (err: any) {
      setError(err?.message || "Failed to join webinar");
    } finally {
      setJoining(false);
    }
  };

  if (loadingInfo || isLoading) {
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

  if (!webinar) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-6">
        <Alert className="max-w-xl w-full" variant="destructive">
          <AlertDescription>Webinar not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (roomToken && roomId) {
    return (
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold">TheraLearn Webinar</p>
              <h1 className="text-2xl font-bold text-slate-900">{webinar.title}</h1>
              {webinar.startTime && (
                <p className="text-sm text-slate-600">{new Date(webinar.startTime).toLocaleString()}</p>
              )}
            </div>
            <div className="text-sm text-slate-600">Role: <span className="font-semibold text-slate-900 capitalize">{role}</span></div>
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

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600 text-xs font-semibold uppercase tracking-wide">
              <Video className="w-4 h-4" /> Live Webinar
            </div>
            <CardTitle className="text-2xl text-slate-900">{webinar.title}</CardTitle>
            <CardDescription className="text-slate-600">
              {webinar.description || "Join the live session hosted on 100ms."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
              {webinar.startTime && (
                <span className="inline-flex items-center gap-1"><CalendarIcon className="w-4 h-4 text-orange-600" /> {new Date(webinar.startTime).toLocaleString()}</span>
              )}
              {webinar.durationMinutes && (
                <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4 text-orange-600" /> {webinar.durationMinutes} mins</span>
              )}
              <Badge variant={webinar.isPaid ? "destructive" : "secondary"}>
                {webinar.isPaid ? `Paid: ₹${webinar.price || 0}` : "Free to attend"}
              </Badge>
              {webinar.hostName && <Badge variant="outline">Host: {webinar.hostName}</Badge>}
              <Badge variant="outline">Attendees: {attendeeCount}</Badge>
            </div>

            {!isAuthenticated && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription className="ml-2 text-sm">
                  Please log in to join this webinar.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleJoin} disabled={joining} className="gap-2">
                {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                Join webinar
              </Button>
              <Button variant="outline" onClick={() => router.push(`/theralearn/webinars/${id}`)}>View details</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
