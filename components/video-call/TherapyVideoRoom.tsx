"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, XCircle, Video, Mic, MicOff, VideoOff, PhoneOff, Maximize2, Minimize2, Settings, Clock, Shield } from "lucide-react";
import { toast } from "sonner";
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

// Video Room Component - Must be inside HMSRoomProvider
export function VideoRoomContent({ onLeave: onLeaveCallback, therapistName, userRole, bookingId, therapistId, onSessionEnded }: { onLeave?: () => void; therapistName?: string; userRole?: string; bookingId?: string; therapistId?: string; onSessionEnded?: () => void }) {
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const isLocalVideoEnabledStore = useHMSStore(selectIsLocalVideoEnabled);
  const isLocalAudioEnabledStore = useHMSStore(selectIsLocalAudioEnabled);
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } = useAVToggle();
  const [isToggling, setIsToggling] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [wasConnected, setWasConnected] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [therapistSeen, setTherapistSeen] = useState(false);
  
  const actualVideoEnabled = isLocalVideoEnabledStore ?? isLocalVideoEnabled;
  const actualAudioEnabled = isLocalAudioEnabledStore ?? isLocalAudioEnabled;
  
  // Get role from local peer or passed prop
  const currentRole = (localPeer as any)?.role?.name || userRole || 'guest';
  const isHost = currentRole === 'host' || currentRole === 'therapist';
  
  const peersRef = useRef(peers);
  const videoEnabledRef = useRef(actualVideoEnabled);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    peersRef.current = peers;
    videoEnabledRef.current = actualVideoEnabled;
  }, [peers, actualVideoEnabled]);

  // Track connection state and peers to detect when therapist ends session
  useEffect(() => {
    if (isConnected) {
      setWasConnected(true);
    }
  }, [isConnected]);

  // Detect when patient is disconnected or therapist leaves
  useEffect(() => {
    if (!isHost && wasConnected && !redirecting) {
      // Check if therapist peer is still in the room
      const therapistPeer = peers.find((p: any) => {
        const role = (p as any)?.role?.name;
        return role === 'host' || role === 'therapist';
      });
      
      if (therapistPeer && !therapistSeen) {
        setTherapistSeen(true);
      }
      
      // If disconnected or therapist left after they had joined, redirect to feedback
      if (therapistSeen && (!isConnected || !therapistPeer) && onSessionEnded) {
        setRedirecting(true);
        
        // Check booking status and redirect to feedback if completed
        if (bookingId) {
          // Small delay to ensure booking status is updated
          setTimeout(async () => {
            try {
              const token = localStorage.getItem('token') || sessionStorage.getItem('token');
              const response = await fetch(`/api/bookings/${bookingId}`, {
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                const booking = data.booking || data.data?.booking || data;
                
                if (booking.status === 'completed') {
                  onSessionEnded();
                } else {
                  // Even if not marked completed, redirect if therapist left
                  onSessionEnded();
                }
              } else {
                // Fallback: redirect if API call fails
                onSessionEnded();
              }
            } catch (err) {
              console.error('[100ms] Error checking booking status:', err);
              // Still redirect to feedback page as fallback
              onSessionEnded();
            }
          }, 1500);
        } else {
          // No booking ID - redirect after short delay
          setTimeout(() => {
            onSessionEnded();
          }, 1500);
        }
      }
    }
  }, [isConnected, wasConnected, isHost, peers, bookingId, onSessionEnded, redirecting, therapistSeen]);

  // Session timer
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isConnected || !localPeer) return;
    const videoTrack = localPeer.videoTrack;
    const hasTrack = !!videoTrack;
    const isVideoTrackObject = hasTrack && typeof videoTrack === 'object' && videoTrack !== null && 'id' in videoTrack;
    const hasTrackId = isVideoTrackObject && !!(videoTrack as { id: string }).id;
    
    if (isConnected && hasTrack && !hasTrackId && isLocalVideoEnabledStore) {
      hmsActions.setLocalVideoEnabled(true).catch((error: any) => {
        console.warn('[100ms] Could not enable video track:', error);
      });
    }
  }, [isConnected, localPeer, isLocalVideoEnabledStore, hmsActions]);

  const handleLeave = async () => {
    if (isToggling) return; // Prevent multiple leave attempts
    
    try {
      setIsToggling(true);
      
      // If therapist is ending, remove all other peers first with multiple fallback strategies
      if (isHost && peers.length > 1) {
        try {
          // Strategy 1: Send broadcast message to notify participants
          try {
            if (typeof hmsActions.sendBroadcastMessage === 'function') {
              await hmsActions.sendBroadcastMessage('Therapist has ended the session. You will be disconnected shortly.');
            }
          } catch (msgError: any) {
            console.warn('[100ms] ⚠️ Could not send broadcast message:', {
              error: msgError?.message || msgError,
              code: msgError?.code
            });
          }
          
          // Strategy 2: Try to remove peers individually
          const otherPeers = peers.filter(p => !p.isLocal);
          let removedCount = 0;
          
          for (const peer of otherPeers) {
            try {
              // Try removePeer if available
              if (typeof (hmsActions as any).removePeer === 'function') {
                await (hmsActions as any).removePeer(peer.id, 'Therapist ended the session');
                removedCount++;
              } else if (typeof (hmsActions as any).endRoom === 'function') {
                // Alternative: end the entire room
                await (hmsActions as any).endRoom();
                break; // No need to continue if room is ended
              }
            } catch (peerError: any) {
              console.warn('[100ms] ⚠️ Error removing peer:', {
                peerId: peer.id,
                peerName: peer.name,
                error: peerError?.message || peerError,
                code: peerError?.code
              });
            }
          }
          
          // Strategy 3: Fallback to API endpoint if SDK methods fail
          if (removedCount === 0 && (localPeer as any)?.room?.id) {
            try {
              const token = localStorage.getItem('token') || sessionStorage.getItem('token');
              const endResponse = await fetch('/api/100ms-room/end', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                  roomId: (localPeer as any)?.room?.id,
                  reason: 'Therapist ended the session'
                })
              });
              
              const endData = await endResponse.json().catch(() => ({}));
              
              if (endResponse.ok && endData.success) {
                // Room ended via API fallback
              } else {
                console.warn('[100ms] ⚠️ API fallback failed:', {
                  status: endResponse.status,
                  data: endData
                });
              }
            } catch (apiError: any) {
              console.warn('[100ms] ⚠️ API fallback error:', {
                error: apiError?.message || apiError,
                roomId: (localPeer as any)?.room?.id
              });
            }
          }
          
          // Wait a bit for peers to be removed/notified
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (removeError: any) {
          console.error('[100ms] ❌ Error ending session for participants:', {
            error: removeError?.message || removeError,
            stack: removeError?.stack,
            roomId: (localPeer as any)?.room?.id
          });
        }
      }
      
      // Step 1: Stop all media tracks - comprehensive cleanup
      try {
        const allTracks: MediaStreamTrack[] = [];
        let tracksStopped = 0;
        
        // Stop tracks from local peer
        if (localPeer?.audioTrack) {
          try {
            const audioTrack = localPeer.audioTrack;
            if (typeof audioTrack === 'object' && audioTrack !== null && 'nativeTrack' in audioTrack && (audioTrack as any).nativeTrack) {
              allTracks.push((audioTrack as any).nativeTrack);
            }
          } catch (e: any) {
            console.warn('[100ms] ⚠️ Error getting audio track:', {
              error: e?.message || e,
              stack: e?.stack
            });
          }
        }
        
        if (localPeer?.videoTrack) {
          try {
            const videoTrack = localPeer.videoTrack;
            if (typeof videoTrack === 'object' && videoTrack !== null && 'nativeTrack' in videoTrack && (videoTrack as any).nativeTrack) {
              allTracks.push((videoTrack as any).nativeTrack);
            }
          } catch (e: any) {
            console.warn('[100ms] ⚠️ Error getting video track:', {
              error: e?.message || e,
              stack: e?.stack
            });
          }
        }
        
        // Stop all tracks from local peer
        allTracks.forEach(track => {
          try {
            if (track.readyState !== 'ended') {
              track.stop();
              tracksStopped++;
            }
          } catch (e: any) {
            console.warn('[100ms] ⚠️ Error stopping track:', {
              kind: track.kind,
              id: track.id,
              error: e?.message || e
            });
          }
        });
        
        // Stop all media streams from DOM elements
        if (typeof window !== 'undefined') {
          let domTracksStopped = 0;
          
          // Get all video elements and stop their streams
          const videoElements = document.querySelectorAll('video');
          
          videoElements.forEach((video) => {
            if (video.srcObject instanceof MediaStream) {
              const stream = video.srcObject;
              const streamTracks = stream.getTracks();
              
              streamTracks.forEach(track => {
                if (track.readyState !== 'ended') {
                  track.stop();
                  domTracksStopped++;
                }
              });
              video.srcObject = null;
            }
          });
          
          // Get all audio elements and stop their streams
          const audioElements = document.querySelectorAll('audio');
          
          audioElements.forEach((audio) => {
            if (audio.srcObject instanceof MediaStream) {
              const stream = audio.srcObject;
              const streamTracks = stream.getTracks();
              
              streamTracks.forEach(track => {
                if (track.readyState !== 'ended') {
                  track.stop();
                  domTracksStopped++;
                }
              });
              audio.srcObject = null;
            }
          });
          
          // Additional cleanup: Force stop all media tracks
          // This is a more aggressive approach to ensure camera/mic are released
          try {
            // Get all media stream tracks from the page
            const allMediaTracks: MediaStreamTrack[] = [];
            
            // Collect all tracks from video elements
            document.querySelectorAll('video').forEach(video => {
              if (video.srcObject instanceof MediaStream) {
                allMediaTracks.push(...video.srcObject.getTracks());
              }
            });
            
            // Collect all tracks from audio elements
            document.querySelectorAll('audio').forEach(audio => {
              if (audio.srcObject instanceof MediaStream) {
                allMediaTracks.push(...audio.srcObject.getTracks());
              }
            });
            
            // Stop all collected tracks
            allMediaTracks.forEach(track => {
              try {
                if (track.readyState !== 'ended') {
                  track.stop();
                }
              } catch (e) {
                console.warn('[100ms] Error force stopping track:', e);
              }
            });
            
            // Clear all srcObject references
            document.querySelectorAll('video, audio').forEach(element => {
              if (element instanceof HTMLVideoElement || element instanceof HTMLAudioElement) {
                if (element.srcObject instanceof MediaStream) {
                  element.srcObject = null;
                }
              }
            });
          } catch (e) {
            console.warn('[100ms] Error in aggressive cleanup:', e);
          }
        }
      } catch (trackError: any) {
        console.error('[100ms] Error stopping tracks:', trackError);
      }
      
      // Step 2: Leave the room - this is critical with retry logic
      try {
        if (isConnected) {
          await hmsActions.leave();
        }
      } catch (leaveError: any) {
        console.error('[100ms] ❌ Error during leave:', {
          error: leaveError?.message || leaveError,
          code: leaveError?.code,
          name: leaveError?.name,
          stack: leaveError?.stack
        });
        
        // Try to force leave even if there's an error
        try {
          if (isConnected) {
            await hmsActions.leave();
          }
        } catch (forceLeaveError: any) {
          console.error('[100ms] ❌ Force leave also failed:', {
            error: forceLeaveError?.message || forceLeaveError,
            code: forceLeaveError?.code,
            name: forceLeaveError?.name
          });
        }
      }
      
      // Step 3: Mark booking as completed if bookingId is provided with retry logic
      if (bookingId) {
        
        const updateBookingStatus = async (retryCount = 0): Promise<void> => {
          const maxRetries = 2;
          const retryDelay = 500;
          
          try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`/api/bookings/${bookingId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ 
                status: 'completed'
              })
            });
            
            if (response.ok) {
              const data = await response.json().catch(() => ({}));
              // Booking marked as completed
            } else {
              const errorData = await response.json().catch(() => ({}));
              console.warn('[100ms] ⚠️ Booking status update failed', {
                bookingId,
                status: response.status,
                error: errorData,
                retryCount
              });
              
              // Retry on server errors
              if ((response.status === 500 || response.status === 503 || response.status === 502) && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
                return updateBookingStatus(retryCount + 1);
              }
            }
          } catch (updateError: any) {
            console.error('[100ms] ❌ Failed to update booking status:', {
              bookingId,
              error: updateError?.message || updateError,
              stack: updateError?.stack,
              retryCount
            });
            
            // Retry on network errors
            if (retryCount < maxRetries && (
              updateError?.message?.includes('network') ||
              updateError?.message?.includes('timeout') ||
              updateError?.message?.includes('fetch')
            )) {
              await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
              return updateBookingStatus(retryCount + 1);
            }
          }
        };
        
        // Don't await - let it run in background
        updateBookingStatus().catch(err => {
          console.error('[100ms] ❌ Booking status update failed after retries:', err);
        });
      }
      
      // Step 4: Wait a bit to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 5: Call the callback to update parent state and redirect
      if (onLeaveCallback) {
        onLeaveCallback();
      }
      
      toast.success(isHost ? "Session ended for all participants" : "Left the session");
    } catch (error: any) {
      console.error('[100ms] Leave error:', error);
      toast.error("Error leaving session", { description: error.message || String(error) });
      
      // Even on error, try to stop all tracks
      try {
        if (typeof window !== 'undefined') {
          const videoElements = document.querySelectorAll('video');
          videoElements.forEach(video => {
            if (video.srcObject instanceof MediaStream) {
              video.srcObject.getTracks().forEach(track => track.stop());
              video.srcObject = null;
            }
          });
        }
      } catch (cleanupError) {
        console.error('[100ms] Cleanup error:', cleanupError);
      }
      
      if (onLeaveCallback) {
        onLeaveCallback();
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
      await hmsActions.setLocalAudioEnabled(newState);
      toast.success(newState ? "Audio unmuted" : "Audio muted");
    } catch (error: any) {
      console.error('[100ms] Toggle audio error:', error);
      try {
        if (toggleAudio) {
        await toggleAudio();
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
      const newState = !actualVideoEnabled;
      if (typeof hmsActions.setLocalVideoEnabled === 'function') {
        await hmsActions.setLocalVideoEnabled(newState);
      } else {
        if (toggleVideo) {
        await toggleVideo();
        }
      }
      toast.success(newState ? "Video shown" : "Video hidden");
    } catch (error: any) {
      console.error('[100ms] Toggle video error:', error);
      toast.error("Failed to toggle video", { description: error.message || String(error) });
    } finally {
      setIsToggling(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const [connectionState, setConnectionState] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (error: any) => {
      // Enhanced error logging with structured data
      const errorLog = {
        code: error.code,
        name: error.name,
        message: error.message,
        description: error.description,
        action: error.action,
        timestamp: new Date().toISOString(),
        roomId: (localPeer as any)?.room?.id,
        isConnected,
        peerCount: peers.length
      };
      
      // Filter out non-critical track warnings
      if (error.code === 3015 || error.message?.includes('track') || error.message?.includes('Track')) {
        console.debug('[100ms] 🔍 Track warning (non-critical):', errorLog);
        return;
      }
      
      // Handle network/reconnection events with detailed logging
      if (
        error.code === 1003 || error.code === 4006 ||
        error.name === 'WebSocketConnectionLost' || error.name === 'ICEDisconnected' ||
        error.message?.includes('Reconnection') || error.message?.includes('reconnection') ||
        error.message?.includes('connection lost') || error.message?.includes('ping pong failure') ||
        error.message?.includes('ICE connection') || error.message?.includes('DISCONNECTED') ||
        error.message?.includes('WebSocket closed')
      ) {
        console.warn('[100ms] ⚠️ Network/reconnection event:', errorLog);
        
        if (error.code === 4006 || error.name === 'ICEDisconnected') {
          setConnectionState('reconnecting');
          setConnectionError('ICE connection disconnected - attempting to reconnect...');
        } else if (error.code === 1003 || error.name === 'WebSocketConnectionLost') {
          setConnectionState('reconnecting');
          setConnectionError('WebSocket connection lost - attempting to reconnect...');
        }
        return;
      }
      
      // Log critical errors with full context
      console.error('[100ms] ❌ Critical error:', {
        ...errorLog,
        stack: error.stack,
        fullError: error
      });
      
      // Set connection error state for critical errors
      if (error.code && error.code >= 4000) {
        setConnectionError(error.message || error.description || 'Connection error occurred');
      }
    };

    const handleReconnected = () => {
      const reconnectLog = {
        timestamp: new Date().toISOString(),
        roomId: (localPeer as any)?.room?.id,
        peerCount: peers.length,
        isConnected
      };
      
      setConnectionState('connected');
      setConnectionError(null);
      toast.success("Reconnected to session");
    };

    const handleReconnecting = () => {
      const reconnectingLog = {
        timestamp: new Date().toISOString(),
        roomId: (localPeer as any)?.room?.id,
        previousState: connectionState
      };
      
      setConnectionState('reconnecting');
      setConnectionError('Reconnecting to session...');
      toast.info("Reconnecting to session...", { duration: 5000 });
    };

    // Note: 100ms SDK uses store subscriptions, not addEventListener on hmsActions
    // These event handlers should be set up via store subscriptions if needed
    const unsubscribeError = null; // hmsActions.addEventListener is not available
    const unsubscribeReconnected = null;
    const unsubscribeReconnecting = null;
    
    return () => {
      // Cleanup - event listeners are handled via store subscriptions in 100ms SDK
      // No explicit unsubscribe needed for addEventListener (not available on hmsActions)
    };
  }, [hmsActions]);

  useEffect(() => {
    if (isConnected) {
      setConnectionState('connected');
      setConnectionError(null);
    } else if (connectionState === 'connected') {
      setConnectionState('disconnected');
    }
  }, [isConnected, connectionState]);

  // Cleanup on unmount - ensure all tracks are stopped
  useEffect(() => {
    return () => {
      // Stop all media tracks when component unmounts
      try {
        if (typeof window !== 'undefined') {
          // Stop all video tracks
          const videoElements = document.querySelectorAll('video');
          videoElements.forEach(video => {
            if (video.srcObject instanceof MediaStream) {
              video.srcObject.getTracks().forEach(track => {
                track.stop();
              });
              video.srcObject = null;
            }
          });
          
          // Stop all audio tracks
          const audioElements = document.querySelectorAll('audio');
          audioElements.forEach(audio => {
            if (audio.srcObject instanceof MediaStream) {
              audio.srcObject.getTracks().forEach(track => {
                track.stop();
              });
              audio.srcObject = null;
            }
          });
        }
        
        // Leave room if still connected
        if (isConnected) {
          hmsActions.leave().catch((err: any) => {
            console.warn('[100ms] Cleanup: Error leaving on unmount:', err);
          });
        }
      } catch (cleanupError) {
        console.error('[100ms] Cleanup error on unmount:', cleanupError);
      }
    };
  }, [isConnected, hmsActions]);

  if (!isConnected) {
    return null;
  }

  const remotePeers = peers.filter(p => !p.isLocal);
  const hasMultipleParticipants = peers.length > 1;

  return (
    <>
      {/* Instructions Modal - shown when call starts */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Video className="w-6 h-6 text-blue-600" />
              Welcome to Your Session
            </DialogTitle>
            <DialogDescription className="text-base">
              Important information before we begin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Card className="border-2 border-blue-100">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Secure & Private</h3>
                    <p className="text-sm text-blue-800">
                      Your session is encrypted and completely private. We never record sessions without explicit consent. 
                      All communications are HIPAA-compliant and secure.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Quick Tips:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use the microphone and camera buttons to control your audio/video</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Ensure you&apos;re in a quiet, private space</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Click &quot;End Session&quot; when finished - your camera and mic will turn off automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>If you experience connection issues, try refreshing or check your internet</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowInstructions(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              Got it, let&apos;s start!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div ref={containerRef} className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col overflow-hidden">
        {/* Modern Header */}
      <div className="bg-black/40 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-semibold text-lg">{therapistName || 'Therapy Session'}</h2>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                {isHost ? 'Host' : 'Guest'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(sessionDuration)}
              </span>
              <span className="text-gray-500">•</span>
              <span>{peers.length} {peers.length === 1 ? 'participant' : 'participants'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {connectionState === 'connected' ? (
            <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
            </Badge>
          ) : connectionState === 'reconnecting' ? (
            <Badge variant="default" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Reconnecting
            </Badge>
          ) : (
            <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/30">
              <XCircle className="w-3 h-3 mr-1" /> Disconnected
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {connectionError && connectionState === 'reconnecting' && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2 backdrop-blur-sm">
          <AlertDescription className="flex items-center gap-2 text-yellow-200 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            {connectionError}
          </AlertDescription>
        </div>
      )}

      {/* Video Area with Modern Grid */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {hasMultipleParticipants ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 h-full">
            {peers.map((peer) => (
              <PeerTile key={peer.id} peer={peer} isLocal={peer.isLocal} />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            {peers.map((peer) => (
              <PeerTile key={peer.id} peer={peer} isLocal={peer.isLocal} isSolo={true} />
            ))}
          </div>
        )}
      </div>

      {/* Modern Controls Bar */}
      <div className="bg-black/60 backdrop-blur-xl border-t border-white/10 px-6 py-5 shadow-2xl">
        <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
          <Button
            variant={actualAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            className={`w-14 h-14 rounded-full transition-all duration-200 ${
              actualAudioEnabled 
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
            }`}
            onClick={handleToggleAudio}
            disabled={!isConnected || isToggling}
          >
            {isToggling ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : actualAudioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            variant={actualVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            className={`w-14 h-14 rounded-full transition-all duration-200 ${
              actualVideoEnabled 
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
            }`}
            onClick={handleToggleVideo}
            disabled={!isConnected || isToggling}
          >
            {isToggling ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : actualVideoEnabled ? (
              <Video className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="px-8 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleLeave}
            disabled={isToggling}
          >
            {isToggling ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Leaving...</>
            ) : (
              <><PhoneOff className="w-5 h-5 mr-2" /> End Session</>
            )}
          </Button>
        </div>
        <p className="text-center text-gray-400 text-xs mt-4">
          🔒 This session is private and secure. Recording is not allowed without consent.
        </p>
      </div>
    </div>
    </>
  );
}

function PeerTile({ peer, isLocal, isSolo = false }: { peer: any; isLocal: boolean; isSolo?: boolean }) {
  const peerRole = peer.role?.name || 'guest';
  const isHostRole = peerRole === 'host' || peerRole === 'therapist';
  const videoTrack = peer.videoTrack;
  const audioTrack = peer.audioTrack;
  
  const isVideoTrackObject = videoTrack && typeof videoTrack === 'object' && videoTrack !== null;
  const isVideoTrackString = typeof videoTrack === 'string';
  const hasVideoTrack = isVideoTrackObject || isVideoTrackString;
  const trackId = isVideoTrackObject ? videoTrack.id : (isVideoTrackString ? videoTrack : undefined);
  
  const isAudioTrackObject = audioTrack && typeof audioTrack === 'object' && audioTrack !== null;
  const isAudioTrackString = typeof audioTrack === 'string';
  const hasAudioTrack = isAudioTrackObject || isAudioTrackString;
  const audioTrackId = isAudioTrackObject ? audioTrack.id : (isAudioTrackString ? audioTrack : undefined);
  
  const { videoRef: videoRefCallback } = useVideo({ trackId: trackId });
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Use the callback ref from useVideo and also store in our ref
  const handleVideoRef = React.useCallback((element: HTMLVideoElement | null) => {
    (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = element;
    if (videoRefCallback) {
      if (typeof videoRefCallback === 'function') {
        videoRefCallback(element);
      } else if (videoRefCallback && typeof videoRefCallback === 'object' && 'current' in videoRefCallback) {
        (videoRefCallback as React.MutableRefObject<HTMLVideoElement | null>).current = element;
      }
    }
  }, [videoRefCallback]);

  const isVideoEnabled = hasVideoTrack && (
    !!trackId || 
    (isVideoTrackObject && (videoTrack.enabled === undefined || videoTrack.enabled === true))
  );
  const isAudioEnabled = hasAudioTrack && (
    !!audioTrackId || 
    (isAudioTrackObject && (audioTrack.enabled === undefined || audioTrack.enabled === true))
  );

  // Extract audio from video stream
  useEffect(() => {
    if (!videoRef?.current || !audioRef.current || isLocal) return;
    
    const video = videoRef.current;
    const audio = audioRef.current;
    
    const checkStream = () => {
      if (video.srcObject instanceof MediaStream) {
        const stream = video.srcObject;
        const audioTracks = stream.getAudioTracks();
        
        if (audioTracks.length > 0 && (!audio.srcObject || (audio.srcObject instanceof MediaStream && audio.srcObject.getAudioTracks().length === 0))) {
          const audioStream = new MediaStream(audioTracks);
          audio.srcObject = audioStream;
          audio.muted = false;
          audio.play().catch(() => {});
        }
      }
    };
    
    checkStream();
    const interval = setInterval(checkStream, 1000);
    return () => clearInterval(interval);
  }, [videoRef, audioRef, peer.name, isLocal]);

  // Manually attach audio track
  useEffect(() => {
    if (!audioRef.current || isLocal || !hasAudioTrack) return;

    const audio = audioRef.current;
    
    const attachAudioTrack = () => {
      try {
        let nativeAudioTrack: MediaStreamTrack | null = null;
        
        if (isAudioTrackObject && (audioTrack as any).nativeTrack) {
          nativeAudioTrack = (audioTrack as any).nativeTrack;
        } else if (videoRef.current?.srcObject instanceof MediaStream) {
          const videoStream = videoRef.current.srcObject;
          const audioTracks = videoStream.getAudioTracks();
          if (audioTracks.length > 0) {
            nativeAudioTrack = audioTracks[0];
          }
        }

        if (nativeAudioTrack && nativeAudioTrack.readyState !== 'ended') {
          const currentStream = audio.srcObject as MediaStream | null;
          const hasTrack = currentStream?.getAudioTracks().some(t => t.id === nativeAudioTrack!.id);
          
          if (!hasTrack) {
            const audioStream = new MediaStream([nativeAudioTrack]);
            audio.srcObject = audioStream;
            audio.muted = false;
            audio.play().catch(() => {});
          }
        }
      } catch (error: any) {
        console.error(`[100ms] Error attaching audio track:`, error);
      }
    };

    attachAudioTrack();
    const interval = setInterval(() => {
      if (!audio.srcObject || (audio.srcObject instanceof MediaStream && audio.srcObject.getAudioTracks().length === 0)) {
        attachAudioTrack();
      }
    }, 1000);

    const ensureAudioPlays = () => {
      if (audio.muted) audio.muted = false;
      if (audio.paused && audio.srcObject) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('canplay', ensureAudioPlays);
    audio.addEventListener('loadedmetadata', ensureAudioPlays);

    const playInterval = setInterval(() => {
      if (hasAudioTrack && isAudioEnabled && audio.paused && audio.srcObject) {
        audio.play().catch(() => {});
      }
      if (audio.muted && !isLocal) {
        audio.muted = false;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(playInterval);
      audio.removeEventListener('canplay', ensureAudioPlays);
      audio.removeEventListener('loadedmetadata', ensureAudioPlays);
    };
  }, [audioRef, hasAudioTrack, isAudioEnabled, isLocal, peer.name, audioTrack, audioTrackId, isAudioTrackObject, videoRef]);

  // Video playback
  useEffect(() => {
    if (!videoRef?.current) return;
    
    if (hasVideoTrack && !trackId && isVideoTrackObject && videoTrack?.nativeTrack) {
      try {
        const video = videoRef.current;
        const stream = new MediaStream([(videoTrack as any).nativeTrack]);
        video.srcObject = stream;
        video.play().catch(() => {});
      } catch (err) {
        console.warn('[100ms] Failed to attach native track:', err);
      }
    }
    
    if (!hasVideoTrack && !trackId) return;

    const video = videoRef.current;
    
    const ensureVideoVisible = () => {
      video.style.opacity = '1';
      video.style.display = 'block';
      video.style.visibility = 'visible';
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    const handleCanPlay = () => ensureVideoVisible();
    const handlePlaying = () => ensureVideoVisible();
    const handleLoadedMetadata = () => ensureVideoVisible();

    if (video.readyState >= 2) {
      ensureVideoVisible();
    }
    ensureVideoVisible();

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadeddata', handleCanPlay);
    video.addEventListener('play', handlePlaying);

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

  const displayName = peer.name || (isLocal ? 'You' : 'Participant');
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-2xl border border-white/10 ${
      isSolo ? 'w-full max-w-4xl mx-auto h-full' : 'h-full'
    }`}>
      {!isLocal && (hasAudioTrack || audioRef) && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          muted={false}
          style={{ display: 'none' }}
        />
      )}
      <video
        ref={handleVideoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
        style={{ 
          opacity: 1,
          display: 'block',
          visibility: 'visible',
          backgroundColor: '#0f172a'
        }}
      />
      {!isVideoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 z-10">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-white text-3xl font-bold">
                {initials}
              </span>
            </div>
            <p className="text-white text-lg font-semibold">{displayName} {isLocal && "(You)"}</p>
            <p className="text-gray-400 text-sm mt-2">Video is off</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-2 z-20 border border-white/10">
        <span className="font-medium">{displayName}</span>
        {isLocal && <span className="text-xs text-gray-300">(You)</span>}
        {isHostRole && (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-1.5 py-0">
            Host
          </Badge>
        )}
        {!isVideoEnabled && isLocal && (
          <VideoOff className="w-4 h-4 text-gray-400" />
        )}
      </div>
      {!isAudioEnabled && (
        <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white p-2 rounded-full z-20 shadow-lg border border-red-500/30">
          <MicOff className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

// Wrapper component to handle auto-join
export function VideoRoomJoinWrapper({ 
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

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      isLeavingRef.current = true;
    };
  }, []);


  useEffect(() => {
    if (token && userName && !isConnected && !hasJoinedRef.current && !isLeavingRef.current && mountedRef.current) {
      const joinRoom = async () => {
        if (!mountedRef.current || isLeavingRef.current) return;

        try {
          await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (permError: any) {
          console.warn('[100ms] Permission request failed:', permError);
        }

        try {
          await hmsActions.join({ 
            userName, 
            authToken: token,
            settings: {
              isAudioMuted: false,
              isVideoMuted: false,
            },
          });
          
          if (mountedRef.current && !isLeavingRef.current) {
            hasJoinedRef.current = true;
            onJoinComplete();
            toast.success("Successfully joined the session!");
          }
        } catch (error: any) {
          console.error('[100ms] Join error:', error);
          toast.error("Failed to join session", { description: error.message || String(error) });
          if (!isLeavingRef.current) {
            onLeave();
          }
        }
      };

      joinRoom();
    }
  }, [token, userName, isConnected, hmsActions, onJoinComplete, onLeave]);

  // Cleanup on unmount - ensure we leave if component unmounts
  useEffect(() => {
    return () => {
      if (isConnected && mountedRef.current) {
        isLeavingRef.current = true;
        hmsActions.leave().catch((err: any) => {
          console.warn('[100ms] Error leaving on unmount:', err);
        });
      }
    };
  }, [isConnected, hmsActions]);

  return null;
}
