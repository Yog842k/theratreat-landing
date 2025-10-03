const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return ResponseUtils.badRequest('Email and password are required');
    }

    if (!ValidationUtils.validateEmail(email)) {
      return ResponseUtils.badRequest('Invalid email format');
    }

    // For demo purposes, if database is not available, allow demo login
    try {
      // Find user
      const user = await database.findOne('users', { 
        email: email.toLowerCase() 
      });

      if (!user) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[LOGIN] User not found for email', email.toLowerCase());
        }
        return ResponseUtils.unauthorized('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[LOGIN] Inactive user attempted login', user._id.toString());
        }
        return ResponseUtils.forbidden('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await AuthUtils.comparePassword(password, user.password);
      if (!isPasswordValid) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[LOGIN] Password mismatch for', user._id.toString());
        }
        return ResponseUtils.unauthorized('Invalid email or password');
      }

      // Generate token
      const token = AuthUtils.generateToken({ 
        userId: user._id.toString(),
        userType: user.userType 
      });

      // Update last login
      await database.updateOne('users', 
        { _id: user._id },
        { $set: { lastLoginAt: new Date() } }
      );

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      return ResponseUtils.success({
        user: userWithoutPassword,
        token
      }, 'Login successful');

    } catch (dbError) {
      console.log('Database unavailable, using demo login...', dbError?.message);
      
      // Demo login for development
      if (email === 'admin@therabook.com' && password === 'Admin123!') {
        const demoUser = {
          _id: 'demo-admin-id',
          name: 'Demo Admin',
          email: 'admin@therabook.com',
          userType: 'admin',
          isActive: true,
          isVerified: true,
          createdAt: new Date()
        };

        const token = AuthUtils.generateToken({ 
          userId: demoUser._id,
          userType: demoUser.userType 
        });

        return ResponseUtils.success({
          user: demoUser,
          token
        }, 'Demo login successful');
      }

      if (email === 'user@test.com' && password === 'Test123!') {
        const demoUser = {
          _id: 'demo-user-id',
          name: 'Demo User',
          email: 'user@test.com',
          userType: 'user',
          isActive: true,
          isVerified: true,
          createdAt: new Date()
        };

        const token = AuthUtils.generateToken({ 
          userId: demoUser._id,
          userType: demoUser.userType 
        });

        return ResponseUtils.success({
          user: demoUser,
          token
        }, 'Demo login successful');
      }

      return ResponseUtils.unauthorized('Invalid credentials');
    }

  } catch (error) {
    console.error('Login error:', error);
    return ResponseUtils.error('Login failed');
  }
}
