const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');

export async function POST(request) {
  try {
    const { email = 'test@example.com', password = 'Test123!', name = 'Test User' } = await request.json();
    
    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password);
    
    // Create test user
    const testUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: 'client',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert user
    const result = await database.insertOne('users', testUser);
    
    // Generate token
    const token = AuthUtils.generateToken({ userId: result.insertedId });
    
    return Response.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        _id: result.insertedId,
        name: testUser.name,
        email: testUser.email,
        userType: testUser.userType
      },
      token
    });
    
  } catch (error) {
    console.error('Test user creation error:', error);
    return Response.json(
      { 
        success: false, 
        error: error.message,
        message: 'Failed to create test user' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Find test user
    const user = await database.findOne('users', { 
      email: 'test@example.com' 
    });
    
    if (!user) {
      return Response.json({
        success: false,
        message: 'Test user not found'
      }, { status: 404 });
    }
    
    // Generate token
    const token = AuthUtils.generateToken({ userId: user._id });
    
    return Response.json({
      success: true,
      message: 'Test user found',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      },
      token
    });
    
  } catch (error) {
    console.error('Test user fetch error:', error);
    return Response.json(
      { 
        success: false, 
        error: error.message,
        message: 'Failed to fetch test user' 
      },
      { status: 500 }
    );
  }
}
