import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerNav } from './SellerNav';
import {
  Store,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
  RotateCcw,
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const {
    sellerAnalytics,
    loadSellerAnalytics,
    setSellerScreen,
    setActiveRole,
    setCustomerScreen,
    orders,
    returns,
    currentUser,
    shops,
    updateShop,
    language,
    showToast,
  } = useApp();

  useEffect(() => {
    loadSellerAnalytics();
  }, []);

  const myShop = shops.find((s) => s.id === currentUser?.shopId) || shops[0];
  const [isOpen, setIsOpen] = useState(myShop?.openStatus ?? true);

  const pendingOrders = orders.filter((o) => (!currentUser?.shopId || o.vendorId === currentUser.shopId) && (o.status === 'confirmed' || o.status === 'processing'));
  const pendingReturns = returns.filter((r) => (!currentUser?.shopId || r.vendorId === currentUser.shopId) && r.status === 'requested');

  const totalSales = sellerAnalytics?.totalSales || 48250;
  const totalOrders = sellerAnalytics?.totalOrders || 142;
  const lowStockCount = sellerAnalytics?.lowStockCount || 3;

  const toggleShop = async () => {
    const next = !isOpen;
    setIsOpen(next);
    if (myShop) {
      await updateShop(myShop.id, { openStatus: next });
      showToast(next ? 'Store is now OPEN for local orders' : 'Store is marked CLOSED', 'info');
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      {/* Seller Top Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderBottom: '1px solid #E8E5D3',
          zIndex: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#1B5E3B',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            🌾
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E' }}>
              {myShop?.name || 'Local Storefront'}
            </div>
            <div style={{ fontSize: '11px', color: '#885E3C' }}>
              {myShop?.location || 'Bengaluru'}
            </div>
          </div>
        </div>

        {/* View Customer Marketplace Button */}
        <button
          type="button"
          onClick={() => {
            setActiveRole('customer');
            setCustomerScreen('home');
          }}
          style={{
            padding: '6px 12px',
            fontSize: '11px',
            border: '1px solid #1B5E3B',
            color: '#1B5E3B',
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
        {/* Store Verification & Open/Closed Status Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E8E5D3',
            padding: '14px',
            marginBottom: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: myShop?.verificationStatus === 'verified' ? '#D1E7DD' : '#FFF3CD',
                  color: myShop?.verificationStatus === 'verified' ? '#0F5132' : '#664D03',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <ShieldCheck size={12} />
                {myShop?.verificationStatus === 'verified' ? 'Verified Local Seller' : 'Verification Pending'}
              </span>
            </div>

            <button
              onClick={toggleShop}
              style={{
                background: isOpen ? '#D1E7DD' : '#F8D7DA',
                color: isOpen ? '#0F5132' : '#842029',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ● {isOpen ? 'Store OPEN' : 'Store CLOSED'}
            </button>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>Total Revenue</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E3B', marginTop: '2px' }}>₹{totalSales}</div>
            <div style={{ fontSize: '10px', color: '#1B5E3B', marginTop: '2px' }}>+18.4% growth</div>
          </div>

          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>Active Orders</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1C241E', marginTop: '2px' }}>{pendingOrders.length}</div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>Require fulfillment</div>
          </div>

          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>Low Stock Items</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: lowStockCount > 0 ? '#C49400' : '#1B5E3B', marginTop: '2px' }}>{lowStockCount}</div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>Restock alert</div>
          </div>

          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>Return Claims</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: pendingReturns.length > 0 ? '#E76F51' : '#1B5E3B', marginTop: '2px' }}>{pendingReturns.length}</div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>Awaiting review</div>
          </div>
        </div>

        {/* Action Banners: Pending Returns Notice */}
        {pendingReturns.length > 0 && (
          <div
            onClick={() => setSellerScreen('returns')}
            style={{
              background: '#FFF5F5',
              border: '1px solid #FED7D7',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RotateCcw size={16} color="#E53E3E" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#C53030' }}>
                  {pendingReturns.length} Pending Return Claim{pendingReturns.length > 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '10px', color: '#742A2A' }}>
                  Customer submitted photos for damaged or wilted item replacement.
                </div>
              </div>
            </div>
            <ArrowRight size={14} color="#E53E3E" />
          </div>
        )}

        {/* Quick Orders Awaiting Packing */}
        <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E8E5D3', padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Orders Awaiting Packing
            </h3>
            <button
              onClick={() => setSellerScreen('orders')}
              style={{ background: 'none', border: 'none', color: '#1B5E3B', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              View All ({orders.length}) →
            </button>
          </div>

          {pendingOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', fontSize: '12px', color: '#8E9991' }}>
              ✓ All orders are currently packed and fulfilled!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingOrders.slice(0, 3).map((o) => (
                <div
                  key={o.id}
                  style={{
                    background: '#FAF9F0',
                    border: '1px solid #E8E5D3',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1C241E' }}>
                      #{o.id} • {o.customerName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#5E6961' }}>
                      {(o.items as any[])?.length} items • ₹{o.totalAmount}
                    </div>
                  </div>
                  <button
                    onClick={() => setSellerScreen('orders')}
                    style={{
                      background: '#1B5E3B',
                      color: '#FFF',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Pack Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Navigation Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <button
            onClick={() => setSellerScreen('inventory')}
            style={{
              background: '#FAF9F0',
              border: '1px solid #E8E5D3',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <Package size={20} color="#1B5E3B" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>Inventory Manager</div>
            <div style={{ fontSize: '11px', color: '#5E6961' }}>Edit live stock & pricing</div>
          </button>

          <button
            onClick={() => setSellerScreen('analytics')}
            style={{
              background: '#FAF9F0',
              border: '1px solid #E8E5D3',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <TrendingUp size={20} color="#F2B705" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>Sales & Charts</div>
            <div style={{ fontSize: '11px', color: '#5E6961' }}>Recharts revenue trends</div>
          </button>
        </div>
      </div>

      <SellerNav />
    </div>
  );
};
