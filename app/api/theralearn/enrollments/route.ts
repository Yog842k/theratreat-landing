import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

const database = require("@/lib/database");
const AuthMiddleware = require("@/lib/middleware");
const { ResponseUtils } = require("@/lib/utils");

export async function GET(request: NextRequest) {
  try {
    const user = await AuthMiddleware.authenticate(request);

    const collection = await database.getCollection("theralearn_enrollments");
    const enrollments = await collection
      .find({ userId: new ObjectId(user._id) })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const courses: Record<string, any> = {};
    for (const e of enrollments) {
      const key = String(e.courseId);
      if (!courses[key]) {
        const course = await database.findOne("theralearn_courses", { _id: e.courseId });
        if (course) courses[key] = course;
      }
    }

    const data = enrollments.map((enrollment: any) => ({
      ...enrollment,
      course: courses[String(enrollment.courseId)] ?? null,
    }));

    return ResponseUtils.success(data, "Enrollments fetched");
  } catch (err: any) {
    return ResponseUtils.unauthorized("Unauthorized");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    const body = await request.json();
    if (!body?.courseId) return ResponseUtils.badRequest("courseId is required");

    const courseId = new ObjectId(body.courseId);
    const existing = await database.findOne("theralearn_enrollments", {
      userId: new ObjectId(user._id),
      courseId,
    });
    if (existing) return ResponseUtils.success(existing, "Already enrolled");

    const enrollment = {
      userId: new ObjectId(user._id),
      courseId,
      status: "enrolled",
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await database.insertOne("theralearn_enrollments", enrollment);
    return ResponseUtils.success({ id: result.insertedId }, "Enrolled", 201);
  } catch (err: any) {
    return ResponseUtils.unauthorized("Unauthorized");
  }
}
