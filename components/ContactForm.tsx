"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export const ContactForm: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!form.name || !form.email || !form.message) {
      setStatus({ type: "error", message: "Please fill in name, email, and message." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit");
      setStatus({ type: "success", message: "Thanks! Your message has been received." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-white rounded-xl shadow p-8 max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Send Us a Message</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-blue-200 rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full border border-blue-200 rounded px-3 py-2"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Phone (optional)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full border border-blue-200 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Subject (optional)</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full border border-blue-200 rounded px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="w-full border border-blue-200 rounded px-3 py-2"
            rows={4}
            required
          />
        </div>
        {status?.type && (
          <div
            className={
              status.type === "success"
                ? "text-green-700 bg-green-50 border border-green-200 rounded p-3"
                : "text-red-700 bg-red-50 border border-red-200 rounded p-3"
            }
          >
            {status.message}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-full px-8 py-3 font-bold shadow hover:bg-blue-700 transition"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </motion.form>
  );
};
