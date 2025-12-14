"use client";
import React, { useState } from "react";

type TestItem = { id: string; name: string; status: "idle" | "running" | "passed" | "failed" };

export default function TheraSelfTestsPanel({ initialTests }: { initialTests: TestItem[] }) {
  const [tests, setTests] = useState<TestItem[]>(initialTests);

  const runTest = (id: string) => {
    setTests((prev) => prev.map((t) => (t.id === id ? { ...t, status: "running" } : t)));
    setTimeout(() => {
      setTests((prev) => prev.map((t) => (t.id === id ? { ...t, status: Math.random() > 0.2 ? "passed" : "failed" } : t)));
    }, 1000);
    // TODO: POST /api/admin/theraself/tests/run
  };

  return (
    <div className="space-y-3">
      {tests.map((t) => (
        <div key={t.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
          <div>
            <div className="text-sm font-medium text-gray-900">{t.name}</div>
            <div className="text-xs text-gray-600">Status: {t.status}</div>
          </div>
          <button onClick={() => runTest(t.id)} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">Run</button>
        </div>
      ))}
    </div>
  );
}
