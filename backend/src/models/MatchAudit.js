import mongoose from 'mongoose';

const matchAuditSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, index: true },
  steps: [{
    step: { type: String, required: true },
    status: { type: String, enum: ['success', 'warning', 'error'], required: true },
    message: { type: String, required: true },
    at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('MatchAudit', matchAuditSchema);