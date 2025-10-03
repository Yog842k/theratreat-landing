"use client";

import { useState, useCallback } from "react";
import { HMSRoomProvider } from "@100mslive/react-sdk";
import JoinSessionForm from "@/components/video-call/JoinSessionForm";
import TherapyRoom from "@/components/video-call/TherapyRoom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Video, ArrowLeft, CheckCircle, AlertCircle, Users, Shield } from "lucide-react";
import Link from "next/link";

interface User {
  name: string;
  role: "therapist" | "patient";
  sessionId: string;
}

export default function SecureTherapyVideoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoom, setShowRoom] = useState(false);

  const generateAuthToken = async (userId: string, role: "therapist" | "patient", roomId?: string) => {
    try {
      const response = await fetch("/api/100ms-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          role: role,
          room_id: roomId || "default-therapy-room",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate authentication token");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Token generation error:", error);
      throw error;
    }
  };

  const handleJoinSession = useCallback(async (
    name: string, 
    role: "therapist" | "patient", 
    sessionId?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!name.trim()) {
        throw new Error("Name is required");
      }

      const userId = `${role}_${name.replace(/\s+/g, "_")}_${Date.now()}`;
      const finalSessionId = sessionId?.trim() || "default-therapy-room";
      
      const token = await generateAuthToken(userId, role, finalSessionId);
      
      setUser({
        name: name.trim(),
        role,
        sessionId: finalSessionId,
      });
      
      setAuthToken(token);
      setShowRoom(true);
      
    } catch (err) {
      console.error("Join session error:", err);
      setError(err instanceof Error ? err.message : "Failed to join session");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLeaveSession = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    setError(null);
    setShowRoom(false);
  }, []);

  const quickJoinDemo = async (role: "therapist" | "patient", demoName: string) => {
    await handleJoinSession(demoName, role, "demo-therapy-session");
  };

  // Show therapy room if user has joined
  if (showRoom && user && authToken) {
    return (
      <HMSRoomProvider authToken={authToken}>
        <TherapyRoom
          onLeave={handleLeaveSession}
          sessionId={user.sessionId}
          userName={user.name}
          userRole={user.role}
        />
      </HMSRoomProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/therabook" className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to TheraBook
            </Link>
            <div className="text-sm text-gray-500">
              Secure Therapy Video Calls
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mx-auto w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6">
            <Video className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TheraBook Video Calling
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Secure, HIPAA-compliant video therapy sessions with professional-grade features designed for healthcare providers.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-xl">HIPAA Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                End-to-end encryption, secure data handling, and compliance with healthcare privacy regulations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-xl">Professional Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Therapist controls, session recording, waiting rooms, and patient management features.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="text-center">
              <Video className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <CardTitle className="text-xl">HD Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Crystal clear video and audio with adaptive quality based on network conditions.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Demo and Join Options */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Quick Demo */}
          <Card className="shadow-xl border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Video className="w-6 h-6" />
                Try Demo Session
              </CardTitle>
              <CardDescription>
                Experience the system instantly with pre-configured demo accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Button 
                  onClick={() => quickJoinDemo("therapist", "Dr. Sarah Wilson")} 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Joining..." : "🩺 Join as Therapist"}
                </Button>
                
                <Button 
                  onClick={() => quickJoinDemo("patient", "Alex Johnson")} 
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 py-3"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Joining..." : "👤 Join as Patient"}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Demo Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• HD video and audio calling</li>
                  <li>• Real-time session controls</li>
                  <li>• Role-based permissions</li>
                  <li>• Professional interface</li>
                </ul>
              </div>

              <div className="mt-4 text-center text-sm text-gray-500">
                💡 Open in multiple tabs to simulate therapist + patient
              </div>
            </CardContent>
          </Card>

          {/* Custom Session */}
          <Card className="shadow-xl border-2 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Users className="w-6 h-6" />
                Join Custom Session
              </CardTitle>
              <CardDescription>
                Enter your details and session information to join a therapy session
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <JoinSessionForm
                onJoin={handleJoinSession}
                isLoading={isLoading}
                error={error}
              />
            </CardContent>
          </Card>
        </div>

        {/* System Requirements */}
        <Card className="mt-16">
          <CardHeader>
            <CardTitle>System Requirements & Security</CardTitle>
            <CardDescription>
              Built for healthcare professionals with enterprise-grade security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-3 text-blue-700">Browser Support</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Chrome 80+</li>
                  <li>✅ Safari 14+</li>
                  <li>✅ Firefox 75+</li>
                  <li>✅ Edge 80+</li>
                  <li>✅ Mobile browsers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-green-700">Security Features</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>🔒 End-to-end encryption</li>
                  <li>🏥 HIPAA compliant</li>
                  <li>🔑 Token-based authentication</li>
                  <li>🛡️ SOC 2 Type II certified</li>
                  <li>📊 Audit logs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-purple-700">Professional Features</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>👨‍⚕️ Therapist host controls</li>
                  <li>⏺️ Session recording</li>
                  <li>⏳ Waiting room</li>
                  <li>📱 Mobile responsive</li>
                  <li>🔧 Custom integrations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
