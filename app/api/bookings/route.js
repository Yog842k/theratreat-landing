const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

export async function GET(request) {
  try {
    const user = await AuthMiddleware.authenticate(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');

    // Build query based on user type
    let query = {};
    if (user.userType === 'user' || user.userType === 'patient') {
      query.userId = new ObjectId(user._id);
    } else if (user.userType === 'therapist') {
      query.therapistId = new ObjectId(user._id);
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // Aggregation pipeline for bookings with user and therapist details
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            { $project: { name: 1, email: 1, phone: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'therapistId',
          foreignField: '_id',
          as: 'therapist',
          pipeline: [
            { $project: { name: 1, email: 1, therapistProfile: 1 } }
          ]
        }
      },
      { $unwind: '$user' },
      { $unwind: '$therapist' },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const bookings = await database.aggregate('bookings', pipeline);

    // Get total count
    const totalCount = await database.aggregate('bookings', [
      { $match: query },
      { $count: 'total' }
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return ResponseUtils.success({
      bookings,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    return ResponseUtils.error('Failed to fetch bookings');
  }
}

export async function POST(request) {
  try {
    let user;
    try {
      // Accept both legacy 'user' and explicit 'patient' roles as end-users
      user = await AuthMiddleware.requireRole(request, ['user', 'patient']);
    } catch (e) {
      // If auth ok but wrong role, surface a 403 with clear message instead of generic 500
      const msg = e?.message || '';
      if (/Insufficient permissions/i.test(msg)) {
        return ResponseUtils.forbidden('Only end users can create bookings (logged in as therapist/admin)');
      }
      if (/Authentication failed/i.test(msg)) {
        return ResponseUtils.unauthorized('Authentication failed');
      }
      return ResponseUtils.error('Authorization error', 500, msg);
    }
    const body = await request.json();
    
    const {
      therapistId,
      appointmentDate,
      appointmentTime,
      sessionType,
      notes
    } = body;

    // Validate required fields
    const required = ['therapistId', 'appointmentDate', 'appointmentTime', 'sessionType'];
    const missing = ValidationUtils.validateRequiredFields(body, required);
    
    if (missing.length > 0) {
      return ResponseUtils.badRequest(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!ValidationUtils.validateObjectId(therapistId)) {
      return ResponseUtils.badRequest('Invalid therapist ID');
    }

    // Parse date (accept YYYY-MM-DD or full ISO)
    let apptDate;
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
        apptDate = new Date(`${appointmentDate}T00:00:00.000Z`);
      } else {
        apptDate = new Date(appointmentDate);
      }
      if (isNaN(apptDate.getTime())) throw new Error('Invalid date');
    } catch {
      return ResponseUtils.badRequest('Invalid appointment date format');
    }

    // Resolve therapist: support legacy (users collection) and new separate therapists collection ID
    let therapistUser = await database.findOne('users', {
      _id: new ObjectId(therapistId),
      userType: 'therapist',
      isActive: true
    });
    let therapistProfile = null;
    let therapistProfileId = null;

    if (!therapistUser) {
      // Treat provided ID as therapists collection document (allow even if not yet approved)
      therapistProfile = await database.findOne('therapists', { _id: new ObjectId(therapistId) });
      if (therapistProfile) {
        therapistProfileId = therapistProfile._id;
        // Load owning user
        therapistUser = await database.findOne('users', { _id: therapistProfile.userId, userType: 'therapist', isActive: true });
      }
    } else {
      // Legacy embedded profile scenario
      therapistProfile = therapistUser.therapistProfile || null;
    }

    if (!therapistUser) {
      return ResponseUtils.notFound('Therapist not found or not available');
    }

    // Consultation fee precedence: separate profile -> embedded -> 0
    const consultationFee = (therapistProfile && therapistProfile.consultationFee) || (therapistUser.therapistProfile && therapistUser.therapistProfile.consultationFee) || 0;

    // Check for existing booking at the same time
    const existingBooking = await database.findOne('bookings', {
      therapistId: therapistUser._id, // always store user _id to keep legacy aggregation working
      appointmentDate: apptDate,
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return ResponseUtils.badRequest('Time slot is already booked');
    }

    // Create booking
    const booking = {
      userId: new ObjectId(user._id),
      therapistId: therapistUser._id, // normalized user id
      therapistProfileId: therapistProfileId, // may be null for legacy
      appointmentDate: apptDate,
      appointmentTime,
      sessionType,
      notes: ValidationUtils.sanitizeString(notes || ''),
      status: 'pending',
      totalAmount: consultationFee,
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await database.insertOne('bookings', booking);
    // attach _id for client convenience
    booking._id = result.insertedId;

    return ResponseUtils.success({
      bookingId: result.insertedId,
      booking
    }, 'Booking created successfully', 201);

  } catch (error) {
    console.error('Create booking error (detailed):', error);
    const msg = error?.message || 'Failed to create booking';
    // If this was thrown earlier intentionally we may still have a generic message
    return ResponseUtils.error('Failed to create booking', 500, msg);
  }
}
