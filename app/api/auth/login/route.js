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
      const emailLower = email.toLowerCase();
      console.log('[LOGIN] Attempting login:', {
        email: emailLower,
        hasPassword: !!password,
        passwordLength: password ? password.length : 0
      });
      
      // Find user
      const user = await database.findOne('users', { 
        email: emailLower 
      });

      if (!user) {
        console.warn('[LOGIN] User not found for email:', emailLower);
        return ResponseUtils.unauthorized('Invalid email or password');
      }

      console.log('[LOGIN] User found:', {
        userId: user._id.toString(),
        email: user.email,
        userType: user.userType,
        isActive: user.isActive,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        passwordIsHashed: user.password && user.password.length > 50 && user.password.startsWith('$2')
      });

      // Check if user is active
      if (!user.isActive) {
        console.warn('[LOGIN] Inactive user attempted login:', user._id.toString());
        return ResponseUtils.forbidden('Account is deactivated');
      }

      // Verify password
      if (!user.password) {
        console.error('[LOGIN] User has no password stored!', {
          userId: user._id.toString(),
          email: user.email
        });
        return ResponseUtils.unauthorized('Invalid email or password');
      }

      const isPasswordValid = await AuthUtils.comparePassword(password, user.password);
      console.log('[LOGIN] Password verification result:', {
        userId: user._id.toString(),
        isValid: isPasswordValid
      });
      
      if (!isPasswordValid) {
        console.warn('[LOGIN] Password mismatch for user:', {
          userId: user._id.toString(),
          email: user.email,
          storedPasswordPrefix: user.password.substring(0, 20) + '...'
        });
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
