"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectCameraStreamByPeerID,
  HMSPeer,
} from "@100mslive/react-sdk";

/*
  Unified 100ms Video Call Demo
  -----------------------------
  Features:
    - Simple join form (name + role + optional room ID)
    - Token fetched from /api/100ms-token (expects { user_id, role, room_id? })
    - Basic media controls (mute/unmute, start/stop video, leave)
    - Automatic track attach/detach per peer
    - Connection + error states surfaced

  To customize roles or room creation logic, adjust your server handler at /api/100ms-token.
*/

type JoinPayload = { name: string; role: string; room?: string };

const DEFAULT_ROLE = "guest"; // update to match your 100ms dashboard role if needed

function JoinForm({ onJoin, loading, error }: { onJoin: (p: JoinPayload) => void; loading: boolean; error: string | null }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState(DEFAULT_ROLE);
  const [room, setRoom] = useState("");
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onJoin({ name, role, room: room.trim() || undefined });
      }}
      className="w-full max-w-md mx-auto flex flex-col gap-4 bg-white/80 backdrop-blur border rounded-md p-6 shadow"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Display Name</label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Jane Doe"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="host">Therapist (host)</option>
          <option value="guest">Patient (guest)</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Room ID (optional)</label>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="existing-room-id or blank"
          value={room}
          onChange={e => setRoom(e.target.value)}
        />
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
      <button
        type="submit"
        disabled={loading || !name}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium"
      >
        {loading ? "Joining..." : "Join Call"}
      </button>
      <a
        href="/api/100ms-token?probe=1"
        target="_blank"
        rel="noreferrer"
        className="text-xs underline text-blue-700 hover:text-blue-900"
      >Diagnostics (probe)</a>
      <p className="text-[11px] text-gray-500 leading-snug">
        Server endpoint: <code className="font-mono">/api/100ms-token</code><br />
        Ensure environment variables (HMS_ACCESS_KEY / HMS_SECRET or MANAGEMENT TOKEN) are configured.
      </p>
    </form>
  );
}

function VideoTile({ peer }: { peer: HMSPeer }) {
  const hmsActions = useHMSActions();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTrack = useHMSStore(selectCameraStreamByPeerID(peer.id));

  useEffect(() => {
    if (videoRef.current && videoTrack) {
      hmsActions.attachVideo(videoTrack.id, videoRef.current);
    }
    return () => {
      if (videoRef.current && videoTrack) {
        hmsActions.detachVideo(videoTrack.id, videoRef.current);
      }
    };
  }, [videoTrack, hmsActions]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted={peer.isLocal}
        playsInline
      />
      <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-black/50 text-white text-xs">
        {peer.name || 'Unnamed'} {peer.isLocal && '(You)'}
      </div>
    </div>
  );
}

function Controls() {
  const hmsActions = useHMSActions();
  const isAudioOn = useHMSStore(selectIsLocalAudioEnabled);
  const isVideoOn = useHMSStore(selectIsLocalVideoEnabled);

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center py-4">
      <button
        onClick={() => hmsActions.setLocalAudioEnabled(!isAudioOn)}
        className={`px-4 py-2 rounded font-medium shadow text-sm ${isAudioOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 text-white hover:bg-red-600'}`}
      >
        {isAudioOn ? 'Mute' : 'Unmute'}
      </button>
      <button
        onClick={() => hmsActions.setLocalVideoEnabled(!isVideoOn)}
        className={`px-4 py-2 rounded font-medium shadow text-sm ${isVideoOn ? 'bg-gray-200 hover:bg-gray-300' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
      >
        {isVideoOn ? 'Stop Video' : 'Start Video'}
      </button>
      <button
        onClick={() => hmsActions.leave()}
        className="px-4 py-2 rounded font-medium shadow text-sm bg-red-600 text-white hover:bg-red-700"
      >
        Leave
      </button>
    </div>
  );
}

function RoomUI() {
  const peers = useHMSStore(selectPeers);
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid gap-4 p-4 auto-rows-[minmax(0,1fr)] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 bg-gray-900 overflow-y-auto">
        {peers.map(p => (
          <VideoTile key={p.id} peer={p} />
        ))}
        {!peers.length && (
          <div className="col-span-full flex items-center justify-center text-gray-400 text-sm">
            Waiting for others to join…
          </div>
        )}
      </div>
      <Controls />
    </div>
  );
}

function DemoInner() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hmsActions = useHMSActions();

  async function handleJoin(payload: JoinPayload) {
    setJoining(true); setError(null);
    try {
      const user_id = `${payload.role}_${payload.name.replace(/\s+/g,'_')}_${Date.now()}`;
      const body: any = { user_id, role: payload.role };
      if (payload.room) body.room_id = payload.room;
      const res = await fetch('/api/100ms-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const raw = await res.text();
      let data: any = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch { /* ignore parse error */ }
      if (!res.ok) {
        console.error('[100ms] token route failed', { status: res.status, data, raw });
      }
      // Some responses may include warnings array
      if (!res.ok) throw new Error(data.error || 'Failed to retrieve token');
      if (!data.token) throw new Error('Token missing in response');
      await hmsActions.join({ userName: payload.name, authToken: data.token });
    } catch (e: any) {
      const msg = e.message || 'Join failed';
      // Provide guidance for common backend issues (e.g., 502 from token route)
      let hint = '';
      if (/502/.test(msg) || /TOKEN_FAILED/.test(msg)) {
        hint = ' Check /api/100ms-token in the browser for diagnostics. Ensure HMS_ACCESS_KEY + HMS_SECRET (or HMS_MANAGEMENT_TOKEN) and HMS_TEMPLATE_ID (if auto-creating rooms) are set in .env.local and server restarted.';
      } else if (/credentials not configured/i.test(msg)) {
        hint = ' Set HMS_ACCESS_KEY and HMS_SECRET in .env.local then restart dev server.';
      } else if (/INVALID_MANAGEMENT_TOKEN/.test(msg)) {
        hint = ' Management token invalid/unauthorized. Regenerate in 100ms dashboard or add HMS_ACCESS_KEY & HMS_SECRET and (optionally) provide a Room ID to skip auto-create.';
      }
      setError(msg + hint);
    } finally {
      setJoining(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start pt-20 px-4 bg-gradient-to-br from-slate-100 to-slate-200">
        <h1 className="text-3xl font-bold mb-2">Video Call</h1>
        <p className="text-gray-600 mb-8 text-center max-w-xl">Join a 100ms room. Provide a room ID to reuse or leave blank to auto-create (requires template setup server-side).</p>
        <JoinForm onJoin={handleJoin} loading={joining} error={error} />
        {error && (
          <div className="mt-4 max-w-md text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
            {error}
            <div className="mt-2 text-[10px] text-gray-600">
              Tip: Open <code>/api/100ms-token?probe=1</code> in a new tab for diagnostics. If it reports NO_BASIC_CREDS_AFTER_MGMT_FAIL add HMS_ACCESS_KEY & HMS_SECRET. If it shows COMPROMISED_KEY_IN_USE regenerate credentials in the 100ms dashboard.
            </div>
          </div>
        )}
      </div>
    );
  }

  return <RoomUI />;
}

export default function VideoCallPage() {
  return (
    <HMSRoomProvider>
      <DemoInner />
    </HMSRoomProvider>
  );
}
