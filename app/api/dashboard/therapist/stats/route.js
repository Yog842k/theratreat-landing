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

    try {
      const tid = therapist._id;
      const totalSessions = await Booking.countDocuments({ therapistId: tid });
      const completedSessions = await Booking.countDocuments({ therapistId: tid, status: 'completed' });
      const upcomingSessions = await Booking.countDocuments({ therapistId: tid, status: 'confirmed' });
      const cancelledSessions = await Booking.countDocuments({ therapistId: tid, status: 'cancelled' });

      return NextResponse.json({
        success: true,
        stats: {
          totalSessions,
          completedSessions,
          upcomingSessions,
          cancelledSessions,
          rating: therapist.rating,
          reviewCount: therapist.reviewCount,
        },
        therapist: {
          displayName: therapist.displayName,
          title: therapist.title,
          specializations: therapist.specializations,
          experience: therapist.experience,
          languages: therapist.languages,
          location: therapist.location,
          bio: therapist.bio,
          image: therapist.image,
          isVerified: therapist.isVerified,
        }
      });
    } catch (e) {
      const msg = (e && e.message) || String(e);
      return NextResponse.json({ success: false, message: 'Error counting bookings', error: msg }, { status: 500 });
    }
  } catch (error) {
    const msg = (error && error.message) || String(error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: msg }, { status: 500 });
  }
}
