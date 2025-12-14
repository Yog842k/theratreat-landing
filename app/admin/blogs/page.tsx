"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import BlogManager from "@/components/admin/BlogManager";

type Blog = { id: string; title: string; slug: string; published: boolean };

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  useEffect(() => {
    fetch("/api/admin/blogs").then((r) => r.json()).then(setBlogs).catch(() => setBlogs([]));
  }, []);

  return (
    <AdminLayout title="Manage Blogs">
      <BlogManager initialBlogs={blogs} />
    </AdminLayout>
  );
}
