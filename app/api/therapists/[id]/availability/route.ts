import { NextRequest, NextResponse } from 'next/server';
const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ObjectId } = require('mongodb');
const { getAvailabilityForDate, upsertWeeklyAvailability, blockSlot } = require('@/lib/availability');

const toObjectId = (v: string) => {
  try { return new ObjectId(v); } catch { return v; }
};

/**
 * GET /api/therapists/[id]/availability
 * Query params: date=YYYY-MM-DD (required)
 * Returns merged availability (weekly schedule - bookings - busy blocks)
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json({ success: false, message: 'Date parameter is required' }, { status: 400 });
    }

    const requestedDate = new Date(dateParam);
    if (Number.isNaN(requestedDate.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date format' }, { status: 400 });
    }

    // Verify therapist exists (accept both therapist _id and userId)
    const therapist = await database.findOne('therapists', { _id: toObjectId(id) })
      || await database.findOne('therapists', { userId: toObjectId(id) });

    if (!therapist) {
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }

    const scheduleOwnerId = therapist._id?.toString() || id;
    const result = await getAvailabilityForDate(scheduleOwnerId, dateParam);

    return NextResponse.json({
      success: true,
      data: {
        availability: result.availability,
        nextAvailable: result.nextAvailable,
        date: result.date,
        therapistId: scheduleOwnerId,
      }
    });
  } catch (error: any) {
    console.error('[availability] Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch availability', error: error?.message }, { status: 500 });
  }
}

/**
 * POST /api/therapists/[id]/availability
 * Body: { weekly: [{ day, start, end, enabled }], timezone?, blocks?: [{ date, time, note }] }
 * Auth: therapist only (owner of the profile)
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await AuthMiddleware.requireRole(request, ['therapist']);
    const body = await request.json();
    const weekly = Array.isArray(body.weekly) ? body.weekly : [];
    const timezone = body.timezone || 'Asia/Kolkata';
    const blocks = Array.isArray(body.blocks) ? body.blocks : [];

    // Ensure the authenticated therapist is updating their own schedule
    const ownedTherapist = await database.findOne('therapists', { $or: [{ _id: toObjectId(id) }, { userId: toObjectId(user._id) }] });
    if (!ownedTherapist) {
      return NextResponse.json({ success: false, message: 'You can only update your own availability' }, { status: 403 });
    }

    await upsertWeeklyAvailability(ownedTherapist._id, weekly, timezone, { updatedBy: user._id });

    // Optional manual blocks (outside therapy commitments)
    for (const block of blocks) {
      if (!block?.date || !block?.time) continue;
      await blockSlot({ therapistId: ownedTherapist._id, date: block.date, time: block.time, source: 'manual', note: block.note || '' });
    }

    const refreshed = await getAvailabilityForDate(ownedTherapist._id, blocks?.[0]?.date || weekly?.[0]?.day || new Date());

    return NextResponse.json({ success: true, data: { availability: refreshed.availability, timezone } });
  } catch (error: any) {
    console.error('[availability][POST] Error:', error);
    const status = /permission/i.test(error?.message || '') ? 403 : 500;
    return NextResponse.json({ success: false, message: 'Failed to update availability', error: error?.message }, { status });
  }
}

