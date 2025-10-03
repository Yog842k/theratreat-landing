import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Therapist from '@/lib/models/Therapist';
// @ts-ignore CommonJS export
import database from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result: any = { mongoose: {}, native: {} };
  // Try Mongoose
  try {
    await connectDB();
    const count = await Therapist.countDocuments({});
    const sample = await Therapist.findOne({});
    result.mongoose = {
      connected: true,
      therapistsCount: count,
      sampleId: sample?._id?.toString?.() || null,
    };
  } catch (e: any) {
    result.mongoose = { connected: false, error: e?.message || String(e) };
  }

  // Try native helper (may be mock)
  try {
    const coll: any = await (database as any).getCollection('therapists');
    const list = await coll.find({}).limit?.(1)?.toArray?.() ?? await coll.find({}).toArray();
    let total = 0;
    if (typeof coll.countDocuments === 'function') {
      total = await coll.countDocuments({});
    } else {
      const all = await (database as any).findMany('therapists', {});
      total = all.length;
    }
    result.native = {
      mocked: (database as any).mock === true,
      therapistsCount: total,
      sampleId: list?.[0]?._id?.toString?.() || null,
    };
  } catch (e: any) {
    result.native = { error: e?.message || String(e) };
  }

  return NextResponse.json({ success: true, data: result });
}
