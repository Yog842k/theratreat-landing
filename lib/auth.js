const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthUtils {
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateToken(payload, expiresIn = '7d') {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    return jwt.sign(payload, secret, { expiresIn });
  }

  static verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      console.warn('[Auth] ⚠️ No authorization header provided');
      return null;
    }
    
    // Handle case-insensitive matching and trim whitespace
    const normalized = authHeader.trim();
    
    // Check for "Bearer " prefix (case-insensitive)
    if (!normalized.toLowerCase().startsWith('bearer ')) {
      console.warn('[Auth] ⚠️ Authorization header does not start with "Bearer "', {
        headerPrefix: normalized.substring(0, 20),
        fullHeader: normalized.length > 50 ? normalized.substring(0, 50) + '...' : normalized
      });
      return null;
    }
    
    // Extract token (skip "Bearer " prefix - 7 characters)
    const token = normalized.substring(7).trim();
    
    if (!token) {
      console.warn('[Auth] ⚠️ Token is empty after extracting from header');
      return null;
    }
    
    console.log('[Auth] ✅ Token extracted successfully', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...'
    });
    
    return token;
  }
}

module.exports = AuthUtils;
