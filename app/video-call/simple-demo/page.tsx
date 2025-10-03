"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Users,
  Settings
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: "therapist" | "patient";
  isVideoOn: boolean;
  isAudioOn: boolean;
}

export default function SimpleVideoCallDemo() {
  const [isInCall, setIsInCall] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<"therapist" | "patient">("patient");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // Mock participants for demo
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Session timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInCall) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isInCall]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get user's camera
  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Stop local video
  const stopLocalVideo = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  // Join call
  const joinCall = async () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }
    
    await startLocalVideo();
    setIsInCall(true);
    
    // Add user as participant
    const newParticipant: Participant = {
      id: `user_${Date.now()}`,
      name: userName,
      role: userRole,
      isVideoOn: true,
      isAudioOn: true
    };
    setParticipants([newParticipant]);
    
    // Simulate other participant joining after 2 seconds
    setTimeout(() => {
      const otherRole = userRole === "therapist" ? "patient" : "therapist";
      const otherName = otherRole === "therapist" ? "Dr. Smith" : "John Doe";
      
      const otherParticipant: Participant = {
        id: `other_${Date.now()}`,
        name: otherName,
        role: otherRole,
        isVideoOn: true,
        isAudioOn: true
      };
      setParticipants(prev => [...prev, otherParticipant]);
    }, 2000);
  };

  // Leave call
  const leaveCall = () => {
    stopLocalVideo();
    setIsInCall(false);
    setParticipants([]);
    setSessionTime(0);
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      }
    }
  };

  // Participant video tile component
  const VideoTile = ({ participant, isLocal = false }: { participant: Participant; isLocal?: boolean }) => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
      {participant.isVideoOn ? (
        isLocal ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center">
              <Video className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">Simulated Video</p>
            </div>
          </div>
        )
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold">
                {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <p className="text-sm">{participant.name}</p>
          </div>
        </div>
      )}
      
      {/* Participant info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="text-white text-sm font-medium">
            {participant.name} {isLocal && "(You)"}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              participant.isAudioOn ? "bg-green-500" : "bg-red-500"
            }`}>
              {participant.isAudioOn ? (
                <Mic className="w-3 h-3 text-white" />
              ) : (
                <MicOff className="w-3 h-3 text-white" />
              )}
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              participant.isVideoOn ? "bg-green-500" : "bg-red-500"
            }`}>
              {participant.isVideoOn ? (
                <Video className="w-3 h-3 text-white" />
              ) : (
                <VideoOff className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Role badge */}
      <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium ${
        participant.role === 'therapist' 
          ? 'bg-blue-500 text-white' 
          : 'bg-green-500 text-white'
      }`}>
        {participant.role === 'therapist' ? 'Therapist' : 'Patient'}
      </div>
    </div>
  );

  if (!isInCall) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Simple Video Call Demo
            </CardTitle>
            <p className="text-gray-600">
              A basic demo of video calling interface
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Join as</Label>
              <select 
                id="role"
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value as "therapist" | "patient")}
                className="w-full p-2 border rounded-md"
              >
                <option value="patient">Patient</option>
                <option value="therapist">Therapist</option>
              </select>
            </div>

            <Button 
              onClick={joinCall}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Video Call
            </Button>

            <div className="text-center text-sm text-gray-500">
              💡 This is a demo interface with simulated participants
            </div>
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
            <h1 className="text-xl font-semibold text-white">Video Call Demo</h1>
          </div>
          
          <div className="flex items-center gap-4 text-white">
            <div className="text-sm flex items-center gap-1">
              <Users className="w-4 h-4" />
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </div>
            <div className="text-sm">
              {formatTime(sessionTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6">
        <div className={`grid gap-4 h-full ${
          participants.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {participants.map((participant, index) => (
            <VideoTile 
              key={participant.id} 
              participant={participant}
              isLocal={index === 0} // First participant is local user
            />
          ))}
        </div>

        {participants.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Connecting...</h3>
              <p>Waiting for participants to join</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <Button
            variant={isAudioOn ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12 p-0"
          >
            {isAudioOn ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>

          {/* Video Toggle */}
          <Button
            variant={isVideoOn ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12 p-0"
          >
            {isVideoOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Leave Call */}
          <Button
            variant="destructive"
            size="lg"
            onClick={leaveCall}
            className="ml-4 px-6"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave Call
          </Button>
        </div>
      </div>
    </div>
  );
}
