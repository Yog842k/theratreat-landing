"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import VerificationTable from "@/components/admin/VerificationTable";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; submittedAt: string };

export default function TherapistsVerifyPage() {
  const [items, setItems] = useState<Item[]>([]);
  const router = useRouter();
  async function load() {
    try {
      const r = await fetch("/api/admin/therapists/pending", { cache: "no-store" });
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
  }
  useEffect(() => { load(); }, []);

  const onApprove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/admin/therapists/${id}/approve`, { method: "POST" });
    await load();
  };
  const onReject = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/admin/therapists/${id}/reject`, { method: "POST" });
    await load();
  };

  const onView = (id: string) => {
    router.push(`/admin/verify/therapists/${id}`);
  };

  return (
    <AdminLayout title="Verify Therapists">
      <VerificationTable items={items} onApprove={onApprove} onReject={onReject} onView={onView} />
    </AdminLayout>
  );
}
