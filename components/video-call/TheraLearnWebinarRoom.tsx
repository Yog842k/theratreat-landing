"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  HMSRoomProvider,
  useAVToggle,
  useHMSActions,
  useHMSStore,
  selectPeers,
  selectIsConnectedToRoom,
  selectLocalPeer,
  useVideo,
} from "@100mslive/react-sdk";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";

const HOST_ROLES = ["host", "instructor", "therapist"];

function HostVideoTile({ peerId, displayName }: { peerId: string | undefined; displayName: string }) {
  const peers = useHMSStore(selectPeers);
  const hostPeer =
    peers.find((p) => p.id === peerId) ||
    peers.find((p) => HOST_ROLES.includes((p as any)?.role?.name)) ||
    peers.find((p) => (p as any)?.videoTrack);
  const { videoRef } = useVideo({ trackId: (hostPeer as any)?.videoTrack });
  const isHostVideoMuted = !(hostPeer as any)?.videoTrack;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
      <video ref={videoRef as any} className="h-full w-full object-cover" autoPlay muted playsInline />
      {!hostPeer && (
        <div className="absolute inset-0 grid place-items-center text-slate-200 text-sm">Waiting for host...</div>
      )}
      <div className="absolute left-4 bottom-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 text-white text-sm border border-white/10">
        <span className="font-semibold">{hostPeer?.name || displayName}</span>
        <Badge variant="outline" className="border-orange-400/50 text-orange-200 bg-orange-500/20">Host</Badge>
        {isHostVideoMuted && <VideoOff className="w-4 h-4 text-red-300" />}
      </div>
    </div>
  );
}

function AttendeeList({
  role,
  onAllowUnmute,
}: {
  role: "host" | "guest";
  onAllowUnmute?: (peerId: string) => void;
}) {
  const peers = useHMSStore(selectPeers);
  const attendees = peers.filter((p) => !HOST_ROLES.includes((p as any)?.role?.name));

  if (!attendees.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">No attendees yet.</div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="font-semibold text-slate-800 mb-3">Attendees</div>
      <div className="flex flex-col gap-2">
        {attendees.map((peer) => {
          const audioMuted = (peer as any).isAudioMuted ?? false;
          return (
            <div key={peer.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-700 grid place-items-center text-sm font-semibold">
                  {(peer.name || "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold">{peer.name || "Guest"}</span>
                  <span className="text-xs text-slate-500">{(peer as any)?.role?.name || "attendee"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                {audioMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-emerald-600" />}
                {role === "host" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    onClick={() => onAllowUnmute?.(peer.id)}
                  >
                    Allow to unmute
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WebinarControls({ onLeave, role, onMuteAll }: { onLeave: () => void; role: "host" | "guest"; onMuteAll?: () => void }) {
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } = useAVToggle();
  const [busy, setBusy] = useState(false);

  const handle = async (action?: (() => void) | (() => Promise<void>)) => {
    try {
      setBusy(true);
      if (!action) return;
      await action();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        variant={isLocalAudioEnabled ? "outline" : "destructive"}
        onClick={() => handle(toggleAudio)}
        disabled={busy || role !== "host"}
        className="gap-2"
      >
        {isLocalAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        {isLocalAudioEnabled ? "Mute" : "Unmute"}
      </Button>
      <Button
        variant={isLocalVideoEnabled ? "outline" : "destructive"}
        onClick={() => handle(toggleVideo)}
        disabled={busy || role !== "host"}
        className="gap-2"
      >
        {isLocalVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        {isLocalVideoEnabled ? "Stop Video" : "Start Video"}
      </Button>
      {role === "host" && (
        <Button variant="secondary" onClick={() => handle(onMuteAll)} disabled={busy} className="gap-2">
          Mute all attendees
        </Button>
      )}
      <Button variant="destructive" onClick={onLeave} className="gap-2">
        Leave Webinar
      </Button>
    </div>
  );
}

function WebinarInner({ token, userName, role, onLeave }: { token: string; userName: string; role: "host" | "guest"; onLeave?: () => void }) {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const [joining, setJoining] = useState(false);
  const hasJoinedRef = useRef(false);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const hostPeerId = useMemo(() => {
    const host = peers.find((p) => HOST_ROLES.includes((p as any)?.role?.name));
    return host?.id || localPeer?.id;
  }, [peers, localPeer]);

  useEffect(() => {
    if (!token || !userName || hasJoinedRef.current || joining || isConnected) return;
    const join = async () => {
      try {
        setJoining(true);
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch(() => {});
        const startMuted = role !== "host";
        await hmsActions.join({ userName, authToken: token, settings: { isAudioMuted: startMuted, isVideoMuted: startMuted } });
        hasJoinedRef.current = true;
        toast.success("Joined webinar");
      } catch (err: any) {
        toast.error("Could not join webinar", { description: err?.message });
      } finally {
        setJoining(false);
      }
    };
    join();
  }, [token, userName, hmsActions, joining, isConnected]);

  useEffect(() => {
    return () => {
      hmsActions.leave().catch(() => {});
    };
  }, [hmsActions]);

  const muteAllAttendees = async () => {
    try {
      await hmsActions.setRemoteTracksEnabled({ roles: ["guest"], type: "audio", enabled: false });
      toast.success("Everyone muted");
    } catch (err: any) {
      toast.error("Could not mute everyone", { description: err?.message });
    }
  };

  const allowUnmute = async (peerId: string) => {
    try {
      const peer = peers.find((p) => p.id === peerId);
      const audioTrack = (peer as any)?.audioTrack;
      if (!audioTrack) {
        toast.error("No audio track for this attendee yet");
        return;
      }
      await hmsActions.setRemoteTrackEnabled(audioTrack, true);
      toast.success(`${peer?.name || "Attendee"} can unmute now`);
    } catch (err: any) {
      toast.error("Could not allow unmute", { description: err?.message });
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <HostVideoTile peerId={hostPeerId} displayName={userName} />
        <WebinarControls
          onLeave={() => {
            const leaveFlow = async () => {
              try {
                if (role === "host") {
                  await hmsActions.endRoom(true, "Host ended the webinar").catch(() => {});
                }
                await hmsActions.leave();
              } catch {
                // ignore
              } finally {
                onLeave?.();
              }
            };
            leaveFlow();
          }}
          role={role}
          onMuteAll={role === "host" ? muteAllAttendees : undefined}
        />
      </div>
      <AttendeeList role={role} onAllowUnmute={role === "host" ? allowUnmute : undefined} />
    </div>
  );
}

export function TheraLearnWebinarRoom({ token, userName, role = "guest", onLeave }: { token: string; userName: string; role?: "host" | "guest"; onLeave?: () => void; }) {
  return (
    <HMSRoomProvider>
      <WebinarInner token={token} userName={userName} role={role} onLeave={onLeave} />
    </HMSRoomProvider>
  );
}

/**
 * Helper that fetches a 100ms token by room and role, then renders the room UI.
 */
export function TheraLearnWebinarLoader({ roomId, role, userId, userName }: { roomId: string; role: string; userId: string; userName: string; }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/100ms-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId || "guest", role, room_id: roomId }),
        });
        const data = await res.json();
        if (!res.ok || !data?.token) {
          throw new Error(data?.error || data?.message || "Failed to fetch token");
        }
        setToken(data.token);
      } catch (err: any) {
        setError(err?.message || "Could not load webinar");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roomId, role, userId]);

  if (loading) {
    return (
      <div className="min-h-[300px] grid place-items-center text-slate-600">
        <div className="flex items-center gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
        {error || "Could not start webinar."}
      </div>
    );
  }

  return <TheraLearnWebinarRoom token={token} userName={userName} />;
}
