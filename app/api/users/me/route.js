// Current user basic info endpoint
// Returns authenticated user's non-sensitive fields
const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ResponseUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

export async function GET(request) {
	try {
		const user = await AuthMiddleware.authenticate(request);
		// Re-fetch to ensure latest (excluding password)
		const freshUser = await database.findOne('users', { _id: new ObjectId(user._id) }, { projection: { password: 0 } });
		if (!freshUser) {
			return ResponseUtils.errorCode('USER_NOT_FOUND', 'User not found', 404);
		}
		return ResponseUtils.success({ user: freshUser });
	} catch (err) {
		const reasons = err?.reasons;
		if (process.env.AUTH_DEBUG === '1') {
			console.warn('[users/me] auth failure reasons:', reasons);
		}
		if (process.env.AUTH_DEBUG === '1') {
			return ResponseUtils.errorCode('AUTH_FAILED', 'Authentication failed', 401, reasons || null);
		}
		return ResponseUtils.unauthorized('Authentication failed');
	}
}

export const dynamic = 'force-dynamic';
