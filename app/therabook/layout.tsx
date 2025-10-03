'use client'
import { Navigation } from "@/components/Navigation";
import { NavigationTabs } from "@/components/NavigationTabs";

export default function TheraBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <NavigationTabs currentView="book" setCurrentView={() => {}} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
   