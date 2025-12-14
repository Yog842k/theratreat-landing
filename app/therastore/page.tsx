"use client";
import React, { Suspense } from "react";
import TheraStoreHome from "@/components/therastore/TheraStoreHome";

export default function TheraStoreHomePage() {
  return (
    <Suspense>
      <TheraStoreHome />
    </Suspense>
  );
}