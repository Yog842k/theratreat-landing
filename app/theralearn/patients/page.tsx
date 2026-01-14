export default function TheraLearnPatientsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">TheraLearn</p>
        <h1 className="text-3xl font-bold text-slate-900">Patients</h1>
        <p className="text-slate-600">Patient-focused webinars, seminars, and guided videos.</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {["Managing Chronic Pain", "Post-op Recovery", "Mental Wellness"].map((title, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            <p className="text-sm text-slate-600 mt-1">Sessions, handouts, and Q&A.</p>
            <button className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-900">Open track</button>
          </div>
        ))}
      </section>
    </main>
  );
}
