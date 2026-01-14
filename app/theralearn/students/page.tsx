export default function TheraLearnStudentsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">TheraLearn</p>
        <h1 className="text-3xl font-bold text-slate-900">Students</h1>
        <p className="text-slate-600">Student-oriented webinars, seminars, and practice material.</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {["Clinical Foundations", "Case Studies", "Licensing Prep"].map((title, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-sm text-slate-600 mt-1">Cohorts, recordings, and notes.</p>
            <button className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-900">Open track</button>
          </div>
        ))}
      </section>
    </main>
  );
}
