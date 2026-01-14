const database = require('@/lib/database');
const AuthUtils = require('@/lib/auth');
const { ObjectId } = require('mongodb');


class AuthMiddleware {
  static async authenticate(request) {
    const debug = (process.env.AUTH_DEBUG === '1' || process.env.NODE_ENV !== 'production');
    const reasons = [];

    try {
      const authHeader = request.headers.get('authorization');
      console.log('[Auth] 🔍 Authentication attempt', {
        hasAuthHeader: !!authHeader,
        authHeaderPrefix: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
        allHeaders: Object.fromEntries(request.headers.entries())
      });

      const cookieHeader = request.headers.get('cookie');
      const cookieToken = (() => {
        if (!cookieHeader) return null;
        const targetKeys = ['token', 'authToken', 'auth_token', 'access_token', 'accessToken', 'Authorization'];
        const parts = cookieHeader.split(';').map((c) => c.trim()).filter(Boolean);
        for (const part of parts) {
          const [k, v] = part.split('=');
          if (targetKeys.includes(k) && v) return decodeURIComponent(v);
        }
        return null;
      })();

      const token = AuthUtils.extractTokenFromHeader(authHeader) || cookieToken;
      if (!token) {
        reasons.push('no_token');
        console.error('[Auth] ❌ No token extracted', {
          authHeader: authHeader ? 'present' : 'missing',
          authHeaderValue: authHeader,
          hasCookie: !!cookieHeader,
          cookieKeys: cookieHeader ? cookieHeader.split(';').map((c) => c.trim().split('=')[0]) : []
        });
        throw new Error('No token provided');
      }
      
      console.log('[Auth] ✅ Token extracted', {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...'
      });
      
      let decoded;
      try {
        decoded = AuthUtils.verifyToken(token);
        console.log('[Auth] ✅ Token verified', {
          hasUserId: !!decoded?.userId,
          userId: decoded?.userId
        });
      } catch (err) {
        reasons.push('jwt_invalid');
        console.error('[Auth] ❌ Token verification failed', {
          error: err?.message || err,
          tokenPrefix: token.substring(0, 20) + '...'
        });
        throw err;
      }
      if (!decoded?.userId) {
        reasons.push('missing_userId_claim');
        console.error('[Auth] ❌ Missing userId in token', { decoded });
        throw new Error('Invalid token payload');
      }
      let user;
      try {
        user = await database.findOne('users', { _id: new ObjectId(decoded.userId) }, { projection: { password: 0 } });
        console.log('[Auth] ✅ User found', {
          userId: user?._id,
          userType: user?.userType,
          email: user?.email
        });
      } catch (dbErr) {
        reasons.push('db_error');
        console.error('[Auth] ❌ Database error', {
          error: dbErr?.message || dbErr,
          userId: decoded.userId
        });
        throw dbErr;
      }
      if (!user) {
        reasons.push('user_not_found');
        console.error('[Auth] ❌ User not found in database', {
          userId: decoded.userId
        });
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      if (debug || process.env.NODE_ENV !== 'production') {
        console.error('[Auth] ❌ Authentication failed:', { 
          message: error?.message, 
          reasons,
          error: error
        });
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
