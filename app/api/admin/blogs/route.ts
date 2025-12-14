import { NextResponse } from "next/server";

let mockBlogs = [
  { id: "b1", title: "Starting Therapy: A Guide", slug: "starting-therapy-guide", published: true },
  { id: "b2", title: "Mindfulness Basics", slug: "mindfulness-basics", published: false },
];

export async function GET() {
  return NextResponse.json(mockBlogs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newBlog = { id: Math.random().toString(36).slice(2), ...body, published: false };
  mockBlogs = [newBlog, ...mockBlogs];
  return NextResponse.json(newBlog, { status: 201 });
}
