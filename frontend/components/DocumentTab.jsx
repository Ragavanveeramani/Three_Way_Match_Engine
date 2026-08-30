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
  const pdfUrl = docData._id ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/documents/${docData._id}/file` : null;

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
        </div>
      </div>

      {/* Right Embedded PDF Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100 h-96">
        {pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-full" title={`${title} Preview`} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            PDF preview unavailable
          </div>
        )}
      </div>
    </div>
  );
}