import Link from "next/link";
import { notFound } from "next/navigation";

async function fetchBlog(slug: string) {
  const baseEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const res = await fetch(`${baseEnv}/api/blogs/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);
  if (!blog) return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-6">
        <Link href="/therablogs" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to TheraBlogs</Link>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-blue-600">{blog.category || "TheraBlogs"}</p>
            <h1 className="text-3xl font-bold text-slate-900">{blog.title}</h1>
            <div className="flex gap-3 text-sm text-slate-500">
              <span>{new Date(blog.updatedAt || Date.now()).toLocaleDateString()}</span>
              {blog.readTime && <span>• {blog.readTime}</span>}
              {blog.author && <span>• By {blog.author}</span>}
            </div>
          </div>

          {blog.coverImage && (
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-100">
              <img src={blog.coverImage} alt={blog.title} className="w-full h-auto object-cover" />
            </div>
          )}

          <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">{blog.content || blog.summary}</p>
        </article>
      </div>
    </div>
  );
}
