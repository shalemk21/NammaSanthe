import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { BottomNav } from './BottomNav';
import {
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  Truck,
  MapPin,
  X,
  Phone,
  ShieldCheck,
  Store,
  RotateCcw,
  AlertCircle,
  CreditCard,
  Play,
  Sparkles,
  RefreshCw,
  FileText,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { ReturnRequestModal } from './ReturnRequestModal';

export const OrdersTrackingScreen: React.FC = () => {
  const {
    orders,
    selectedOrderForDetail,
    setSelectedOrderForDetail,
    cancelOrder,
    updateOrderStatus,
    language,
    showToast,
    openInvoiceModal,
    openReviewModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Cancellation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('Change of delivery plans');
  const [customReason, setCustomReason] = useState('');

  // 1-Click Simulation Transition Steps
  const getNextSimulationStep = (currentStatus: Order['status'], isPickup: boolean) => {
    switch (currentStatus) {
      case 'pending':
      case 'confirmed':
        return {
          nextStatus: 'packed',
          label: 'Pack Order at Local Store',
          note: 'Farm-fresh items picked, weighed and packed in eco-friendly bags.',
          ref: isPickup ? 'PICKUP-PIN-7721' : 'LOC-PACK-8841',
        };
      case 'processing':
        return {
          nextStatus: 'packed',
          label: 'Finish Packing Order',
          note: 'Produce bagged and labeled with temperature control.',
          ref: isPickup ? 'PICKUP-PIN-7721' : 'LOC-PACK-8841',
        };
      case 'packed':
        return isPickup
          ? {
              nextStatus: 'ready_for_pickup',
              label: 'Set Ready for In-Store Pickup',
              note: 'Order moved to customer pickup counter #3.',
              ref: 'TOKEN-PICKUP-9931',
            }
          : {
              nextStatus: 'shipped',
              label: 'Dispatch Out for Delivery',
              note: 'Handed over to local electric delivery partner.',
              ref: 'SANTHE-EXP-4402',
            };
      case 'ready_for_pickup':
        return {
          nextStatus: 'picked_up',
          label: 'Customer Picked Up Items',
          note: 'Handed over to customer at pickup counter. Thank you!',
        };
      case 'shipped':
        return {
          nextStatus: 'delivered',
          label: 'Mark as Delivered Fresh',
          note: 'Delivered directly to customer doorstep. Enjoy fresh produce!',
        };
      case 'delivered':
      case 'picked_up':
        return {
          nextStatus: 'confirmed',
          label: 'Reset to Placed (Re-test)',
          note: 'Order reset to initial placed state for demo simulation.',
        };
      default:
        return null;
    }
  };

  const handleSimulateNextStep = async (order: Order) => {
    const isPickup = order.fulfillmentType === 'pickup';
    const nextStep = getNextSimulationStep(order.status, isPickup);
    if (!nextStep) return;

    setIsSimulating(true);
    try {
      await updateOrderStatus(order.id, nextStep.nextStatus, nextStep.note, nextStep.ref);
      if (nextStep.nextStatus === 'delivered' || nextStep.nextStatus === 'picked_up') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#1B5E3B', '#F2B705', '#E76F51'],
        });
        showToast('🎉 Order delivered successfully!', 'success', 'ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ತಲುಪಿಸಲಾಗಿದೆ!');
      } else {
        showToast(`Order updated to: ${nextStep.nextStatus.replace(/_/g, ' ').toUpperCase()}`, 'info');
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'processing') return order.status === 'confirmed' || order.status === 'processing' || order.status === 'packed';
    if (activeTab === 'shipped') return order.status === 'shipped' || order.status === 'ready_for_pickup';
    if (activeTab === 'delivered') return order.status === 'delivered' || order.status === 'picked_up';
    return true;
  });

  // Multi-Vendor Order Splitting: Detect and group orders sharing parentOrderId
  const groupedOrderEntries = React.useMemo(() => {
    const parentMap = new Map<string, Order[]>();
    const standalone: Order[] = [];

    filteredOrders.forEach((order) => {
      if (order.parentOrderId) {
        const existing = parentMap.get(order.parentOrderId) || [];
        existing.push(order);
        parentMap.set(order.parentOrderId, existing);
      } else {
        standalone.push(order);
      }
    });

    const entries: (
      | { type: 'combined'; parentOrderId: string; orders: Order[]; total: number }
      | { type: 'single'; order: Order }
    )[] = [];

    parentMap.forEach((parentOrders, pId) => {
      entries.push({
        type: 'combined',
        parentOrderId: pId,
        orders: parentOrders,
        total: parentOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      });
    });

    standalone.forEach((order) => {
      entries.push({ type: 'single', order });
    });

    return entries;
  }, [filteredOrders]);

  const getStatusBadge = (status: Order['status'], fulfillmentType?: Order['fulfillmentType']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
            Confirmed
          </span>
        );
      case 'processing':
        return (
          <span className="badge-terracotta" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={10} />
            <span>Preparing</span>
          </span>
        );
      case 'packed':
        return (
          <span style={{ background: '#EDE9FE', color: '#6D28D9', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
            Packed
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Store size={11} />
            <span>Ready for Pickup</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="badge-turmeric" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Truck size={10} />
            <span>Out for Delivery</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <CheckCircle2 size={10} />
            <span>Delivered Fresh</span>
          </span>
        );
      case 'picked_up':
        return (
          <span className="badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <CheckCircle2 size={10} />
            <span>Picked Up</span>
          </span>
        );
      case 'cancelled':
        return (
          <span style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderForDetail) return;
    const finalReason = customReason ? `${cancellationReason}: ${customReason}` : cancellationReason;
    await cancelOrder(selectedOrderForDetail.id, finalReason);
    setIsCancelModalOpen(false);
    setSelectedOrderForDetail(null);
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '90px', background: '#F8F7ED', minHeight: '100vh' }}>
      <HeaderNav />

      <div style={{ padding: '14px 16px' }}>
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: '#1B5E3B', fontWeight: 700, margin: '0 0 2px' }}>
            {language === 'kn' ? 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ಟ್ರ್ಯಾಕಿಂಗ್' : 'My Orders & Tracking'}
          </h2>
          <span style={{ fontSize: '11.5px', color: '#885E3C' }}>
            Phase 2: Live status milestones, pickup counters, tracking references & refund progress
          </span>
        </div>

        {/* Status Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#ECE9D8',
            borderRadius: '999px',
            padding: '3px',
            marginBottom: '16px',
            border: '1px solid #DDD8C4',
          }}
        >
          {(['all', 'processing', 'shipped', 'delivered'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              id={`orders-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '7px 0',
                fontSize: '11.5px',
                fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? '#1B5E3B' : '#5E6961',
                background: activeTab === tab ? '#FFFFFF' : 'transparent',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                boxShadow: activeTab === tab ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {tab === 'processing' ? 'Preparing' : tab === 'shipped' ? 'In Transit' : tab}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div
            className="card-base"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              marginTop: '10px',
              background: '#FFF',
              borderRadius: '16px',
              border: '1px solid #E8E5D3',
            }}
          >
            <Package size={36} color="#885E3C" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C241E', marginBottom: '4px' }}>
              No orders found in this tab
            </h3>
            <p style={{ fontSize: '12px', color: '#5E6961' }}>
              Your fresh orders placed with local Karnataka vendors will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {groupedOrderEntries.map((entry) => {
              if (entry.type === 'combined') {
                return (
                  <div
                    key={entry.parentOrderId}
                    className="card-base"
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1.5px solid #1B5E3B',
                      boxShadow: '0 4px 16px rgba(27, 94, 59, 0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Combined Santhe Order Top Banner */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #1B5E3B 0%, #13462B 100%)',
                        color: '#FFFFFF',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            background: 'rgba(255,255,255,0.2)',
                            padding: '6px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Package size={18} color="#A7F3D0" />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>Combined Santhe Order</span>
                            <span style={{ fontSize: '11px', color: '#A7F3D0', fontWeight: 600 }}>
                              #{entry.parentOrderId}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#D1E7DD' }}>
                            Multi-Vendor Cart Split into {entry.orders.length} Local Producer Packages
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', color: '#A7F3D0', display: 'block', textTransform: 'uppercase' }}>
                          Combined Total
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>₹{entry.total}</span>
                      </div>
                    </div>

                    {/* Independent Vendor Packages */}
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#5E6961', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Independent Vendor Packages & Status:
                      </div>

                      {entry.orders.map((subOrder, subIdx) => {
                        const isPickup = subOrder.fulfillmentType === 'pickup';
                        const isCod = subOrder.paymentMethod.toUpperCase().includes('COD');

                        return (
                          <div
                            key={subOrder.id}
                            style={{
                              background: '#FAF9F2',
                              border: '1px solid #E8E5D3',
                              borderRadius: '12px',
                              padding: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span
                                  style={{
                                    background: '#1B5E3B',
                                    color: '#FFF',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                  }}
                                >
                                  Package {subIdx + 1}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>
                                  {subOrder.vendorName}
                                </span>
                                {isPickup && (
                                  <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '9.5px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                    <Store size={9} />
                                    <span>Pickup</span>
                                  </span>
                                )}
                              </div>
                              {getStatusBadge(subOrder.status, subOrder.fulfillmentType)}
                            </div>

                            {/* Item thumbnails */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
                              {subOrder.items.map((item: any, i: number) => {
                                const img = item.product?.image || item.image || '';
                                const name = item.product?.name || item.name || 'Item';
                                return (
                                  <img
                                    key={i}
                                    src={img}
                                    alt={name}
                                    title={`${name} x${item.quantity}`}
                                    style={{
                                      width: '38px',
                                      height: '38px',
                                      borderRadius: '6px',
                                      objectFit: 'cover',
                                      border: '1px solid #E8E5D3',
                                    }}
                                  />
                                );
                              })}
                              <div style={{ fontSize: '11px', color: '#5E6961' }}>
                                {subOrder.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0)} items • Sub-Order #{subOrder.id}
                              </div>
                            </div>

                            {subOrder.trackingReference && (
                              <div style={{ fontSize: '10.5px', color: '#1B5E3B', background: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                                Tracking Token: <strong>{subOrder.trackingReference}</strong>
                              </div>
                            )}

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingTop: '6px',
                                borderTop: '1px dashed #E8E5D3',
                                marginTop: '4px',
                              }}
                            >
                              <div style={{ fontSize: '12px' }}>
                                <span style={{ color: '#5E6961' }}>Package Total: </span>
                                <strong style={{ color: '#1B5E3B' }}>₹{subOrder.totalAmount}</strong>
                              </div>

                              <button
                                type="button"
                                id={`track-order-${subOrder.id}`}
                                onClick={() => setSelectedOrderForDetail(subOrder)}
                                className="btn-outline"
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '11px',
                                  borderRadius: '8px',
                                  background: '#FFF',
                                  borderColor: '#1B5E3B',
                                  color: '#1B5E3B',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                }}
                              >
                                <span>Track Package</span>
                                <ChevronRight size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Standalone Single Order
              const order = entry.order;
              const isPickup = order.fulfillmentType === 'pickup';
              const isCod = order.paymentMethod.toUpperCase().includes('COD');

              return (
                <div
                  key={order.id}
                  className="card-base"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E8E5D3',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#1C241E' }}>
                          Order #{order.id}
                        </span>
                        {isPickup && (
                          <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <Store size={10} />
                            <span>Pickup</span>
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#5E6961' }}>
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {getStatusBadge(order.status, order.fulfillmentType)}
                  </div>

                  {/* Vendor & Payment Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                    <span style={{ color: '#885E3C', fontWeight: 600 }}>Producer: {order.vendorName}</span>
                    <span style={{ color: isCod ? '#D97706' : '#059669', fontWeight: 700 }}>
                      {isCod ? '● COD (Pending)' : '● Paid Online'}
                    </span>
                  </div>

                  {/* Item thumbnails */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
                    {order.items.map((item: any, i) => {
                      const img = item.product?.image || item.image || '';
                      const name = item.product?.name || item.name || 'Item';
                      return (
                        <img
                          key={i}
                          src={img}
                          alt={name}
                          title={`${name} x${item.quantity}`}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            border: '1px solid #E8E5D3',
                          }}
                        />
                      );
                    })}
                    <div style={{ fontSize: '11px', color: '#5E6961', marginLeft: '4px' }}>
                      {order.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)} items
                    </div>
                  </div>

                  {/* Refund notice if applicable */}
                  {order.refundStatus === 'successful' && (
                    <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <RotateCcw size={13} />
                      <span>Refund of ₹{order.refundAmount || order.totalAmount} processed to payment method</span>
                    </div>
                  )}

                  {/* Tracking reference badge */}
                  {order.trackingReference && (
                    <div style={{ fontSize: '11px', color: '#1B5E3B', background: '#F0FDF4', padding: '4px 8px', borderRadius: '6px' }}>
                      Courier Ref: <strong>{order.trackingReference}</strong>
                    </div>
                  )}

                  {/* Footer row with total and action */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid #F0EEE4',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '11px', color: '#5E6961' }}>Total: </span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#1B5E3B' }}>
                        ₹{order.totalAmount}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        id={`invoice-btn-${order.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openInvoiceModal(order);
                        }}
                        style={{
                          background: '#F0FDFA',
                          border: '1px solid #99F6E4',
                          color: '#0F766E',
                          borderRadius: '8px',
                          padding: '5px 9px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Download Tax Invoice"
                      >
                        <FileText size={12} />
                        <span>Invoice</span>
                      </button>

                      <button
                        type="button"
                        id={`track-order-${order.id}`}
                        onClick={() => setSelectedOrderForDetail(order)}
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '11.5px' }}
                      >
                        <span>Live Status</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Order Tracking Modal */}
      {selectedOrderForDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedOrderForDetail(null)}
        >
          <div
            className="fade-in"
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#FFFFFF',
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              padding: '20px 20px 30px',
              maxHeight: '88vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid #F0EEE4',
                marginBottom: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '18px',
                      color: '#1B5E3B',
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    Order #{selectedOrderForDetail.id}
                  </h3>
                  {getStatusBadge(selectedOrderForDetail.status, selectedOrderForDetail.fulfillmentType)}
                </div>
                <div style={{ fontSize: '11px', color: '#885E3C', marginTop: '2px' }}>
                  {selectedOrderForDetail.estimatedDelivery}
                  {selectedOrderForDetail.parentOrderId && (
                    <span style={{ display: 'block', color: '#1B5E3B', fontWeight: 600 }}>
                      Part of Combined Santhe Order #{selectedOrderForDetail.parentOrderId}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderForDetail(null)}
                style={{
                  background: '#F8F7ED',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#5E6961',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tracking Reference if available */}
            {selectedOrderForDetail.trackingReference && (
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginBottom: '14px',
                  fontSize: '12px',
                  color: '#166534',
                }}
              >
                Tracking / Courier Reference: <strong>{selectedOrderForDetail.trackingReference}</strong>
              </div>
            )}

            {/* 1-Click Order Delivery Step Simulator */}
            {selectedOrderForDetail.status !== 'cancelled' && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #E8F5E9 100%)',
                  border: '1px solid #A7F3D0',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(27, 94, 59, 0.08)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: '#1B5E3B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Sparkles size={13} color="#1B5E3B" />
                    <span>Live Order Simulation</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#365314', marginTop: '2px' }}>
                    Status: <strong style={{ textTransform: 'capitalize' }}>{selectedOrderForDetail.status.replace(/_/g, ' ')}</strong>
                  </div>
                </div>

                {(() => {
                  const simStep = getNextSimulationStep(
                    selectedOrderForDetail.status,
                    selectedOrderForDetail.fulfillmentType === 'pickup'
                  );
                  if (!simStep) return null;
                  return (
                    <button
                      type="button"
                      id="simulate-order-step-btn"
                      onClick={() => handleSimulateNextStep(selectedOrderForDetail)}
                      disabled={isSimulating}
                      style={{
                        background: '#1B5E3B',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: isSimulating ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(27, 94, 59, 0.25)',
                      }}
                    >
                      {isSimulating ? (
                        <RefreshCw size={12} className="spin" />
                      ) : simStep.nextStatus === 'confirmed' ? (
                        <RefreshCw size={12} />
                      ) : (
                        <Play size={12} fill="#FFF" />
                      )}
                      <span>{simStep.label}</span>
                    </button>
                  );
                })()}
              </div>
            )}

            {/* Step by Step Tracking Timeline */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', marginBottom: '14px' }}>
                {selectedOrderForDetail.fulfillmentType === 'pickup' ? 'Store Pickup Milestones' : 'Delivery Journey'}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedOrderForDetail.trackingSteps.map((step, idx) => {
                  const isDone = step.completed;
                  const isCurrent = step.current;

                  return (
                    <div key={idx} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                      {/* Timeline line */}
                      {idx < selectedOrderForDetail.trackingSteps.length - 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '11px',
                            top: '24px',
                            bottom: '-14px',
                            width: '2px',
                            background: isDone ? '#1B5E3B' : '#E8E5D3',
                          }}
                        />
                      )}

                      {/* Timeline Icon Node */}
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isDone
                            ? '#1B5E3B'
                            : isCurrent
                            ? '#F2B705'
                            : '#FFFFFF',
                          border: isDone
                            ? 'none'
                            : isCurrent
                            ? '2px solid #F2B705'
                            : '2px solid #C4BEA9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isDone ? '#FFFFFF' : '#1C241E',
                          zIndex: 2,
                          flexShrink: 0,
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={14} />
                        ) : isCurrent ? (
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#231D05',
                            }}
                          />
                        ) : null}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '12.5px',
                              fontWeight: isCurrent || isDone ? 700 : 500,
                              color: isCurrent ? '#1B5E3B' : isDone ? '#1C241E' : '#5E6961',
                            }}
                          >
                            {language === 'kn' ? step.kannadaStep : step.step}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#885E3C' }}>{step.time}</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#5E6961', marginTop: '2px', margin: '2px 0 0' }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Destination / Pickup Info */}
            <div
              style={{
                background: '#F8F7ED',
                border: '1px solid #E8E5D3',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '11.5px',
                color: '#5E6961',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#1C241E', marginBottom: '4px' }}>
                <MapPin size={13} color="#1B5E3B" />
                <span>{selectedOrderForDetail.fulfillmentType === 'pickup' ? 'Pickup Location:' : 'Delivery Destination:'}</span>
              </div>
              <p style={{ lineHeight: 1.4, margin: '0 0 10px' }}>
                {selectedOrderForDetail.deliveryAddress}
              </p>

              <div style={{ borderTop: '1px solid #E8E5D3', paddingTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1B5E3B', fontSize: '13px' }}>
                  <span>Total Paid ({selectedOrderForDetail.paymentMethod})</span>
                  <span>₹{selectedOrderForDetail.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Digital Tax Invoice & Receipt Download */}
            <button
              type="button"
              id="order-detail-tax-invoice-btn"
              onClick={() => openInvoiceModal(selectedOrderForDetail)}
              style={{
                width: '100%',
                marginTop: '14px',
                background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)',
              }}
            >
              <FileText size={16} />
              <span>Download Tax Invoice / Receipt</span>
            </button>

            {/* Action Buttons: Review, Return, or Cancel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {selectedOrderForDetail.status === 'delivered' || selectedOrderForDetail.status === 'picked_up' ? (
                <>
                  <button
                    type="button"
                    id="rate-review-produce-btn"
                    onClick={() => openReviewModal(selectedOrderForDetail)}
                    style={{
                      background: 'linear-gradient(135deg, #1B5E3B 0%, #166534 100%)',
                      color: '#FFF',
                      border: 'none',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 3px 10px rgba(27, 94, 59, 0.25)',
                    }}
                  >
                    <Star size={16} fill="#F2B705" color="#F2B705" />
                    <span>Rate & Review Fresh Produce (Add Photos)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsReturnModalOpen(true)}
                    style={{
                      background: '#FFF',
                      color: '#E76F51',
                      border: '1.5px solid #E76F51',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>Request Return / Refund</span>
                  </button>
                </>
              ) : selectedOrderForDetail.status !== 'cancelled' &&
                selectedOrderForDetail.status !== 'shipped' ? (
                <>
                  {/* Cancel Button (eligible before dispatch) */}
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    style={{
                      background: '#FFF',
                      color: '#E76F51',
                      border: '1.5px solid #E76F51',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel Order
                  </button>

                  {/* Demo Simulation Step Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const isPickup = selectedOrderForDetail.fulfillmentType === 'pickup';
                      const nextStatus =
                        selectedOrderForDetail.status === 'confirmed'
                          ? 'processing'
                          : selectedOrderForDetail.status === 'processing'
                          ? isPickup
                            ? 'ready_for_pickup'
                            : 'shipped'
                          : isPickup
                          ? 'picked_up'
                          : 'delivered';
                      updateOrderStatus(
                        selectedOrderForDetail.id,
                        nextStatus,
                        `Simulated order progress: moved to ${nextStatus}`
                      );
                    }}
                    style={{
                      background: '#F0EFE6',
                      color: '#1B5E3B',
                      border: '1px solid #D0CDBB',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ⚡ Demo: Advance to Next Milestone
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION DIALOG MODAL (Prompt Requirement #4) */}
      {isCancelModalOpen && selectedOrderForDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '380px',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#DC2626' }}>
                Cancel Order #{selectedOrderForDetail.id}
              </h3>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5E6961' }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '14px',
                fontSize: '11.5px',
                color: '#991B1B',
                lineHeight: 1.4,
              }}
            >
              <strong>Refund Policy Disclosure:</strong>
              {selectedOrderForDetail.paymentStatus === 'paid' &&
              !selectedOrderForDetail.paymentMethod.toUpperCase().includes('COD') ? (
                <span>
                  {' '}
                  This is a prepaid order. A full refund of <strong>₹{selectedOrderForDetail.totalAmount}</strong> will
                  be automatically credited back to your payment source. Reserved stock will be released back to the store.
                </span>
              ) : (
                <span>
                  {' '}
                  This is a Cash on Delivery order. It will be cancelled without any fee. No payment refund is required.
                </span>
              )}
            </div>

            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#1C241E', display: 'block', marginBottom: '4px' }}>
              Select Cancellation Reason:
            </label>
            <select
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px', marginBottom: '8px' }}
            >
              <option value="Change of delivery plans">Change of delivery plans</option>
              <option value="Ordered duplicate / wrong item">Ordered duplicate / wrong item</option>
              <option value="Need in-store pickup instead">Need in-store pickup instead</option>
              <option value="Expected delivery time is late">Expected delivery time is late</option>
              <option value="Found alternative item locally">Found alternative item locally</option>
              <option value="Other">Other Reason</option>
            </select>

            {cancellationReason === 'Other' && (
              <textarea
                placeholder="Please describe your reason..."
                rows={2}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px', marginBottom: '12px', boxSizing: 'border-box' }}
              />
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={handleConfirmCancel}
                style={{
                  flex: 1,
                  background: '#DC2626',
                  color: '#FFF',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Confirm Cancellation
              </button>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                style={{
                  background: '#E5E7EB',
                  color: '#4B5563',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      <ReturnRequestModal
        order={selectedOrderForDetail}
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
      />

      <BottomNav />
    </div>
  );
};

