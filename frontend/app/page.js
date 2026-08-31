'use client';

import { useState } from 'react';
import SummaryTab from '../components/SummaryTab.jsx';
import DocumentTab from '../components/DocumentTab.jsx';
import LineItemGrid from '../components/LineItemGrid.jsx';
import FileUpload from '../components/fileUpload.jsx';

export default function Dashboard() {
  const [poNumber, setPoNumber] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [matchData, setMatchData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (targetPo) => {
    const searchPo = targetPo !== undefined ? targetPo : poNumber;

    // Clear state if the search input is empty
    if (!searchPo.trim()) {
      setMatchData(null);
      setSummaryData(null);
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: 'Bearer mock-static-jwt-token-12345' };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const [mRes, sRes] = await Promise.all([
        fetch(`${apiUrl}/match/${searchPo}`, { headers }),
        fetch(`${apiUrl}/summary/${searchPo}`, { headers })
      ]);

      if (mRes.ok) {
        const mJson = await mRes.json();
        setMatchData(mJson);
      } else {
        setMatchData(null);
      }

      if (sRes.ok) {
        const sJson = await sRes.json();
        setSummaryData(sJson);
      } else {
        setSummaryData(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setMatchData(null);
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleUploadSuccess = (uploadResponse) => {
    const newPo = uploadResponse?.poNumber || uploadResponse?.document?.poNumber || poNumber;
    if (newPo) {
      setPoNumber(newPo);
      fetchData(newPo);
    }
  };

  const getSelectedDocData = () => {
    if (!summaryData || !summaryData.documents) return null;
    
    return summaryData.documents.find((doc) => {
      const typeStr = (doc.type || doc.documentType || '').toLowerCase();
      if (typeStr) {
        return typeStr === activeTab;
      }
      // Fallback check matching property existence directly
      if (activeTab === 'po') return Boolean(doc.poNumber || doc.poDate);
      if (activeTab === 'grn') return Boolean(doc.grnNumber || doc.grnDate);
      if (activeTab === 'invoice') return Boolean(doc.invoiceNumber || doc.invoiceDate);
      return false;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Search Header Form */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-lg border shadow-sm gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            className="border px-3 py-1.5 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Search PO Number..."
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {matchData && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            matchData.status === 'matched' ? 'bg-green-100 text-green-800' :
            matchData.status === 'partially_matched' ? 'bg-amber-100 text-amber-800' :
            matchData.status === 'mismatch' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
          }`}>
            Status: {matchData.status}
          </span>
        )}
      </div>

      {/* Upload Box */}
      <FileUpload onUploadSuccess={handleUploadSuccess} />

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 flex space-x-6 text-sm font-medium">
        {['summary', 'po', 'grn', 'invoice'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'po' ? 'Purchase Order' : tab === 'grn' ? 'Delivery (GRN)' : tab === 'invoice' ? 'Invoices' : 'Summary'}
          </button>
        ))}
      </div>

      {/* Render Active View */}
      {activeTab === 'summary' && <SummaryTab summary={summaryData} />}
      {activeTab !== 'summary' && <DocumentTab title={activeTab.toUpperCase()} docData={getSelectedDocData()} />}

      {/* Line Item Grid */}
      {matchData?.items && <LineItemGrid items={matchData.items} />}
    </div>
  );
}