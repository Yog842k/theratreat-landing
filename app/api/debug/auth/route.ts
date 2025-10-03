import { NextRequest, NextResponse } from 'next/server';
const AuthMiddleware = require('@/lib/middleware');

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Checking authentication...');
    
    const authHeader = request.headers.get('authorization');
    console.log('Debug: Auth header:', authHeader ? 'Present' : 'Missing');
    
    const user = await AuthMiddleware.authenticate(request);
    console.log('Debug: Authenticated user:', JSON.stringify(user, null, 2));

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });

  } catch (error: any) {
    console.error('Debug: Authentication error:', error.message);
    return NextResponse.json(
      { 
        success: false, 
        authenticated: false,
        error: error.message 
      },
      { status: 401 }
    );
  }
}
