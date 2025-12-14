"use client";
import React from "react";

export default function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
