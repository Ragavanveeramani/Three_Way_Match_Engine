import express from 'express';
import path from 'path';
import fs from 'fs';
import { upload, protect } from './authMiddleware.js';
import { parseDocumentWithGemini } from '../services/geminiService.js';
import { resolveItemMaster } from '../services/masterResolver.js';

import PurchaseOrder from '../models/PurchaseOrder.js';
import Grn from '../models/Grn.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

/**
 * Helper to extract the first non-empty, non-null, and non-UNKNOWN string.
 */
const getValidValue = (...values) => {
  for (const val of values) {
    if (
      val !== undefined &&
      val !== null &&
      String(val).trim() !== '' &&
      String(val).toUpperCase() !== 'UNKNOWN'
    ) {
      return String(val).trim();
    }
  }
  return null;
};

// POST /documents/upload
// POST /documents/upload
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { documentType } = req.body;
    if (!req.file || !documentType) {
      return res.status(400).json({ message: 'File and documentType are required.' });
    }

    const type = documentType.toLowerCase();

    // Fix Windows path resolution issue
    const normalizedPath = path.resolve(req.file.path);

    // Verify file actually exists and has size > 0
    const stats = fs.statSync(normalizedPath);
    console.log(`[Upload Debug] Path: ${normalizedPath} | Size: ${stats.size} bytes`);

    if (stats.size === 0) {
      return res.status(400).json({ message: 'Uploaded file is empty (0 bytes).' });
    }

    // 1. Send normalized file path to Gemini
   // 1. Send normalized file path to Gemini
    let extractedData = (await parseDocumentWithGemini(normalizedPath, type));

    // Handle instances where Gemini wraps the object inside an array
    if (Array.isArray(extractedData)) {
      extractedData = extractedData[0] || {};
    } else {
      extractedData = extractedData || {};
    }

    console.log('Gemini Parsed Output:', JSON.stringify(extractedData, null, 2));

    const rawItems = Array.isArray(extractedData.items) ? extractedData.items : [];
    // 2. Resolve SKU Master for each line item
    const resolvedItems = await Promise.all(
      rawItems.map(async (item) => {
        const itemCode = getValidValue(item.itemCode, item.sku, item.code) || '';
        const skuMasterId = itemCode ? await resolveItemMaster(itemCode) : null;
        return { ...item, itemCode, skuMaster: skuMasterId };
      })
    );

    let savedDoc;
    const fallbackDate = new Date().toISOString().split('T')[0];

    // 3. Save Document to MongoDB
    if (type === 'po') {
      savedDoc = await PurchaseOrder.create({
        poNumber: getValidValue(extractedData.poNumber, extractedData.po_number, extractedData.number) || `PO-${Date.now()}`,
        poDate: getValidValue(extractedData.poDate, extractedData.po_date, extractedData.date) || fallbackDate,
        vendorName: getValidValue(extractedData.vendorName, extractedData.vendor_name, extractedData.vendor) || 'Unknown Vendor',
        items: resolvedItems,
        filePath: normalizedPath,
        rawParsed: extractedData
      });
    } else if (type === 'grn') {
      savedDoc = await Grn.create({
        grnNumber: getValidValue(extractedData.grnNumber, extractedData.grn_number, extractedData.number) || `GRN-${Date.now()}`,
        poNumber: getValidValue(extractedData.poNumber, extractedData.po_number) || 'PO-UNKNOWN',
        grnDate: getValidValue(extractedData.grnDate, extractedData.grn_date, extractedData.date) || fallbackDate,
        items: resolvedItems,
        filePath: normalizedPath,
        rawParsed: extractedData
      });
    } else if (type === 'invoice') {
      savedDoc = await Invoice.create({
        invoiceNumber: getValidValue(extractedData.invoiceNumber, extractedData.invoice_number, extractedData.number) || `INV-${Date.now()}`,
        poNumber: getValidValue(extractedData.poNumber, extractedData.po_number) || 'PO-UNKNOWN',
        invoiceDate: getValidValue(extractedData.invoiceDate, extractedData.invoice_date, extractedData.date) || fallbackDate,
        items: resolvedItems,
        filePath: normalizedPath,
        rawParsed: extractedData
      });
    } else {
      return res.status(400).json({ message: 'Invalid document type.' });
    }

    res.status(201).json({ message: 'Document uploaded and processed successfully', doc: savedDoc });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Parsing/Upload failed', error: error.message });
  }
});

// GET /documents/:id/file -> Serve raw file for PDF preview
router.get('/:id/file', async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    const grn = await Grn.findById(req.params.id);
    const inv = await Invoice.findById(req.params.id);

    const doc = po || grn || inv;
    if (!doc || !fs.existsSync(doc.filePath)) {
      return res.status(404).send('File not found');
    }

    res.sendFile(path.resolve(doc.filePath));
  } catch (err) {
    res.status(500).send('Error serving file');
  }
});

export default router;