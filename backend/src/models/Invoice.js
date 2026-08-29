import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  itemCode: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitRate: { type: Number, required: true },
  mrp: { type: Number },
  skuMaster: { type: mongoose.Schema.Types.ObjectId, ref: 'SkuMaster', default: null }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, trim: true },
  poNumber: { type: String, required: true, trim: true }, // Linking key to PO
  invoiceDate: { type: String, required: true },
  items: [invoiceItemSchema],
  filePath: { type: String, required: true },
  rawParsed: { type: Object }
}, { timestamps: true });

// Compound index to ensure uniqueness of invoiceNumber under the same poNumber
invoiceSchema.index({ poNumber: 1, invoiceNumber: 1 }, { unique: true });

export default  mongoose.model('Invoice', invoiceSchema);