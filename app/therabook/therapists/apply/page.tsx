
"use client";
import React from "react";
import TherapistRegistration from "@/components/therabook/TherapistRegistration";
import { useRouter } from "next/navigation";

export default function TherapistApplicationPage() {
  const router = useRouter();
  const setCurrentView = (view: any) => {
    if (view === "therapist-dashboard") {
      router.push("/therabook/profile/therapist");
    }
  };
  return <TherapistRegistration setCurrentView={setCurrentView} />;
}
