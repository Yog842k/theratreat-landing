"use client";
import React from 'react';

interface VideoCallDashboardProps {
  userRole: string;
  userId: string;
}

// Placeholder implementation to satisfy import; extend with real logic as needed.
export default function VideoCallDashboard({ userRole, userId }: VideoCallDashboardProps) {
  return (
    <div className="p-4 border rounded bg-white text-sm text-gray-700">
      <p className="font-semibold mb-2">Video Call Dashboard</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>User Role: {userRole}</li>
        <li>User ID: {userId}</li>
        <li>Status: Placeholder component</li>
      </ul>
    </div>
  );
}
