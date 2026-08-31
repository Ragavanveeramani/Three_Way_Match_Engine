import PurchaseOrder from'../models/PurchaseOrder.js';
import Grn from '../models/Grn.js';
import Invoice from '../models/Invoice.js';

const evaluateThreeWayMatch = async (poNumber) => {
  const po = await PurchaseOrder.findOne({ poNumber }).populate('items.skuMaster');
  const grns = await Grn.find({ poNumber }).populate('items.skuMaster');
  const invoices = await Invoice.find({ poNumber }).populate('items.skuMaster');

  const reasonCodes = new Set();

  // 1. Check for Insufficient Documents
  if (!po || grns.length === 0 || invoices.length === 0) {
    return {
      poNumber,
      status: 'insufficient_documents',
      reasons: ['insufficient_documents'],
      documents: {
        poUploaded: !!po,
        grnCount: grns.length,
        invoiceCount: invoices.length
      },
      items: []
    };
  }

  // 2. Document-Level Rules
  if (invoices.some(inv => new Date(inv.invoiceDate) < new Date(po.poDate))) {
    reasonCodes.add('invoice_date_after_po_date');
  }

  // 3. Aggregate Item Quantities and Rates
  const itemMap = new Map();

  // Aggregate PO Items
  po.items.forEach(item => {
    const key = item.skuMaster ? item.skuMaster._id.toString() : item.itemCode.trim().toLowerCase();
    itemMap.set(key, {
      skuKey: key,
      skuCode: item.itemCode,
      description: item.description,
      poQty: item.quantity,
      grnQty: 0,
      invQty: 0,
      unitPrice: item.skuMaster ? item.skuMaster.agreedRate : 0,
      mrp: item.skuMaster ? item.skuMaster.mrp : 0,
      skuMaster: item.skuMaster || null,
      reasons: []
    });
  });

  // Aggregate GRN Items
  grns.forEach(grn => {
    grn.items.forEach(item => {
      const key = item.skuMaster ? item.skuMaster._id.toString() : item.itemCode.trim().toLowerCase();
      if (itemMap.has(key)) {
        itemMap.get(key).grnQty += item.receivedQuantity;
      } else {
        reasonCodes.add('item_missing_in_po');
        itemMap.set(key, {
          skuKey: key,
          skuCode: item.itemCode,
          description: item.description,
          poQty: 0,
          grnQty: item.receivedQuantity,
          invQty: 0,
          unitPrice: 0,
          mrp: item.mrp || 0,
          skuMaster: item.skuMaster || null,
          reasons: ['item_missing_in_po']
        });
      }
    });
  });

  // Aggregate Invoice Items
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      const key = item.skuMaster ? item.skuMaster._id.toString() : item.itemCode.trim().toLowerCase();
      const existing = itemMap.get(key);

      if (existing) {
        existing.invQty += item.quantity;
        existing.invoicedRate = item.unitRate;
        existing.invoicedMrp = item.mrp;

        // Price Mismatch Check (> priceTolerance)
        if (existing.skuMaster && existing.skuMaster.agreedRate > 0) {
          const diff = Math.abs(item.unitRate - existing.skuMaster.agreedRate) / existing.skuMaster.agreedRate;
          if (diff > (existing.skuMaster.priceTolerance || 0.05)) {
            existing.reasons.push('price_mismatch');
            reasonCodes.add('price_mismatch');
          }
        }

        // MRP Mismatch Check (> 1%)
        if (existing.skuMaster && existing.skuMaster.mrp > 0 && item.mrp) {
          const mrpDiff = Math.abs(item.mrp - existing.skuMaster.mrp) / existing.skuMaster.mrp;
          if (mrpDiff > 0.01) {
            existing.reasons.push('mrp_mismatch');
            reasonCodes.add('mrp_mismatch');
          }
        }
      } else {
        reasonCodes.add('item_missing_in_po');
      }
    });
  });

  // 4. Evaluate Item-Level Quantities and Unmapped SKUs
  const items = Array.from(itemMap.values());
  items.forEach(item => {
    if (!item.skuMaster) {
      item.reasons.push('unmapped_master_sku');
      reasonCodes.add('unmapped_master_sku');
    }
    if (item.grnQty > item.poQty) {
      item.reasons.push('grn_qty_exceeds_po_qty');
      reasonCodes.add('grn_qty_exceeds_po_qty');
    }
    if (item.invQty > item.grnQty) {
      item.reasons.push('invoice_qty_exceeds_grn_qty');
      reasonCodes.add('invoice_qty_exceeds_grn_qty');
    }
    if (item.invQty > item.poQty) {
      item.reasons.push('invoice_qty_exceeds_po_qty');
      reasonCodes.add('invoice_qty_exceeds_po_qty');
    }
  });

  // 5. Compute Final Status
  const hardViolations = [
    'grn_qty_exceeds_po_qty',
    'invoice_qty_exceeds_grn_qty',
    'invoice_qty_exceeds_po_qty',
    'invoice_date_after_po_date',
    'item_missing_in_po',
    'duplicate_po'
  ];
  const hasHardViolation = Array.from(reasonCodes).some(r => hardViolations.includes(r));

  let finalStatus = 'matched';
  if (hasHardViolation) {
    finalStatus = 'mismatch';
  } else if (reasonCodes.size > 0 || items.some(i => i.grnQty !== i.poQty || i.invQty !== i.poQty)) {
    finalStatus = 'partially_matched';
  }

  return {
    poNumber,
    status: finalStatus,
    reasons: Array.from(reasonCodes),
    documents: {
      poUploaded: true,
      grnCount: grns.length,
      invoiceCount: invoices.length
    },
    items
  };
};

export    {evaluateThreeWayMatch} ;