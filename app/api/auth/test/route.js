const AuthMiddleware = require('@/lib/middleware');

export async function GET(request) {
  try {
    // Test authentication
    const user = await AuthMiddleware.authenticate(request);
    
    return Response.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });
    
  } catch (error) {
    console.error('Auth test error:', error);
    return Response.json(
      { 
        success: false, 
        error: error.message,
        message: 'Authentication failed' 
      },
      { status: 401 }
    );
  }
}
