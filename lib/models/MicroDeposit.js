import mongoose from 'mongoose';

const microDepositSchema = new mongoose.Schema({
  verificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'BankVerification', required: true },
  depositAmountPaise: { type: Number, required: true },
  depositTxnId: { type: String },
  status: { type: String, enum: ['sent', 'cleared', 'reconciled'], required: true },
  createdAt: { type: Date, default: Date.now },
  verifiedByUser: { type: Boolean, default: false },
  verifiedAt: { type: Date },
});

export default mongoose.models.MicroDeposit || mongoose.model('MicroDeposit', microDepositSchema);
