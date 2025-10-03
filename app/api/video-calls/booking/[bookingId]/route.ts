import { NextRequest, NextResponse } from 'next/server';

// Mock database - In production, replace with actual database calls
const bookings: { [key: string]: any } = {
  'booking-123': {
    id: 'booking-123',
    therapistId: 'therapist-1',
    therapistName: 'Dr. Sarah Johnson',
    clientId: 'client-1',
    clientName: 'John Doe',
    scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    duration: 50,
    status: 'scheduled',
    notes: 'Initial consultation session. Please prepare any questions you may have.'
  }
};

// Generate room codes for 100ms
function generateRoomCode(): string {
  // In production, integrate with 100ms Management SDK to create actual rooms
  return `room-${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await context.params;
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = bookings[bookingId];
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Generate or retrieve room code
    let roomCode = booking.roomCode;
    if (!roomCode) {
      roomCode = generateRoomCode();
      booking.roomCode = roomCode;
    }

    return NextResponse.json({
      booking,
      roomCode
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await context.params;
    const body = await request.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = bookings[bookingId];
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking with provided fields
    Object.assign(booking, body);
    booking.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
