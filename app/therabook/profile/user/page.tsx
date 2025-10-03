"use client";

import React from "react";
import dynamic from "next/dynamic";

const UserProfilePage = dynamic(() => import("./page-sidebar"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-blue-600">Loading your profile...</p>
      </div>
    </div>
  ),
});

export default function Page() {
  return <UserProfilePage />;
}
