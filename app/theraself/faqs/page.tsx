"use client";

export default function TheraSelfFaqsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">FAQs</h1>
      <div className="space-y-3">
        {[1,2,3].map((i)=> (
          <details key={i} className="border border-gray-100 rounded-xl p-4">
            <summary className="font-semibold text-gray-900">Question {i}</summary>
            <p className="text-sm text-gray-600 mt-2">Answer content explaining the process.</p>
          </details>
        ))}
      </div>
    </main>
  );
}
