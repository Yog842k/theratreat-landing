import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Basic validation for required top-level sections and key fields
    const errors: string[] = [];
    if (!body?.personalInfo?.firstName) errors.push("firstName is required");
    if (!body?.personalInfo?.lastName) errors.push("lastName is required");
    if (!body?.personalInfo?.email) errors.push("email is required");
    if (!body?.personalInfo?.phone) errors.push("phone is required");
    if (!body?.professionalInfo?.licenseNumber) errors.push("licenseNumber is required");
    if (!body?.professionalInfo?.primarySpecialty) errors.push("primarySpecialty is required");
    if (!body?.practiceDetails?.serviceTypes || body.practiceDetails.serviceTypes.length === 0) errors.push("serviceTypes required");
  if (!body?.availability?.workingDays || body.availability.workingDays.length === 0) errors.push("workingDays required");
  // preferredHours may be multi-select array; optional, so no hard validation here
    if (!body?.location?.primaryAddress) errors.push("primaryAddress is required");
    if (!body?.agreements?.termsOfService || !body?.agreements?.privacyPolicy || !body?.agreements?.professionalConduct || !body?.agreements?.serviceAgreement) errors.push("All agreements must be accepted");

    if (errors.length) {
      return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const db = await getDb();
    const doc = {
      ...body,
      createdAt: new Date(),
      status: "pending-review",
    };
    const result = await db.collection("therapist_applications").insertOne(doc);
    return new Response(JSON.stringify({ ok: true, id: result.insertedId }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("/api/therapists/register error", err);
    return new Response(JSON.stringify({ error: err?.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
