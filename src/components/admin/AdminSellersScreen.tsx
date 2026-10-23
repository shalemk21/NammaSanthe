import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminNav } from './AdminNav';
import { Store, ShieldCheck, XCircle, Search, MapPin, Phone, Star } from 'lucide-react';
import { Shop } from '../../types';

export const AdminSellersScreen: React.FC = () => {
  const { shops, verifySeller, showToast } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'suspended'>('all');
  const [search, setSearch] = useState('');

  const filtered = shops.filter((s) => {
    const matchesFilter = filter === 'all' || s.verificationStatus === filter;
    const matchesSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.locality || s.location || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      <div style={{ background: '#FFF', padding: '16px', borderBottom: '1px solid #E8E5D3' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
          Seller Verification & Account Management
        </h1>
        <p style={{ fontSize: '11px', color: '#5E6961', margin: '2px 0 0' }}>
          Inspect submitted trade licenses, verify identities, and suspend rogue storefronts
        </p>

        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Search seller name or locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px' }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px', background: '#FFF' }}
          >
            <option value="all">All ({shops.length})</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((shop) => (
          <div
            key={shop.id}
            style={{
              background: '#FFF',
              borderRadius: '12px',
              border: '1px solid #E8E5D3',
              padding: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <img src={shop.avatar} alt={shop.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: 0 }}>{shop.name}</h3>
                    <div style={{ fontSize: '11px', color: '#885E3C' }}>{shop.type} • {shop.location}</div>
                  </div>
                  <span
                    style={{
                      background:
                        shop.verificationStatus === 'verified'
                          ? '#D1E7DD'
                          : shop.verificationStatus === 'suspended'
                          ? '#F8D7DA'
                          : '#FFF3CD',
                      color:
                        shop.verificationStatus === 'verified'
                          ? '#0F5132'
                          : shop.verificationStatus === 'suspended'
                          ? '#842029'
                          : '#664D03',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {shop.verificationStatus}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#5E6961', marginTop: '6px' }}>
                  Speciality: {shop.speciality}
                </div>

                {shop.verificationNotes && (
                  <div style={{ background: '#FAF9F0', padding: '6px 8px', borderRadius: '6px', fontSize: '11px', color: '#885E3C', marginTop: '6px', border: '1px solid #E8E5D3' }}>
                    Notes: {shop.verificationNotes}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', borderTop: '1px solid #F0EEE4', paddingTop: '8px' }}>
                  {shop.verificationStatus !== 'verified' && (
                    <button
                      onClick={() => verifySeller(shop.id, 'verified', 'Approved by administrator')}
                      style={{ background: '#1B5E3B', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ✓ Approve Verification
                    </button>
                  )}

                  {shop.verificationStatus !== 'suspended' && (
                    <button
                      onClick={() => verifySeller(shop.id, 'suspended', 'Suspended pending investigation')}
                      style={{ background: '#FFF', color: '#E76F51', border: '1px solid #E76F51', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Suspend Account
                    </button>
                  )}

                  {shop.verificationStatus === 'suspended' && (
                    <button
                      onClick={() => verifySeller(shop.id, 'verified', 'Reinstated after review')}
                      style={{ background: '#1B5E3B', color: '#FFF', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AdminNav />
    </div>
  );
};
