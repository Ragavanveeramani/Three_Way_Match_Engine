'use client';

import { useState } from 'react';

export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('po');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer mock-static-jwt-token-12345',
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed.');
      }

      setMessage({ type: 'success', text: `Document parsed & uploaded successfully!` });
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-800 text-base">Upload Document</h3>
      
      <form onSubmit={handleUpload} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="po">Purchase Order (PO)</option>
              <option value="grn">Goods Receipt Note (GRN)</option>
              <option value="invoice">Tax Invoice</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">PDF File</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Parsing with Gemini AI...' : 'Upload & Process Document'}
        </button>
      </form>

      {message && (
        <div
          className={`p-2.5 rounded text-xs font-medium ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}