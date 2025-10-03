import mongoose from 'mongoose';

const therapistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  specializations: [{
    type: String,
    required: true
  }],
  experience: {
    type: Number,
    required: true
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  certifications: [{
    name: String,
    issuer: String,
    year: Number
  }],
  consultationFee: {
    type: Number,
    required: true
  },
  sessionTypes: [{
    type: String,
    enum: ['video', 'audio', 'in-clinic', 'home-visit']
  }],
  languages: [String],
  location: String,
  bio: String,
  image: String,
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [{
      startTime: String,
      endTime: String,
      isAvailable: { type: Boolean, default: true }
    }]
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  // Razorpay connected account (linked/managed account id like acc_XXXX)
  razorpayAccountId: {
    type: String,
    required: false
  },
  // Default platform commission share (0-1). 0.15 => 15%
  defaultCommissionPercent: {
    type: Number,
    default: 0.15,
    min: 0,
    max: 1
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
therapistSchema.index({ specializations: 1 });
therapistSchema.index({ location: 1 });
therapistSchema.index({ rating: -1 });
therapistSchema.index({ consultationFee: 1 });

export default mongoose.models.Therapist || mongoose.model('Therapist', therapistSchema);
