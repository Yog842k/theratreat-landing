const reviews = [
  { title: "Actionable and concise", body: "Quick to apply in clinic; therapist tracks were on-point." },
  { title: "Live Q&A was gold", body: "Workshops addressed niche edge cases I face weekly." },
  { title: "Great pacing", body: "Short modules and checkpoints kept me engaged." }
];

export default function TheraLearnReviewsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">TheraLearn</p>
        <h1 className="text-3xl font-bold text-slate-900">Happy Customers</h1>
        <p className="text-slate-600">Testimonials from therapists, patients, and students.</p>
      </header>
      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-base font-semibold text-slate-900">{r.title}</p>
            <p className="text-sm text-slate-600 mt-2 leading-snug">{r.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
