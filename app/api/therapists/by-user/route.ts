import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Therapist from '@/lib/models/Therapist';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId required' }, { status: 400 });
    }
    await connectDB();
    const therapist = await Therapist.findOne({ userId }).lean();
    if (!therapist) {
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }
    // Also include minimal user info (e.g., gender) for profile rendering
    const user = await User.findById(userId).select('name gender profileImage').lean();
    return NextResponse.json({ success: true, therapist, user });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: errMsg }, { status: 500 });
  }
}
