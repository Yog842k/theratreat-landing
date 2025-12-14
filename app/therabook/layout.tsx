'use client'

export default function TheraBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation tabs merged into main Navigation; removed duplicate */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
