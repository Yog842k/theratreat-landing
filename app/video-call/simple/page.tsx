"use client";

// Simple self-contained 100ms call page.
// Uses /api/100ms-token (room code OR room_id flow) and the @100mslive/react-sdk provider.
// You can visit this at /video-call/simple

import React, { useState, useEffect, useRef } from 'react';
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  selectPeers,
  selectIsConnectedToRoom,
  HMSPeer,
} from '@100mslive/react-sdk';

// --- Video Tile ---
function PeerTile({ peer }: { peer: HMSPeer }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const actions = useHMSActions();
  useEffect(() => {
    const trackId = peer.videoTrack;
    const el = videoRef.current;
    if (trackId && el) {
      actions.attachVideo(trackId, el).catch(() => {});
      return () => { actions.detachVideo(trackId, el).catch(() => {}); };
    }
  }, [peer.videoTrack, actions]);
  return (
    <div style={{ width: 220, height: 160, position: 'relative', border: '1px solid #999', borderRadius: 6, overflow: 'hidden', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <video ref={videoRef} autoPlay playsInline muted={peer.isLocal} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', left: 4, bottom: 4, background: 'rgba(0,0,0,0.55)', padding: '2px 6px', borderRadius: 4, fontSize: 11, color: '#fff' }}>{peer.name}{peer.isLocal ? ' (you)' : ''}</div>
    </div>
  );
}

// --- Inner page logic (inside provider) ---
function InnerPage() {
  const [userName, setUserName] = useState('');
  const [roomCode, setRoomCode] = useState(''); // optional
  const [roomId, setRoomId] = useState('');     // optional
  const [error, setError] = useState<string>('');
  const [joining, setJoining] = useState(false);
  const [tokenPreview, setTokenPreview] = useState<string | null>(null);
  const [modeUsed, setModeUsed] = useState<string | null>(null);

  const peers = useHMSStore(selectPeers);
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!userName) { setError('Please enter a user name'); return; }
    if (!roomCode && !roomId) {
      setError('Provide a Room Code OR Room ID (leave both blank only if server set to auto-create).');
      // Not strictly required if backend auto-creates, but clearer UX.
    }
    setJoining(true);
    try {
      const payload: any = { userName, role: 'host' };
      if (roomCode) payload.roomCode = roomCode.trim();
      if (roomId) payload.room_id = roomId.trim(); // backend expects room_id, not roomId
      const res = await fetch('/api/100ms-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const raw = await res.text();
      let data: any = {};
      try { data = raw ? JSON.parse(raw) : {}; } catch {}
      if (!res.ok) {
        const errMsg = typeof data.error === 'string' ? data.error : (data.error?.message || raw || 'Failed to get token');
        setError(errMsg);
        return;
      }
      if (!data.token) { setError('Token missing in response'); return; }
      setTokenPreview(data.token.slice(0, 14) + '…');
      setModeUsed(data.mode || (roomCode ? 'room-code' : 'room-id'));
      await hmsActions.join({ userName, authToken: data.token });
    } catch (err: any) {
      setError(err?.message || 'Join failed');
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    try { await hmsActions.leave(); } catch {}
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Simple 100ms Call</h1>
      {!isConnected && (
        <form onSubmit={handleJoin} style={{ display: 'grid', gap: '0.75rem', maxWidth: 480, marginBottom: '2rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>User Name
            <input value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Alice" required style={{ marginTop: 4, padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>Room Code (optional)
            <input value={roomCode} onChange={e=>setRoomCode(e.target.value)} placeholder="abc-defg-hij" style={{ marginTop: 4, padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>Room ID (optional)
            <input value={roomId} onChange={e=>setRoomId(e.target.value)} placeholder="room_xxxxx" style={{ marginTop: 4, padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4 }} />
          </label>
          <button type="submit" disabled={joining} style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', borderRadius: 6, fontWeight: 500, border: 'none', cursor: 'pointer' }}>{joining ? 'Joining…' : 'Join Call'}</button>
          {tokenPreview && <div style={{ fontSize: 12, color: '#555' }}>Token preview: <code>{tokenPreview}</code> (mode: {modeUsed})</div>}
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
            Provide a Room Code for the code join flow (no server credentials) OR a Room ID (server-managed). If both given, room code takes priority.
          </p>
        </form>
      )}
      {error && <div style={{ color: 'red', marginBottom: 16 }}>Error: {error}</div>}
      {isConnected && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={handleLeave} style={{ padding: '8px 14px', background: '#dc2626', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Leave</button>
          {modeUsed && <span style={{ fontSize: 12, background: '#eee', padding: '4px 8px', borderRadius: 4 }}>Mode: {modeUsed}</span>}
        </div>
      )}
      {isConnected && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Participants ({peers.length})</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {peers.map(p => <PeerTile key={p.id} peer={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SimpleVideoCallPage() {
  return (
    <HMSRoomProvider>
      <InnerPage />
    </HMSRoomProvider>
  );
}
