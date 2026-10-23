import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminNav } from './AdminNav';
import { Layers, AlertTriangle, CheckCircle, Search, Eye } from 'lucide-react';

export const AdminListingsScreen: React.FC = () => {
  const { products, flagListing, setSelectedProduct, setCustomerScreen } = useApp();
  const [search, setSearch] = useState('');
  const [flagFilter, setFlagFilter] = useState<'all' | 'flagged' | 'clean'>('all');

  const filtered = products.filter((p) => {
    const matchesFlag =
      flagFilter === 'all' ||
      (flagFilter === 'flagged' && p.isSuspicious) ||
      (flagFilter === 'clean' && !p.isSuspicious);

    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    return matchesFlag && matchesSearch;
  });

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      <div style={{ background: '#FFF', padding: '16px', borderBottom: '1px solid #E8E5D3' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
          Listings Moderation & Fraud Watch
        </h1>
        <p style={{ fontSize: '11px', color: '#5E6961', margin: '2px 0 0' }}>
          Inspect catalog products, prevent counterfeit items, and flag unauthorized listings
        </p>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Search product or seller name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px' }}
          />
          <select
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value as any)}
            style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px', background: '#FFF' }}
          >
            <option value="all">All ({products.length})</option>
            <option value="flagged">Flagged ({products.filter((p) => p.isSuspicious).length})</option>
            <option value="clean">Verified Normal</option>
          </select>
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((prod) => (
          <div
            key={prod.id}
            style={{
              background: '#FFF',
              borderRadius: '12px',
              border: prod.isSuspicious ? '1.5px solid #E76F51' : '1px solid #E8E5D3',
              padding: '12px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <img src={prod.image} alt={prod.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', margin: 0 }}>{prod.name}</h3>
                {prod.isSuspicious && (
                  <span style={{ background: '#F8D7DA', color: '#842029', padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700 }}>
                    FLAGGED SUSPICIOUS
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: '#885E3C' }}>
                {prod.vendorName} • ₹{prod.price}/{prod.unit} • Stock: {prod.stockCount}
              </div>
              <div style={{ fontSize: '10px', color: '#5E6961' }}>
                Category: {prod.category} • Return window: {prod.returnWindowDays || 7} days
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => flagListing(prod.id, !prod.isSuspicious)}
                style={{
                  background: prod.isSuspicious ? '#1B5E3B' : '#FFF',
                  color: prod.isSuspicious ? '#FFF' : '#E76F51',
                  border: prod.isSuspicious ? 'none' : '1px solid #E76F51',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <AlertTriangle size={11} />
                <span>{prod.isSuspicious ? 'Clear Flag' : 'Flag Listing'}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedProduct(prod);
                  setCustomerScreen('detail');
                }}
                style={{
                  background: '#F0EFE6',
                  color: '#5E6961',
                  border: 'none',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Eye size={11} />
                <span>Inspect</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <AdminNav />
    </div>
  );
};
