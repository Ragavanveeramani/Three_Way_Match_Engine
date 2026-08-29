import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const DEFAULT_MODELS = ['gemini-3.6-flash', 'gemini-3.1-pro-preview'];

const generateWithRetry = async (ai, payload, models = DEFAULT_MODELS, retries = 3) => {
  let lastError;

  for (const model of models) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          ...payload
        });
        return response;
      } catch (error) {
        lastError = error;

        if (error.status === 503 || error.status === 429) {
          const delay = Math.pow(2, attempt) * 1500;
          console.warn(`[Gemini API] ${model} returned ${error.status}. Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
        } else {
          console.warn(`[Gemini API] ${model} failed with status ${error.status || error.code}. Trying next model...`);
          break;
        }
      }
    }
  }

  throw lastError;
};

const parseDocumentWithGemini = async (filePath, documentType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const absolutePath = path.resolve(filePath);

  // 1. Upload file using Gemini Files API for native OCR processing
  console.log('[Gemini API] Uploading file to Gemini File API...');
  const uploadedFile = await ai.files.upload({
    file: absolutePath,
    mimeType: 'application/pdf'
  });

  const prompts = {
    po: `Extract key details from this Purchase Order document.
Return strictly valid JSON with no markdown wrapping:
{
  "poNumber": "extracted purchase order number",
  "poDate": "extracted date",
  "vendorName": "extracted vendor name",
  "items": [
    {
      "itemCode": "item code or SKU",
      "description": "item description",
      "quantity": 1
    }
  ]
}`,
    grn: `Extract Goods Receipt Note details in strictly valid JSON:
{
  "grnNumber": "string",
  "poNumber": "string",
  "grnDate": "string",
  "items": [
    { "itemCode": "string", "description": "string", "receivedQuantity": 0, "mrp": 0 }
  ]
}`,
    invoice: `Extract Tax Invoice details in strictly valid JSON:
{
  "invoiceNumber": "string",
  "poNumber": "string",
  "invoiceDate": "string",
  "items": [
    { "itemCode": "string", "description": "string", "quantity": 0, "unitRate": 0, "mrp": 0 }
  ]
}`
  };

  const selectedPrompt = prompts[documentType.toLowerCase()];
  if (!selectedPrompt) {
    throw new Error(`Invalid document type: ${documentType}`);
  }

  const payload = {
    contents: [
      {
        fileData: {
          fileUri: uploadedFile.uri,
          mimeType: uploadedFile.mimeType
        }
      },
      { text: selectedPrompt }
    ],
    config: {
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await generateWithRetry(ai, payload);
    const cleanJsonText = response.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJsonText);

    return parsed.data || parsed.purchaseOrder || parsed.po || parsed.invoice || parsed.grn || parsed;
  } finally {
    // 2. Cleanup file from Gemini API storage after processing
    try {
      await ai.files.delete({ name: uploadedFile.name });
    } catch (cleanupErr) {
      console.warn('[Gemini API] File cleanup failed:', cleanupErr.message);
    }
  }
};

export { parseDocumentWithGemini };