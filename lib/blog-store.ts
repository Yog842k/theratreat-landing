// Lightweight in-memory blog store used by API routes
// In production, replace with a real database.

export type BlogStatus = "draft" | "published" | "scheduled";

export type Blog = {
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

// Start empty; populate via admin dashboard. Add seed data here if you need demo entries.
let blogStore: Blog[] = [];

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function getAllBlogs(): Blog[] {
  return blogStore.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getPublishedBlogs(): Blog[] {
  return getAllBlogs().filter((b) => b.status === "published");
}

export function getBlogBySlug(slug: string): Blog | null {
  const all = getAllBlogs();
  return all.find((b) => b.slug === slug) || null;
}

export function addBlog(input: Omit<Blog, "id" | "updatedAt">): Blog {
  const blog: Blog = {
    ...input,
    id: makeId(),
    updatedAt: new Date().toISOString(),
  };
  blogStore = [blog, ...blogStore];
  return blog;
}

export function updateBlog(id: string, patch: Partial<Blog>): Blog | null {
  let updated: Blog | null = null;
  blogStore = blogStore.map((b) => {
    if (b.id !== id) return b;
    updated = { ...b, ...patch, updatedAt: new Date().toISOString() };
    return updated;
  });
  return updated;
}

export function deleteBlog(id: string): boolean {
  const before = blogStore.length;
  blogStore = blogStore.filter((b) => b.id !== id);
  return blogStore.length < before;
}
