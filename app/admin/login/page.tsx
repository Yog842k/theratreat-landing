"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginContent />
    </Suspense>
  );
}

function AdminLoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = (params?.get && params.get("next")) || "/admin";

  useEffect(() => {
    // If already has the cookie via client-side check, redirect
    // Note: We can't read httpOnly cookies, but we can attempt a lightweight probe.
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const expected = process.env.NEXT_PUBLIC_ADMIN_PANEL_PASS || "123@theratreat";
      if (password !== expected) {
        setError("Invalid admin password.");
        setLoading(false);
        return;
      }
      // Set cookie and redirect
      // Use client-side cookie set; server will validate in middleware
      document.cookie = `tt_admin_pass=${expected}; path=/; max-age=${60 * 60 * 12}`; // 12 hours
      router.replace(next);
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow rounded p-6">
        <h1 className="text-xl font-semibold mb-4">Admin Access</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter the admin password to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              placeholder="Enter admin password"
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm" role="alert">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded px-3 py-2 hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Validating…" : "Unlock Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
