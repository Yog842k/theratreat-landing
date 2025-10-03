"use client";
import { useEffect, useState, useRef } from "react";
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
} from "@100mslive/react-sdk";

function VideoCall() {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const isAudioOn = useHMSStore(selectIsLocalAudioEnabled);
  const isVideoOn = useHMSStore(selectIsLocalVideoEnabled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function join() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/100ms-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "user-" + Date.now() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { token } = await res.json();
      await hmsActions.join({ userName: "Guest", authToken: token });
    } catch (e: any) {
      setError(e.message || "Failed to join");
    }
    setLoading(false);
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={join}
          disabled={loading}
          className="p-3 bg-blue-500 text-white rounded-lg"
        >
          {loading ? "Joining..." : "Join Call"}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${isAudioOn ? "bg-green-500" : "bg-gray-400"}`}
          onClick={() => hmsActions.setLocalAudioEnabled(!isAudioOn)}
        >
          {isAudioOn ? "Mute" : "Unmute"}
        </button>
        <button
          className={`px-3 py-1 rounded ${isVideoOn ? "bg-green-500" : "bg-gray-400"}`}
          onClick={() => hmsActions.setLocalVideoEnabled(!isVideoOn)}
        >
          {isVideoOn ? "Stop Video" : "Start Video"}
        </button>
        <button
          className="px-3 py-1 rounded bg-red-500 text-white"
          onClick={() => hmsActions.leave()}
        >
          Leave
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {peers.map((peer) => (
          <VideoTile key={peer.id} peer={peer} hmsActions={hmsActions} />
        ))}
      </div>
    </div>
  );
}

function VideoTile({ peer, hmsActions }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current && peer.videoTrack) {
      hmsActions.attachVideo(peer.videoTrack, videoRef.current);
    }
    // Clean up
    return () => {
      if (videoRef.current) {
        hmsActions.detachVideo(peer.videoTrack, videoRef.current);
      }
    };
  }, [peer.videoTrack, hmsActions]);
  return (
    <div className="border rounded-lg p-2 flex flex-col items-center bg-gray-100">
      <h2 className="font-semibold mb-2">{peer.name} {peer.isLocal && "(You)"}</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={peer.isLocal}
        className="w-full h-48 bg-black rounded"
      />
      <div className="text-xs mt-1 text-gray-600">{peer.roleName}</div>
    </div>
  );
}

export default function Demo100msPage() {
  return (
    <HMSRoomProvider>
      <div className="p-6 min-h-screen bg-gray-50">
        <h1 className="text-xl font-bold mb-4">100ms Demo Call</h1>
        <VideoCall />
      </div>
    </HMSRoomProvider>
  );
}
