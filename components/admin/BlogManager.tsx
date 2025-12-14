"use client";
import React, { useState } from "react";

type Blog = { id: string; title: string; slug: string; published: boolean };

export default function BlogManager({ initialBlogs }: { initialBlogs: Blog[] }) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const addBlog = () => {
    if (!title || !slug) return;
    const newBlog = { id: Math.random().toString(36).slice(2), title, slug, published: false };
    setBlogs((prev) => [newBlog, ...prev]);
    setTitle("");
    setSlug("");
    // TODO: POST /api/admin/blogs
  };

  const togglePublish = (id: string) => {
    setBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, published: !b.published } : b)));
    // TODO: PATCH /api/admin/blogs/:id
  };

  const removeBlog = (id: string) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    // TODO: DELETE /api/admin/blogs/:id
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-md border border-gray-300 px-3 py-2" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" className="rounded-md border border-gray-300 px-3 py-2" />
          <button onClick={addBlog} className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Add Blog</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {blogs.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 text-sm text-gray-900">{b.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{b.slug}</td>
                <td className="px-4 py-3 text-sm">{b.published ? "Published" : "Draft"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => togglePublish(b.id)} className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">Toggle Publish</button>
                    <button onClick={() => removeBlog(b.id)} className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
