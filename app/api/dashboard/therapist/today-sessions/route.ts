import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Therapist from '@/lib/models/Therapist';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const therapistId = url.searchParams.get('therapistId');
    const userId = url.searchParams.get('userId');
    console.log('Received identifiers:', { therapistId, userId });

    await connectDB();

    // Resolve therapist
    let therapist;
    if (therapistId) {
      let objectId;
      try {
        objectId = new (await import('mongoose')).Types.ObjectId(therapistId);
      } catch (e) {
        const msg = (e as any)?.message ?? String(e);
        console.error('Invalid therapistId format:', therapistId, msg);
        return NextResponse.json({ success: false, message: 'Invalid therapistId format', error: msg }, { status: 400 });
      }
      try {
        therapist = await Therapist.findById(objectId);
      } catch (e) {
        const msg = (e as any)?.message ?? String(e);
        console.error('Error finding therapist by _id:', msg);
        return NextResponse.json({ success: false, message: 'Error finding therapist', error: msg }, { status: 500 });
      }
    } else if (userId) {
      try {
        therapist = await Therapist.findOne({ userId });
      } catch (e) {
        const msg = (e as any)?.message ?? String(e);
        console.error('Error finding therapist by userId:', msg);
        return NextResponse.json({ success: false, message: 'Error finding therapist', error: msg }, { status: 500 });
      }
    } else {
      return NextResponse.json({ success: false, message: 'therapistId or userId required' }, { status: 400 });
    }

    if (!therapist) {
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    // Find today's sessions for the therapist
    let sessions = [];
    try {
      sessions = await Booking.find({
        therapistId: therapist._id,
        sessionDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['confirmed', 'completed'] }
      })
      .populate({ path: 'clientId', select: 'name email' })
      .sort({ sessionDate: 1 });
    } catch (e) {
      const msg = (e as any)?.message ?? String(e);
      console.error('Error finding today sessions:', msg);
      return NextResponse.json({ success: false, message: 'Error finding today sessions', error: msg }, { status: 500 });
    }
    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    const msg = (error as any)?.message ?? String(error);
    console.error('Today sessions error:', msg);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: msg },
      { status: 500 }
    );
  }
}
