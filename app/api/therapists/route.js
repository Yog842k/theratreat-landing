import connectDB from '@/lib/mongodb';
import Therapist from '@/lib/models/Therapist';
import { NextResponse } from 'next/server';
// Fallback lightweight DB (auto-mocks when no MONGODB_URI)
import database from '@/lib/database';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    // Primary path: use Mongoose (fast paths, population, etc.)
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const specialization = searchParams.get('specialization');
    const searchQ = searchParams.get('search') || searchParams.get('q') || '';
    const minRating = parseFloat(searchParams.get('minRating')) || 0;
    const maxFee = parseFloat(searchParams.get('maxFee'));
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const featuredOnly = searchParams.get('featured') === 'true' || searchParams.get('featured') === '1';

  // Broad query: do not force isActive=true to be compatible with legacy data
  const query = {};
  if (specialization) query.specializations = { $in: [new RegExp(specialization, 'i')] };
  if (searchQ) {
    const rx = new RegExp(searchQ, 'i');
    query.$or = [
      { displayName: { $regex: rx } },
      { fullName: { $regex: rx } },
      { name: { $regex: rx } },
      { title: { $regex: rx } },
      { specializations: { $in: [rx] } },
    ];
  }
    if (featuredOnly) query.featured = true;
    if (minRating > 0) query.rating = { $gte: minRating };
    if (maxFee) query.consultationFee = { $lte: maxFee };

    const skip = (page - 1) * limit;
    const sort = {};
    if (featuredOnly) {
      // Put curated order first, fallback to rating
      sort.featuredOrder = 1;
      sort.rating = -1;
    } else if (sortBy === 'rating') sort.rating = sortOrder;
    else if (sortBy === 'experience') sort.experience = sortOrder;
    else if (sortBy === 'fee') sort.consultationFee = sortOrder;
    else sort[sortBy] = sortOrder;

    const therapists = await Therapist.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

  const totalCount = await Therapist.countDocuments(query);
  // Minimal debug for visibility in server logs
    console.log(`[api/therapists] mongoose found: ${therapists.length}/${totalCount}`);
    const emptyReason = (therapists.length === 0 && totalCount === 0)
      ? await (async () => {
          // Attempt a quick heuristic to guide debugging
          const anyDoc = await Therapist.findOne({}).select('_id').lean();
          if (anyDoc) return 'filtered-out';
          return 'no-therapists-in-collection';
        })()
      : undefined;
    const totalPages = Math.ceil(totalCount / limit);

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
      meta: {
        source: 'mongoose',
        emptyReason
      }
    });
  } catch (error) {
    // Fallback path: use lightweight DB helper which safely mocks when URI missing
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page')) || 1;
      const limit = parseInt(searchParams.get('limit')) || 10;
      const specialization = searchParams.get('specialization');
      const searchQ = searchParams.get('search') || searchParams.get('q') || '';
      const minRating = parseFloat(searchParams.get('minRating')) || 0;
      const maxFee = parseFloat(searchParams.get('maxFee'));
      const sortBy = searchParams.get('sortBy') || 'rating';
      const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
      const featuredOnly = searchParams.get('featured') === 'true' || searchParams.get('featured') === '1';

    const query = {};
    if (specialization) query.specializations = { $in: [new RegExp(specialization, 'i')] };
    if (searchQ) {
      const rx = new RegExp(searchQ, 'i');
      query.$or = [
        { displayName: { $regex: rx } },
        { fullName: { $regex: rx } },
        { name: { $regex: rx } },
        { title: { $regex: rx } },
        { specializations: { $in: [rx] } },
      ];
    }
      if (featuredOnly) query.featured = true;
      if (minRating > 0) query.rating = { $gte: minRating };
      if (maxFee) query.consultationFee = { $lte: maxFee };

      const skip = (page - 1) * limit;
      const sort = {};
      if (featuredOnly) {
        sort.featuredOrder = 1;
        sort.rating = -1;
      } else if (sortBy === 'rating') sort.rating = sortOrder;
      else if (sortBy === 'experience') sort.experience = sortOrder;
      else if (sortBy === 'fee') sort.consultationFee = sortOrder;
      else sort[sortBy] = sortOrder;

      // Use helper (this will auto-fallback to mock DB if no MONGODB_URI)
  const therapists = await database.findMany('therapists', query, { sort, skip, limit });

      // Try to get an accurate count when possible, else fall back to current page length
      let totalCount = Array.isArray(therapists) ? therapists.length : 0;
      try {
        const coll = await database.getCollection('therapists');
        if (typeof coll?.countDocuments === 'function') {
          totalCount = await coll.countDocuments(query);
        }
      } catch (_) {
        // ignore, keep fallback count
      }
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / limit));
  console.log(`[api/therapists] fallback found: ${(therapists||[]).length}/${totalCount}`);

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
        meta: { source: 'fallback-db', primaryError: error?.message }
      });
    } catch (fallbackErr) {
      console.error('Get therapists error (fallback failed):', fallbackErr);
      console.error('Primary error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch therapists' },
        { status: 500 },
      );
    }
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { displayName, title, specializations, experience, consultationFee, userId } = body;
    if (!displayName || !title || !specializations || !experience || !consultationFee || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const existing = await Therapist.findOne({ userId });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Therapist profile already exists for this user' },
        { status: 400 },
      );
    }

    const therapist = await Therapist.create({
      userId,
      displayName,
      title,
      specializations: Array.isArray(specializations) ? specializations : [specializations],
      experience,
      consultationFee,
      ...body,
    });

    return NextResponse.json({ success: true, data: { therapist } }, { status: 201 });
  } catch (error) {
    console.error('Create therapist error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create therapist profile' },
      { status: 500 },
    );
  }
}
