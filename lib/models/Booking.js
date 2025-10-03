import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  sessionDate: {
    type: Date,
    required: true
  },
  sessionTime: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  sessionType: {
    type: String,
    enum: ['video', 'audio', 'in-clinic', 'home-visit'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  sessionNotes: String,
  cancellationReason: String,
  meetingLink: String,
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ clientId: 1, sessionDate: 1 });
bookingSchema.index({ therapistId: 1, sessionDate: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
