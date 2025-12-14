"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import VerificationTable from "@/components/admin/VerificationTable";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string; submittedAt: string };

export default function ClinicsVerifyPage() {
  const [items, setItems] = useState<Item[]>([]);
  const router = useRouter();
  useEffect(() => {
    fetch("/api/admin/clinics/pending").then((r) => r.json()).then(setItems).catch(() => setItems([]));
  }, []);

  const onApprove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/admin/clinics/${id}/approve`, { method: "POST" });
  };
  const onView = (id: string) => {
    router.push(`/admin/verify/clinics/${id}`);
  };
  const onReject = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/admin/clinics/${id}/reject`, { method: "POST" });
  };

  return (
    <AdminLayout title="Verify Clinics">
      <VerificationTable items={items} onApprove={onApprove} onReject={onReject} onView={onView} />
    </AdminLayout>
  );
}
