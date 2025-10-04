export const metadata = { title: 'Contact | TheraTreat' };

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-slate-600 max-w-2xl">Have a question about bookings, accounts, or partnerships? Reach our support team and we will respond promptly.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[{l:'Support Email',v:'support@theratreat.in'},{l:'Helpline',v:'+91 80000 00000'},{l:'Hours',v:'9 AM – 8 PM IST (Mon–Sat)'}].map((c,i)=>(
            <div key={i} className="p-5 rounded-xl bg-white shadow border border-slate-100">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{c.l}</p>
              <p className="font-medium text-slate-800">{c.v}</p>
            </div>
          ))}
        </div>
        <form className="mt-4 grid gap-4 bg-white p-6 rounded-xl shadow border border-slate-100 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input required name="name" pattern="^[A-Za-z ]{2,60}$" title="Only letters and spaces" className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input required type="email" name="email" className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea required name="message" minLength={10} maxLength={1000} className="w-full border rounded-md px-3 py-2 h-32 resize-y focus:ring-2 focus:ring-blue-200" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">Send</button>
        </form>
      </div>
    </main>
  );
}
