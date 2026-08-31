import express from 'express';
import { protect } from './authMiddleware.js';
import { evaluateThreeWayMatch } from '../services/matchEngine.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Grn from '../models/Grn.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// GET /match/:poNumber
router.get('/match/:poNumber', protect, async (req, res) => {
  try {
    const matchResult = await evaluateThreeWayMatch(req.params.poNumber);
    res.json(matchResult);
  } catch (err) {
    res.status(500).json({ message: 'Match computation failed', error: err.message });
  }
});

// GET /summary/:poNumber
router.get('/summary/:poNumber', protect, async (req, res) => {
  try {
    const poNumber = req.params.poNumber;
    const po = await PurchaseOrder.findOne({ poNumber });
    const grns = await Grn.find({ poNumber });
    const invoices = await Invoice.find({ poNumber });

    const totalPoAmount = po ? po.items.reduce((acc, i) => acc + (i.quantity * 100), 0) : 0;
    const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.items.reduce((iAcc, item) => iAcc + (item.quantity * item.unitRate), 0), 0);
    const totalReceived = grns.reduce((acc, grn) => acc + grn.items.reduce((gAcc, item) => gAcc + (item.receivedQuantity * 100), 0), 0);

    res.json({
      poNumber,
      poAmount: totalPoAmount,
      totalInvoiced,
      totalReceived,
      documents: [
        ...(po ? [{ _id: po._id, type: 'PO', number: po.poNumber, date: po.poDate }] : []),
        ...grns.map(g => ({ _id: g._id, type: 'GRN', number: g.grnNumber, date: g.grnDate })),
        ...invoices.map(i => ({ _id: i._id, type: 'Invoice', number: i.invoiceNumber, date: i.invoiceDate }))
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Summary fetch failed', error: err.message });
  }
});

export default router;