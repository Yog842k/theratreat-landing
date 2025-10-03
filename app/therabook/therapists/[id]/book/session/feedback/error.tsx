'use client';

import { Button } from "@/components/ui/button";

export default function FeedbackError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Feedback Error</h2>
        <p className="text-gray-600 mb-6">We couldn&apos;t load the feedback form.</p>
        <Button onClick={reset} variant="outline">
          Try again {error.digest}
        </Button>
      </div>
    </div>
  );
}
