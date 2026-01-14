import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

const database = require("@/lib/database");
const AuthMiddleware = require("@/lib/middleware");
const { ResponseUtils } = require("@/lib/utils");
const { USER_ROLES } = require("@/utils/constants");

function validateCourse(payload: any) {
  const required = ["title", "category", "level", "duration"];
  const missing = required.filter((k) => !payload?.[k]);
  if (missing.length > 0) {
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }
}

export async function GET() {
  const collection = await database.getCollection("theralearn_courses");
  const courses = await collection.find({}).sort({ createdAt: -1 }).limit(100).toArray();

  return ResponseUtils.success(courses, "Courses fetched");
}

export async function POST(request: NextRequest) {
  const user = await AuthMiddleware.requireRole(request, [USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN]);
  const body = await request.json();
  validateCourse(body);

  const doc = {
    title: String(body.title).trim(),
    category: String(body.category).trim(),
    level: String(body.level).trim(),
    duration: String(body.duration).trim(),
    type: body.type ?? "Course",
    description: body.description ?? "",
    tags: Array.isArray(body.tags) ? body.tags : [],
    skills: Array.isArray(body.skills) ? body.skills : [],
    outline: Array.isArray(body.outline) ? body.outline : [],
    chapters: Array.isArray(body.chapters) ? body.chapters : [],
    notes: Array.isArray(body.notes) ? body.notes : [],
    price: body.price ?? null,
    status: body.status ?? "draft",
    modules: body.modules ?? (Array.isArray(body.chapters) ? body.chapters.length : 0),
    certificate: Boolean(body.certificate),
    liveSession: Boolean(body.liveSession),
    instructorId: new ObjectId(user._id),
    instructor: body.instructor ?? `${user.name ?? "Instructor"}`,
    instructorRole: body.instructorRole ?? "Instructor",
    rating: 0,
    ratingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await database.insertOne("theralearn_courses", doc);
  return ResponseUtils.success({ id: result.insertedId }, "Course created", 201);
}
