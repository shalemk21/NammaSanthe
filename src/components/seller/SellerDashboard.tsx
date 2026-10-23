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
  Truck,
  MapPin,
  Star,
  AlertCircle,
  CreditCard,
  Banknote,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { Review } from '../../types';
import { api } from '../../services/api';

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

  const [shopReviews, setShopReviews] = useState<Review[]>([]);

  useEffect(() => {
    loadSellerAnalytics();
  }, []);

  const myShop = shops.find((s) => s.id === currentUser?.shopId) || shops[0];
  const [isOpen, setIsOpen] = useState(myShop?.openStatus ?? true);

  // Load reviews for this seller
  useEffect(() => {
    if (myShop) {
      api.reviews.getReviews({ vendorId: myShop.id }).then((res) => {
        if (res.reviews) setShopReviews(res.reviews);
      }).catch(() => {});
    }
  }, [myShop]);

  // Orders for this seller
  const myOrders = orders.filter((o) => !currentUser?.shopId || o.vendorId === currentUser.shopId);

  // Status breakdown
  const pendingOrders = myOrders.filter((o) => o.status === 'confirmed' || o.status === 'processing');
  const preparingOrders = myOrders.filter((o) => o.status === 'processing' || o.status === 'packed');
  const dispatchedOrders = myOrders.filter((o) => o.status === 'shipped' || o.status === 'ready_for_pickup');
  const completedOrders = myOrders.filter((o) => o.status === 'delivered' || o.status === 'picked_up');
  const cancelledOrders = myOrders.filter((o) => o.status === 'cancelled');

  // Returns & Refunds
  const pendingReturns = returns.filter(
    (r) => (!currentUser?.shopId || r.vendorId === currentUser.shopId) && r.status === 'requested'
  );
  const refundedReturns = returns.filter(
    (r) => (!currentUser?.shopId || r.vendorId === currentUser.shopId) && r.status === 'refunded'
  );

  const totalSales = myOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

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
    <div className="fade-in" style={{ paddingBottom: '90px', background: '#F8F7ED' }}>
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
              {myShop?.location || 'Bengaluru'} • PIN: {myShop?.pincode}
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
        {/* Store Verification & Status Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E8E5D3',
            padding: '14px',
            marginBottom: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
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

        {/* ======================================================== */}
        {/* PHASE 2 SPECIFIC SECTION: CONVENIENCE & DELIVERY CONTROLS */}
        {/* ======================================================== */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1B5E3B 0%, #13462B 100%)',
            color: '#FFFFFF',
            borderRadius: '18px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 16px rgba(27, 94, 59, 0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#A7F3D0', fontWeight: 800, letterSpacing: '0.5px' }}>
                Phase 2 Delivery & Fulfillment
              </span>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 0' }}>
                Shopping Convenience Controls
              </h2>
            </div>
            <button
              onClick={() => setSellerScreen('delivery_settings')}
              style={{
                background: '#A7F3D0',
                color: '#065F46',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Settings size={13} />
              <span>Configure PINs</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11.5px' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '8px', borderRadius: '10px' }}>
              <span style={{ color: '#D1E7DD', display: 'block', fontSize: '10px' }}>Serviceable PINs</span>
              <strong style={{ fontSize: '14px' }}>{myShop?.serviceablePincodes?.length || 3} Codes</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '8px', borderRadius: '10px' }}>
              <span style={{ color: '#D1E7DD', display: 'block', fontSize: '10px' }}>Store Pickup</span>
              <strong style={{ fontSize: '14px' }}>{myShop?.allowPickup !== false ? 'Enabled' : 'Disabled'}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '8px', borderRadius: '10px' }}>
              <span style={{ color: '#D1E7DD', display: 'block', fontSize: '10px' }}>Min Order</span>
              <strong style={{ fontSize: '14px' }}>₹{myShop?.minOrderValue || 99}</strong>
            </div>
          </div>
        </div>

        {/* Phase 2 Order Fulfillment Pipeline Breakdown */}
        <div
          className="card-base"
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E8E5D3',
            padding: '14px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
              Order Fulfillment Pipeline
            </h3>
            <button
              onClick={() => setSellerScreen('orders')}
              style={{ background: 'none', border: 'none', color: '#1B5E3B', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              View Hub →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
            <div style={{ background: '#EFF6FF', padding: '10px 4px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#1D4ED8', display: 'block' }}>
                {pendingOrders.length}
              </span>
              <span style={{ fontSize: '10px', color: '#1E40AF', fontWeight: 600 }}>New/Pending</span>
            </div>

            <div style={{ background: '#FEF3C7', padding: '10px 4px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#92400E', display: 'block' }}>
                {preparingOrders.length}
              </span>
              <span style={{ fontSize: '10px', color: '#78350F', fontWeight: 600 }}>Preparing</span>
            </div>

            <div style={{ background: '#EDE9FE', padding: '10px 4px', borderRadius: '10px', border: '1px solid #DDD6FE' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#6D28D9', display: 'block' }}>
                {dispatchedOrders.length}
              </span>
              <span style={{ fontSize: '10px', color: '#5B21B6', fontWeight: 600 }}>Dispatched</span>
            </div>

            <div style={{ background: '#DCFCE7', padding: '10px 4px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#15803D', display: 'block' }}>
                {completedOrders.length}
              </span>
              <span style={{ fontSize: '10px', color: '#166534', fontWeight: 600 }}>Delivered</span>
            </div>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>Total Revenue</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E3B', marginTop: '2px' }}>₹{totalSales}</div>
            <div style={{ fontSize: '10px', color: '#1B5E3B', marginTop: '2px' }}>{myOrders.length} orders total</div>
          </div>

          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>Cancelled Orders</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: cancelledOrders.length > 0 ? '#DC2626' : '#1C241E', marginTop: '2px' }}>
              {cancelledOrders.length}
            </div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>Inventory auto-restored</div>
          </div>

          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>Low Stock Alert</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: lowStockCount > 0 ? '#C49400' : '#1B5E3B', marginTop: '2px' }}>
              {lowStockCount}
            </div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>Needs farm restock</div>
          </div>

          <div style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <div style={{ fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>Returns & Refunds</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: pendingReturns.length > 0 ? '#E76F51' : '#1B5E3B', marginTop: '2px' }}>
              {pendingReturns.length}
            </div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
              {refundedReturns.length} refunded
            </div>
          </div>
        </div>

        {/* Phase 2 Store Reviews Snapshot */}
        <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E8E5D3', padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
                Verified Customer Reviews ({shopReviews.length})
              </h3>
              <span style={{ fontSize: '11px', color: '#885E3C' }}>Store Rating: {myShop?.rating} ★</span>
            </div>
          </div>

          {shopReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#5E6961' }}>
              No verified reviews submitted yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shopReviews.slice(0, 2).map((rev) => (
                <div key={rev.id} style={{ background: '#FAF9F0', padding: '10px', borderRadius: '8px', border: '1px solid #E8E5D3', fontSize: '11.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <strong style={{ color: '#1C241E' }}>{rev.customerName}</strong>
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>{'★'.repeat(rev.rating)}</span>
                  </div>
                  <span style={{ color: '#5E6961', display: 'block' }}>"{rev.comment}"</span>
                  <span style={{ fontSize: '10px', color: '#059669', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                    ✓ Verified Purchase • {rev.productName}
                  </span>
                </div>
              ))}
            </div>
          )}
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
                  Review photo proof and authorize refund or replacement.
                </div>
              </div>
            </div>
            <ArrowRight size={14} color="#E53E3E" />
          </div>
        )}

        {/* Quick Action Navigation Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <button
            onClick={() => setSellerScreen('delivery_settings')}
            style={{
              background: '#FAF9F0',
              border: '1px solid #E8E5D3',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <Truck size={20} color="#1B5E3B" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>Delivery Settings</div>
            <div style={{ fontSize: '11px', color: '#5E6961' }}>PIN codes, rates & prep time</div>
          </button>

          <button
            onClick={() => setSellerScreen('orders')}
            style={{
              background: '#FAF9F0',
              border: '1px solid #E8E5D3',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <ClipboardList size={20} color="#D97706" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>Fulfillment Hub</div>
            <div style={{ fontSize: '11px', color: '#5E6961' }}>Dispatch & tracking refs</div>
          </button>
        </div>
      </div>

      <SellerNav />
    </div>
  );
};

