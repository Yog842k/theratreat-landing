"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import VerificationTable from "@/components/admin/VerificationTable";

type Item = { id: string; name: string; submittedAt: string };

export default function VendorsVerifyPage() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    fetch("/api/admin/vendors/pending").then((r) => r.json()).then(setItems).catch(() => setItems([]));
  }, []);

  const onApprove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/admin/vendors/${id}/approve`, { method: "POST" });
  };
  const onReject = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/admin/vendors/${id}/reject`, { method: "POST" });
  };

  return (
    <AdminLayout title="Verify Vendors">
      <VerificationTable items={items} onApprove={onApprove} onReject={onReject} />
    </AdminLayout>
  );
}
