import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Therapist from '@/lib/models/Therapist';
import Booking from '@/lib/models/Booking';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const therapistId = url.searchParams.get('therapistId');
    const userId = url.searchParams.get('userId');
    const dateParam = url.searchParams.get('date');

    await connectDB();

    // Resolve therapist document
    let therapist;
    if (therapistId) {
      try {
        const objectId = new (await import('mongoose')).Types.ObjectId(therapistId);
        therapist = await Therapist.findById(objectId);
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        console.error('Invalid therapistId:', msg);
        return NextResponse.json({ success: false, message: 'Invalid therapistId', error: msg }, { status: 400 });
      }
    } else if (userId) {
      try {
        therapist = await Therapist.findOne({ userId });
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        console.error('Error finding therapist by userId:', msg);
        return NextResponse.json({ success: false, message: 'Error finding therapist', error: msg }, { status: 500 });
      }
    } else {
      return NextResponse.json({ success: false, message: 'therapistId or userId required' }, { status: 400 });
    }

    if (!therapist) {
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }

    // Compute day range
    const day = dateParam ? new Date(dateParam) : new Date();
    if (Number.isNaN(day.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid date' }, { status: 400 });
    }
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    // Fetch bookings for the day
    let bookings: any[] = [];
    try {
      bookings = await Booking.find({
        therapistId: therapist._id,
        sessionDate: { $gte: start, $lt: end },
        status: { $in: ['pending', 'confirmed', 'rescheduled', 'completed'] }
      })
        .populate({ path: 'clientId', select: 'name email' })
        .sort({ sessionDate: 1 })
        .lean();
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      console.error('Error fetching scheduled sessions:', msg);
      return NextResponse.json({ success: false, message: 'Error fetching sessions', error: msg }, { status: 500 });
    }

    const sessions = bookings.map((b) => ({
      _id: b._id,
      patientName: b.clientId?.name || 'Patient',
      patientEmail: b.clientId?.email || '',
      sessionDate: b.sessionDate,
      sessionTime: b.sessionTime,
      sessionType: b.sessionType,
      status: b.status,
      amount: b.amount,
      meetingLink: b.meetingLink,
    }));

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    const msg = (error as any)?.message ?? String(error);
    console.error('Scheduled sessions error:', msg);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: msg },
      { status: 500 }
    );
  }
}
