const AuthMiddleware = require('@/lib/middleware');
const database = require('@/lib/database');
const { ResponseUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

export async function GET(request) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    let therapistProfile = null;
    if (user.userType === 'therapist') {
      therapistProfile = await database.findOne('therapists', { userId: new ObjectId(user._id) });
    }
    return ResponseUtils.success({ user, therapistProfile });
  } catch (e) {
    return ResponseUtils.unauthorized('Unauthorized');
  }
}
