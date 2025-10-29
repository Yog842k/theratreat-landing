
import { NextResponse } from 'next/server';

// Set your Idfy API credentials here or use environment variables
const IDFY_API_KEY = process.env.IDFY_CLIENT_SECRET || '<your-api-key>';
const IDFY_ACCOUNT_ID = process.env.IDFY_CLIENT_ID || '<your-account-id>';

export async function POST(request: Request) {
  try {
    const { request_id } = await request.json();
    if (!request_id) {
      return NextResponse.json({ success: false, message: 'request_id required.' }, { status: 400 });
    }
    // Call Idfy Get Task API
    const idfyRes = await fetch(`https://eve.idfy.com/v3/tasks?request_id=${request_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api-key': IDFY_API_KEY,
        'account-id': IDFY_ACCOUNT_ID
      }
    });
    const idfyJson = await idfyRes.json();
    if (!idfyRes.ok) {
      return NextResponse.json({ success: false, message: idfyJson?.message || 'Idfy API error.' }, { status: idfyRes.status });
    }
    // Parse and map response
    const src = idfyJson?.result?.source_output;
    if (!src) {
      return NextResponse.json({ success: false, message: 'No source output from Idfy.' }, { status: 422 });
    }
    return NextResponse.json({
      success: true,
      message: 'PAN verification completed.',
      data: {
        match: {
          nameMatch: src.name_match,
          dobMatch: src.dob_match,
          score: src.name_match && src.dob_match ? 100 : 0
        },
        provider: {
          panStatus: src.pan_status,
          aadhaarSeedingStatus: src.aadhaar_seeding_status
        },
        inputDetails: src.input_details || {}
      },
      status: idfyJson.status,
      completed_at: idfyJson.completed_at,
      created_at: idfyJson.created_at
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
