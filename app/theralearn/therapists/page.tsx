export default function TheraLearnTherapistsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">TheraLearn</p>
        <h1 className="text-3xl font-bold text-slate-900">Therapists</h1>
        <p className="text-slate-600">Featured therapists, live workshops, and credentialed courses.</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {["Dr. Anika Rao", "Dr. Kabir Iyer", "Dr. Sara Kapoor"].map((name, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{name}</p>
            <p className="text-sm text-slate-600 mt-1">Webinars · Courses · Workshops</p>
            <button className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-900">View profile</button>
          </div>
        ))}
      </section>
    </main>
  );
}
