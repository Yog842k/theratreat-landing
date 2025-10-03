"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { NavigationTabs } from "@/components/NavigationTabs";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/components/HomePage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { ViewType } from "@/constants/app-data";
import { HelpMeChoose } from "@/components/HelpMeChoose";
import PatientRegistration from "@/components/PatientRegistration";

export default function Page() {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user just completed registration
    if (searchParams.get('registered') === 'true') {
      setShowSuccessMessage(true);
      // Hide the message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, [searchParams]);

  const handleViewChange = (view: ViewType) => {
    // Handle navigation for modules that have dedicated routes
    if (view === "book") {
      router.push("/therabook");
      return;
    }
    // For other views, use the state-based system
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case "book":
        // This case should never be reached since we redirect to /therabook
        // But keep it for safety, redirect if somehow reached
        router.push("/therabook");
        return <div>Redirecting to TheraBook...</div>;
      case "help-me-choose":
        return <HelpMeChoose setCurrentView={handleViewChange} />;
      case "patient-register":
        return <PatientRegistration setCurrentView={handleViewChange} />;
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
      <main className={currentView === "home" ? "" : "max-w-7xl mx-auto px-6 py-8"}>
        {renderView()}
      </main>
      <Footer />
    </div>
    );
  }
