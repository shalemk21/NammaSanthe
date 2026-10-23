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
  Store,
  CreditCard,
  Banknote,
  RotateCcw,
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
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [dispatchTrackingRef, setDispatchTrackingRef] = useState<Record<string, string>>({});

  // Orders for this seller
  const myOrders = orders.filter((o) => !currentUser?.shopId || o.vendorId === currentUser.shopId);

  const filteredOrders = myOrders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesFulfillment = fulfillmentFilter === 'all' || o.fulfillmentType === fulfillmentFilter;
    const matchesSearch =
      searchQuery === '' ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesFulfillment && matchesSearch;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'processing':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'packed':
        return { bg: '#EDE9FE', text: '#6D28D9' };
      case 'ready_for_pickup':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'shipped':
        return { bg: '#FDE68A', text: '#854D0E' };
      case 'delivered':
      case 'picked_up':
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
    <div className="fade-in" style={{ paddingBottom: '90px', background: '#F8F7ED', minHeight: '100vh' }}>
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
              Phase 2: Delivery & Pickup Pipelines • Tracking Refs • Payment Status
            </span>
          </div>
          <span style={{ background: '#1B5E3B', color: '#FFF', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
            {myOrders.length} Total
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#5E6961' }} />
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
            <option value="processing">Preparing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="shipped">Dispatched</option>
            <option value="delivered">Delivered / Picked Up</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #D0CDBB',
              fontSize: '12px',
              background: '#FFF',
              fontWeight: 600,
            }}
          >
            <option value="all">All Modes</option>
            <option value="delivery">Delivery</option>
            <option value="pickup">Store Pickup</option>
          </select>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#FFF', borderRadius: '14px', border: '1px solid #E8E5D3', color: '#5E6961', fontSize: '13px' }}>
            No orders match the selected filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOrders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              const items = Array.isArray(order.items) ? order.items : [];
              const isPickup = order.fulfillmentType === 'pickup';
              const isCod = order.paymentMethod.toUpperCase().includes('COD');

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E8E5D3',
                    padding: '14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '14px', color: '#1B5E3B' }}>#{order.id}</strong>
                        {order.parentOrderId && (
                          <span style={{ fontSize: '10px', background: '#ECE9D8', color: '#885E3C', padding: '1px 5px', borderRadius: '4px' }}>
                            Split
                          </span>
                        )}
                        <span
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.text,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#5E6961', marginTop: '2px' }}>
                        Customer: <strong style={{ color: '#1C241E' }}>{order.customerName}</strong> • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#1B5E3B', display: 'block' }}>
                        ₹{order.totalAmount}
                      </span>
                      <span style={{ fontSize: '10.5px', color: isCod ? '#D97706' : '#059669', fontWeight: 700 }}>
                        {isCod ? 'Pay on Delivery' : 'Paid Online'}
                      </span>
                    </div>
                  </div>

                  {/* Mode & Timing Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span
                      style={{
                        background: isPickup ? '#FEF3C7' : '#E0F2FE',
                        color: isPickup ? '#92400E' : '#0369A1',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isPickup ? <Store size={12} /> : <Truck size={12} />}
                      <span>{isPickup ? 'In-Store Pickup' : 'Home Delivery'}</span>
                    </span>

                    <span style={{ background: '#F5F3E8', color: '#5E6961', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>
                      Slot: {order.deliverySlot}
                    </span>

                    {order.refundStatus === 'successful' && (
                      <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <RotateCcw size={11} />
                        <span>Refunded ₹{order.refundAmount || order.totalAmount}</span>
                      </span>
                    )}
                  </div>

                  {/* Items snapshot */}
                  <div style={{ background: '#FAF9F0', padding: '10px', borderRadius: '8px', border: '1px solid #E8E5D3', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#885E3C', marginBottom: '6px' }}>
                      ORDER ITEMS ({items.length}):
                    </div>
                    {items.map((it: any, idx: number) => (
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

                  {/* Delivery destination / Pickup counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5E6961', marginBottom: '12px' }}>
                    <MapPin size={13} color="#1B5E3B" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.deliveryAddress} {order.deliveryPincode ? `(${order.deliveryPincode})` : ''}
                    </span>
                  </div>

                  {/* Tracking Reference Display if available */}
                  {order.trackingReference && (
                    <div style={{ fontSize: '11px', color: '#1B5E3B', background: '#F0FDF4', padding: '4px 8px', borderRadius: '6px', marginBottom: '10px' }}>
                      Tracking Reference: <strong>{order.trackingReference}</strong>
                    </div>
                  )}

                  {/* Status progression actions */}
                  {order.status !== 'delivered' && order.status !== 'picked_up' && order.status !== 'cancelled' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #F0EEE4', paddingTop: '10px' }}>
                      {/* Step: Confirmed */}
                      {order.status === 'confirmed' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                'processing',
                                isPickup ? 'Store assembling items for pickup' : 'Store started picking and packing fresh produce'
                              )
                            }
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
                            ✓ Accept & Start Preparing
                          </button>
                          <button
                            type="button"
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
                        </div>
                      )}

                      {/* Step: Processing */}
                      {order.status === 'processing' && (
                        <div>
                          {isPickup ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(
                                  order.id,
                                  'ready_for_pickup',
                                  'Items packed and placed at store pickup counter'
                                )
                              }
                              style={{
                                width: '100%',
                                background: '#D97706',
                                color: '#FFF',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                            >
                              🏬 Mark as Ready for Store Pickup
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(order.id, 'packed', 'Order hand-graded and packed in eco-cloth bag')
                              }
                              style={{
                                width: '100%',
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
                        </div>
                      )}

                      {/* Step: Packed (Delivery) */}
                      {order.status === 'packed' && !isPickup && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="Optional: Enter Courier / Tracking Reference (e.g. KA-04-EV-2026)"
                            value={dispatchTrackingRef[order.id] || ''}
                            onChange={(e) =>
                              setDispatchTrackingRef({ ...dispatchTrackingRef, [order.id]: e.target.value })
                            }
                            style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '11.5px' }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                'shipped',
                                'Handed over for delivery',
                                dispatchTrackingRef[order.id] || 'KA-04-EV-2026'
                              )
                            }
                            style={{
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
                            🛵 Dispatch / Handover for Delivery
                          </button>
                        </div>
                      )}

                      {/* Step: Ready for Pickup */}
                      {order.status === 'ready_for_pickup' && isPickup && (
                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(order.id, 'picked_up', 'Customer verified Order ID and collected items at counter')
                          }
                          style={{
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
                          ✓ Confirm Handover / Picked Up
                        </button>
                      )}

                      {/* Step: Shipped (Delivery) */}
                      {order.status === 'shipped' && !isPickup && (
                        <button
                          type="button"
                          onClick={() =>
                            updateOrderStatus(order.id, 'delivered', 'Safely delivered to customer doorstep')
                          }
                          style={{
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
                          ✓ Confirm Delivered to Doorstep
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

