import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminNav } from './AdminNav';
import {
  Shield,
  TrendingUp,
  Store,
  Users,
  ShoppingBag,
  Scale,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ArrowRight,
  DollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const {
    adminStats,
    loadAdminStats,
    shops,
    disputes,
    products,
    verifySeller,
    resolveDispute,
    setAdminScreen,
    setActiveRole,
    setCustomerScreen,
    showToast,
  } = useApp();

  useEffect(() => {
    loadAdminStats();
  }, []);

  const totalGMV = adminStats?.totalGMV || 184500;
  const platformRevenue = adminStats?.platformFeeRevenue || Math.round(totalGMV * 0.05);
  const totalSellers = adminStats?.totalSellers || shops.length;
  const pendingSellers = shops.filter((s) => s.verificationStatus === 'pending');
  const openDisputes = disputes.filter((d) => d.status !== 'resolved');
  const flaggedProducts = products.filter((p) => p.isSuspicious);

  const platformTrendData = [
    { day: 'Mon', gmv: 21000, fee: 1050 },
    { day: 'Tue', gmv: 24500, fee: 1225 },
    { day: 'Wed', gmv: 22000, fee: 1100 },
    { day: 'Thu', gmv: 28000, fee: 1400 },
    { day: 'Fri', gmv: 34000, fee: 1700 },
    { day: 'Sat', gmv: 42000, fee: 2100 },
    { day: 'Sun (Santhe)', gmv: 58000, fee: 2900 },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      {/* Top Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          padding: '14px 16px',
          borderBottom: '1px solid #E8E5D3',
          zIndex: 800,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#E76F51',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
              Marketplace Command Center
            </h1>
            <div style={{ fontSize: '11px', color: '#885E3C' }}>
              Platform Governance, Disputes & Seller Verification
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveRole('customer');
            setCustomerScreen('home');
          }}
          style={{
            padding: '5px 12px',
            fontSize: '11px',
            border: '1px solid #E76F51',
            color: '#E76F51',
            background: '#FFF',
            borderRadius: '20px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Eye size={12} />
          <span>Customer View</span>
        </button>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#885E3C', fontSize: '11px', fontWeight: 700 }}>
              <span>GROSS MERCHANDISE VALUE</span>
              <DollarSign size={14} color="#1B5E3B" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1B5E3B', marginTop: '4px' }}>
              ₹{totalGMV.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
              Platform 5% take: ₹{platformRevenue.toLocaleString()}
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#885E3C', fontSize: '11px', fontWeight: 700 }}>
              <span>REGISTERED SELLERS</span>
              <Store size={14} color="#F2B705" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1C241E', marginTop: '4px' }}>
              {totalSellers}
            </div>
            <div style={{ fontSize: '10px', color: pendingSellers.length > 0 ? '#E76F51' : '#1B5E3B', marginTop: '2px', fontWeight: 600 }}>
              {pendingSellers.length} pending review
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#885E3C', fontSize: '11px', fontWeight: 700 }}>
              <span>OPEN DISPUTES</span>
              <Scale size={14} color="#E76F51" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: openDisputes.length > 0 ? '#E76F51' : '#1B5E3B', marginTop: '4px' }}>
              {openDisputes.length}
            </div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
              Require arbitration
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#885E3C', fontSize: '11px', fontWeight: 700 }}>
              <span>FLAGGED LISTINGS</span>
              <AlertTriangle size={14} color="#8A6800" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: flaggedProducts.length > 0 ? '#C49400' : '#1B5E3B', marginTop: '4px' }}>
              {flaggedProducts.length}
            </div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
              Fraud / suspicious items
            </div>
          </div>
        </div>

        {/* Recharts GMV Graph */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E5D3', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Platform GMV & Commission Growth
            </h3>
            <span style={{ fontSize: '10px', color: '#885E3C' }}>Daily Platform Totals</span>
          </div>

          <div style={{ width: '100%', height: '170px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminGMV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E76F51" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E76F51" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#5E6961' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5E6961' }} />
                <Tooltip formatter={(val: any) => [`₹${val}`, 'GMV']} />
                <Area type="monotone" dataKey="gmv" stroke="#E76F51" strokeWidth={2.5} fillOpacity={1} fill="url(#adminGMV)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Seller Verification Queue */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E5D3', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Pending Seller Verifications ({pendingSellers.length})
            </h3>
            <button
              onClick={() => setAdminScreen('sellers')}
              style={{ background: 'none', border: 'none', color: '#E76F51', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              All Sellers →
            </button>
          </div>

          {pendingSellers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#8E9991', fontSize: '12px' }}>
              ✓ All local sellers have been reviewed and approved!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingSellers.map((seller) => (
                <div
                  key={seller.id}
                  style={{
                    background: '#FAF9F0',
                    border: '1px solid #E8E5D3',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={seller.avatar} alt={seller.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>{seller.name}</div>
                      <div style={{ fontSize: '11px', color: '#885E3C' }}>{seller.location} • {seller.type}</div>
                      <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>{seller.verificationNotes || 'FSSAI License submitted'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => verifySeller(seller.id, 'verified', 'Approved by Administrator after document verification')}
                      style={{
                        background: '#1B5E3B',
                        color: '#FFF',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => verifySeller(seller.id, 'rejected', 'Missing clear trade license proof')}
                      style={{
                        background: '#FFF',
                        color: '#E76F51',
                        border: '1px solid #E76F51',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dispute Resolution Queue */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E5D3', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Customer-Seller Disputes ({openDisputes.length})
            </h3>
            <button
              onClick={() => setAdminScreen('disputes')}
              style={{ background: 'none', border: 'none', color: '#E76F51', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              Dispute Center →
            </button>
          </div>

          {openDisputes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#8E9991', fontSize: '12px' }}>
              ✓ No active disputes right now. Community trust index is 99.4%!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {openDisputes.map((disp) => (
                <div
                  key={disp.id}
                  style={{
                    background: '#FFF5F5',
                    border: '1px solid #FED7D7',
                    borderRadius: '10px',
                    padding: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#C53030' }}>#{disp.id}: {disp.subject}</span>
                    <span style={{ fontSize: '10px', background: '#F8D7DA', color: '#842029', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {disp.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#5E6961', marginBottom: '8px' }}>
                    Customer: {disp.customerName} vs Seller: {disp.vendorName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#1C241E', background: '#FFF', padding: '6px', borderRadius: '6px', marginBottom: '8px' }}>
                    "{disp.customerStatement}"
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => resolveDispute(disp.id, 'Admin arbitrated in favor of customer: full refund authorized.', 'resolved', 'refund')}
                      style={{ background: '#1B5E3B', color: '#FFF', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Arbitrate: Refund Customer
                    </button>
                    <button
                      onClick={() => resolveDispute(disp.id, 'Admin arbitrated in favor of seller: pickup fulfilled.', 'resolved', 'close')}
                      style={{ background: '#FFF', color: '#5E6961', border: '1px solid #D0CDBB', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Dismiss Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links to other admin screens */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <button
            onClick={() => setAdminScreen('sellers')}
            style={{ background: '#FAF9F0', border: '1px solid #E8E5D3', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}
          >
            <Store size={18} color="#1B5E3B" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1C241E' }}>Sellers</div>
          </button>
          <button
            onClick={() => setAdminScreen('listings')}
            style={{ background: '#FAF9F0', border: '1px solid #E8E5D3', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}
          >
            <AlertTriangle size={18} color="#F2B705" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1C241E' }}>Listings Mod</div>
          </button>
          <button
            onClick={() => setAdminScreen('banners')}
            style={{ background: '#FAF9F0', border: '1px solid #E8E5D3', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}
          >
            <DollarSign size={18} color="#E76F51" style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#1C241E' }}>Promotions</div>
          </button>
        </div>
      </div>

      <AdminNav />
    </div>
  );
};
