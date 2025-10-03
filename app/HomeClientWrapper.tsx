"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const HomeRootClient = dynamic(() => import("@/components/HomeRootClient"), {
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-sm text-gray-500">Loading home experience…</div>
    </div>
  ),
});

export function HomeClientWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-sm text-gray-500">Preparing page…</div>
        </div>
      }
    >
      <HomeRootClient />
    </Suspense>
  );
}
