'use client';

export default function LineItemGrid({ items = [] }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
        Line Item Reconciliation Grid
      </div>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b text-gray-600">
            <th className="p-3">SKU</th>
            <th className="p-3">Description</th>
            <th className="p-3">PO Qty</th>
            <th className="p-3">GRN Qty</th>
            <th className="p-3">Inv Qty</th>
            <th className="p-3">Agreed Rate</th>
            <th className="p-3">Invoiced Rate</th>
            <th className="p-3">Status / Issues</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item, idx) => {
            const hasQtyErr = item.invQty > item.grnQty || item.grnQty > item.poQty;
            const hasRateErr = item.reasons?.includes('price_mismatch');

            return (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-gray-700">{item.skuCode}</td>
                <td className="p-3 font-medium text-gray-900">{item.description}</td>
                <td className="p-3">{item.poQty}</td>
                <td className={`p-3 font-semibold ${item.grnQty < item.poQty ? 'bg-amber-100 text-amber-800' : ''}`}>
                  {item.grnQty}
                </td>
                <td className={`p-3 font-semibold ${hasQtyErr ? 'bg-red-100 text-red-800' : ''}`}>
                  {item.invQty}
                </td>
                <td className="p-3">₹{item.unitPrice?.toFixed(2) || '0.00'}</td>
                <td className={`p-3 font-semibold ${hasRateErr ? 'bg-red-100 text-red-800' : ''}`}>
                  ₹{item.invoicedRate?.toFixed(2) || '0.00'}
                </td>
                <td className="p-3">
                  {item.reasons && item.reasons.length > 0 ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded">
                      {item.reasons.join(', ')}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                      Matched
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}