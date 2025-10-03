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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = AuthUtils;
