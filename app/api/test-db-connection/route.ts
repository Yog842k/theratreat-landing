import { NextResponse } from 'next/server';
import database from '@/lib/database';

export async function GET() {
  try {
    const db = await database.connect();
    const isMock = (database as any).mock === true;
    
    // Try to query therapists collection
    let therapistCount = 0;
    let sampleTherapist = null;
    
    try {
      const therapists = await database.findMany('therapists', {});
      therapistCount = therapists.length;
      sampleTherapist = therapists[0] || null;
    } catch (queryError) {
      console.error('Query error:', queryError);
    }
    
    return NextResponse.json({
      success: true,
      connected: !isMock,
      usingMock: isMock,
      therapistCount,
      sampleTherapist: sampleTherapist ? {
        id: sampleTherapist._id,
        name: sampleTherapist.displayName || sampleTherapist.name
      } : null,
      message: isMock 
        ? 'Using mock database. To use real MongoDB: 1) Add your IP to MongoDB Atlas Network Access, 2) Verify MONGODB_URI in .env.local'
        : 'Connected to real MongoDB database'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      connected: false,
      usingMock: true,
      error: error instanceof Error ? error.message : String(error),
      message: 'Database connection failed. Check MONGODB_URI and IP whitelist in MongoDB Atlas.'
    }, { status: 500 });
  }
}


