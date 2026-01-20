import Link from "next/link";

export const dynamic = "force-dynamic";

type Blog = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  content: string;
  status: "draft" | "published" | "scheduled";
  updatedAt: string;
  scheduledFor?: string;
  author?: string;
};

async function fetchBlogs(): Promise<Blog[]> {
  const baseEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` ||
    "http://localhost:3000";

  const url = `${baseEnv}/api/blogs`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Failed to fetch blogs", e);
    return [];
  }
}

export default async function TheraBlogsPage() {
  const posts = await fetchBlogs();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-sm font-semibold text-blue-600">TheraBlogs</p>
          <h1 className="text-4xl font-bold text-slate-900">Insights, stories, and research</h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            A curated hub for clinical updates, therapy tips, case studies, and platform news.
          </p>
        </header>

        {posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-5 text-center text-sm text-slate-600">
            No published blogs yet. Add one from the admin dashboard to see it here.
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">Cover image</div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                  {post.category || "General"}
                </span>
              </div>
              <div className="space-y-3 px-5 py-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{new Date(post.updatedAt || Date.now()).toLocaleDateString()}</span>
                  {post.readTime && <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{post.readTime}</span>
                  </>}
                </div>
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700">{post.title}</h2>
                <p className="text-sm text-slate-600">{post.summary || post.content?.slice(0, 140)}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>By {post.author || "TheraTreat"}</span>
                  {post.slug ? (
                    <Link href={`/therablogs/${post.slug}`} className="text-blue-600 font-semibold hover:text-blue-700">
                      Read
                    </Link>
                  ) : (
                    <span className="text-slate-400">No slug</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
