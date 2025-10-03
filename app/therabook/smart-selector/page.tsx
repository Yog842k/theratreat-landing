'use client';

import { useState } from 'react';
import { HelpMeChoose } from '@/components/HelpMeChoose';
import { ViewType } from '@/constants/app-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// This page mounts the provided smart selector (HelpMeChoose). It manages simple in-page view routing.
export default function SmartSelectorPage() {
  const [currentView, setCurrentView] = useState<ViewType>('help-me-choose');

  // Placeholder for therapist search after selection. Could be replaced with real search UI.
  if (currentView === 'therapist-search') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Matching Therapists...</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          This is a placeholder. Integrate your therapist search component here to use the selected category for filtering.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => setCurrentView('help-me-choose')} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
            Change Selection
          </Button>
          <Link href="/therabook/therapists">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              Browse Therapists
            </Button>
          </Link>
        </div>
        <Link href="/therabook" className="mt-8 text-sm text-blue-600 hover:underline">Back to TheraBook</Link>
      </div>
    );
  }

  return (
    <>
      <HelpMeChoose setCurrentView={setCurrentView} />
    </>
  );
}
