import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Therapist from '@/lib/models/Therapist';
import Booking from '@/lib/models/Booking';
import TherapistEarning from '@/lib/models/TherapistEarning';

export async function GET(request: NextRequest) {
  try {
    // Accept therapistId or userId; resolve therapist from either
    const url = new URL(request.url);
    const therapistId = url.searchParams.get('therapistId');
    const userId = url.searchParams.get('userId');
    console.log('Received identifiers:', { therapistId, userId });

    await connectDB();

    // Resolve therapist document
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
    // Get stats
    let totalSessions = 0, completedSessions = 0, upcomingSessions = 0, cancelledSessions = 0;
    try {
      const tid = therapist._id;
      totalSessions = await Booking.countDocuments({ therapistId: tid });
      completedSessions = await Booking.countDocuments({ therapistId: tid, status: 'completed' });
      upcomingSessions = await Booking.countDocuments({ therapistId: tid, status: 'confirmed' });
      cancelledSessions = await Booking.countDocuments({ therapistId: tid, status: 'cancelled' });
    } catch (e) {
      const msg = (e as any)?.message ?? String(e);
      console.error('Error counting bookings:', msg);
      return NextResponse.json({ success: false, message: 'Error counting bookings', error: msg }, { status: 500 });
    }
    // Earnings aggregation (defensive: wrap in try so stats still return if this fails)
    let totalEarnings = 0, availableEarnings = 0, last30Days = 0;
    try {
      const tid = therapist._id;
      const earnings = await TherapistEarning.aggregate([
        { $match: { therapistId: tid } },
        { $group: { _id: '$status', sum: { $sum: '$amount' } } }
      ]);
      for (const row of earnings) {
        totalEarnings += row.sum || 0;
        if (row._id === 'available') availableEarnings = row.sum || 0;
      }
      const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000);
      const last30 = await TherapistEarning.aggregate([
        { $match: { therapistId: tid, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } }
      ]);
      last30Days = last30?.[0]?.sum || 0;
    } catch (e) {
      console.warn('Earnings aggregation warning:', (e as any)?.message);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalSessions,
        completedSessions,
        upcomingSessions,
        cancelledSessions,
        rating: therapist.rating,
        reviewCount: therapist.reviewCount,
        totalEarnings,
        availableEarnings,
        last30DaysEarnings: last30Days,
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
  } catch (error) {
    const msg = (error as any)?.message ?? String(error);
    console.error('Dashboard stats error:', msg);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: msg },
      { status: 500 }
    );
  }
}
