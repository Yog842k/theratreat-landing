"use client";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  CalendarClock,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  Tag,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";

type BlogStatus = "draft" | "published" | "scheduled";

type AdminBlog = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  content: string;
  status: BlogStatus;
  updatedAt: string;
  scheduledFor?: string;
  author?: string;
};

type NewBlogForm = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  content: string;
  scheduledFor: string;
  author?: string;
};

type ApiBlog = Partial<{
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  content: string;
  published: boolean;
  status: BlogStatus;
  updatedAt: string;
  scheduledFor: string;
  author: string;
}>;

const emptyForm: NewBlogForm = {
  title: "",
  slug: "",
  summary: "",
  category: "General",
  tags: [],
  coverImage: "",
  readTime: "",
  content: "",
  scheduledFor: "",
};

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const normalizeBlog = (payload: ApiBlog): AdminBlog => {
  const id = payload.id || makeId();
  return {
    id,
    title: payload.title || "Untitled post",
    slug: payload.slug || `draft-${id.slice(0, 6)}`,
    summary: payload.summary || payload.content?.slice(0, 120) || "",
    category: payload.category || "General",
    tags: payload.tags || [],
    coverImage: payload.coverImage || "",
    readTime: payload.readTime || "",
    content: payload.content || "",
    status: (payload.status as BlogStatus) || (payload.published ? "published" : "draft") || "draft",
    updatedAt: payload.updatedAt || new Date().toISOString(),
    scheduledFor: payload.scheduledFor,
    author: payload.author || "Admin",
  };
};

export default function AdminTheraBlogsPage() {
  const [form, setForm] = useState<NewBlogForm>(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch("/api/admin/blogs")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ApiBlog[]) => {
        if (!alive) return;
        const safeData = Array.isArray(data) ? data : [];
        setBlogs(safeData.map(normalizeBlog));
      })
      .catch(() => alive && setBlogs([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: blogs.length,
      published: blogs.filter((b) => b.status === "published").length,
      drafts: blogs.filter((b) => b.status === "draft").length,
      scheduled: blogs.filter((b) => b.status === "scheduled").length,
    }),
    [blogs]
  );

  const updateForm = (key: keyof NewBlogForm, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    updateForm("tags", Array.from(new Set([...form.tags, value])));
    setTagInput("");
  };

  const handleCoverImage = (file: File | null) => {
    if (!file) {
      updateForm("coverImage", "");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateForm("coverImage", reader.result?.toString() || "");
    };
    reader.readAsDataURL(file);
  };

  const removeTag = (tag: string) => {
    updateForm(
      "tags",
      form.tags.filter((t) => t !== tag)
    );
  };

  const handleSubmit = async (status: BlogStatus) => {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setError("Title, slug, and content are required.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      status,
      scheduledFor: status === "scheduled" ? form.scheduledFor : undefined,
    };
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save blog");
      setBlogs((prev) => [normalizeBlog(json as ApiBlog), ...prev]);
      setForm(emptyForm);
      setTagInput("");
    } catch (e: any) {
      setError(e?.message || "Unable to save blog");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (id: string) => {
    const target = blogs.find((b) => b.id === id);
    if (!target) return;
    const nextStatus: BlogStatus = target.status === "published" ? "draft" : "published";
    setBlogs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item
      )
    );
    await fetch(`/api/admin/blogs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    }).catch(() => {});
  };

  const removeBlog = async (id: string) => {
    setBlogs((prev) => prev.filter((item) => item.id !== id));
    await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <AdminLayout title="TheraBlogs uploads">
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total posts" value={stats.total} />
          <StatCard label="Published" value={stats.published} tone="success" />
          <StatCard label="Drafts" value={stats.drafts} tone="muted" />
          <StatCard label="Scheduled" value={stats.scheduled} tone="warning" />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-600">Upload</p>
                <h2 className="text-xl font-semibold text-slate-900">Create a TheraBlog post</h2>
                <p className="text-sm text-slate-600">
                  Fill in the essentials and push to draft, schedule, or publish immediately.
                </p>
              </div>
              {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" aria-label="Loading blogs" />}
            </div>

            {error && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Title" value={form.title} onChange={(v) => updateForm("title", v)} placeholder="TheraBlog headline" />
              <InputField label="Slug" value={form.slug} onChange={(v) => updateForm("slug", v)} placeholder="therablogs-title" />
              <InputField label="Summary" value={form.summary} onChange={(v) => updateForm("summary", v)} placeholder="Optional short teaser" fullWidth />
              <InputField label="Category" value={form.category} onChange={(v) => updateForm("category", v)} placeholder="General, Release notes, Therapy tips" />
              <InputField label="Read time" value={form.readTime} onChange={(v) => updateForm("readTime", v)} placeholder="e.g. 6 min read" />
              <div>
                <label className="text-sm font-medium text-slate-800">Cover image</label>
                <div className="mt-1 flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCoverImage(e.target.files?.[0] || null)}
                    className="text-sm text-slate-700"
                  />
                  {form.coverImage && (
                    <span className="text-xs text-blue-700 underline cursor-pointer" onClick={() => updateForm("coverImage", "")}>Clear</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800">Tags</label>
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                    <Tag className="h-3.5 w-3.5" />
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-slate-500 hover:text-slate-800">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag and press Enter"
                  className="min-w-[160px] flex-1 bg-transparent px-2 py-1 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-800">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => updateForm("content", e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                placeholder="Write or paste your blog content here..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Schedule (optional)"
                value={form.scheduledFor}
                onChange={(v) => updateForm("scheduledFor", v)}
                placeholder="YYYY-MM-DD hh:mm"
                type="datetime-local"
              />
              <div className="rounded-lg border border-dashed border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <UploadCloud className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Assets</p>
                    <p className="text-xs text-slate-600">Attach hero image or files via the cover image URL for now.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save as draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("published")}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Publish now
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("scheduled")}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
              >
                <CalendarClock className="h-4 w-4" />
                Schedule
              </button>
            </div>
          </div>

          <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Preview</p>
                <p className="text-xs text-slate-600">Snapshot of the post metadata.</p>
              </div>
            </div>
            <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{form.title || "Post title"}</p>
              <p className="text-xs text-slate-600">{form.summary || "Short description for TheraBlogs cards."}</p>
              <div className="flex flex-wrap gap-2">
                <Badge tone="info">{form.category || "Category"}</Badge>
                {form.readTime && <Badge tone="muted">{form.readTime}</Badge>}
                {form.tags.map((tag) => (
                  <Badge key={tag} tone="accent">{tag}</Badge>
                ))}
              </div>
              <div className="rounded-md border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                {form.coverImage ? form.coverImage : "Cover image URL will appear here."}
              </div>
            </div>
            <div className="space-y-2 rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">API wiring</p>
              <p>
                Hook POST/PATCH/DELETE calls to /api/admin/blogs to persist the uploads. Current view keeps state in memory for prototyping.
              </p>
            </div>
          </aside>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent uploads</h3>
              <p className="text-sm text-slate-600">Manage drafts, scheduled posts, and published articles.</p>
            </div>
            <FileText className="h-5 w-5 text-blue-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Updated</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td className="px-6 py-3 font-medium text-slate-900">{blog.title}</td>
                    <td className="px-6 py-3 text-slate-600">{blog.slug}</td>
                    <td className="px-6 py-3 text-slate-600">{blog.category}</td>
                    <td className="px-6 py-3">
                      <StatusPill status={blog.status} />
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {new Date(blog.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => togglePublish(blog.id)}
                          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          {blog.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlog(blog.id)}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!blogs.length && !loading && (
                  <tr>
                    <td className="px-6 py-6 text-center text-sm text-slate-500" colSpan={6}>
                      No posts yet. Add your first TheraBlog above.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-center text-sm text-slate-500" colSpan={6}>
                      Loading existing posts...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "success" | "warning" | "muted" }) {
  const toneMap: Record<"default" | "success" | "warning" | "muted", string> = {
    default: "bg-blue-50 text-blue-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    muted: "bg-slate-50 text-slate-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2">
        <span className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-sm font-semibold ${toneMap[tone]}`}>{value}</span>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  fullWidth,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <label className="text-sm font-medium text-slate-800">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}

function Badge({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "muted" | "accent" }) {
  const toneClasses: Record<"info" | "muted" | "accent", string> = {
    info: "bg-blue-50 text-blue-700 border border-blue-100",
    muted: "bg-slate-100 text-slate-700 border border-slate-200",
    accent: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{children}</span>;
}

function StatusPill({ status }: { status: BlogStatus }) {
  const color =
    status === "published"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
      : status === "scheduled"
      ? "bg-amber-50 text-amber-700 border border-amber-100"
      : "bg-slate-100 text-slate-700 border border-slate-200";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{status}</span>;
}
