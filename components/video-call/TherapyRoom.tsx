"use client";

import { useState, useEffect } from "react";
import { 
  useHMSActions, 
  useHMSStore, 
  selectPeers,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectRoomState,
  selectLocalPeer,
  HMSRoomState
} from "@100mslive/react-sdk";
import VideoTileNew from "./VideoTileNew";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Settings, 
  Users,
  MessageSquare,
  MoreVertical,
  Monitor,
  Hand,
  Volume2,
  VolumeX
} from "lucide-react";

interface TherapyRoomProps {
  onLeave?: () => void;
  sessionId?: string;
  userName?: string;
  userRole?: "therapist" | "patient";
}

export default function TherapyRoom({ 
  onLeave, 
  sessionId, 
  userName, 
  userRole 
}: TherapyRoomProps) {
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const roomState = useHMSStore(selectRoomState);
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  const hmsActions = useHMSActions();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Session timer
  useEffect(() => {
    if (roomState === HMSRoomState.Connected) {
      const timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [roomState]);

  // Format session time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = async () => {
    await hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
  };

  const toggleVideo = async () => {
    await hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
  };

  const toggleHandRaise = async () => {
    try {
      if (isHandRaised) {
        await hmsActions.lowerLocalPeerHand();
      } else {
        await hmsActions.raiseLocalPeerHand();
      }
      setIsHandRaised(!isHandRaised);
    } catch (error) {
      console.error("Error toggling hand raise:", error);
    }
  };

  const leaveRoom = async () => {
    try {
      await hmsActions.leave();
      onLeave?.();
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const endSession = async () => {
    try {
      if (userRole === "therapist") {
        await hmsActions.endRoom(false, "Session ended by therapist");
      }
      await hmsActions.leave();
      onLeave?.();
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  if (roomState === HMSRoomState.Connecting) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Connecting to session...</h3>
            <p className="text-gray-600">Please wait while we connect you to the therapy room.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (roomState === HMSRoomState.Failed) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertDescription>
                Failed to connect to the session. Please check your internet connection and try again.
              </AlertDescription>
            </Alert>
            <Button onClick={onLeave} className="w-full mt-4">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">Therapy Session</h1>
            {sessionId && (
              <span className="text-sm text-gray-300 bg-gray-700 px-3 py-1 rounded">
                ID: {sessionId}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-300">
              <Users className="w-4 h-4 inline mr-1" />
              {peers.length} participant{peers.length !== 1 ? 's' : ''}
            </div>
            <div className="text-sm text-gray-300">
              Session: {formatTime(sessionTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-6">
          <div className={`grid gap-4 h-full ${
            peers.length === 1 ? 'grid-cols-1' : 
            peers.length <= 2 ? 'grid-cols-1 lg:grid-cols-2' :
            peers.length <= 4 ? 'grid-cols-2' : 
            'grid-cols-2 lg:grid-cols-3'
          }`}>
            {peers.map((peer) => (
              <VideoTileNew 
                key={peer.id} 
                peer={peer} 
                isLocal={peer.isLocal}
              />
            ))}
          </div>

          {peers.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Waiting for participants...</h3>
                <p>Share the session ID with your therapist or patient to get started.</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-white font-medium">Session Chat</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>
            <div className="flex-1 p-4">
              <div className="text-center text-gray-400 text-sm">
                Chat messages will appear here
              </div>
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm"
                />
                <Button size="sm">Send</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <Button
            variant={isLocalAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12 p-0"
          >
            {isLocalAudioEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>

          {/* Video Toggle */}
          <Button
            variant={isLocalVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12 p-0"
          >
            {isLocalVideoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>

          {/* Hand Raise */}
          <Button
            variant={isHandRaised ? "default" : "secondary"}
            size="lg"
            onClick={toggleHandRaise}
            className="rounded-full w-12 h-12 p-0"
          >
            <Hand className="w-5 h-5" />
          </Button>

          {/* Chat Toggle */}
          <Button
            variant={isChatOpen ? "default" : "secondary"}
            size="lg"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="rounded-full w-12 h-12 p-0"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          {/* Settings */}
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Leave/End Session */}
          {userRole === "therapist" ? (
            <Button
              variant="destructive"
              size="lg"
              onClick={endSession}
              className="ml-4 px-6"
            >
              <Phone className="w-4 h-4 mr-2" />
              End Session
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="lg"
              onClick={leaveRoom}
              className="ml-4 px-6"
            >
              <Phone className="w-4 h-4 mr-2" />
              Leave
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
