"use client";

import { useEffect, useRef } from "react";
import { 
  HMSPeer, 
  useHMSStore, 
  selectVideoTrackByPeerID,
  selectIsPeerAudioEnabled,
  selectIsPeerVideoEnabled
} from "@100mslive/react-sdk";

interface VideoTileProps {
  peer: HMSPeer;
  isLocal?: boolean;
}

export default function VideoTile({ peer, isLocal = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoTrack = useHMSStore(selectVideoTrackByPeerID(peer.id));
  const isVideoOn = useHMSStore(selectIsPeerVideoEnabled(peer.id));
  const isAudioOn = useHMSStore(selectIsPeerAudioEnabled(peer.id));

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (videoTrack && videoTrack.enabled) {
      // 100ms video tracks expose a native MediaStreamTrack via track?.nativeTrack
      // Fallback: store stream on track?.stream if provided.
      const nativeTrack: MediaStreamTrack | undefined = (videoTrack as any).nativeTrack || (videoTrack as any).track;
      if (nativeTrack) {
        const stream = new MediaStream([nativeTrack]);
        // Assign only if different to avoid flicker.
        if (el.srcObject !== stream) {
          el.srcObject = stream;
        }
      }
    } else {
      // Clear if video disabled
      if (el.srcObject) el.srcObject = null;
    }
  }, [videoTrack, videoTrack?.enabled]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video shadow-lg">
      {isVideoOn ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
            {getInitials(peer.name || "Unknown")}
          </div>
        </div>
      )}

      {/* Peer info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="text-white text-sm font-medium">
            {peer.name || "Unknown"} {isLocal && "(You)"}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Audio indicator */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isAudioOn ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isAudioOn ? (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v8a1 1 0 11-2 0V4a1 1 0 011-1zM6 9a1 1 0 112 0v2a1 1 0 11-2 0V9zM14 9a1 1 0 10-2 0v2a1 1 0 102 0V9z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Video indicator */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isVideoOn ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isVideoOn ? (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connection status */}
      {peer.isHandRaised && (
        <div className="absolute top-3 right-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-lg">✋</span>
        </div>
      )}

      {/* Role indicator */}
      <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium ${
        peer.roleName === 'therapist' 
          ? 'bg-blue-500 text-white' 
          : 'bg-green-500 text-white'
      }`}>
        {peer.roleName === 'therapist' ? 'Therapist' : 'Patient'}
      </div>
    </div>
  );
}
