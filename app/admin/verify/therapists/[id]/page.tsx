"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Award, 
  FileText, 
  CreditCard, 
  Globe, 
  Linkedin, 
  Instagram, 
  Clock, 
  DollarSign, 
  ChevronLeft,
  ExternalLink,
  Code
} from "lucide-react";

export default function TherapistReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/therapists/${id}`);
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const json = await res.json();
        if (mounted) setData(json);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) run();
    return () => { mounted = false; };
  }, [id]);

  const approve = async () => {
    if(!confirm("Are you sure you want to APPROVE this therapist?")) return;
    await fetch(`/api/admin/therapists/${id}/approve`, { method: "POST" });
    router.replace("/admin/verify/therapists");
  };
  
  const reject = async () => {
    if(!confirm("Are you sure you want to REJECT this therapist?")) return;
    await fetch(`/api/admin/therapists/${id}/reject`, { method: "POST" });
    router.replace("/admin/verify/therapists");
  };

  const hiddenKeys = new Set(["_id", "password", "__v"]);

  // Helper to render raw JSON safely
  const renderRawValue = (val: any) => {
    if (val && typeof val === "object") {
      if (val.$oid) return <span className="text-blue-600 font-mono">{String(val.$oid)}</span>;
      if (val.$date) return <span className="text-green-600 font-mono">{String(val.$date)}</span>;
    }
    if (val === null || val === undefined) return <span className="text-slate-300">null</span>;
    if (typeof val === "boolean") return <span className={val ? "text-green-600" : "text-red-600"}>{String(val)}</span>;
    if (typeof val === "object") return <pre className="text-[10px] leading-tight text-slate-500">{JSON.stringify(val, null, 2)}</pre>;
    return <span className="text-slate-700">{String(val)}</span>;
  };

  return (
    <AdminLayout title="Therapist Review">
      <div className="min-h-screen pb-20">
        
        {/* Navigation & Actions Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-4 mb-6 shadow-sm">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href="/admin/verify/therapists" className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                 <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Review Application
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-normal border border-blue-100">
                    {id?.slice(-6)}
                  </span>
                </h1>
              </div>
            </div>
            
            <div className="flex w-full sm:w-auto gap-3">
              <button onClick={reject} className="flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button onClick={approve} className="flex-1 sm:flex-none justify-center flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 shadow-sm shadow-green-200 transition-colors">
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {loading && (
             <div className="flex items-center justify-center h-64 text-slate-500 gap-2">
               <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" /> Loading Application...
             </div>
          )}
          
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN (SIDEBAR INFO) */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <div className="px-6 pb-6 -mt-12 text-center">
                    <div className="relative inline-block">
                       {data.profilePhotoUrl || data.image ? (
                        <img src={(data.profilePhotoUrl || data.image) as string} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md bg-white" />
                      ) : (
                        <div className="h-24 w-24 rounded-full border-4 border-white shadow-md bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-slate-900">{data.fullName || data.name || "Unknown Name"}</h2>
                    <p className="text-sm text-slate-500 font-medium">{data.title || "Therapist"}</p>
                    
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                       {data.gender && <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md capitalize">{data.gender}</span>}
                       {data.currentCity && <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md flex items-center gap-1"><MapPin className="w-3 h-3"/> {data.currentCity}</span>}
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 px-6 py-4 space-y-3">
                    <ContactRow icon={Mail} label="Email" value={data.email} href={`mailto:${data.email}`} />
                    <ContactRow icon={Phone} label="Phone" value={data.phoneNumber} href={`tel:${data.phoneNumber}`} />
                    <ContactRow icon={Calendar} label="DOB" value={data.dateOfBirth} />
                    <div className="pt-2 flex gap-3 justify-center">
                       {data.linkedIn && <SocialIcon href={data.linkedIn} icon={Linkedin} />}
                       {data.website && <SocialIcon href={data.website} icon={Globe} />}
                       {data.instagram && <SocialIcon href={data.instagram} icon={Instagram} />}
                    </div>
                  </div>
                </div>

                {/* Pricing Card */}
                <SectionCard title="Pricing & Fees" icon={DollarSign}>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                        <div className="text-xs text-green-600 font-medium uppercase">Consultation</div>
                        <div className="text-lg font-bold text-green-700">
                          {data.consultationFee ? `₹${data.consultationFee}` : '—'}
                        </div>
                     </div>
                     <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
                        <div className="text-xs text-blue-600 font-medium uppercase">Session</div>
                        <div className="text-lg font-bold text-blue-700">
                           {data.sessionFee ? `₹${data.sessionFee}` : '—'}
                        </div>
                     </div>
                  </div>
                  <div className="mt-4 text-xs text-slate-500 space-y-1">
                     <div className="flex justify-between"><span>Currency:</span> <span className="font-medium text-slate-700">{data.currency || 'INR'}</span></div>
                     <div className="flex justify-between"><span>Payment Status:</span> <span className="font-medium text-slate-700">{data.registrationCompleted ? 'Completed' : 'Pending'}</span></div>
                  </div>
                </SectionCard>

                {/* Bank Details */}
                {data.bankDetails && (
                  <SectionCard title="Bank Details" icon={CreditCard}>
                    <div className="space-y-3 text-sm">
                      <DetailRow label="Bank" value={data.bankDetails.bankName} />
                      <DetailRow label="Account Holder" value={data.bankDetails.accountHolder} />
                      <DetailRow label="Account No." value={data.bankDetails.accountNumber} mono />
                      <DetailRow label="IFSC" value={data.bankDetails.ifscCode} mono />
                      <DetailRow label="UPI ID" value={data.bankDetails.upiId} />
                    </div>
                  </SectionCard>
                )}

              </div>

              {/* RIGHT COLUMN (MAIN CONTENT) */}
              <div className="lg:col-span-2 space-y-6">

                {/* Bio & Intro */}
                <SectionCard title="About & Bio" icon={User}>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {data.bio || <span className="text-slate-400 italic">No bio provided.</span>}
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                     <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">Languages</span>
                        <p className="text-sm text-slate-800 mt-1">{Array.isArray(data.preferredLanguages) ? data.preferredLanguages.join(', ') : '—'}</p>
                     </div>
                     <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase">Therapy Languages</span>
                        <p className="text-sm text-slate-800 mt-1">{Array.isArray(data.therapyLanguages) ? data.therapyLanguages.join(', ') : '—'}</p>
                     </div>
                  </div>
                </SectionCard>

                {/* Professional Details */}
                <SectionCard title="Professional Details" icon={Briefcase}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase">Specializations</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                               {Array.isArray(data.specializations) && data.specializations.length > 0 
                                  ? data.specializations.map((s: string, i: number) => <Tag key={i} text={s} color="blue" />) 
                                  : <span className="text-sm text-slate-400">—</span>}
                            </div>
                         </div>
                         <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase">Filters / Conditions</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                               {Array.isArray(data.primaryFilters) && data.primaryFilters.length > 0 
                                  ? data.primaryFilters.map((s: string, i: number) => <Tag key={i} text={s} color="slate" />) 
                                  : <span className="text-sm text-slate-400">—</span>}
                            </div>
                         </div>
                      </div>
                      <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100 h-fit">
                         <DetailRow label="Experience" value={data.experience} />
                         <DetailRow label="Workplaces" value={data.workplaces} />
                         <DetailRow label="Online Exp." value={data.onlineExperience ? "Yes" : "No"} />
                         <DetailRow label="Weekly Sessions" value={data.weeklySessions} />
                         <DetailRow label="Session Types" value={Array.isArray(data.sessionTypes) ? data.sessionTypes.join(', ') : '—'} />
                      </div>
                   </div>
                </SectionCard>

                {/* Availability */}
                <SectionCard title="Availability" icon={Clock}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 border border-slate-200 rounded-lg">
                         <span className="text-xs font-semibold text-slate-500 uppercase block mb-2">Preferred Days</span>
                         <div className="flex flex-wrap gap-1">
                            {Array.isArray(data.preferredDays) ? data.preferredDays.map((d: string) => (
                               <span key={d} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100">{d}</span>
                            )) : '—'}
                         </div>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-lg">
                         <span className="text-xs font-semibold text-slate-500 uppercase block mb-2">Time Slots</span>
                         <div className="flex flex-wrap gap-1">
                            {Array.isArray(data.preferredTimeSlots) ? data.preferredTimeSlots.map((d: string) => (
                               <span key={d} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">{d}</span>
                            )) : '—'}
                         </div>
                      </div>
                   </div>
                </SectionCard>

                {/* Documents & Credentials */}
                <SectionCard title="Documents & Credentials" icon={Award}>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Critical Docs */}
                      <DocumentLink label="License Document" url={data.licenseDocumentUrl} />
                      <DocumentLink label="Resume / CV" url={data.resumeUrl} />
                      
                      {/* Certificates List */}
                      <div className="sm:col-span-2 mt-2">
                         <span className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Qualification Certificates</span>
                         <div className="space-y-2">
                            {Array.isArray(data.qualificationCertUrls) && data.qualificationCertUrls.length > 0 ? (
                               data.qualificationCertUrls.map((u: string, i: number) => (
                                  <DocumentLink key={i} label={`Certificate ${i+1}`} url={u} small />
                               ))
                            ) : <span className="text-sm text-slate-400 italic">No certificates uploaded.</span>}
                         </div>
                      </div>

                      {/* Generic Documents Array */}
                      {Array.isArray(data.documents) && data.documents.length > 0 && (
                         <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Other Documents</span>
                            <div className="space-y-2">
                               {data.documents.map((d: any, idx: number) => (
                                  <DocumentLink key={idx} label={d.type || d.name || `Document ${idx+1}`} url={d.url || d.link} small />
                               ))}
                            </div>
                         </div>
                      )}
                   </div>
                </SectionCard>

                {/* Raw Data Inspector */}
                <div className="mt-8 pt-8 border-t border-slate-200">
                   <details className="group">
                      <summary className="flex items-center gap-2 text-sm font-medium text-slate-500 cursor-pointer hover:text-blue-600 transition-colors select-none">
                         <Code className="w-4 h-4" /> Inspect Raw JSON Data
                      </summary>
                      <div className="mt-4 bg-slate-900 rounded-lg p-4 overflow-x-auto text-xs font-mono text-slate-300 shadow-inner">
                         <div className="grid grid-cols-1 gap-y-1">
                            {Object.keys(data).filter(k => !hiddenKeys.has(k)).map(k => (
                               <div key={k} className="grid grid-cols-[150px_1fr] gap-4 border-b border-slate-800 pb-1 mb-1 last:border-0">
                                  <span className="text-blue-400 opacity-80">{k}:</span>
                                  <div className="break-all">{renderRawValue(data[k])}</div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </details>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// --- SUBCOMPONENTS ---

function SectionCard({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
         <Icon className="w-4 h-4 text-slate-400" />
         <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-5">
         {children}
      </div>
    </section>
  )
}

function ContactRow({ icon: Icon, label, value, href }: { icon: any, label: string, value: string, href?: string }) {
   if(!value) return null;
   return (
      <div className="flex items-center gap-3 text-sm">
         <div className="p-1.5 bg-slate-100 rounded text-slate-500">
            <Icon className="w-3.5 h-3.5" />
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">{label}</p>
            {href ? (
               <a href={href} className="text-slate-800 font-medium hover:text-blue-600 truncate block transition-colors">{value}</a>
            ) : (
               <p className="text-slate-800 font-medium truncate">{value}</p>
            )}
         </div>
      </div>
   )
}

function DetailRow({ label, value, mono }: { label: string, value: any, mono?: boolean }) {
   return (
      <div className="flex justify-between items-start gap-4">
         <span className="text-slate-500 shrink-0">{label}</span>
         <span className={`text-slate-900 font-medium text-right ${mono ? 'font-mono text-xs tracking-wide' : ''}`}>
            {value || <span className="text-slate-300">—</span>}
         </span>
      </div>
   )
}

function DocumentLink({ label, url, small }: { label: string, url: string, small?: boolean }) {
   if(!url) return null;
   return (
      <a 
        href={url} 
        target="_blank" 
        rel="noreferrer" 
        className={`flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group ${small ? 'py-2' : ''}`}
      >
         <div className="p-2 bg-blue-100 text-blue-600 rounded">
            <FileText className="w-4 h-4" />
         </div>
         <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700 truncate">{label}</p>
            <p className="text-xs text-slate-400 truncate">{url}</p>
         </div>
         <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
      </a>
   )
}

function Tag({ text, color }: { text: string, color: 'blue' | 'slate' }) {
   const styles = {
      blue: "bg-blue-50 text-blue-700 border-blue-100",
      slate: "bg-slate-100 text-slate-600 border-slate-200"
   }
   return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[color]}`}>
         {text}
      </span>
   )
}

function SocialIcon({ href, icon: Icon }: { href: string, icon: any }) {
   return (
      <a href={href} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200 hover:border-blue-200">
         <Icon className="w-4 h-4" />
      </a>
   )
}
