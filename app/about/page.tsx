export const metadata = {
  title: 'About | TheraTreat'
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-slate-900">About TheraTreat</h1>
        <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
          TheraTreat is a comprehensive healthcare platform bringing together therapy, rehabilitation,
          self-care learning, and assistive product access under one secure, patient-first ecosystem.
          We help individuals connect with qualified therapists across multiple specializations including
          psychology, physiotherapy, occupational therapy, speech therapy, ABA and more.
        </p>
        <section className="grid md:grid-cols-3 gap-6">
          {[{h:'Mission',t:'Improve access, trust and outcomes in therapy & rehab.'},{h:'Quality',t:'Only verified & credentialed providers are listed.'},{h:'Security',t:'Privacy-first, DPDP aligned, encryption in transit & at rest.'}].map((b,i)=>(
            <div key={i} className="p-6 rounded-xl bg-white shadow border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-2">{b.h}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{b.t}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
