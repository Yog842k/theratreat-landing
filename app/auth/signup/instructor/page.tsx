"use client";

import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { InstructorRegistration } from "@/components/theralearn/InstructorRegistration";

export default function InstructorSignupPage() {
  const router = useRouter();

  return (
    <Suspense fallback={<div className="min-h-screen" />}> {/* client-only form */}
      <InstructorRegistration
        onComplete={() => router.push("/theralearn/instructor/dashboard")}
        setCurrentView={() => router.push("/theralearn/instructor/dashboard")}
      />
    </Suspense>
  );
}
