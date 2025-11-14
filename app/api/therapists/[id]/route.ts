import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Therapist from '@/lib/models/Therapist';

export async function GET(request: NextRequest, context: any) {
  try {
    // Handle both Promise and direct params (for Next.js version compatibility)
    const params = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params;
    const { id } = params;
    console.log('[API] Therapist GET called with id:', id);
    await connectDB();
    const therapist = await Therapist.findById(id).lean();
    if (!therapist) {
      console.error('[API] Therapist not found for id:', id);
      return NextResponse.json({ success: false, message: 'Therapist not found' }, { status: 404 });
    }
    console.log('[API] Therapist found:', therapist);
    return NextResponse.json({ success: true, therapist });
  } catch (error) {
    console.error('[API] Internal server error in therapist GET:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: errMsg }, { status: 500 });
  }
}
