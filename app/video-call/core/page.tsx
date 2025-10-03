"use client";

// Core 100ms React SDK demo (custom UI) – complements the RoomKit prebuilt page.
// Features:
//  - Join via Room Code (client fetch using getAuthTokenByRoomCode) OR backend token (/api/100ms-token)
//  - List peers with video tiles
//  - Mute/unmute audio & video
//  - Leave room & auto leave on unload
//  - Minimal, easily extensible structure

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  HMSRoomProvider,
  useHMSStore,
  useHMSActions,
  selectPeers,
  useVideo,
  useAVToggle,
  selectIsConnectedToRoom,
  selectLocalPeer,
} from '@100mslive/react-sdk';

// Separate the actual app logic so we can wrap with HMSRoomProvider cleanly.
export default function CoreVideoPage() {
  return (
    <HMSRoomProvider>
      <CoreVideoInner />
    </HMSRoomProvider>
  );
}

interface JoinFormState {
  name: string;
  role: string;
  roomCode: string; // optional if using backend token flow
  roomId: string;   // optional explicit room id for backend flow
  method: 'roomCode' | 'backend';
}

function CoreVideoInner() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const localPeer = useHMSStore(selectLocalPeer);
  const hmsActions = useHMSActions();
  const [form, setForm] = useState<JoinFormState>({ name: '', role: 'guest', roomCode: '', roomId: '', method: 'backend' });
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    const handler = () => { if (isConnected) hmsActions.leave(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hmsActions, isConnected]);

  const handleChange = (key: keyof JoinFormState, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const join = useCallback(async () => {
    setError(null);
    setJoining(true);
    try {
      if (!form.name.trim()) throw new Error('Name required');
      let authToken: string | undefined;
      if (form.method === 'roomCode') {
        if (!form.roomCode.trim()) throw new Error('Room code required for roomCode method');
        authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode: form.roomCode.trim() });
      } else {
        // Backend token flow
        const user_id = `${form.role}_${form.name.replace(/\s+/g, '_')}_${Date.now()}`;
        const payload: any = { user_id, role: form.role };
        if (form.roomId.trim()) payload.room_id = form.roomId.trim();
        const res = await fetch('/api/100ms-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Token request failed');
        authToken = json.token;
        setDebug({ mode: json.mode, created: json.created, room_id: json.room_id });
      }
      if (!authToken) throw new Error('No auth token generated');
      await hmsActions.join({ userName: form.name.trim(), authToken });
    } catch (e: any) {
      setError(e.message || 'Join failed');
    } finally {
      setJoining(false);
    }
  }, [form, hmsActions]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
  <HeaderBar isConnected={!!isConnected} onLeave={() => hmsActions.leave()} localName={localPeer?.name} />
      {!isConnected && (
        <div className="w-full max-w-4xl mx-auto p-6">
          <JoinForm
            form={form}
            onChange={handleChange}
            onSubmit={(e) => { e.preventDefault(); if (!joining) join(); }}
            joining={joining}
            error={error}
          />
          {debug && (
            <pre className="mt-4 text-xs bg-slate-100 p-3 rounded border overflow-auto max-h-40">{JSON.stringify(debug, null, 2)}</pre>
          )}
        </div>
      )}
      {isConnected && <ConferenceSection />}
    </div>
  );
}

function HeaderBar({ isConnected, onLeave, localName }: { isConnected: boolean; onLeave: () => void; localName?: string }) {
  return (
    <div className="h-14 flex items-center justify-between px-4 bg-white border-b shadow-sm">
      <div className="font-semibold text-slate-800">100ms Core SDK Demo</div>
      <div className="flex items-center gap-3 text-sm">
        {localName && <span className="text-slate-500">{localName}</span>}
        {isConnected && (
          <button onClick={onLeave} className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium">Leave</button>
        )}
        {!isConnected && (
          <a href="/video-call/roomkit" className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">RoomKit</a>
        )}
      </div>
    </div>
  );
}

function JoinForm({ form, onChange, onSubmit, joining, error }: { form: JoinFormState; onChange: (k: keyof JoinFormState, v: string) => void; onSubmit: (e: React.FormEvent) => void; joining: boolean; error: string | null; }) {
  return (
    <form onSubmit={onSubmit} className="bg-white border rounded shadow p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Join a Room</h2>
      {error && <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">Display Name</label>
          <input value={form.name} onChange={e=>onChange('name', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Role (template must allow)</label>
          <input value={form.role} onChange={e=>onChange('role', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="guest" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Method</label>
          <select value={form.method} onChange={e=>onChange('method', e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
            <option value="backend">Backend Token (auto room create)</option>
            <option value="roomCode">Room Code (client)</option>
          </select>
        </div>
        {form.method === 'roomCode' ? (
          <div>
            <label className="block text-xs font-medium mb-1">Room Code</label>
            <input value={form.roomCode} onChange={e=>onChange('roomCode', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="enter room code" />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium mb-1">Room ID (optional – reuse existing)</label>
            <input value={form.roomId} onChange={e=>onChange('roomId', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="leave blank to auto-create" />
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button disabled={joining} type="submit" className="px-4 py-2 rounded bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white text-sm font-medium min-w-[120px]">{joining ? 'Joining…' : 'Join'}</button>
        <button type="button" onClick={() => window.open('/api/100ms-token?probe=1', '_blank')} className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm">Probe</button>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        Backend flow uses <code>/api/100ms-token</code> with your management token / access+secret. Room Code flow uses the SDK to obtain a token directly (no backend needed but requires you’ve created codes in the dashboard). For production, prefer issuing tokens server-side and enforcing auth.
      </p>
    </form>
  );
}

function ConferenceSection() {
  const peers = useHMSStore(selectPeers);
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[200px]">
        {peers.map(p => <PeerTile key={p.id} peer={p} />)}
      </div>
      <FooterControls />
    </div>
  );
}

function PeerTile({ peer }: { peer: any }) {
  const { videoRef } = useVideo({ trackId: peer.videoTrack });
  return (
    <div className="relative bg-black rounded overflow-hidden flex items-center justify-center group">
      <video ref={videoRef} className={`h-full w-full object-cover ${peer.isLocal ? 'ring-2 ring-blue-500' : ''}`} autoPlay playsInline muted={peer.isLocal} />
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 flex items-center justify-between">
        <span>{peer.name}{peer.isLocal ? ' (You)' : ''}</span>
        <span className="opacity-70">{peer.role}</span>
      </div>
    </div>
  );
}

function FooterControls() {
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } = useAVToggle();
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button onClick={toggleAudio} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm">
        {isLocalAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
      </button>
      <button onClick={toggleVideo} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-white text-sm">
        {isLocalVideoEnabled ? 'Disable Video' : 'Enable Video'}
      </button>
    </div>
  );
}
