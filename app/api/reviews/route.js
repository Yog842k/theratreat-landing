const database = require('@/lib/database');
const AuthMiddleware = require('@/lib/middleware');
const { ValidationUtils, ResponseUtils } = require('@/lib/utils');
const { ObjectId } = require('mongodb');

export async function POST(request) {
  try {
    const user = await AuthMiddleware.requireRole(request, ['user']);
    const body = await request.json();
    
    const {
      therapistId,
      bookingId,
      rating,
      comment
    } = body;

    // Validate required fields
    const required = ['therapistId', 'bookingId', 'rating'];
    const missing = ValidationUtils.validateRequiredFields(body, required);
    
    if (missing.length > 0) {
      return ResponseUtils.badRequest(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!ValidationUtils.validateObjectId(therapistId) || !ValidationUtils.validateObjectId(bookingId)) {
      return ResponseUtils.badRequest('Invalid therapist ID or booking ID');
    }

    if (rating < 1 || rating > 5) {
      return ResponseUtils.badRequest('Rating must be between 1 and 5');
    }

    // Verify booking exists and belongs to user
    const booking = await database.findOne('bookings', {
      _id: new ObjectId(bookingId),
      userId: new ObjectId(user._id),
      therapistId: new ObjectId(therapistId),
      status: 'completed'
    });

    if (!booking) {
      return ResponseUtils.notFound('Booking not found or not completed');
    }

    // Check if review already exists
    const existingReview = await database.findOne('reviews', {
      bookingId: new ObjectId(bookingId)
    });

    if (existingReview) {
      return ResponseUtils.badRequest('Review already exists for this booking');
    }

    // Create review
    const review = {
      userId: new ObjectId(user._id),
      therapistId: new ObjectId(therapistId),
      bookingId: new ObjectId(bookingId),
      rating,
      comment: ValidationUtils.sanitizeString(comment || ''),
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await database.insertOne('reviews', review);

    // Update therapist rating
    await updateTherapistRating(therapistId);

    return ResponseUtils.success({
      reviewId: result.insertedId,
      review
    }, 'Review created successfully', 201);

  } catch (error) {
    console.error('Create review error:', error);
    return ResponseUtils.error('Failed to create review');
  }
}

async function updateTherapistRating(therapistId) {
  try {
    const pipeline = [
      { $match: { therapistId: new ObjectId(therapistId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ];

    const result = await database.aggregate('reviews', pipeline);
    
    if (result.length > 0) {
      const { avgRating, reviewCount } = result[0];
      
      await database.updateOne('users',
        { _id: new ObjectId(therapistId) },
        {
          $set: {
            'therapistProfile.rating': Math.round(avgRating * 10) / 10,
            'therapistProfile.reviewCount': reviewCount,
            updatedAt: new Date()
          }
        }
      );
    }
  } catch (error) {
    console.error('Update therapist rating error:', error);
  }
}
