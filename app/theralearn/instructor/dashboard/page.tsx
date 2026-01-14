"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/NewAuthContext";

type WebinarItem = {
  _id: string;
  title: string;
  startTime?: string;
  status?: string;
};

export default function InstructorDashboardPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const [webinars, setWebinars] = useState<WebinarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !isAuthenticated) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/theralearn/webinars?mine=true", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Could not load webinars");
        }
        setWebinars(Array.isArray(data.data) ? data.data : []);
      } catch (err: any) {
        setError(err?.message || "Could not load webinars");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, isAuthenticated]);

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-orange-600 font-semibold">TheraLearn</p>
            <h1 className="text-3xl font-bold text-slate-900">Instructor Dashboard</h1>
            <p className="text-slate-600">Manage your webinars and launch new sessions.</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/theralearn/instructor/webinars/new"
              className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-white font-semibold shadow-sm hover:bg-slate-900 transition"
            >
              Schedule Webinar
            </a>
            <a
              href="/theralearn/instructor/courses/new"
              className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-orange-700 transition"
            >
              Add Course
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">My Webinars</h2>
            {loading && <span className="text-xs text-slate-500">Loading…</span>}
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
          {(!webinars || webinars.length === 0) && !loading ? (
            <p className="text-sm text-slate-500">No webinars yet. Schedule one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="text-slate-500 border-b">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Start</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {webinars.map((w) => (
                    <tr key={w._id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-semibold text-slate-900">{w.title}</td>
                      <td className="py-2 pr-4 text-slate-600">{w.startTime ? new Date(w.startTime).toLocaleString() : "—"}</td>
                      <td className="py-2 pr-4 text-slate-600">{w.status || "scheduled"}</td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-3 text-sm">
                          <a className="text-orange-600 hover:underline" href={`/theralearn/webinars/${w._id}`}>View</a>
                          <a className="text-slate-700 hover:underline" href={`/theralearn/webinars/${w._id}/room`}>Join as host</a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
