"use client";
import React, { useEffect, useState } from "react";
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  selectPeers,
  selectIsConnectedToRoom,
  useAVToggle,
  useVideo,
} from "@100mslive/react-sdk";

/*
  Simple 100ms Room Demo (room code based)
  ---------------------------------------
  Frontend flow:
    1. User enters name + room code.
    2. POST /api/100ms-token { roomCode, userName }
       (Backend should exchange room code for token via 100ms management API.)
    3. Join room with returned authToken.

  Backend expectation (/api/100ms-token):
    - Accepts JSON { roomCode, userName }
    - Returns { token } on success (auth token usable with hmsActions.join)

  Notes:
    - This demo assumes token generation by *room code* (not dynamic room creation). Provide a valid room code from 100ms Dashboard.
    - If you want to create rooms dynamically, adapt backend to create or fetch a room first.
*/

function JoinForm() {
  const hmsActions = useHMSActions();
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roomCode) return;
    setIsJoining(true); setError(null);
    try {
      const resp = await fetch("/api/100ms-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, userName: name })
      });
      const raw = await resp.text();
      let json: any = {}; try { json = raw ? JSON.parse(raw) : {}; } catch {}
      if (!resp.ok) {
        setError(json.error ? (typeof json.error === 'string' ? json.error : JSON.stringify(json.error)) : `Request failed (${resp.status})`);
        return;
      }
      const authToken = json.token;
      if (!authToken) { setError('Token missing in response'); return; }
      await hmsActions.join({ userName: name, authToken });
    } catch (err: any) {
      setError(err.message || 'Join failed');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto flex flex-col gap-4 p-6 bg-white shadow rounded border">
      <h2 className="text-xl font-semibold text-center">Join Room</h2>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-3 py-2"
        required
      />
      <input
        type="text"
        placeholder="Room code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        className="border rounded px-3 py-2"
        required
      />
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
      <button
        type="submit"
        disabled={isJoining}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-4 py-2 font-medium"
      >
        {isJoining ? "Joining…" : "Join"}
      </button>
      <p className="text-[11px] text-gray-500 text-center leading-snug">
        Provide a room code generated in 100ms dashboard.<br />
        Backend must return {`{ token }`}.
      </p>
    </form>
  );
}

function Peer({ peer }: { peer: any }) {
  const { videoRef } = useVideo({ trackId: peer.videoTrack });
  return (
    <div className="flex flex-col items-center p-2 bg-gray-900 rounded">
      <video
        ref={videoRef}
        autoPlay
        muted={peer.isLocal}
        playsInline
        className="w-48 h-36 object-cover bg-black rounded"
      />
      <div className="text-xs text-white mt-1">{peer.name} {peer.isLocal && '(You)'}</div>
    </div>
  );
}

function Conference() {
  const peers = useHMSStore(selectPeers);
  return (
    <div className="flex flex-wrap gap-4 justify-center p-4">
      {peers.map(p => <Peer key={p.id} peer={p} />)}
    </div>
  );
}

function Controls() {
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } = useAVToggle();
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  if (!isConnected) return null;
  return (
    <div className="flex gap-3 justify-center pb-6">
      <button onClick={toggleAudio} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium">
        {isLocalAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
      </button>
      <button onClick={toggleVideo} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium">
        {isLocalVideoEnabled ? 'Hide Video' : 'Show Video'}
      </button>
      <button onClick={() => hmsActions.leave()} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium">
        Leave
      </button>
    </div>
  );
}

function RoomContent() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  return isConnected ? (
    <>
      <Conference />
      <Controls />
    </>
  ) : (
    <JoinForm />
  );
}

export default function RoomPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col">
      <div className="py-8 text-center">
        <h1 className="text-3xl font-bold">Room Code Demo</h1>
        <p className="text-gray-600 text-sm mt-2">Enter an existing 100ms room code to join</p>
      </div>
      <HMSRoomProvider>
        <RoomContent />
      </HMSRoomProvider>
    </div>
  );
}
