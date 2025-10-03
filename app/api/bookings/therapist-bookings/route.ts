import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Therapist from '@/lib/models/Therapist';

// NOTE: Front-end dashboard expects an array at response.data (not response.bookings)
// and booking objects shaped with:
// { _id, userId:{ name,email }, sessionType, date, timeSlot, status, amount, notes, createdAt }
// The stored documents may instead have appointmentDate, appointmentTime, totalAmount, userId (ObjectId), payment fields, etc.
// This route normalizes both legacy (sessionDate/timeSlot) and new (appointmentDate/appointmentTime) schemas.

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
    // Find all bookings for the therapist (broad query)
    let raw: any[] = [];
    try {
      raw = await Booking.find({ therapistId: therapist._id }).sort({ createdAt: -1 }).lean();
    } catch (e) {
      const msg = (e as any)?.message ?? String(e);
      console.error('Error finding bookings:', msg);
      return NextResponse.json({ success: false, message: 'Error finding bookings', error: msg }, { status: 500 });
    }

    // Resolve user details for bookings missing a populated client reference
    const mongoose = await import('mongoose');
    const userIds: string[] = [];
    for (const b of raw) {
      const id = (b as any).userId || (b as any).clientId;
      if (id && typeof id === 'object' && id._id) continue; // already populated
      if (id && typeof id === 'string') userIds.push(id);
      if (id && id.toString && !userIds.includes(id.toString())) userIds.push(id.toString());
    }
    let usersById: Record<string, any> = {};
    if (userIds.length) {
      try {
        const docs = await mongoose.connection.db.collection('users').find({ _id: { $in: userIds.map(u => new mongoose.Types.ObjectId(u)) } }, { projection: { name: 1, email: 1 } }).toArray();
        for (const u of docs) usersById[u._id.toString()] = u;
      } catch (e) {
        console.warn('User lookup failed (non-fatal):', (e as any)?.message);
      }
    }

    const normalized = raw.map(b => {
      const userRef: any = (b as any).clientId || (b as any).userId;
      let userObj: any = null;
      if (userRef && typeof userRef === 'object' && userRef._id) {
        userObj = { name: userRef.name || 'User', email: userRef.email || '' };
      } else {
        const key = userRef?.toString?.();
        if (key && usersById[key]) {
          userObj = { name: usersById[key].name || 'User', email: usersById[key].email || '' };
        }
      }
      const dateValue = (b as any).sessionDate || (b as any).appointmentDate || (b as any).date;
      const timeSlot = (b as any).timeSlot || (b as any).appointmentTime || '';
      const amount = (b as any).amount ?? (b as any).totalAmount ?? 0;
      return {
        _id: b._id,
        userId: userObj || { name: 'Unknown', email: '' },
        sessionType: (b as any).sessionType || 'video',
        date: dateValue ? new Date(dateValue).toISOString() : null,
        timeSlot,
        status: (b as any).status || 'pending',
        amount,
        notes: (b as any).notes || '',
        createdAt: b.createdAt || new Date().toISOString()
      };
    });

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    const msg = (error as any)?.message ?? String(error);
    console.error('Therapist bookings error:', msg);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: msg },
      { status: 500 }
    );
  }
}
