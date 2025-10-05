export const metadata = {
  title: 'Contact | TheraTreat',
  description: 'Contact TheraTreat support and general inquiries.'
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Contact Us</h1>
          <p className="text-slate-600 text-lg leading-relaxed">We'd love to hear from you. Choose the appropriate contact channel below.</p>
        </header>
        <section className="grid md:grid-cols-2 gap-6 text-sm">
          {[{h:'Patient Support',d:'Scheduling & technical issues',v:'support@theratreat.in'},{h:'Privacy & Data',d:'Privacy / data handling queries',v:'privacy@theratreat.in'},{h:'Partnerships',d:'Clinics, universities & integrators',v:'partners@theratreat.in'},{h:'Media & Press',d:'Press & media related questions',v:'media@theratreat.in'}].map((b,i)=>(
            <div key={i} className="p-5 rounded-xl bg-white border border-slate-100 shadow-sm space-y-2">
              <h3 className="font-semibold text-slate-800">{b.h}</h3>
              <p className="text-slate-500">{b.d}</p>
              <a href={`mailto:${b.v}`} className="text-blue-600 font-medium hover:underline">{b.v}</a>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
