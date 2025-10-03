"use client";

import { useState } from "react";
import { HMSRoomProvider, useHMSActions, useHMSStore, selectPeers, selectIsLocalAudioEnabled, selectIsLocalVideoEnabled } from "@100mslive/react-sdk";

function JoinForm({ onJoin, loading }: { onJoin: (name: string, role: string) => void; loading: boolean }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("guest");
  return (
    <div className="flex flex-col gap-4 max-w-xs mx-auto mt-24 p-6 border rounded bg-white">
      <input
        className="border p-2 rounded"
        placeholder="Your Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <select className="border p-2 rounded" value={role} onChange={e => setRole(e.target.value)}>
        <option value="host">Therapist (host)</option>
        <option value="guest">Patient (guest)</option>
      </select>
      <button
        className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        disabled={loading || !name}
        onClick={() => onJoin(name, role)}
      >
        {loading ? "Joining..." : "Join Video Call"}
      </button>
    </div>
  );
}

function VideoTile({ peer }: { peer: any }) {
  const videoRef = useState<HTMLVideoElement | null>(null)[0];
  // 100ms SDK attaches video automatically in the background
  return (
    <div className="border rounded p-2 bg-black flex flex-col items-center">
      <video
        ref={videoRef}
        autoPlay
        muted={peer.isLocal}
        playsInline
        className="w-48 h-36 bg-gray-900 object-cover rounded"
        id={`video-${peer.id}`}
      />
      <div className="text-white text-xs mt-2">{peer.name} {peer.isLocal && "(You)"}</div>
    </div>
  );
}

function RoomUI({ onLeave }: { onLeave: () => void }) {
  const peers = useHMSStore(selectPeers);
  const hmsActions = useHMSActions();
  const isAudio = useHMSStore(selectIsLocalAudioEnabled);
  const isVideo = useHMSStore(selectIsLocalVideoEnabled);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-gray-900">
        {peers.map(peer => (
          <VideoTile key={peer.id} peer={peer} />
        ))}
      </div>
      <div className="flex gap-4 justify-center p-4 bg-gray-800">
        <button onClick={() => hmsActions.setLocalAudioEnabled(!isAudio)} className="px-4 py-2 rounded bg-gray-200">
          {isAudio ? "Mute" : "Unmute"}
        </button>
        <button onClick={() => hmsActions.setLocalVideoEnabled(!isVideo)} className="px-4 py-2 rounded bg-gray-200">
          {isVideo ? "Stop Video" : "Start Video"}
        </button>
        <button onClick={() => hmsActions.leave()} className="px-4 py-2 rounded bg-red-500 text-white" >Leave</button>
      </div>
    </div>
  );
}

function RoomWrapper({ token, onLeave }: { token: string; onLeave: () => void }) {
  return (
    <HMSRoomProvider authToken={token}>
      <RoomUI onLeave={onLeave} />
    </HMSRoomProvider>
  );
}

export default function Page() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(name: string, role: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/100ms-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: name + Date.now(), role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get token");
      setToken(data.token);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">100ms Video Call Demo</h1>
        <JoinForm onJoin={handleJoin} loading={loading} />
        {error && <div className="text-red-600 mt-4">{error}</div>}
      </div>
    );
  }
  return <RoomWrapper token={token} onLeave={() => setToken(null)} />;
}
