"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, XCircle, Copy, ExternalLink, RefreshCw, Video, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  selectPeers,
  selectIsConnectedToRoom,
  selectLocalPeer,
  selectIsLocalVideoEnabled,
  selectIsLocalAudioEnabled,
  useAVToggle,
  useVideo,
} from "@100mslive/react-sdk";

interface RoomData {
  id: string;
  name: string;
  code?: string;
  codes?: Array<{ role: string; code: string }>;
  description?: string;
  template_id?: string;
  region?: string;
  created_at?: string;
}

interface TokenData {
  token: string;
  room_id: string;
  user_id: string;
  role: string;
  expires_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  room?: RoomData;
  token?: string;
  room_id?: string;
  user_id?: string;
  role?: string;
  error?: string;
  message?: string;
  [key: string]: any;
}

// Video Room Component - Must be inside HMSRoomProvider
function VideoRoomContent({ onLeave: onLeaveCallback }: { onLeave?: () => void }) {
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const isLocalVideoEnabledStore = useHMSStore(selectIsLocalVideoEnabled);
  const isLocalAudioEnabledStore = useHMSStore(selectIsLocalAudioEnabled);
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } = useAVToggle();
  const [isToggling, setIsToggling] = useState(false);
  
  // Use store selectors as source of truth, fallback to hook values
  const actualVideoEnabled = isLocalVideoEnabledStore ?? isLocalVideoEnabled;
  const actualAudioEnabled = isLocalAudioEnabledStore ?? isLocalAudioEnabled;
  
  // Use refs to track latest values for async operations
  const peersRef = useRef(peers);
  const videoEnabledRef = useRef(actualVideoEnabled);
  
  useEffect(() => {
    peersRef.current = peers;
    videoEnabledRef.current = actualVideoEnabled;
  }, [peers, actualVideoEnabled]);

  // Monitor local peer video track and ensure it's published after joining
  useEffect(() => {
    if (!isConnected || !localPeer) {
      return;
    }

    const videoTrack = localPeer.videoTrack;
    const isVideoTrackObject = videoTrack && typeof videoTrack === 'object' && videoTrack !== null && 'id' in videoTrack;
    const hasTrack = !!videoTrack;
    const hasTrackId = isVideoTrackObject ? !!(videoTrack as any).id : (typeof videoTrack === 'string');
    
    console.log('[100ms] Local peer video track state:', {
      isConnected,
      hasPeer: !!localPeer,
      hasTrack,
      hasTrackId,
      trackId: isVideoTrackObject ? (videoTrack as any).id : (typeof videoTrack === 'string' ? videoTrack : undefined),
      enabled: isVideoTrackObject ? (videoTrack as any).enabled : undefined,
      storeEnabled: isLocalVideoEnabledStore,
      readyState: isVideoTrackObject ? (videoTrack as any).readyState : undefined
    });

    // If we're connected but track has no ID, try to enable it
    if (isConnected && hasTrack && !hasTrackId && isLocalVideoEnabledStore) {
      console.log('[100ms] Track exists but has no ID - attempting to enable/publish...');
      // The track might need to be explicitly enabled to get an ID
      hmsActions.setLocalVideoEnabled(true).catch((error: any) => {
        console.warn('[100ms] Could not enable video track:', error);
      });
    }
  }, [isConnected, localPeer, isLocalVideoEnabledStore, hmsActions]);

  const handleLeave = async () => {
    try {
      setIsToggling(true);
      
      // Clear persisted session when explicitly leaving
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hms_active_session');
        console.log('[100ms] Session cleared on explicit leave');
      }
      
      // Call onLeaveCallback first to update parent state and unmount wrapper
      // This prevents the wrapper from trying to rejoin
      if (onLeaveCallback) {
        onLeaveCallback();
      }
      // Then leave the room
      await hmsActions.leave();
      toast.success("Left the room");
    } catch (error: any) {
      console.error('[100ms] Leave error:', error);
      toast.error("Error leaving room", { description: error.message || String(error) });
      // Even if leave fails, we should still call the callback to update UI
      if (onLeaveCallback) {
        onLeaveCallback();
      }
      // Clear session even if leave fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hms_active_session');
      }
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleAudio = async () => {
    if (isToggling) return;
    
    try {
      setIsToggling(true);
      const newState = !isLocalAudioEnabled;

      console.log('[100ms] Toggling audio:', { 
        currentState: isLocalAudioEnabled, 
        newState 
      });

      // Use setLocalAudioEnabled - this is the correct method to enable/publish audio
      await hmsActions.setLocalAudioEnabled(newState);
      
      toast.success(newState ? "Audio unmuted" : "Audio muted");
    } catch (error: any) {
      console.error('[100ms] Toggle audio error:', error);
      // Fallback to hook
      try {
        if (toggleAudio) {
        await toggleAudio();
        toast.success(isLocalAudioEnabled ? "Audio muted" : "Audio unmuted");
        }
      } catch (fallbackError: any) {
        toast.error("Failed to toggle audio", { description: error.message || fallbackError.message });
      }
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggleVideo = async () => {
    if (isToggling) return;
    
    try {
      setIsToggling(true);
      const currentState = actualVideoEnabled;
      const newState = !currentState;

      const localVideoTrack = localPeer?.videoTrack;
      const isLocalVideoTrackObject = localVideoTrack && typeof localVideoTrack === 'object' && localVideoTrack !== null && 'id' in localVideoTrack;

      console.log('[100ms] Toggling video:', { 
        currentState: currentState,
        newState,
        hasLocalPeer: !!localPeer,
        localPeerVideoTrack: isLocalVideoTrackObject ? {
          id: (localVideoTrack as any).id,
          enabled: (localVideoTrack as any).enabled,
          source: (localVideoTrack as any).source
        } : 'no track'
      });

      // Use setLocalVideoEnabled - this is the correct method according to 100ms docs
      if (typeof hmsActions.setLocalVideoEnabled === 'function') {
        console.log('[100ms] Calling setLocalVideoEnabled(', newState, ')');
        await hmsActions.setLocalVideoEnabled(newState);
      } else {
        // Fallback to toggleVideo hook
        console.log('[100ms] setLocalVideoEnabled not available, using toggleVideo hook');
        if (toggleVideo) {
        await toggleVideo();
        }
      }
      
      // Wait for track state to update - use refs to get latest values
      let attempts = 0;
      const maxAttempts = 20; // Wait up to 4 seconds
      let found = false;
      
      while (attempts < maxAttempts && !found) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Read latest values from refs (updated by useEffect)
        const currentPeers = peersRef.current;
        const currentStoreEnabled = videoEnabledRef.current;
        const updatedPeer = currentPeers.find((p: any) => p.isLocal);
        const updatedTrack = updatedPeer?.videoTrack;
        const isUpdatedTrackObject = updatedTrack && typeof updatedTrack === 'object' && updatedTrack !== null && 'id' in updatedTrack;
        const isUpdatedTrackString = typeof updatedTrack === 'string';
        const updatedTrackId = isUpdatedTrackObject ? (updatedTrack as any).id : (isUpdatedTrackString ? updatedTrack : undefined);
        
        // Log progress every 5 attempts
        if (attempts % 5 === 0) {
          console.log(`[100ms] Polling attempt ${attempts + 1}/${maxAttempts}:`, {
            storeEnabled: currentStoreEnabled,
            hasPeer: !!updatedPeer,
            hasTrack: !!updatedTrack,
            trackId: updatedTrackId,
            trackEnabled: isUpdatedTrackObject ? (updatedTrack as any).enabled : undefined,
            trackSource: isUpdatedTrackObject ? (updatedTrack as any).source : undefined,
            trackReadyState: isUpdatedTrackObject ? (updatedTrack as any).readyState : undefined,
            peerName: updatedPeer?.name
          });
        }
        
        if (newState) {
          // Wanting to show video - check if enabled in store AND track is published
          if (currentStoreEnabled && updatedTrack && updatedTrackId) {
            console.log('[100ms] ✅ Video track published and enabled:', {
              trackId: updatedTrackId,
              enabled: isUpdatedTrackObject ? (updatedTrack as any).enabled : undefined,
              source: isUpdatedTrackObject ? (updatedTrack as any).source : undefined,
              readyState: isUpdatedTrackObject ? (updatedTrack as any).readyState : undefined
            });
            found = true;
            break;
          }
        } else {
          // Wanting to hide video
          if (!currentStoreEnabled || !updatedTrack || !updatedTrackId) {
            console.log('[100ms] ✅ Video track unpublished/disabled');
            found = true;
            break;
          }
        }
        attempts++;
      }
      
      if (!found && attempts >= maxAttempts) {
        console.warn('[100ms] ⚠️ Timeout waiting for track state update after', maxAttempts, 'attempts');
      }
      
      // Final check - use refs for latest values
      const finalPeers = peersRef.current;
      const finalStoreEnabled = videoEnabledRef.current;
      const finalPeer = finalPeers.find((p: any) => p.isLocal);
      const finalTrack = finalPeer?.videoTrack;
      const isFinalTrackObject = finalTrack && typeof finalTrack === 'object' && finalTrack !== null && 'id' in finalTrack;
      const finalVideoTrack = finalPeer?.videoTrack;
      const isFinalVideoTrackObject = finalVideoTrack && typeof finalVideoTrack === 'object' && finalVideoTrack !== null && 'id' in finalVideoTrack;
      const finalAudioTrack = finalPeer?.audioTrack;
      const isFinalAudioTrackObject = finalAudioTrack && typeof finalAudioTrack === 'object' && finalAudioTrack !== null && 'id' in finalAudioTrack;
      
      // Comprehensive final state log
      console.log('[100ms] Final track state after toggle:', {
        requestedState: newState,
        storeEnabled: finalStoreEnabled,
        hasPeer: !!finalPeer,
        peerId: finalPeer?.id,
        peerName: finalPeer?.name,
        hasTrack: !!finalTrack,
        trackId: isFinalTrackObject ? (finalTrack as any).id : (typeof finalTrack === 'string' ? finalTrack : undefined),
        trackEnabled: isFinalTrackObject ? (finalTrack as any).enabled : undefined,
        trackSource: isFinalTrackObject ? (finalTrack as any).source : undefined,
        trackReadyState: isFinalTrackObject ? (finalTrack as any).readyState : undefined,
        trackKind: isFinalTrackObject ? (finalTrack as any).kind : undefined,
        trackSettings: isFinalTrackObject && (finalTrack as any).settings ? {
          width: (finalTrack as any).settings.width,
          height: (finalTrack as any).settings.height,
          deviceId: (finalTrack as any).settings.deviceId
        } : 'no settings',
        allPeerTracks: finalPeer ? {
          videoTrack: isFinalVideoTrackObject ? {
            id: (finalVideoTrack as any).id,
            enabled: (finalVideoTrack as any).enabled
          } : null,
          audioTrack: isFinalAudioTrackObject ? {
            id: (finalAudioTrack as any).id,
            enabled: (finalAudioTrack as any).enabled
          } : null
        } : 'no peer'
      });
      
      toast.success(newState ? "Video shown" : "Video hidden");
    } catch (error: any) {
      console.error('[100ms] Toggle video error:', error);
      toast.error("Failed to toggle video", { description: error.message || String(error) });
    } finally {
      setIsToggling(false);
    }
  };

  // Track connection state for UI feedback
  const [connectionState, setConnectionState] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Handle track errors and reconnection gracefully
  useEffect(() => {
    // Suppress noisy HMS store reconnection errors in console
    // These are internal SDK errors that are handled automatically by the SDK
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    const shouldSuppressError = (message: string): boolean => {
      // Only suppress specific HMS-Store reconnection errors
      return (
        message.includes('HMS-Store') && 
        (
          message.includes('Reconnection: received error from sdk') ||
          message.includes('reconnection: received error from sdk') ||
          (message.includes('Reconnection') && message.includes('received error from sdk'))
        )
      );
    };
    
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (shouldSuppressError(message)) {
        // These are internal SDK reconnection errors that are handled automatically - suppress
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (shouldSuppressError(message)) {
        // These are internal SDK reconnection warnings that are handled automatically - suppress
        return;
      }
      originalConsoleWarn.apply(console, args);
    };
    
    const handleError = (error: any) => {
      // Ignore non-critical track errors (3015)
      if (error.code === 3015 || error.message?.includes('track') || error.message?.includes('Track')) {
        console.warn('[100ms] Track warning (non-critical):', error);
        return;
      }
      
      // Handle network/reconnection errors
      if (
        error.code === 1003 || // WebSocketConnectionLost
        error.code === 4006 || // ICEDisconnected
        error.name === 'WebSocketConnectionLost' ||
        error.name === 'ICEDisconnected' ||
        error.message?.includes('Reconnection') ||
        error.message?.includes('reconnection') ||
        error.message?.includes('connection lost') ||
        error.message?.includes('ping pong failure') ||
        error.message?.includes('ICE connection') ||
        error.message?.includes('DISCONNECTED') ||
        error.message?.includes('WebSocket closed')
      ) {
        // Log for debugging but don't spam user with toasts
        // Only log if it's not the common HMS-Store reconnection error
        if (!error.message?.includes('HMS-Store')) {
        console.warn('[100ms] Network/reconnection event:', {
          code: error.code,
          name: error.name,
          message: error.message,
          action: error.action
        });
        }
        
        // Update connection state
        if (error.code === 4006 || error.name === 'ICEDisconnected') {
          setConnectionState('reconnecting');
          setConnectionError('ICE connection disconnected - attempting to reconnect...');
        } else if (error.code === 1003 || error.name === 'WebSocketConnectionLost') {
          setConnectionState('reconnecting');
          setConnectionError('WebSocket connection lost - attempting to reconnect...');
        }
        
        // These are handled automatically by SDK
        return;
      }
      
      // Log other errors but don't show to user unless critical
      if (!error.message?.includes('HMS-Store')) {
      console.error('[100ms] Error:', error);
      }
    };

    const handleReconnected = () => {
      console.log('[100ms] Reconnected successfully');
      setConnectionState('connected');
      setConnectionError(null);
      toast.success("Reconnected to room");
    };

    const handleReconnecting = () => {
      console.log('[100ms] Reconnecting...');
      setConnectionState('reconnecting');
      setConnectionError('Reconnecting to room...');
      toast.info("Reconnecting to room...", { duration: 5000 });
    };

    // Note: 100ms SDK uses store subscriptions for events, not addEventListener on hmsActions
    // Connection state is already monitored via useHMSStore(selectIsConnectedToRoom)
    // Error handling is done via try-catch blocks in async operations
    
    return () => {
      // Restore original console methods
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [hmsActions]);

  // Update connection state based on isConnected
  useEffect(() => {
    if (isConnected) {
      setConnectionState('connected');
      setConnectionError(null);
    } else if (connectionState === 'connected') {
      // Only update to disconnected if we were previously connected
      // Don't immediately disconnect - give SDK time to reconnect
      // This prevents accidental disconnects when new peers join
      const timeoutId = setTimeout(() => {
        setConnectionState('disconnected');
      }, 3000); // Wait 3 seconds before marking as disconnected
      
      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, connectionState]);

  // Don't unmount the component if we have peers in the room, even if temporarily disconnected
  // This prevents the UI from disappearing when there's a brief reconnection
  const hasOtherPeers = peers.filter(p => !p.isLocal).length > 0;
  
  if (!isConnected && !hasOtherPeers && connectionState === 'disconnected') {
    // Only return null if truly disconnected and no other peers
    return null;
  }

  return (
    <div className="space-y-2 sm:space-y-4 px-2 sm:px-0">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <span className="font-semibold">Video Room</span>
            {connectionState === 'connected' ? (
              <Badge variant="default" className="bg-green-600 text-xs sm:text-sm">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" /> Connected
              </Badge>
            ) : connectionState === 'reconnecting' ? (
              <Badge variant="default" className="bg-yellow-600 text-xs sm:text-sm">
                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 animate-spin" /> Reconnecting
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs sm:text-sm">
                <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" /> Disconnected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
          {connectionError && connectionState === 'reconnecting' && (
            <Alert className="text-xs sm:text-sm">
              <AlertDescription className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span className="break-words">{connectionError}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  The SDK is automatically attempting to reconnect. This is usually caused by network instability, firewall restrictions, or VPN issues.
                </p>
              </AlertDescription>
            </Alert>
          )}
          {/* Responsive video grid - 1 column on mobile, 2 on tablet, up to 3 on desktop */}
          <div className={`grid gap-3 sm:gap-4 ${
            peers.length === 1 
              ? 'grid-cols-1' 
              : peers.length === 2 
                ? 'grid-cols-1 sm:grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {peers.map((peer) => (
              <PeerTile key={peer.id} peer={peer} />
            ))}
          </div>
          {/* Responsive control buttons - stack on mobile, horizontal on larger screens */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-3 sm:pt-4 border-t">
            <Button
              variant={actualAudioEnabled ? "default" : "destructive"}
              onClick={handleToggleAudio}
              size="default"
              disabled={!isConnected || isToggling}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-0 text-sm sm:text-base touch-manipulation"
            >
              {isToggling ? (
                <><Loader2 className="w-4 h-4 sm:w-4 sm:h-4 mr-2 animate-spin" /> <span className="hidden sm:inline">Processing...</span><span className="sm:hidden">Processing</span></>
              ) : actualAudioEnabled ? (
                <><Mic className="w-4 h-4 sm:w-4 sm:h-4 mr-2" /> Mute</>
              ) : (
                <><MicOff className="w-4 h-4 sm:w-4 sm:h-4 mr-2" /> Unmute</>
              )}
            </Button>
            <Button
              variant={actualVideoEnabled ? "default" : "destructive"}
              onClick={handleToggleVideo}
              size="default"
              disabled={!isConnected || isToggling}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-0 text-sm sm:text-base touch-manipulation"
            >
              {isToggling ? (
                <><Loader2 className="w-4 h-4 sm:w-4 sm:h-4 mr-2 animate-spin" /> <span className="hidden sm:inline">Processing...</span><span className="sm:hidden">Processing</span></>
              ) : actualVideoEnabled ? (
                <><Video className="w-4 h-4 sm:w-4 sm:h-4 mr-2" /> <span className="hidden sm:inline">Hide Video</span><span className="sm:hidden">Hide</span></>
              ) : (
                <><VideoOff className="w-4 h-4 sm:w-4 sm:h-4 mr-2" /> <span className="hidden sm:inline">Show Video</span><span className="sm:hidden">Show</span></>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeave}
              size="default"
              disabled={isToggling}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-0 text-sm sm:text-base touch-manipulation"
            >
              {isToggling ? (
                <><Loader2 className="w-4 h-4 sm:w-4 sm:h-4 mr-2 animate-spin" /> <span className="hidden sm:inline">Leaving...</span><span className="sm:hidden">Leaving</span></>
              ) : (
                <><PhoneOff className="w-4 h-4 sm:w-4 sm:h-4 mr-2" /> Leave</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PeerTile({ peer }: { peer: any }) {
  // Get track info
  const videoTrack = peer.videoTrack;
  const audioTrack = peer.audioTrack;
  
  // Check if track exists - handle both object tracks and string IDs
  const isVideoTrackObject = videoTrack && typeof videoTrack === 'object' && videoTrack !== null;
  const isVideoTrackString = typeof videoTrack === 'string';
  const hasVideoTrack = isVideoTrackObject || isVideoTrackString;
  const hasVideoTrackId = isVideoTrackObject ? !!videoTrack.id : isVideoTrackString;
  const trackId = isVideoTrackObject ? videoTrack.id : (isVideoTrackString ? videoTrack : undefined);
  
  // Check audio track
  const isAudioTrackObject = audioTrack && typeof audioTrack === 'object' && audioTrack !== null;
  const isAudioTrackString = typeof audioTrack === 'string';
  const hasAudioTrack = isAudioTrackObject || isAudioTrackString;
  const audioTrackId = isAudioTrackObject ? audioTrack.id : (isAudioTrackString ? audioTrack : undefined);
  
  // Use video hook - pass trackId if available (works for both local and remote tracks)
  const { videoRef: videoRefCallback } = useVideo({ 
    trackId: trackId
  });
  
  // Create our own ref to access the video element
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Manual audio ref - 100ms SDK doesn't have useAudio hook, so we handle it manually
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Use the callback ref from useVideo and also store in our ref
  const handleVideoRef = React.useCallback((element: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = element;
    if (videoRefCallback) {
      if (typeof videoRefCallback === 'function') {
        videoRefCallback(element);
      } else if (videoRefCallback && 'current' in videoRefCallback) {
        (videoRefCallback as React.MutableRefObject<HTMLVideoElement | null>).current = element;
      }
    }
  }, [videoRefCallback]);
  
  // Check enabled state - if undefined or true, consider it enabled
  // For tracks without ID, check if they have a native track (MediaStreamTrack)
  const hasNativeTrack = isVideoTrackObject && 'nativeTrack' in videoTrack && !!videoTrack.nativeTrack;
  const isVideoEnabled = hasVideoTrack && (
    hasVideoTrackId || hasNativeTrack || 
    (isVideoTrackObject && (videoTrack.enabled === undefined || videoTrack.enabled === true))
  );
  const isAudioEnabled = hasAudioTrack && (
    !!audioTrackId || 
    (isAudioTrackObject && (audioTrack.enabled === undefined || audioTrack.enabled === true))
  );

  // Debug logging
  useEffect(() => {
    console.log(`[100ms] Peer ${peer.isLocal ? 'LOCAL' : 'REMOTE'} (${peer.name}) tracks:`, {
      video: {
        hasTrack: hasVideoTrack,
        hasTrackId: hasVideoTrackId,
        trackId: trackId,
        enabled: isVideoTrackObject ? videoTrack.enabled : undefined,
        readyState: isVideoTrackObject ? videoTrack.readyState : undefined,
        videoRef: !!videoRef?.current,
        srcObject: videoRef?.current?.srcObject ? 'has stream' : 'no stream',
      },
      audio: {
        hasTrack: hasAudioTrack,
        trackId: audioTrackId,
        enabled: isAudioTrackObject ? audioTrack.enabled : undefined,
        readyState: isAudioTrackObject ? audioTrack.readyState : undefined,
        audioRef: !!audioRef?.current,
        srcObject: audioRef?.current?.srcObject ? 'has stream' : 'no stream',
        paused: audioRef?.current?.paused,
        muted: audioRef?.current?.muted,
      }
    });
  }, [peer.isLocal, peer.name, hasVideoTrack, hasVideoTrackId, trackId, hasAudioTrack, audioTrackId, videoTrack, audioTrack, videoRef, audioRef]);

  // Monitor when stream gets attached to video element and extract audio if available
  useEffect(() => {
    if (!videoRef?.current || !audioRef.current || peer.isLocal) return;
    
    const video = videoRef.current;
    const audio = audioRef.current;
    
    const checkStream = () => {
      if (video.srcObject instanceof MediaStream) {
        const stream = video.srcObject;
        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();
        
        console.log(`[100ms] ✅ Stream attached to video for ${peer.name}:`, {
          totalTracks: stream.getTracks().length,
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length,
          readyState: video.readyState
        });
        
        // If video stream has audio tracks, attach them to audio element
        if (audioTracks.length > 0 && (!audio.srcObject || (audio.srcObject instanceof MediaStream && audio.srcObject.getAudioTracks().length === 0))) {
          const audioStream = new MediaStream(audioTracks);
          audio.srcObject = audioStream;
          audio.muted = false;
          console.log(`[100ms] ✅ Extracted ${audioTracks.length} audio track(s) from video stream for ${peer.name}`);
          audio.play().catch((err: any) => {
            console.warn(`[100ms] Audio play error:`, err);
          });
        }
      }
    };
    
    // Check immediately
    checkStream();
    
    // Also check when srcObject might change
    const interval = setInterval(checkStream, 1000);
    return () => clearInterval(interval);
  }, [videoRef, audioRef, peer.name, peer.isLocal]);

  // Force video to play and ensure visibility
  // Try to render video even if track doesn't have ID yet
  useEffect(() => {
    if (!videoRef?.current) {
      return;
    }
    
    // If we have a track but no ID, try to manually attach the native track
    if (hasVideoTrack && !hasVideoTrackId && isVideoTrackObject && videoTrack?.nativeTrack) {
      console.log('[100ms] Attempting to attach native track directly for peer:', peer.name);
      try {
        const video = videoRef.current;
        const stream = new MediaStream([videoTrack.nativeTrack]);
        video.srcObject = stream;
        video.play().catch((err: any) => {
          console.warn('[100ms] Play error with native track:', err);
        });
      } catch (err: any) {
        console.warn('[100ms] Failed to attach native track:', err);
      }
    }
    
    if (!hasVideoTrack && !trackId) {
      return;
    }

    const video = videoRef.current;
    
    const ensureVideoVisible = () => {
      // Make sure video is visible
      video.style.opacity = '1';
      video.style.display = 'block';
      video.style.visibility = 'visible';
      
      // Try to play
      if (video.paused) {
        video.play().catch((err: any) => {
          console.warn('[100ms] Play error (will retry):', err);
        });
      }
    };

    const handleCanPlay = () => {
      ensureVideoVisible();
    };

    const handlePlaying = () => {
      ensureVideoVisible();
    };

    const handleLoadedMetadata = () => {
      ensureVideoVisible();
    };

    // Check immediately
    if (video.readyState >= 2) {
      ensureVideoVisible();
    }

    // Set initial styles
    ensureVideoVisible();

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleCanPlay);
    video.addEventListener('play', handlePlaying);

    // Periodic check to ensure video stays visible
    const interval = setInterval(() => {
      if (hasVideoTrack && isVideoEnabled && video.paused) {
        video.play().catch(() => {});
      }
      if (video.style.opacity !== '1') {
        video.style.opacity = '1';
      }
    }, 1000);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadeddata', handleCanPlay);
      video.removeEventListener('play', handlePlaying);
      clearInterval(interval);
    };
  }, [videoRef, hasVideoTrack, isVideoEnabled, videoTrack, trackId, peer.name]);

  // Manually attach audio track to audio element for remote peers
  useEffect(() => {
    if (!audioRef.current || peer.isLocal || !hasAudioTrack) {
      return; // Don't play local audio (would cause echo)
    }

    const audio = audioRef.current;
    
    // Function to attach audio track
    const attachAudioTrack = () => {
      try {
        // Get the native audio track
        let nativeAudioTrack: MediaStreamTrack | null = null;
        
        // First, try to get audio track from peer's audioTrack
        if (isAudioTrackObject && audioTrack.nativeTrack) {
          // If we have a native track, use it directly
          nativeAudioTrack = audioTrack.nativeTrack;
        } else if (isAudioTrackObject && 'getNativeTrack' in audioTrack && typeof audioTrack.getNativeTrack === 'function') {
          // Try to get native track via method
          try {
            nativeAudioTrack = audioTrack.getNativeTrack();
          } catch (e) {
            // Method might not exist or might throw
          }
        }
        
        // If we don't have audio track yet, check video stream (sometimes audio is bundled with video)
        if (!nativeAudioTrack && videoRef.current?.srcObject instanceof MediaStream) {
          const videoStream = videoRef.current.srcObject;
          const audioTracks = videoStream.getAudioTracks();
          if (audioTracks.length > 0) {
            nativeAudioTrack = audioTracks[0];
            console.log(`[100ms] Found audio track in video stream for ${peer.name}`);
          }
        }

        if (nativeAudioTrack && nativeAudioTrack.readyState !== 'ended') {
          // Check if we already have this track attached
          const currentStream = audio.srcObject as MediaStream | null;
          const hasTrack = currentStream?.getAudioTracks().some(t => t.id === nativeAudioTrack!.id);
          
          if (!hasTrack) {
            // Create a MediaStream with the audio track
            const audioStream = new MediaStream([nativeAudioTrack]);
            audio.srcObject = audioStream;
            audio.muted = false;
            
            console.log(`[100ms] ✅ Attached audio track for ${peer.name}`, {
              trackId: nativeAudioTrack.id,
              enabled: nativeAudioTrack.enabled,
              readyState: nativeAudioTrack.readyState,
            });
            
            // Try to play
        audio.play().catch((err: any) => {
              console.warn(`[100ms] Audio play error for ${peer.name}:`, err);
            });
          }
        } else if (audioTrackId) {
          // If we have a track ID but no native track yet, log for debugging
          console.log(`[100ms] Audio track ID available but native track not ready yet for ${peer.name}:`, audioTrackId);
        }
      } catch (error: any) {
        console.error(`[100ms] Error attaching audio track for ${peer.name}:`, error);
      }
    };

    // Try to attach immediately
    attachAudioTrack();

    // Also try periodically in case the track becomes available later
    const interval = setInterval(() => {
      if (!audio.srcObject || (audio.srcObject instanceof MediaStream && audio.srcObject.getAudioTracks().length === 0)) {
        attachAudioTrack();
      }
    }, 1000);

    // Ensure audio plays
    const ensureAudioPlays = () => {
      if (audio.muted) {
        audio.muted = false;
      }
      if (audio.paused && audio.srcObject) {
        audio.play().catch((err: any) => {
          console.warn(`[100ms] Audio play error:`, err);
        });
      }
    };

    // Set up event listeners
    const handleCanPlay = () => {
      ensureAudioPlays();
    };

    const handleLoadedMetadata = () => {
      ensureAudioPlays();
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', ensureAudioPlays);

    // Periodic check to ensure audio stays playing
    const playInterval = setInterval(() => {
      if (hasAudioTrack && isAudioEnabled && audio.paused && audio.srcObject) {
        audio.play().catch(() => {});
      }
      if (audio.muted && !peer.isLocal) {
        audio.muted = false;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(playInterval);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', ensureAudioPlays);
    };
  }, [audioRef, hasAudioTrack, isAudioEnabled, peer.isLocal, peer.name, audioTrack, audioTrackId, isAudioTrackObject]);

  // Always render video element for peers - useVideo hook will attach stream when trackId is available
  // The hook works even with undefined trackId and will update when track becomes available
  // This ensures video displays as soon as tracks are published

  return (
    <div className="relative bg-black rounded-lg sm:rounded-xl overflow-hidden aspect-video w-full shadow-lg">
      {/* Always render video element - useVideo hook handles stream attachment automatically */}
      <>
        {/* Audio element for remote peers - CRITICAL for audio to work */}
        {/* Always render audio element if we have an audio track (useAudio hook will attach stream) */}
        {!peer.isLocal && (hasAudioTrack || audioRef) && (
          <audio
            ref={audioRef}
            autoPlay
            playsInline
            muted={false}
            style={{ display: 'none' }}
            onError={(e) => {
              console.error(`[100ms] Audio error for ${peer.name}:`, e);
            }}
            onLoadedMetadata={() => {
              console.log(`[100ms] ✅ Audio loaded metadata for ${peer.name}`, {
                hasSrcObject: !!audioRef.current?.srcObject,
                paused: audioRef.current?.paused,
                muted: audioRef.current?.muted,
                readyState: audioRef.current?.readyState,
              });
              if (audioRef.current) {
                audioRef.current.muted = false;
                audioRef.current.play().catch((err: any) => {
                  console.warn(`[100ms] Audio play error:`, err);
                });
              }
            }}
            onCanPlay={() => {
              console.log(`[100ms] ✅ Audio can play for ${peer.name}`);
              if (audioRef.current) {
                audioRef.current.muted = false;
                if (audioRef.current.paused) {
                  audioRef.current.play().catch((err: any) => {
                    console.warn(`[100ms] Audio play error:`, err);
                  });
                }
              }
            }}
            onPlaying={() => {
              console.log(`[100ms] ✅ Audio playing for ${peer.name}`);
            }}
          />
        )}
        <video
          ref={handleVideoRef}
          autoPlay
          playsInline
          muted={peer.isLocal}
          className="w-full h-full object-cover"
          style={{ 
            opacity: 1,
            display: 'block',
            visibility: 'visible',
            backgroundColor: '#000'
          }}
          onError={(e) => {
            console.error('[100ms] Video error for peer:', peer.name, e);
          }}
          onLoadedMetadata={() => {
            console.log('[100ms] Video loaded metadata for:', peer.name);
            if (videoRef.current) {
              videoRef.current.style.opacity = '1';
              videoRef.current.play().catch((err: any) => {
                console.warn('[100ms] Play error:', err);
              });
            }
          }}
          onPlaying={() => {
            console.log('[100ms] Video playing for:', peer.name);
            if (videoRef.current) {
              videoRef.current.style.opacity = '1';
            }
          }}
          onCanPlay={() => {
            if (videoRef.current) {
              videoRef.current.style.opacity = '1';
              if (videoRef.current.paused) {
                videoRef.current.play().catch(err => {
                  console.warn('[100ms] Play error:', err);
                });
              }
            }
          }}
          onLoadedData={() => {
            if (videoRef.current) {
              videoRef.current.style.opacity = '1';
              if (videoRef.current.paused) {
                videoRef.current.play().catch(err => {
                  console.warn('[100ms] Play error:', err);
                });
              }
            }
          }}
        />
        {/* Overlay only when video is explicitly disabled */}
        {!isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10 pointer-events-none">
            <div className="text-center px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-lg sm:text-xl font-semibold">
                  {peer.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <p className="text-white text-xs sm:text-sm break-words">{peer.name} {peer.isLocal && "(You)"}</p>
              <p className="text-gray-400 text-xs mt-1">Video is off</p>
            </div>
          </div>
        )}
      </>
      {/* Responsive name badge */}
      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/70 backdrop-blur-sm text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg flex items-center gap-1.5 z-20 max-w-[calc(100%-4rem)] sm:max-w-none">
        <span className="truncate">{peer.name} {peer.isLocal && "(You)"}</span>
        {!isVideoEnabled && peer.isLocal && (
          <VideoOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
        )}
      </div>
      {/* Responsive audio mute indicator */}
      {!isAudioEnabled && (
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-600 text-white p-1.5 sm:p-2 rounded-md sm:rounded-lg z-20 shadow-lg">
          <MicOff className="w-3 h-3 sm:w-4 sm:h-4" />
        </div>
      )}
    </div>
  );
}

// Main Page Component
function RoomTestPageContent() {
  const router = useRouter();
  
  // Room creation state
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [region, setRegion] = useState("auto");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [roomError, setRoomError] = useState("");

  // Token generation state
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("host");
  const [roomId, setRoomId] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [tokenError, setTokenError] = useState("");

  // Combined flow state
  const [combinedLoading, setCombinedLoading] = useState(false);

  // API health check
  const [apiStatus, setApiStatus] = useState<{
    create: { status: string; configured: boolean };
    token: { status: string; configured: boolean };
  } | null>(null);
  
  // Connection test
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Client-side WebRTC connectivity test
  const [webrtcTest, setWebrtcTest] = useState<any>(null);
  const [testingWebRTC, setTestingWebRTC] = useState(false);

  useEffect(() => {
    checkApiStatus();
  }, []);

  async function checkApiStatus() {
    try {
      const [createRes, tokenRes] = await Promise.all([
        fetch("/api/100ms-room/create"),
        fetch("/api/100ms-room/token"),
      ]);
      const createData = await createRes.json();
      const tokenData = await tokenRes.json();
      setApiStatus({
        create: { status: createData.status || "unknown", configured: createData.configured || false },
        token: { status: tokenData.status || "unknown", configured: tokenData.configured || false },
      });
    } catch (error) {
      console.error("API status check failed:", error);
    }
  }

  async function testConnection() {
    setTestingConnection(true);
    setConnectionTest(null);
    try {
      const response = await fetch("/api/100ms-room/test-connection");
      const data = await response.json();
      setConnectionTest(data);
      
      if (data.success) {
        toast.success("Connection test passed", {
          description: "All endpoints are reachable",
        });
      } else {
        toast.error("Connection test failed", {
          description: "Some endpoints are not reachable. Check recommendations.",
          duration: 8000,
        });
      }
    } catch (error: any) {
      toast.error("Connection test error", {
        description: error.message || "Failed to run connection test",
      });
      setConnectionTest({
        success: false,
        error: error.message || String(error),
      });
    } finally {
      setTestingConnection(false);
    }
  }

  async function testWebRTCConnectivity() {
    setTestingWebRTC(true);
    setWebrtcTest(null);
    
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: [],
      success: false,
    };

    try {
      // Test 1: Check if WebRTC is supported
      const hasRTCPeerConnection = typeof RTCPeerConnection !== 'undefined';
      results.tests.push({
        name: 'WebRTC Support',
        success: hasRTCPeerConnection,
        message: hasRTCPeerConnection ? 'WebRTC is supported' : 'WebRTC is not supported in this browser',
      });

      if (!hasRTCPeerConnection) {
        setWebrtcTest(results);
        toast.error("WebRTC not supported", {
          description: "Your browser does not support WebRTC",
        });
        return;
      }

      // Test 2: Test STUN server connectivity (100ms uses Google STUN)
      const stunServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ];

      // Test each STUN server sequentially
      for (const stunServer of stunServers) {
        await new Promise<void>((resolve) => {
          let resolved = false;
          try {
            const pc = new RTCPeerConnection({ iceServers: [stunServer] });
            const testStart = Date.now();
            
            const timeout = setTimeout(() => {
              if (!resolved) {
                resolved = true;
                pc.close();
                results.tests.push({
                  name: `STUN Server: ${stunServer.urls}`,
                  success: false,
                  message: 'Connection timeout (5s)',
                  duration: Date.now() - testStart,
                });
                resolve();
              }
            }, 5000);

            pc.onicecandidate = (event) => {
              if (event.candidate && !resolved) {
                resolved = true;
                clearTimeout(timeout);
                pc.close();
                results.tests.push({
                  name: `STUN Server: ${stunServer.urls}`,
                  success: true,
                  message: 'Successfully connected to STUN server',
                  duration: Date.now() - testStart,
                  candidate: event.candidate.candidate,
                });
                resolve();
              }
            };

            pc.onicegatheringstatechange = () => {
              if (pc.iceGatheringState === 'complete' && !resolved) {
                resolved = true;
                clearTimeout(timeout);
                pc.close();
                results.tests.push({
                  name: `STUN Server: ${stunServer.urls}`,
                  success: false,
                  message: 'ICE gathering completed but no candidates received',
                  duration: Date.now() - testStart,
                });
                resolve();
              }
            };

            // Create a data channel to trigger ICE gathering
            pc.createDataChannel('test');
            pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch((err: any) => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                pc.close();
                results.tests.push({
                  name: `STUN Server: ${stunServer.urls}`,
                  success: false,
                  message: `Failed to create offer: ${err.message}`,
                  duration: Date.now() - testStart,
                });
                resolve();
              }
            });
          } catch (error: any) {
            if (!resolved) {
              resolved = true;
              results.tests.push({
                name: `STUN Server: ${stunServer.urls}`,
                success: false,
                message: `Error: ${error.message}`,
              });
              resolve();
            }
          }
        });
      }

      // Test 3: Check media device access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        results.tests.push({
          name: 'Media Device Access',
          success: true,
          message: 'Camera and microphone access granted',
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
        });
        stream.getTracks().forEach(track => track.stop());
      } catch (error: any) {
        results.tests.push({
          name: 'Media Device Access',
          success: false,
          message: `Permission denied or device unavailable: ${error.message}`,
        });
      }

      // Determine overall success - need WebRTC support and at least one STUN server working
      const stunTests = results.tests.filter((t: any) => t.name.includes('STUN'));
      const hasWorkingStun = stunTests.some((t: any) => t.success);
      const webrtcSupportTest = results.tests.find((t: any) => t.name === 'WebRTC Support');
      results.success = webrtcSupportTest?.success && hasWorkingStun;

      setWebrtcTest(results);

      if (results.success) {
        toast.success("WebRTC connectivity test passed", {
          description: "Your browser can establish WebRTC connections",
        });
      } else {
        const failedTests = results.tests.filter((t: any) => !t.success);
        toast.error("WebRTC connectivity test failed", {
          description: `${failedTests.length} test(s) failed. Check details below.`,
          duration: 8000,
        });
      }
    } catch (error: any) {
      toast.error("WebRTC test error", {
        description: error.message || "Failed to run WebRTC test",
      });
      setWebrtcTest({
        success: false,
        error: error.message || String(error),
        tests: results.tests,
      });
    } finally {
      setTestingWebRTC(false);
    }
  }

  async function createRoom() {
    setCreatingRoom(true);
    setRoomError("");
    setRoomData(null);

    try {
      const payload: Record<string, any> = {};
      if (roomName) payload.name = roomName;
      if (roomDescription) payload.description = roomDescription;
      if (templateId) payload.template_id = templateId;
      if (region) payload.region = region;

      const response = await fetch("/api/100ms-room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse<RoomData> = await response.json();

      if (!data.success) {
        const errorMsg = data.message || data.error || "Room creation failed";
        setRoomError(errorMsg);
        
        // Show specific error messages based on error type
        if (data.error === 'Connection timeout' || response.status === 504) {
          toast.error("Connection Timeout", {
            description: "Cannot reach 100ms API. Your network may be blocking outbound connections. You can still test video calls by entering an existing room ID below.",
            duration: 10000,
          });
        } else if (data.error === 'Network error' || response.status === 503) {
          toast.error("Network Error", {
            description: "Cannot connect to 100ms Management API. This is likely a firewall/proxy issue. You can still test video calls by entering an existing room ID below.",
            duration: 10000,
          });
        } else {
          toast.error("Room creation failed", {
            description: errorMsg,
          });
        }
        
        // Show helpful info about using existing room ID
        if (data.error === 'Connection timeout' || data.error === 'Network error' || response.status === 503 || response.status === 504) {
          toast.info("Workaround Available", {
            description: "If you have an existing room ID, you can enter it manually and generate a token. Token generation doesn't require network access.",
            duration: 12000,
          });
        }
        
        return;
      }

      if (data.room) {
        setRoomData(data.room);
        setRoomId(data.room.id);
        
        // Optionally create room codes for common roles
        const createRoomCodes = async () => {
          if (!data.room) return;
          
          const roles = ['host', 'guest'];
          const codes: any[] = [];
          const roomId = data.room.id;
          
          for (const role of roles) {
            try {
              const codeRes = await fetch("/api/100ms-room/create-room-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  room_id: roomId,
                  role: role,
                }),
              });
              
              const codeData = await codeRes.json();
              if (codeData.success && codeData.room_code) {
                codes.push({ role, code: codeData.room_code });
              }
            } catch (e) {
              console.warn(`Failed to create room code for ${role}:`, e);
            }
          }
          
          if (codes.length > 0) {
            // Update room data with codes
            setRoomData({
              ...data.room,
              id: data.room.id,
              name: data.room.name || '',
              codes: codes,
              code: codes.find((c: any) => c.role === 'host')?.code || codes[0]?.code,
            });
            toast.success("Room codes created", {
              description: `Created codes for ${codes.length} role(s)`,
            });
          }
        };
        
        // Create room codes in background (don't wait)
        createRoomCodes();
        
        toast.success("Room created successfully", {
          description: `Room ID: ${data.room.id}`,
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      setRoomError(errorMsg);
      toast.error("Error creating room", {
        description: errorMsg,
      });
    } finally {
      setCreatingRoom(false);
    }
  }

  async function generateToken() {
    if (!userId || !userRole || !roomId) {
      setTokenError("Please fill in all required fields");
      toast.error("Missing required fields");
      return;
    }

    setGeneratingToken(true);
    setTokenError("");
    setTokenData(null);

    try {
      // Try to generate token directly - the API will tell us if room doesn't exist
      const response = await fetch("/api/100ms-room/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          role: userRole,
          room_id: roomId,
        }),
      });

      const data: ApiResponse<TokenData> = await response.json();

      // Check if token was successfully generated
      if (data.success && data.token) {
        const finalTokenData = {
          token: data.token,
          room_id: data.room_id || roomId,
          user_id: data.user_id || userId,
          role: data.role || userRole,
          expires_at: data.expires_at,
        };
        setTokenData(finalTokenData);
        
        // Save session for persistence across refreshes
        if (roomData) {
          saveSession(
            finalTokenData.token,
            finalTokenData.room_id,
            finalTokenData.user_id,
            finalTokenData.role,
            finalTokenData.expires_at,
            roomData.name,
            roomData.code
          );
        }
        
        toast.success("Token generated successfully");
        setTokenError(""); // Clear any previous errors
        return;
      }

      // If we get here, token generation failed
      const errorMsg = data.message || data.error || "Token generation failed";
      setTokenError(errorMsg);
      
      // Show specific error messages based on error type
      if (data.error === 'API endpoint not found (404)' || response.status === 404) {
        // Only show 404 error if token wasn't actually generated
        if (!data.token) {
          toast.error("Room Not Found", {
            description: `Room ID "${roomId}" not found. Please verify the room exists or create it first.`,
            duration: 6000,
          });
        }
      } else if (data.error === 'Connection timeout' || response.status === 504) {
        toast.error("Connection Timeout", {
          description: "The request to 100ms API timed out. Please check your network connection and try again.",
          duration: 6000,
        });
      } else if (data.error === 'Network error' || response.status === 503) {
        toast.error("Network Error", {
          description: "Failed to connect to 100ms API. Please check your network and 100ms service status.",
          duration: 6000,
        });
      } else {
        toast.error("Token generation failed", {
          description: errorMsg,
        });
      }
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      setTokenError(errorMsg);
      toast.error("Error generating token", {
        description: errorMsg,
      });
    } finally {
      setGeneratingToken(false);
    }
  }

  async function createRoomAndToken() {
    if (!userId || !userRole) {
      toast.error("Please enter user ID and select role");
      return;
    }

    setCombinedLoading(true);
    setRoomError("");
    setTokenError("");
    setRoomData(null);
    setTokenData(null);

    try {
      // Step 1: Create room
      const roomPayload: Record<string, any> = {};
      if (roomName) roomPayload.name = roomName;
      if (roomDescription) roomPayload.description = roomDescription;
      if (templateId) roomPayload.template_id = templateId;
      if (region) roomPayload.region = region;

      const roomResponse = await fetch("/api/100ms-room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomPayload),
      });

      const roomData: ApiResponse<RoomData> = await roomResponse.json();

      if (!roomData.success || !roomData.room) {
        const errorMsg = roomData.message || roomData.error || "Room creation failed";
        setRoomError(errorMsg);
        
        if (roomData.error === 'Connection timeout' || roomResponse.status === 504) {
          toast.error("Connection Timeout", {
            description: "The request to 100ms API timed out. Please check your network connection.",
            duration: 6000,
          });
        } else if (roomData.error === 'Network error' || roomResponse.status === 503) {
          toast.error("Network Error", {
            description: "Failed to connect to 100ms API. Please check your network.",
            duration: 6000,
          });
        } else {
          toast.error("Room creation failed", {
            description: errorMsg,
          });
        }
        return;
      }

      setRoomData(roomData.room);
      setRoomId(roomData.room.id);
      toast.success("Room created", { description: `ID: ${roomData.room.id}` });

      // Step 2: Generate token
      const tokenResponse = await fetch("/api/100ms-room/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          role: userRole,
          room_id: roomData.room.id,
        }),
      });

      const tokenData: ApiResponse<TokenData> = await tokenResponse.json();

      if (!tokenData.success || !tokenData.token) {
        const errorMsg = tokenData.message || tokenData.error || "Token generation failed";
        setTokenError(errorMsg);
        
        if (tokenData.error === 'Connection timeout' || tokenResponse.status === 504) {
          toast.error("Connection Timeout", {
            description: "The request to 100ms API timed out. Please check your network connection.",
            duration: 6000,
          });
        } else if (tokenData.error === 'Network error' || tokenResponse.status === 503) {
          toast.error("Network Error", {
            description: "Failed to connect to 100ms API. Please check your network.",
            duration: 6000,
          });
        } else {
          toast.error("Token generation failed", {
            description: errorMsg,
          });
        }
        return;
      }

      const finalTokenData = {
        token: tokenData.token,
        room_id: tokenData.room_id || roomData.room.id,
        user_id: tokenData.user_id || userId,
        role: tokenData.role || userRole,
        expires_at: tokenData.expires_at,
      };
      setTokenData(finalTokenData);
      
      // Save session for persistence across refreshes
      saveSession(
        finalTokenData.token,
        finalTokenData.room_id,
        finalTokenData.user_id,
        finalTokenData.role,
        finalTokenData.expires_at,
        roomData.room.name,
        roomData.room.code
      );
      
      toast.success("Token generated");
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      toast.error("Error in combined flow", { description: errorMsg });
    } finally {
      setCombinedLoading(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }

  function getJoinUrl() {
    if (!roomData?.code) return null;
    const subdomain = process.env.NEXT_PUBLIC_HMS_SUBDOMAIN;
    if (subdomain) {
      return `https://${subdomain}.app.100ms.live/meeting/${roomData.code}`;
    }
    return null;
  }

  const [isJoining, setIsJoining] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);

  // Save session to localStorage when joining
  const saveSession = (token: string, roomId: string, userId: string, role: string, expiresAt?: string, roomName?: string, roomCode?: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const session = {
        token,
        room_id: roomId,
        user_id: userId,
        role,
        expires_at: expiresAt,
        room_name: roomName,
        room_code: roomCode,
        joined_at: new Date().toISOString(),
      };
      localStorage.setItem('hms_active_session', JSON.stringify(session));
      console.log('[100ms] Session saved to localStorage');
    } catch (error) {
      console.error('[100ms] Error saving session:', error);
    }
  };

  // Clear session from localStorage
  const clearSession = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('hms_active_session');
    console.log('[100ms] Session cleared from localStorage');
  };

  // Load persisted session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedSession = localStorage.getItem('hms_active_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        const now = Date.now();
        
        // Check if token is expired (if expires_at is available)
        if (session.expires_at) {
          const expiresAt = new Date(session.expires_at).getTime();
          if (now >= expiresAt) {
            console.log('[100ms] Saved session token expired, clearing...');
            localStorage.removeItem('hms_active_session');
            toast.info("Previous session expired", {
              description: "Please join the room again",
            });
            return;
          }
        }
        
        // Restore session
        console.log('[100ms] Restoring previous session...');
        setTokenData({
          token: session.token,
          room_id: session.room_id,
          user_id: session.user_id,
          role: session.role,
          expires_at: session.expires_at,
        });
        setRoomData({
          id: session.room_id,
          name: session.room_name || '',
          code: session.room_code,
        });
        setRoomId(session.room_id);
        setUserId(session.user_id);
        setUserRole(session.role);
        setIsInRoom(true);
        toast.success("Reconnecting to previous session...", {
          description: "Your video call will resume shortly",
        });
      }
    } catch (error) {
      console.error('[100ms] Error loading saved session:', error);
      localStorage.removeItem('hms_active_session');
    }
  }, []);

  async function handleJoinRoom() {
    if (!tokenData?.token || !roomData?.id || !userId) {
      toast.error("Missing required data", {
        description: "Please ensure room and token are generated successfully",
      });
      return;
    }

    setIsJoining(true);
    try {
      // Save session before joining
      saveSession(
        tokenData.token,
        roomData.id,
        userId,
        tokenData.role || userRole,
        tokenData.expires_at,
        roomData.name,
        roomData.code
      );
      
      // This will be handled by the HMSRoomProvider wrapper
      // We'll trigger the join from the VideoRoomContent component
      setIsInRoom(true);
      toast.success("Joining room...");
    } catch (error: any) {
      toast.error("Failed to join room", { description: error.message });
      setIsJoining(false);
      clearSession();
    }
  }

  const joinUrl = getJoinUrl();

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 max-w-6xl">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">100ms Room Creation Test</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Test and manage 100ms room creation with refined API endpoints
          </p>
        </div>

        {/* API Status */}
        {apiStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center flex-wrap">
                <Badge variant={apiStatus.create.configured ? "default" : "destructive"}>
                  {apiStatus.create.configured ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Room API Ready</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Room API Not Configured</>
                  )}
                </Badge>
                <Badge variant={apiStatus.token.configured ? "default" : "destructive"}>
                  {apiStatus.token.configured ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Token API Ready</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Token API Not Configured</>
                  )}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkApiStatus}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connection Test Results */}
        {connectionTest && (
          <Card className={connectionTest.success ? "border-green-500" : "border-red-500"}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {connectionTest.success ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-500" /> Connection Test Passed</>
                ) : (
                  <><XCircle className="w-5 h-5 text-red-500" /> Connection Test Failed</>
                )}
              </CardTitle>
              <CardDescription>
                Tested at {new Date(connectionTest.timestamp).toLocaleString()}
                {connectionTest.totalDuration && ` • Duration: ${connectionTest.totalDuration}ms`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionTest.tests && connectionTest.tests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Test Results:</h4>
                  {connectionTest.tests.map((test: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        test.success
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{test.endpoint}</span>
                        {test.success ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" /> Failed
                          </Badge>
                        )}
                      </div>
                      {test.duration && (
                        <div className="text-xs text-muted-foreground">
                          Duration: {test.duration}ms
                        </div>
                      )}
                      {test.error && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Error: {test.error}
                        </div>
                      )}
                      {test.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-muted-foreground">
                            Details
                          </summary>
                          <pre className="text-xs mt-1 p-2 bg-background rounded overflow-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {connectionTest.recommendations && connectionTest.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Recommendations:</h4>
                  <ul className="space-y-1 text-sm">
                    {connectionTest.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-0.5">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* DNS & TCP Diagnostics */}
              {connectionTest.diagnostics && (
                <div className="pt-2 border-t space-y-3">
                  <h4 className="text-sm font-semibold">Network Diagnostics:</h4>
                  
                  {connectionTest.diagnostics.dns && (
                    <div className={`p-2 rounded border text-xs ${
                      connectionTest.diagnostics.dns.success
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">DNS Resolution:</span>
                        <Badge variant={connectionTest.diagnostics.dns.success ? "default" : "destructive"}>
                          {connectionTest.diagnostics.dns.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        Hostname: {connectionTest.diagnostics.dns.hostname}
                      </div>
                      {connectionTest.diagnostics.dns.addresses && connectionTest.diagnostics.dns.addresses.length > 0 && (
                        <div className="text-muted-foreground mt-1">
                          IP Addresses: {connectionTest.diagnostics.dns.addresses.join(", ")}
                        </div>
                      )}
                      {connectionTest.diagnostics.dns.error && (
                        <div className="text-red-600 dark:text-red-400 mt-1">
                          Error: {connectionTest.diagnostics.dns.error}
                        </div>
                      )}
                    </div>
                  )}

                  {connectionTest.diagnostics.tcp && (
                    <div className={`p-2 rounded border text-xs ${
                      connectionTest.diagnostics.tcp.success
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">TCP Connection:</span>
                        <Badge variant={connectionTest.diagnostics.tcp.success ? "default" : "destructive"}>
                          {connectionTest.diagnostics.tcp.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        {connectionTest.diagnostics.tcp.host}:{connectionTest.diagnostics.tcp.port}
                        {connectionTest.diagnostics.tcp.duration && (
                          <span className="ml-2">({connectionTest.diagnostics.tcp.duration}ms)</span>
                        )}
                      </div>
                      {connectionTest.diagnostics.tcp.error && (
                        <div className="text-red-600 dark:text-red-400 mt-1">
                          Error: {connectionTest.diagnostics.tcp.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {connectionTest.environment && (
                <div className="pt-2 border-t">
                  <h4 className="text-sm font-semibold mb-2">Environment:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Management Token:</span>{" "}
                      <Badge variant={connectionTest.hasManagementToken ? "default" : "destructive"}>
                        {connectionTest.hasManagementToken ? "Configured" : "Missing"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Template ID:</span>{" "}
                      <Badge variant={connectionTest.environment.hasTemplateId ? "default" : "secondary"}>
                        {connectionTest.environment.hasTemplateId ? "Set" : "Not Set"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Subdomain:</span>{" "}
                      <Badge variant={connectionTest.environment.hasSubdomain ? "default" : "secondary"}>
                        {connectionTest.environment.hasSubdomain ? "Set" : "Not Set"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Proxy:</span>{" "}
                      <Badge variant={connectionTest.environment.hasProxy ? "default" : "secondary"}>
                        {connectionTest.environment.hasProxy ? "Detected" : "None"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Node Env:</span>{" "}
                      <Badge>{connectionTest.environment.nodeEnv || "unknown"}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* WebRTC Connectivity Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>WebRTC Connectivity Test</span>
              <Button
                variant="outline"
                size="sm"
                onClick={testWebRTCConnectivity}
                disabled={testingWebRTC}
              >
                {testingWebRTC ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test WebRTC
                  </>
                )}
              </Button>
            </CardTitle>
            <CardDescription>
              Test if your browser can establish WebRTC connections (required for video calls)
            </CardDescription>
          </CardHeader>
          {webrtcTest && (
            <CardContent className="space-y-4">
              <div className={`p-3 rounded border ${
                webrtcTest.success
                  ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Overall Result:</span>
                  <Badge variant={webrtcTest.success ? "default" : "destructive"}>
                    {webrtcTest.success ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Passed</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Failed</>
                    )}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tested at {new Date(webrtcTest.timestamp).toLocaleString()}
                </p>
              </div>

              {webrtcTest.tests && webrtcTest.tests.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Test Results:</h4>
                  {webrtcTest.tests.map((test: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        test.success
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{test.name}</span>
                        {test.success ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" /> Failed
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {test.message}
                      </div>
                      {test.duration && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Duration: {test.duration}ms
                        </div>
                      )}
                      {test.videoTracks !== undefined && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Video tracks: {test.videoTracks}, Audio tracks: {test.audioTracks}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!webrtcTest.success && (
                <Alert variant="destructive">
                  <AlertTitle>WebRTC Connectivity Issues</AlertTitle>
                  <AlertDescription className="space-y-2 mt-2">
                    <p className="text-sm">
                      Your browser cannot establish WebRTC connections. This is why you're experiencing network errors.
                    </p>
                    <div className="text-sm space-y-1">
                      <p><strong>Common causes:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Firewall blocking UDP traffic (WebRTC uses UDP)</li>
                        <li>Corporate network/VPN restrictions</li>
                        <li>Router blocking STUN/TURN servers</li>
                        <li>Browser security settings</li>
                        <li>Network proxy interfering with WebRTC</li>
                      </ul>
                    </div>
                    <div className="text-sm space-y-1 mt-2">
                      <p><strong>Solutions to try:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Disable VPN if active</li>
                        <li>Check firewall settings - allow UDP ports 1024-65535</li>
                        <li>Try a different network (mobile hotspot, different WiFi)</li>
                        <li>Check router settings for WebRTC/STUN blocking</li>
                        <li>Try a different browser</li>
                        <li>Contact your network administrator if on corporate network</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          )}
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="create" className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">Create Room</TabsTrigger>
            <TabsTrigger value="token">Generate Token</TabsTrigger>
            <TabsTrigger value="combined">Combined Flow</TabsTrigger>
          </TabsList>

          {/* Create Room Tab */}
          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Room</CardTitle>
                <CardDescription>
                  Create a new 100ms room with custom settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-name">Room Name (Optional)</Label>
                    <Input
                      id="room-name"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="my-test-room"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-id">Template ID (Optional)</Label>
                    <Input
                      id="template-id"
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      placeholder="Uses env HMS_TEMPLATE_ID if empty"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="eu">Europe</SelectItem>
                        <SelectItem value="ap">Asia Pacific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={roomDescription}
                      onChange={(e) => setRoomDescription(e.target.value)}
                      placeholder="Room description"
                    />
                  </div>
                </div>
                <Button
                  onClick={createRoom}
                  disabled={creatingRoom}
                  className="w-full"
                >
                  {creatingRoom ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Room...
                    </>
                  ) : (
                    "Create Room"
                  )}
                </Button>
                {roomError && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{roomError}</AlertDescription>
                  </Alert>
                )}
                {roomData && (
                  <Card className="bg-muted">
                    <CardHeader>
                      <CardTitle className="text-lg">Room Created Successfully</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Room ID:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-background px-2 py-1 rounded">
                              {roomData.id}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(roomData.id, "Room ID")}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {roomData.code && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Room Code (Host):</span>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-background px-2 py-1 rounded">
                                {roomData.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(roomData.code!, "Room Code")}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        {roomData.codes && roomData.codes.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Room Codes:</span>
                            {roomData.codes.map((codeInfo: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{codeInfo.role}:</span>
                                <div className="flex items-center gap-2">
                                  <code className="bg-background px-2 py-1 rounded">
                                    {codeInfo.code}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(codeInfo.code, `${codeInfo.role} Room Code`)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {roomData.name && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Name:</span>
                            <span className="text-sm">{roomData.name}</span>
                          </div>
                        )}
                        {joinUrl && (
                          <div className="pt-2">
                            <a
                              href={joinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Join Room
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Token Tab */}
          <TabsContent value="token" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Token</CardTitle>
                <CardDescription>
                  Generate an authentication token for joining a room. Token generation works offline (no network required).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(roomError && (roomError.includes('Network error') || roomError.includes('Connection timeout'))) && (
                  <Alert>
                    <AlertDescription>
                      <strong>Note:</strong> If room creation failed due to network issues, you can still generate tokens by manually entering an existing room ID below. Token generation doesn't require network access.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-id">User ID *</Label>
                    <Input
                      id="user-id"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="user-123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={userRole} onValueChange={setUserRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="host">Host (Therapist)</SelectItem>
                        <SelectItem value="guest">Guest (Patient)</SelectItem>
                        <SelectItem value="hls-viewer">HLS Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="room-id">Room ID *</Label>
                    <Input
                      id="room-id"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter room ID (from created room or existing room)"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      You can use any valid room ID, even if you couldn't create a new room due to network issues.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={generateToken}
                  disabled={generatingToken || !userId || !userRole || !roomId}
                  className="w-full"
                >
                  {generatingToken ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Token...
                    </>
                  ) : (
                    "Generate Token"
                  )}
                </Button>
                {tokenError && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{tokenError}</AlertDescription>
                  </Alert>
                )}
                {tokenData && (
                  <Card className="bg-muted">
                    <CardHeader>
                      <CardTitle className="text-lg">Token Generated</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Token:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-background px-2 py-1 rounded max-w-md truncate">
                              {tokenData.token.substring(0, 50)}...
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(tokenData.token, "Token")}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Room ID:</span>
                          <span className="text-sm">{tokenData.room_id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">User ID:</span>
                          <span className="text-sm">{tokenData.user_id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Role:</span>
                          <Badge>{tokenData.role}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Combined Flow Tab */}
          <TabsContent value="combined" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Room & Generate Token</CardTitle>
                <CardDescription>
                  Automatically create a room and generate a token in one flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="combined-user-id">User ID *</Label>
                    <Input
                      id="combined-user-id"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="user-123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="combined-role">Role *</Label>
                    <Select value={userRole} onValueChange={setUserRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="host">Host (Therapist)</SelectItem>
                        <SelectItem value="guest">Guest (Patient)</SelectItem>
                        <SelectItem value="hls-viewer">HLS Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="combined-room-name">Room Name (Optional)</Label>
                    <Input
                      id="combined-room-name"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="my-test-room"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="combined-region">Region</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="eu">Europe</SelectItem>
                        <SelectItem value="ap">Asia Pacific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={createRoomAndToken}
                  disabled={combinedLoading || !userId || !userRole}
                  className="w-full"
                >
                  {combinedLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Room & Token...
                    </>
                  ) : (
                    "Create Room & Generate Token"
                  )}
                </Button>
                {(roomError || tokenError) && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {roomError || tokenError}
                    </AlertDescription>
                  </Alert>
                )}
                {roomData && tokenData && (
                  <div className="space-y-3">
                    <Card className="bg-muted">
                      <CardHeader>
                        <CardTitle className="text-lg">Room Created</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">Room ID:</span>
                            <code className="text-xs">{roomData.id}</code>
                          </div>
                          {roomData.code && (
                            <div className="flex justify-between">
                              <span className="font-medium">Room Code:</span>
                              <code className="text-xs">{roomData.code}</code>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted">
                      <CardHeader>
                        <CardTitle className="text-lg">Token Generated</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Token:</span>
                            <div className="flex items-center gap-2">
                              <code className="text-xs max-w-xs truncate">
                                {tokenData.token.substring(0, 40)}...
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(tokenData.token, "Token")}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Role:</span>
                            <Badge>{tokenData.role}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    {joinUrl && (
                      <a
                        href={joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Join Room (Prebuilt)
                      </a>
                    )}
                    <Button
                      onClick={handleJoinRoom}
                      className="w-full mt-3"
                      size="lg"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Video Room Section - Shows when joined */}
        {isInRoom && tokenData && (
          <>
            <VideoRoomJoinWrapper
              key={`wrapper-${tokenData.token}-${isInRoom}`} // Force remount when token or isInRoom changes
              token={tokenData.token}
              userName={userId}
              onJoinComplete={() => setIsJoining(false)}
              onLeave={() => {
                setIsInRoom(false);
                // Clear session when leaving
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('hms_active_session');
                }
              }}
            />
            <VideoRoomContent onLeave={() => {
              setIsInRoom(false);
              // Clear session when leaving
              if (typeof window !== 'undefined') {
                localStorage.removeItem('hms_active_session');
              }
            }} />
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
}

// Wrapper component to handle auto-join
function VideoRoomJoinWrapper({ 
  token, 
  userName, 
  onJoinComplete,
  onLeave 
}: { 
  token: string; 
  userName: string;
  onJoinComplete: () => void;
  onLeave: () => void;
}) {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hasJoinedRef = useRef(false);
  const isLeavingRef = useRef(false);
  const mountedRef = useRef(true);

  // Track if component is mounted
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      isLeavingRef.current = true; // Mark as leaving when unmounting
    };
  }, []);

  useEffect(() => {
    // Only auto-join if:
    // 1. We have token and userName
    // 2. We're not connected
    // 3. We haven't joined yet
    // 4. We're not in the process of leaving
    // 5. Component is still mounted
    if (token && userName && !isConnected && !hasJoinedRef.current && !isLeavingRef.current && mountedRef.current) {
      // Request permissions first
      const requestPermissions = async () => {
        try {
          // Request camera and microphone permissions
          await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (permError: any) {
          console.warn('[100ms] Permission request failed:', permError);
          // Continue anyway - user can grant permissions later
        }
      };

      const joinRoom = async () => {
        // Double-check we're still supposed to join before proceeding
        if (!mountedRef.current || isLeavingRef.current) {
          console.log('[100ms] Skipping join - component unmounting or leaving');
          return;
        }

        try {
          await requestPermissions();
          
          console.log('[100ms] Joining room with video enabled...');
          
          // Join with video and audio enabled so tracks are created immediately
          await hmsActions.join({ 
            userName, 
            authToken: token,
            settings: {
              isAudioMuted: false, // Enable audio so track is created and published
              isVideoMuted: false, // Enable video so track is created
            },
          });
          
          console.log('[100ms] Join call completed, waiting for tracks...');
          
          // Wait for tracks to be created and published - poll until we get track IDs
          let attempts = 0;
          const maxAttempts = 30; // Wait up to 6 seconds
          let trackPublished = false;
          
          while (attempts < maxAttempts && !trackPublished) {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Check if we can access the store to get local peer
            // We'll use a workaround since we can't use hooks here
            // The track should be available via the store after join
            
            // Try to enable video and audio explicitly if not already enabled
            if (attempts === 0) {
              try {
                if (typeof hmsActions.setLocalVideoEnabled === 'function') {
                  console.log('[100ms] Explicitly enabling video after join...');
                  await hmsActions.setLocalVideoEnabled(true);
                }
                if (typeof hmsActions.setLocalAudioEnabled === 'function') {
                  console.log('[100ms] Explicitly enabling audio after join...');
                  await hmsActions.setLocalAudioEnabled(true);
                }
              } catch (error: any) {
                console.warn('[100ms] Could not enable tracks:', error);
              }
            }
            
            // Log progress every 5 attempts
            if (attempts % 5 === 0) {
              console.log(`[100ms] Waiting for video track (attempt ${attempts + 1}/${maxAttempts})...`);
            }
            
            attempts++;
            
            // Note: We can't check track state here directly since we're in useEffect
            // The track will be available in the component once it's published
            // We'll just wait a reasonable amount of time
            if (attempts >= 10) {
              // After 2 seconds, assume track should be ready
              trackPublished = true;
            }
          }
          
          console.log('[100ms] Join process completed');
          
          // Only update state if still mounted
          if (mountedRef.current) {
            hasJoinedRef.current = true;
            onJoinComplete();
            toast.success("Successfully joined the room!", {
              description: "Your session will persist across page refreshes",
            });
          }
        } catch (error: any) {
          console.error('[100ms] Join error:', error);
          
          // Ignore reconnection-related errors during join
          if (error.message?.includes('Reconnection') || error.message?.includes('reconnection')) {
            console.warn('[100ms] Reconnection during join (non-critical):', error.message);
            onJoinComplete();
            toast.success("Joined room (reconnecting...)");
            return;
          }
          
          // Check if it's a track error (non-critical)
          if (error.code === 3015 || error.message?.includes('track') || error.message?.includes('Track')) {
            // Track errors are often non-critical - user can enable tracks later
            console.warn('[100ms] Track warning (non-critical):', error.message);
            toast.warning("Joined room, but some tracks may not be ready", {
              description: "You can enable audio/video using the controls below",
            });
            onJoinComplete();
            return;
          }
          
          // Check if we're already connected - if so, don't call onLeave as it might disconnect other participants
          if (isConnected) {
            console.warn('[100ms] Join error but already connected - ignoring to prevent disconnect:', error.message);
            onJoinComplete();
            return;
          }
          
          // Check for non-critical errors that shouldn't cause a leave
          const nonCriticalErrorCodes = [
            3015, // Track error
            4001, // Permission denied (user can grant later)
            4002, // Device not found (user can select device)
            4003, // Device in use (can retry)
          ];
          
          const isNonCritical = nonCriticalErrorCodes.includes(error.code) ||
            error.message?.includes('permission') ||
            error.message?.includes('Permission') ||
            error.message?.includes('device') ||
            error.message?.includes('Device') ||
            error.message?.includes('NotAllowedError') ||
            error.message?.includes('NotFoundError');
          
          if (isNonCritical) {
            console.warn('[100ms] Non-critical join error:', error.message);
            toast.warning("Joined room with warnings", {
              description: error.message || "Some features may be limited",
            });
            onJoinComplete();
            return;
          }
          
          // Only call onLeave for critical errors when not already connected
          console.error('[100ms] Critical join error:', error);
          toast.error("Failed to join room", { description: error.message || String(error) });
          // Only leave if we're not already connected (to avoid disconnecting other participants)
          if (!isConnected) {
            onLeave();
          } else {
            // If already connected, just complete the join process
            onJoinComplete();
          }
        }
      };

      joinRoom();
    }
  }, [token, userName, isConnected, hmsActions, onJoinComplete, onLeave]);

  // Handle intentional leave - mark as leaving when onLeave is called
  // This prevents auto-rejoin
  useEffect(() => {
    // When isConnected becomes false and we had joined, it might be an intentional leave
    // The parent's handleLeave will set isInRoom to false, which will unmount this component
    // So we don't need to do anything here - just prevent rejoin attempts
    
    // IMPORTANT: Don't trigger any actions when connection state changes
    // This prevents accidental disconnects when new peers join
    // The SDK handles reconnections automatically
  }, [isConnected, token, onLeave]);

  return null;
}

// Main export with HMSRoomProvider
export default function RoomTestPage() {
  return (
    <HMSRoomProvider>
      <RoomTestPageContent />
    </HMSRoomProvider>
  );
}

