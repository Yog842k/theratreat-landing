const faqs = [
  { q: "Do I get certificates?", a: "Courses and workshops issue completion certificates." },
  { q: "Are sessions live or recorded?", a: "We mix live cohorts with on-demand recordings; each card shows its format." },
  { q: "Can clinics enroll teams?", a: "Yes, request team access and we will provision seats with reporting." }
];

export default function TheraLearnFaqsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">TheraLearn</p>
        <h1 className="text-3xl font-bold text-slate-900">FAQs</h1>
        <p className="text-slate-600">Common questions about courses, cohorts, and certificates.</p>
      </header>
      <section className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {faqs.map((f, i) => (
          <details key={i} className="p-4 group" open={i === 0}>
            <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold text-slate-900 list-none">
              <span>{f.q}</span>
              <span className="text-xs text-slate-500 group-open:hidden">Show</span>
              <span className="text-xs text-slate-500 hidden group-open:inline">Hide</span>
            </summary>
            <p className="pt-2 text-sm text-slate-600 leading-snug">{f.a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
