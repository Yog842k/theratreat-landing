'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Mic, MicOff,  PhoneOff, Settings, MessageSquare, Clock } from "lucide-react";
import { useParams } from "next/navigation";


interface SessionPageProps {}

const mockSession = {
  therapist: {
    name: "Dr. Sarah Johnson",
    title: "Clinical Psychologist",
    image: "/api/placeholder/100/100",
  },
  session: {
    type: "Video Call",
    startTime: "2:00 PM",
    duration: "50 minutes",
    remainingTime: "45:30",
  }
};

export default function SessionPage({}: SessionPageProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [timeRemaining] = useState("45:30");
  const routeParams = useParams();
  const id = Array.isArray(routeParams?.id) ? (routeParams?.id?.[0] as string) : ((routeParams?.id as string) || "");

  useEffect(() => {
    // Simulate session timer
    const timer = setInterval(() => {
      // Timer logic would go here
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleJoinSession = () => {
    setSessionStarted(true);
  };

  const handleEndSession = () => {
    window.location.href = `/therabook/therapists/${id}/book/session/feedback`;
  };

  if (!sessionStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Join Session</h1>
          <p className="text-gray-600 mb-8">
            Your session with Dr. Johnson is ready to begin
          </p>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={mockSession.therapist.image} alt={mockSession.therapist.name} />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{mockSession.therapist.name}</h3>
                  <p className="text-sm text-gray-600">{mockSession.therapist.title}</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Session Type:</span>
                  <Badge variant="outline">{mockSession.session.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Start Time:</span>
                  <span className="text-sm font-medium">{mockSession.session.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium">{mockSession.session.duration}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleJoinSession} className="w-full" size="lg">
                  <Video className="w-5 h-5 mr-2" />
                  Join Session
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Make sure you&apos;re in a quiet, private space before joining
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={mockSession.therapist.image} alt={mockSession.therapist.name} />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-white font-semibold">{mockSession.therapist.name}</h2>
            <p className="text-gray-300 text-sm">Session in progress</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{timeRemaining}</span>
          </div>
          <Badge variant="destructive" className="animate-pulse">
            LIVE
          </Badge>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        {/* Therapist Video (Main) */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <Avatar className="w-32 h-32 mx-auto mb-4">
              <AvatarImage src={mockSession.therapist.image} alt={mockSession.therapist.name} />
              <AvatarFallback className="text-4xl">SJ</AvatarFallback>
            </Avatar>
            <p className="text-white text-xl font-semibold">{mockSession.therapist.name}</p>
            <p className="text-gray-300">Video would appear here</p>
          </div>
        </div>

        {/* Your Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-semibold">You</span>
              </div>
              <p className="text-white text-sm">Your video</p>
            </div>
          </div>
        </div>

        {/* Chat Panel (if needed) */}
        <div className="absolute top-4 left-4 w-80 max-h-96 bg-gray-800 rounded-lg p-4 hidden">
          <h3 className="text-white font-semibold mb-2">Session Notes</h3>
          <div className="space-y-2">
            <p className="text-gray-300 text-sm">Private notes area...</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isAudioOn ? "default" : "destructive"}
            size="lg"
            className="w-14 h-14 rounded-full"
            onClick={() => setIsAudioOn(!isAudioOn)}
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="lg"
            className="w-14 h-14 rounded-full"
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full"
          >
            <Settings className="w-6 h-6" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-14 h-14 rounded-full"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="px-8"
            onClick={handleEndSession}
          >
            <PhoneOff className="w-5 h-5 mr-2" />
            End Session
          </Button>
        </div>

        <p className="text-center text-gray-400 text-xs mt-4">
          This session is private and secure. Recording is not allowed without consent.
        </p>
      </div>
    </div>
  );
}
