import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerNav } from './SellerNav';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Clock,
  Phone,
  Package,
  Search,
  Filter,
} from 'lucide-react';
import { Order } from '../../types';

export const SellerOrdersScreen: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    cancelOrder,
    currentUser,
    language,
    showToast,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Orders for this seller
  const myOrders = orders.filter((o) => !currentUser?.shopId || o.vendorId === currentUser.shopId);

  const filteredOrders = myOrders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'processing':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'packed':
        return { bg: '#EDE9FE', text: '#6D28D9' };
      case 'shipped':
        return { bg: '#FDE68A', text: '#854D0E' };
      case 'delivered':
        return { bg: '#D1E7DD', text: '#0F5132' };
      case 'cancelled':
        return { bg: '#F8D7DA', text: '#842029' };
      default:
        return { bg: '#F0ECE8', text: '#5E6961' };
    }
  };

  const handleReject = async (orderId: string) => {
    if (!rejectReason) {
      showToast('Please provide a reason for declining the order', 'warning');
      return;
    }
    await cancelOrder(orderId, `Seller declined: ${rejectReason}`);
    setRejectingOrderId(null);
    setRejectReason('');
  };

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
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '18px', color: '#1B5E3B', fontWeight: 800, margin: 0 }}>
              {language === 'kn' ? 'ಆರ್ಡರ್ ನಿರ್ವಹಣೆ' : 'Order Fulfillment Hub'}
            </h1>
            <span style={{ fontSize: '11px', color: '#885E3C' }}>
              Manage customer orders, packing, and dispatch milestones
            </span>
          </div>
          <span style={{ background: '#1B5E3B', color: '#FFF', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
            {myOrders.length} Total
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#8E9991' }} />
            <input
              type="text"
              placeholder="Search by Order # or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 30px',
                borderRadius: '8px',
                border: '1px solid #D0CDBB',
                fontSize: '12px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #D0CDBB',
              fontSize: '12px',
              background: '#FFF',
              fontWeight: 600,
            }}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#FFF', borderRadius: '14px', border: '1px solid #E8E5D3', color: '#8E9991', fontSize: '13px' }}>
            No orders match the selected filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOrders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              const items = order.items as any[];

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E8E5D3',
                    padding: '14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Top order summary */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#1C241E' }}>
                          #{order.id}
                        </span>
                        <span
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#5E6961', marginTop: '2px' }}>
                        Customer: <strong style={{ color: '#1C241E' }}>{order.customerName}</strong> • {order.createdAt?.split('T')[0] || 'Today'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#1B5E3B' }}>
                        ₹{order.totalAmount}
                      </div>
                      <div style={{ fontSize: '10px', color: '#885E3C' }}>
                        {order.paymentMethod}
                      </div>
                    </div>
                  </div>

                  {/* Items snapshot */}
                  <div style={{ background: '#FAF9F0', padding: '10px', borderRadius: '8px', border: '1px solid #E8E5D3', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#885E3C', marginBottom: '6px' }}>
                      ORDER ITEMS ({items.length}):
                    </div>
                    {items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                        <span style={{ color: '#1C241E' }}>
                          • {it.name || it.product?.name} (x{it.quantity})
                        </span>
                        <span style={{ fontWeight: 600, color: '#5E6961' }}>
                          ₹{(it.priceSnapshot || it.product?.price) * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery destination */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5E6961', marginBottom: '12px' }}>
                    <MapPin size={13} color="#1B5E3B" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.deliveryAddress}
                    </span>
                  </div>

                  {/* Status progression actions */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid #F0EEE4', paddingTop: '10px' }}>
                      {order.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'processing', 'Store started picking and packing fresh produce')}
                            style={{
                              flex: 1,
                              background: '#1B5E3B',
                              color: '#FFF',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            ✓ Accept & Start Packing
                          </button>
                          <button
                            onClick={() => setRejectingOrderId(order.id)}
                            style={{
                              background: '#FFF',
                              color: '#E76F51',
                              border: '1px solid #E76F51',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {order.status === 'processing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'packed', 'Order hand-graded and packed in eco-cloth bag')}
                          style={{
                            flex: 1,
                            background: '#F2B705',
                            color: '#1C241E',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          📦 Mark as Packed
                        </button>
                      )}

                      {order.status === 'packed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped', 'Handed over to Santhe Electric Delivery Partner')}
                          style={{
                            flex: 1,
                            background: '#2A9D8F',
                            color: '#FFF',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          🛵 Handover for Delivery
                        </button>
                      )}

                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered', 'Safely delivered to customer doorstep')}
                          style={{
                            flex: 1,
                            background: '#1B5E3B',
                            color: '#FFF',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          ✓ Confirm Delivered
                        </button>
                      )}
                    </div>
                  )}

                  {/* Reject Order Reason Drawer */}
                  {rejectingOrderId === order.id && (
                    <div style={{ marginTop: '10px', background: '#FFF5F5', padding: '10px', borderRadius: '8px', border: '1px solid #FED7D7' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#C53030', marginBottom: '4px' }}>
                        Decline Reason:
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Fresh stock ran out, farm plucking delayed..."
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E0', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleReject(order.id)}
                          style={{ background: '#E53E3E', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Confirm Decline
                        </button>
                        <button
                          onClick={() => setRejectingOrderId(null)}
                          style={{ background: '#E2E8F0', color: '#4A5568', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SellerNav />
    </div>
  );
};
