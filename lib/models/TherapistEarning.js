import mongoose from 'mongoose';

/*
 TherapistEarning
 Represents credit allocated to a therapist for a completed (and paid) booking.
 This is an internal ledger entry. Actual withdrawal / payout logic can
 reference these documents and move status from 'available' -> 'withdrawn'.
*/

const therapistEarningSchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true, // enforce idempotency (one earning per booking)
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'available', 'withdrawing', 'withdrawn'],
    default: 'available'
  },
  meta: {
    platformFee: { type: Number, default: 0 },
    notes: { type: String }
  },
  releasedAt: { type: Date, default: Date.now }
}, { timestamps: true });

therapistEarningSchema.index({ therapistId: 1, status: 1, createdAt: -1 });

export default mongoose.models.TherapistEarning || mongoose.model('TherapistEarning', therapistEarningSchema);
