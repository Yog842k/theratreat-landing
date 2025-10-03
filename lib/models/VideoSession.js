import mongoose from 'mongoose';

// VideoSession stores server-managed 100ms room metadata for therapist <-> client sessions.
// We DO NOT persist auth tokens; they are generated on-demand.
const videoSessionSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  roomId: { type: String, required: true },
  roomName: { type: String },
  templateId: { type: String },
  scheduledStart: { type: Date, required: true },
  scheduledEnd: { type: Date, required: true },
  status: { type: String, enum: ['scheduled','active','completed','cancelled'], default: 'scheduled' },
  startedAt: { type: Date },
  endedAt: { type: Date },
  createdBy: { type: String, default: 'system' },
  notes: { type: String },
  lastTokenIssuedAt: { type: Date }, // diagnostic only (not security sensitive)
  meta: { type: Object }
}, { timestamps: true });

videoSessionSchema.index({ therapistId: 1, scheduledStart: 1 });
videoSessionSchema.index({ clientId: 1, scheduledStart: 1 });
videoSessionSchema.index({ bookingId: 1 }, { unique: true, sparse: true });

export default mongoose.models.VideoSession || mongoose.model('VideoSession', videoSessionSchema);
