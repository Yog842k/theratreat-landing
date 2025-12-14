"use client";

export default function TheraSelfResourcesPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      <section className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-2xl font-bold">Pinned Articles (Therablogs)</h2>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>Understanding Attention Symptoms in Kids</li>
          <li>Managing Anxiety: Techniques and Tools</li>
          <li>Depression: When to Seek Help</li>
        </ul>
      </section>
      <section className="bg-white border border-gray-100 rounded-2xl p-6">
        <h2 className="text-2xl font-bold">Videos & Workshops (Theralearn)</h2>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>Parent Workshop: Building Focus Routines</li>
          <li>Mindfulness Basics for Anxiety</li>
          <li>Exercise Plan for Mood Support</li>
        </ul>
      </section>
    </main>
  );
}
