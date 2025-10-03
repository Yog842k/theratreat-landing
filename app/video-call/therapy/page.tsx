"use client";

import { useState, useCallback } from "react";
import { HMSRoomProvider } from "@100mslive/react-sdk";
import JoinSessionForm from "@/components/video-call/JoinSessionForm";
import TherapyRoom from "@/components/video-call/TherapyRoom";

interface User {
  name: string;
  role: "therapist" | "patient";
  sessionId: string;
}

export default function TherapyVideoCallPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          room_id: roomId,
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
      // Validate inputs
      if (!name.trim()) {
        throw new Error("Name is required");
      }
      
      if (!sessionId?.trim()) {
        throw new Error("Session ID is required");
      }

      // Generate unique user ID
      const userId = `${role}_${name.replace(/\s+/g, "_")}_${Date.now()}`;
      
      // Get authentication token from 100ms
      const token = await generateAuthToken(userId, role, sessionId);
      
      // Store user data
      setUser({
        name: name.trim(),
        role,
        sessionId: sessionId.trim(),
      });
      
      setAuthToken(token);
      
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
  }, []);

  // If user hasn't joined yet, show join form
  if (!user || !authToken) {
    return (
      <JoinSessionForm
        onJoin={handleJoinSession}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // User has joined, show the therapy room
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
