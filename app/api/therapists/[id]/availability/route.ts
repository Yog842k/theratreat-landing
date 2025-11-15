import { NextRequest, NextResponse } from 'next/server';
const database = require('@/lib/database');
const { ObjectId } = require('mongodb');

/**
 * GET /api/therapists/[id]/availability
 * Returns available time slots for a therapist on a specific date
 * Only blocks slots when:
 * 1. Therapist is not available (based on their schedule)
 * 2. Another booking already exists at that time
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { success: false, message: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Parse the date
    const requestedDate = new Date(dateParam);
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = requestedDate.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    // Find therapist by ID (try both therapistProfileId and userId)
    let therapist = null;
    try {
      // Try to find in therapists collection first
      therapist = await database.findOne('therapists', { _id: new ObjectId(id) });
      
      // If not found, try to find by userId
      if (!therapist) {
        const user = await database.findOne('users', { _id: new ObjectId(id) });
        if (user && user.userType === 'therapist') {
          therapist = await database.findOne('therapists', { userId: new ObjectId(id) });
        }
      }
    } catch (e) {
      console.error('[availability] Error finding therapist:', e);
    }

    if (!therapist) {
      return NextResponse.json(
        { success: false, message: 'Therapist not found' },
        { status: 404 }
      );
    }

    // Get therapist's availability schedule for this day
    const therapistAvailability = therapist.availability || [];
    const daySchedule = therapistAvailability.find((avail: any) => 
      avail.day?.toLowerCase() === dayName
    );

    // Default time slots if no schedule is set (9 AM to 6 PM, hourly)
    const defaultSlots = [
      '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    let availableTimeSlots: string[] = [];

    if (daySchedule && daySchedule.slots && daySchedule.slots.length > 0) {
      // Use therapist's schedule
      availableTimeSlots = daySchedule.slots
        .filter((slot: any) => slot.isAvailable !== false)
        .map((slot: any) => slot.startTime)
        .filter(Boolean);
    } else {
      // No schedule set, use default slots (assume therapist is available)
      availableTimeSlots = defaultSlots;
    }

    // Get existing bookings for this therapist on this date
    // Handle both Date objects and date strings in the database
    const dateStart = new Date(requestedDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(requestedDate);
    dateEnd.setHours(23, 59, 59, 999);
    
    // Also create date string for exact match (YYYY-MM-DD format)
    const dateString = requestedDate.toISOString().split('T')[0];

    // Query for existing bookings - check therapist ID and date
    const existingBookings = await database.findMany('bookings', {
      $and: [
        {
          $or: [
            { therapistId: new ObjectId(id) },
            { therapistProfileId: new ObjectId(id) }
          ]
        },
        {
          $or: [
            { appointmentDate: { $gte: dateStart, $lte: dateEnd } },
            { appointmentDate: dateString },
            { date: dateString } // Legacy field name
          ]
        },
        {
          status: { $in: ['pending', 'confirmed'] } // Only count active bookings
        }
      ]
    });

    // Extract booked time slots
    const bookedTimeSlots = new Set(
      existingBookings
        .map((booking: any) => booking.appointmentTime)
        .filter(Boolean)
    );

    // Generate availability response
    const availability = availableTimeSlots.map((time: string) => {
      // Block slot only if:
      // 1. It's in the booked slots (another session exists)
      // 2. Therapist schedule explicitly marks it as unavailable (already filtered above)
      const isBooked = bookedTimeSlots.has(time);
      
      return {
        time,
        available: !isBooked
      };
    });

    // Sort by time
    availability.sort((a, b) => a.time.localeCompare(b.time));

    console.log('[availability] Generated availability:', {
      therapistId: id,
      date: dateParam,
      dayName,
      totalSlots: availability.length,
      availableCount: availability.filter(a => a.available).length,
      bookedCount: bookedTimeSlots.size
    });

    return NextResponse.json({
      success: true,
      data: {
        availability,
        date: dateParam,
        therapistId: id
      }
    });

  } catch (error: any) {
    console.error('[availability] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch availability', error: error.message },
      { status: 500 }
    );
  }
}

