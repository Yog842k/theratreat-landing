import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Therapist from '@/lib/models/Therapist';
import Booking from '@/lib/models/Booking';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const therapistId = url.searchParams.get('therapistId');
    const userId = url.searchParams.get('userId');

    await connectDB();

    let therapist;
    if (therapistId) {
      let objectId;
      try {
        objectId = new (await import('mongoose')).Types.ObjectId(therapistId);
      } catch (e) {
        const msg = (e && e.message) || String(e);
        return NextResponse.json({ success: false, message: 'Invalid therapistId format', error: msg }, { status: 400 });
      }
      try {
        therapist = await Therapist.findById(objectId);
      } catch (e) {
        const msg = (e && e.message) || String(e);
        return NextResponse.json({ success: false, message: 'Error finding therapist', error: msg }, { status: 500 });
      }
    } else if (userId) {
      try {
        therapist = await Therapist.findOne({ userId });
      } catch (e) {
        const msg = (e && e.message) || String(e);
        return NextResponse.json({ success: false, message: 'Error finding therapist', error: msg }, { status: 500 });
      }
    } else {
      return NextResponse.json({ success: false, message: 'therapistId or userId required' }, { status: 400 });
    }

    if (!therapist) {
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    try {
      const sessions = await Booking.find({
        therapistId: therapist._id,
        sessionDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['confirmed', 'completed'] }
      }).sort({ sessionDate: 1 });
      return NextResponse.json({ success: true, sessions });
    } catch (e) {
      const msg = (e && e.message) || String(e);
      return NextResponse.json({ success: false, message: 'Error finding today sessions', error: msg }, { status: 500 });
    }
  } catch (error) {
    const msg = (error && error.message) || String(error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: msg }, { status: 500 });
  }
}
