const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ObjectId } = require('mongodb');


class AuthMiddleware {
  static async authenticate(request) {
    const debug = (process.env.AUTH_DEBUG === '1');
    const reasons = [];

    try {
      const authHeader = request.headers.get('authorization');
      const token = AuthUtils.extractTokenFromHeader(authHeader);
      if (!token) {
        reasons.push('no_token');
        throw new Error('No token provided');
      }
      let decoded;
      try {
        decoded = AuthUtils.verifyToken(token);
      } catch (err) {
        reasons.push('jwt_invalid');
        throw err;
      }
      if (!decoded?.userId) {
        reasons.push('missing_userId_claim');
        throw new Error('Invalid token payload');
      }
      let user;
      try {
        user = await database.findOne('users', { _id: new ObjectId(decoded.userId) }, { projection: { password: 0 } });
      } catch (dbErr) {
        reasons.push('db_error');
        throw dbErr;
      }
      if (!user) {
        reasons.push('user_not_found');
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      if (debug || process.env.NODE_ENV !== 'production') {
        console.warn('[Auth] authenticate failed:', { message: error?.message, reasons });
      }
      // Normalize outward error
      const err = new Error('Authentication failed');
      // Attach debug info (not sent to client automatically, but route can surface if needed)
      err.reasons = reasons;
      throw err;
    }
  }

  static async requireRole(request, allowedRoles = []) {
    const user = await this.authenticate(request);
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.userType)) {
      throw new Error('Insufficient permissions');
    }

    return user;
  }
}

module.exports = AuthMiddleware;
