const categories = [
  { title: "Neuro Rehab", meta: "12 modules" },
  { title: "Pediatrics", meta: "6 live sessions" },
  { title: "Mental Health", meta: "8 recordings" },
  { title: "Sports Physio", meta: "10 modules" },
  { title: "Geriatrics", meta: "5 seminars" }
];

export default function TheraLearnCategoriesPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">TheraLearn</p>
        <h1 className="text-3xl font-bold text-slate-900">Course Categories</h1>
        <p className="text-slate-600">Browse therapist-focused categories with live and recorded options.</p>
      </header>
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {categories.map((cat, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{cat.title}</p>
            <p className="text-xs text-slate-500 mt-1">{cat.meta}</p>
            <p className="text-sm text-slate-600 mt-2">Includes assessments, checkpoints, and optional live touchpoints.</p>
          </div>
        ))}
      </section>
    </main>
  );
}
