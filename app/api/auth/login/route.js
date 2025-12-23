const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const passwordTrimmed = (password || '').trim();

    // Validate input
    if (!email || !passwordTrimmed) {
      return ResponseUtils.badRequest('Email and password are required');
    }

    if (!ValidationUtils.validateEmail(email)) {
      return ResponseUtils.badRequest('Invalid email format');
    }

    // For demo purposes, if database is not available, allow demo login
    try {
      const emailLower = email.toLowerCase().trim();

      // Regex fallback to handle case/whitespace mismatches from legacy inserts
      const escapeRegex = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const emailRegex = new RegExp(`^${escapeRegex(emailLower)}$`, 'i');
      
      // Find user (exact, then case-insensitive)
      let user = await database.findOne('users', { email: emailLower });
      if (!user) {
        user = await database.findOne('users', { email: emailRegex });
      }

      if (!user) {
        console.warn('[LOGIN] User not found for email:', emailLower);
        return ResponseUtils.unauthorized('Invalid email or password');
      }


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

      // Prefer trimmed password to avoid trailing-space entry issues
      let isPasswordValid = await AuthUtils.comparePassword(passwordTrimmed, user.password);
      if (!isPasswordValid && password !== passwordTrimmed) {
        // Fallback: try raw password if user actually has intentional leading/trailing spaces
        isPasswordValid = await AuthUtils.comparePassword(password, user.password);
      }
      if (!isPasswordValid && typeof user.password === 'string' && !user.password.startsWith('$2')) {
        // Legacy plain-text storage (should not happen, but guard for existing docs)
        isPasswordValid = passwordTrimmed === user.password || password === user.password;
      }
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
