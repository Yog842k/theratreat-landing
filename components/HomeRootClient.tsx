"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { NavigationTabs } from "@/components/NavigationTabs";
import { HomePage } from "@/components/HomePage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { ViewType } from "@/constants/app-data";
import { HelpMeChoose } from "@/components/HelpMeChoose";
import PatientRegistration from "@/components/PatientRegistration";

// NOTE: This component encapsulates all client-side hooks including useSearchParams
// so that the top-level app/page.tsx can remain a Server Component with a Suspense boundary

export default function HomeRootClient() {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setShowSuccessMessage(true);
      const t = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const handleViewChange = (view: ViewType) => {
    // Route-aware views that should navigate to dedicated (or coming soon) pages
    switch (view) {
      case "book":
        router.push("/therabook");
        return;
      case "self-test":
        router.push("/theraself");
        return;
      case "store":
        router.push("/therastore");
        return;
      case "learn":
        router.push("/theralearn");
        return;
      case "therapists":
        router.push("/therapists");
        return;
      case "blog":
        router.push("/blog");
        return;
      default:
        setCurrentView(view);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "help-me-choose":
        return <HelpMeChoose setCurrentView={handleViewChange} />;
      case "patient-register":
        return <PatientRegistration setCurrentView={handleViewChange} />;
      case "book":
        router.push("/therabook");
        return <div>Redirecting to TheraBook...</div>;
      default:
        return <HomePage setCurrentView={handleViewChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <NavigationTabs currentView={currentView} setCurrentView={handleViewChange} />
      {showSuccessMessage && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Welcome to TheraTreat! Your account has been created successfully. You can now start booking therapy sessions and exploring our platform.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <main className={currentView === "home" ? "" : "max-w-7xl mx-auto px-6 py-8"}>{renderView()}</main>
    </div>
  );
}
