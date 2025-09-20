"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, RefreshCw, Mail, ClipboardList, Search, ChevronLeft, ChevronRight, Copy } from "lucide-react";

type ContactItem = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
};

type TherapistItem = {
  _id: string;
  createdAt: string;
  status?: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  professionalInfo?: {
    licenseNumber?: string;
    primarySpecialty?: string;
  };
  practiceDetails?: {
    serviceTypes?: string[];
  };
  location?: {
    primaryAddress?: string;
  };
};

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [stored, setStored] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [therapists, setTherapists] = useState<TherapistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"contacts" | "therapists">("contacts");
  const [tSearch, setTSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const k = localStorage.getItem("admin_key");
    if (k) {
      setStored(k);
      setKey(k);
    }
  }, []);

  const hasKey = useMemo(() => (key?.length || 0) > 0, [key]);

  async function fetchData() {
    if (!hasKey) return;
    setLoading(true);
    setError(null);
    try {
      const [cRes, tRes] = await Promise.all([
        fetch("/api/contact", { headers: { "x-admin-key": key } }),
        fetch("/api/therapists", { headers: { "x-admin-key": key } }),
      ]);
      const cJson = await cRes.json();
      const tJson = await tRes.json();
      if (!cRes.ok) throw new Error(cJson?.error || "Failed to load contacts");
      if (!tRes.ok) throw new Error(tJson?.error || "Failed to load therapists");
      setContacts(cJson.items || []);
      setTherapists(tJson.items || []);
    } catch (e: any) {
      setError(e?.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  }

  function saveKey() {
    if (key) localStorage.setItem("admin_key", key);
  }

  function clearKey() {
    localStorage.removeItem("admin_key");
    setStored(null);
    setKey("");
    setContacts([]);
    setTherapists([]);
  }

  const filteredTherapists = useMemo(() => {
    const q = tSearch.trim().toLowerCase();
    if (!q) return therapists;
    return therapists.filter((t) => {
      const name = [t.personalInfo?.firstName, t.personalInfo?.lastName].filter(Boolean).join(" ").toLowerCase();
      const email = (t.personalInfo?.email || "").toLowerCase();
      const phone = (t.personalInfo?.phone || "").toLowerCase();
      const specialty = (t.professionalInfo?.primarySpecialty || "").toLowerCase();
      const services = (t.practiceDetails?.serviceTypes || []).join(",").toLowerCase();
      return (
        name.includes(q) || email.includes(q) || phone.includes(q) || specialty.includes(q) || services.includes(q)
      );
    });
  }, [therapists, tSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredTherapists.length / pageSize));
  const pagedTherapists = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTherapists.slice(start, start + pageSize);
  }, [filteredTherapists, page]);

  useEffect(() => {
    setPage(1);
  }, [tSearch]);

  function formatKey(key: string) {
    return key
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  function isObject(val: any) {
    return val !== null && typeof val === "object" && !Array.isArray(val);
  }

  function RenderTree({ data }: { data: any }) {
    if (data === null || data === undefined) return <div className="text-gray-500">—</div>;
    if (Array.isArray(data)) {
      if (data.length === 0) return <div className="text-gray-500">[]</div>;
      return (
        <ul className="list-disc pl-5 space-y-1">
          {data.map((item, idx) => (
            <li key={idx}>
              {isObject(item) ? (
                <div className="border-l-2 border-slate-200 pl-3 mt-1">
                  <RenderTree data={item} />
                </div>
              ) : (
                String(item)
              )}
            </li>
          ))}
        </ul>
      );
    }
    if (isObject(data)) {
      const entries = Object.entries(data as Record<string, any>).sort((a, b) => a[0].localeCompare(b[0]));
      if (entries.length === 0) return <div className="text-gray-500">{`{}`}</div>;
      return (
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k}>
              <div className="text-gray-500 text-xs mb-1">{formatKey(k)}</div>
              {isObject(v) || Array.isArray(v) ? (
                <div className="border-l-2 border-slate-200 pl-3">
                  <RenderTree data={v} />
                </div>
              ) : (
                <div className="break-words">{String(v)}</div>
              )}
            </div>
          ))}
        </div>
      );
    }
    return <div>{String(data)}</div>;
  }

  return (
    <div className="mt-15 max-w-6xl mx-auto px-6 py-10">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-indigo-700 border-indigo-200">
          <ShieldCheck className="w-4 h-4" />
          Admin Panel (Private)
        </div>
        <h1 className="mt-3 text-3xl font-bold">TheraTreat Admin</h1>
        <p className="text-gray-600">View therapist registrations and contact submissions</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Access</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter admin key"
            className="w-full sm:w-80 rounded-md border px-3 py-2"
          />
          <div className="flex gap-2">
            <button
              onClick={saveKey}
              className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm"
            >Save</button>
            <button
              onClick={fetchData}
              disabled={!hasKey || loading}
              className="rounded-md border px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={clearKey}
              className="rounded-md border px-4 py-2 text-sm"
            >Clear</button>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          className={`px-3 py-2 rounded-md border text-sm ${activeTab === "contacts" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"}`}
          onClick={() => setActiveTab("contacts")}
        >Contacts <Badge variant="outline" className="ml-2">{contacts.length}</Badge></button>
        <button
          className={`px-3 py-2 rounded-md border text-sm ${activeTab === "therapists" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"}`}
          onClick={() => setActiveTab("therapists")}
        >Therapists <Badge variant="outline" className="ml-2">{therapists.length}</Badge></button>
      </div>

      {activeTab === "contacts" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-700" /> Contact Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[520px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-left">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">Subject</th>
                    <th className="py-2 pr-3">Message</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c._id} className="border-t">
                      <td className="py-2 pr-3">{c.name}</td>
                      <td className="py-2 pr-3">{c.email}</td>
                      <td className="py-2 pr-3">{c.phone || "-"}</td>
                      <td className="py-2 pr-3">{c.subject || "-"}</td>
                      <td className="py-2 pr-3 max-w-[280px] truncate" title={c.message}>{c.message}</td>
                      <td className="py-2">{new Date(c.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {contacts.length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-gray-500">No data. Enter key and Refresh.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "therapists" && (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-700" /> Therapist Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Search name, email, phone, specialty, services"
                    value={tSearch}
                    onChange={(e) => setTSearch(e.target.value)}
                  />
                </div>
                <div className="text-sm text-gray-600">{filteredTherapists.length} results</div>
              </div>
            </CardContent>
          </Card>

          {/* Card list showing full details */}
          <div className="grid gap-4">
            {pagedTherapists.map((t) => {
              const name = [t.personalInfo?.firstName, t.personalInfo?.lastName].filter(Boolean).join(" ") || "-";
              return (
                <Card key={t._id} className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex flex-wrap items-center gap-3 justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{name}</span>
                        {t.professionalInfo?.primarySpecialty && (
                          <span className="text-xs rounded-full border px-2 py-0.5 text-gray-700">
                            {t.professionalInfo.primarySpecialty}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(t, null, 2))}
                          className="rounded-md border px-2 py-1 text-xs flex items-center gap-1"
                          title="Copy JSON"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy JSON
                        </button>
                        <span className="text-xs text-gray-600">{new Date(t.createdAt).toLocaleString()}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700">
                    <RenderTree data={t} />
                  </CardContent>
                </Card>
              );
            })}

            {filteredTherapists.length === 0 && (
              <Card><CardContent className="py-8 text-center text-gray-500">No results. Try adjusting your search or Refresh.</CardContent></Card>
            )}
          </div>

          {/* Pagination */}
          {filteredTherapists.length > 0 && (
            <div className="flex items-center justify-center gap-3">
              <button
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <button
                className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
