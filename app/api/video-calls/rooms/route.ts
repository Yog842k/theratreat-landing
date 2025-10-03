import { NextRequest, NextResponse } from 'next/server';

// Mock data for available rooms - In production, integrate with 100ms Management SDK
const rooms: { [key: string]: any } = {};

function generateRoomCode(): string {
  return `room-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      therapistId, 
      clientId, 
      scheduledTime, 
      duration = 50,
      notes 
    } = body;

    if (!therapistId || !clientId || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields: therapistId, clientId, scheduledTime' },
        { status: 400 }
      );
    }

    const roomCode = generateRoomCode();
    const bookingId = `booking-${Date.now()}`;

    const room = {
      id: bookingId,
      roomCode,
      therapistId,
      clientId,
      scheduledTime,
      duration,
      notes,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    rooms[bookingId] = room;

    return NextResponse.json({
      success: true,
      booking: room,
      roomCode
    });

  } catch (error) {
    console.error('Error creating video call room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const therapistId = url.searchParams.get('therapistId');
    const clientId = url.searchParams.get('clientId');

    let filteredRooms = Object.values(rooms);

    if (therapistId) {
      filteredRooms = filteredRooms.filter(room => room.therapistId === therapistId);
    }

    if (clientId) {
      filteredRooms = filteredRooms.filter(room => room.clientId === clientId);
    }

    return NextResponse.json({
      rooms: filteredRooms.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.error('Error fetching video call rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
