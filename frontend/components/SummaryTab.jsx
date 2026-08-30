'use client';

export default function SummaryTab({ summary }) {
  if (!summary) return <div className="p-4 text-gray-500">No summary data available.</div>;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">PO Amount</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{summary.poAmount?.toLocaleString() || '0.00'}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Invoiced</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{summary.totalInvoiced?.toLocaleString() || '0.00'}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Received</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{summary.totalReceived?.toLocaleString() || '0.00'}</p>
        </div>
      </div>

      {/* Uploaded Documents Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
          Uploaded Document History
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-600 border-b">
              <th className="p-3">Doc Type</th>
              <th className="p-3">Document #</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {summary.documents && summary.documents.length > 0 ? (
              summary.documents.map((doc, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-blue-600">{doc.type}</td>
                  <td className="p-3 font-mono text-gray-800">{doc.number}</td>
                  <td className="p-3 text-gray-600">{doc.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">No linked documents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}