'use client';

export default function DocumentTab({ title, docData }) {
  if (!docData) {
    return (
      <div className="p-8 text-center bg-white border border-gray-200 rounded-lg text-gray-500">
        No {title} document uploaded or associated with this Purchase Order yet.
      </div>
    );
  }

  const documentNumber = docData.number || docData.documentNumber || docData.poNumber || docData.invoiceNumber || docData.grnNumber || 'N/A';
  const documentDate = docData.date || docData.poDate || docData.invoiceDate || docData.grnDate || docData.createdAt || 'N/A';
  
  // Resolve id across possible property variations (_id, id, documentId)
  const docId = docData._id || docData.id || docData.documentId;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const pdfUrl = docId ? `${apiUrl}/documents/${docId}/file` : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Metadata Panel */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg space-y-4">
        <h3 className="font-bold text-gray-800 text-lg border-b pb-2">{title} Details</h3>
        <div className="text-sm space-y-3">
          <div className="flex">
            <span className="text-gray-500 w-32 font-medium">Document #:</span>
            <span className="font-mono font-semibold text-gray-800">{documentNumber}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-32 font-medium">Date:</span>
            <span className="text-gray-800">{documentDate}</span>
          </div>
          {docData.vendorName && (
            <div className="flex">
              <span className="text-gray-500 w-32 font-medium">Vendor:</span>
              <span className="text-gray-800">{docData.vendorName}</span>
            </div>
          )}
          {pdfUrl && (
            <div className="pt-2">
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs font-medium inline-flex items-center"
              >
                Open Original File in New Tab →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Right Embedded PDF Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 h-96 flex flex-col">
        {pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-full" title={`${title} Preview`} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm p-4 text-center">
            <p>PDF preview unavailable</p>
            <p className="text-xs text-gray-400 mt-1">Document record lacks a persistent database ID reference.</p>
          </div>
        )}
      </div>
    </div>
  );
}