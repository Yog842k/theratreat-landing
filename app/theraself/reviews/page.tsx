"use client";

export default function TheraSelfReviewsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Reviews</h1>
      <div className="space-y-3">
        {[1,2].map((i)=> (
          <div key={i} className="border border-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-900 font-semibold">User {i}</p>
            <p className="text-sm text-gray-600">Helpful screening and clear next steps.</p>
          </div>
        ))}
      </div>
    </main>
  );
}
