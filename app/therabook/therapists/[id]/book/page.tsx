"use client";

import React from "react";
import { useParams } from "next/navigation";
import { TherapyBookingEnhanced } from "@/components/therabook/TherapyBookingEnhanced";

export default function BookingPage() {
  const routeParams = useParams();
  const id = Array.isArray(routeParams?.id)
    ? (routeParams?.id?.[0] as string)
    : ((routeParams?.id as string) || "");

  return <TherapyBookingEnhanced therapistId={id} />;
}