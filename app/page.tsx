import { Suspense } from "react";
import { HomeClientWrapper } from "./HomeClientWrapper";

export default function Page() {
  return (
    <Suspense fallback={<div />}> {/* Outer suspense (server) */}
      <HomeClientWrapper />
    </Suspense>
  );
}
