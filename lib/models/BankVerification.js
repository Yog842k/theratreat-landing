import mongoose from 'mongoose';

const bankVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumberEncrypted: { type: String, required: true },
  ifsc: { type: String, required: true },
  accountName: { type: String },
  method: { type: String, enum: ['lookup', 'micro_deposit'], required: true },
  status: { type: String, enum: ['initiated', 'pending', 'verified', 'failed', 'needs_user_confirmation'], required: true },
  provider: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.BankVerification || mongoose.model('BankVerification', bankVerificationSchema);
