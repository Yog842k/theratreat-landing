import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Therapist from '@/lib/models/Therapist';
// Lightweight native driver helper (auto-mocks if no MONGODB_URI)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - CommonJS export
import database from '@/lib/database';

export const dynamic = 'force-dynamic';

const getApiBase = () => {
  const base = process.env.THERATREAT_API_BASE || process.env.BACKEND_API_BASE || 'http://localhost:5000/api/v1';
  return base.replace(/\/$/, '');
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const search = url.search || '';
    const target = `${getApiBase()}/therapists${search}`;

    const headers: Record<string, string> = {};
    const apiKey = process.env.API_KEY;
    if (apiKey) headers['X-API-Key'] = String(apiKey);

    // Try upstream backend first
    try {
      const upstream = await fetch(target, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });
      const data = await upstream.json().catch(() => ({}));
      if (upstream.ok) {
        return NextResponse.json(data);
      }
      // Non-200 from upstream -> fall through to local fallback
      // but carry status for context
      console.warn(`[theratreat proxy] upstream non-OK ${upstream.status}:`, data?.message || data);
    } catch (e) {
      // Network or connection error -> fall back
      console.warn('[theratreat proxy] upstream fetch failed, falling back to local DB:', (e as any)?.message || e);
    }

    // Fallback to local database (Mongoose first)
    const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(url.searchParams.get('limit') || '10', 10) || 10;
    const searchQ = url.searchParams.get('search') || '';
    const specialty = url.searchParams.get('specialty') || '';
    const location = url.searchParams.get('location') || '';
    const sessionType = url.searchParams.get('sessionType') || '';
    const sortBy = url.searchParams.get('sortBy') || 'rating';

    const q: Record<string, any> = { isActive: true };
    const or: any[] = [];
    if (searchQ) {
      or.push(
        { displayName: { $regex: searchQ, $options: 'i' } },
        { title: { $regex: searchQ, $options: 'i' } },
        { specializations: { $in: [new RegExp(searchQ, 'i')] } },
      );
    }
    if (or.length) q.$or = or;
    if (specialty) q.specializations = { $in: [new RegExp(specialty, 'i')] };
    if (location) q.location = { $regex: location, $options: 'i' };
    if (sessionType) q.sessionTypes = { $in: [new RegExp(sessionType, 'i')] };

    const sort: Record<string, 1 | -1> =
      sortBy === 'price' ? { consultationFee: 1 } :
      sortBy === 'experience' ? { experience: -1 } :
      { rating: -1 };

    const skip = (page - 1) * limit;

    // Try Mongoose
    try {
      await connectDB();
      const therapists = await Therapist.find(q)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      const totalCount = await Therapist.countDocuments(q);
      const totalPages = Math.ceil((totalCount || 0) / limit) || 1;
      return NextResponse.json({
        success: true,
        data: {
          therapists,
          pagination: {
            page,
            limit,
            totalPages,
            totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        meta: { source: 'fallback-mongoose' }
      });
    } catch (mongooseErr) {
      console.warn('[theratreat proxy] Mongoose fallback failed, trying native helper:', (mongooseErr as any)?.message || mongooseErr);
    }

    // Finally, try lightweight native helper (can be mock -> returns [])
    try {
      const therapists = await database.findMany('therapists', q, { sort, skip, limit });
      let totalCount = Array.isArray(therapists) ? therapists.length : 0;
      try {
        const coll: any = await (database as any).getCollection('therapists');
        if (coll && typeof coll.countDocuments === 'function') {
          totalCount = await coll.countDocuments(q);
        }
      } catch {}
      const totalPages = Math.ceil((totalCount || 0) / limit) || 1;
      return NextResponse.json({
        success: true,
        data: {
          therapists: therapists || [],
          pagination: {
            page,
            limit,
            totalPages,
            totalCount,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        meta: { source: 'fallback-native' }
      });
    } catch (nativeErr) {
      console.error('[theratreat proxy] native helper fallback failed:', (nativeErr as any)?.message || nativeErr);
      // If even native fails, return an empty, successful response to avoid breaking UI
      return NextResponse.json({
        success: true,
        data: { therapists: [], pagination: { page: 1, limit: 0, totalPages: 1, totalCount: 0, hasNext: false, hasPrev: false } },
        meta: { source: 'empty' }
      });
    }
  } catch (error: any) {
    const message = error?.message || String(error);
    return NextResponse.json(
      { success: false, message: 'Proxy request failed', error: message },
      { status: 500 }
    );
  }
}
