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
} from 'lucide-react';
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
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'processing':
        return (
          <span
            className="badge-terracotta"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
          >
            <Clock size={10} />
            <span>Processing</span>
          </span>
        );
      case 'shipped':
        return (
          <span
            className="badge-turmeric"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
          >
            <Truck size={10} />
            <span>Out for Delivery</span>
          </span>
        );
      case 'delivered':
        return (
          <span
            className="badge-green"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
          >
            <CheckCircle2 size={10} />
            <span>Delivered Fresh</span>
          </span>
        );
      case 'cancelled':
        return (
          <span
            style={{
              background: '#F0ECE8',
              color: '#8E9991',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
            }}
          >
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      <HeaderNav />

      <div style={{ padding: '14px 16px' }}>
        <div style={{ marginBottom: '14px' }}>
          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '22px',
              color: '#1B5E3B',
              fontWeight: 700,
            }}
          >
            {language === 'kn' ? 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ಟ್ರ್ಯಾಕಿಂಗ್' : 'My Orders & Tracking'}
          </h2>
          <span style={{ fontSize: '11.5px', color: '#885E3C' }}>
            Live status of your fresh harvests & deliveries
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
              {tab}
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
            }}
          >
            <Package size={36} color="#885E3C" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C241E', marginBottom: '4px' }}>
              No {activeTab !== 'all' ? activeTab : ''} orders found
            </h3>
            <p style={{ fontSize: '12px', color: '#5E6961' }}>
              Your fresh orders placed with local Karnataka vendors will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="card-base"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>
                      Order #{order.id}
                    </span>
                    <div style={{ fontSize: '10.5px', color: '#8E9991' }}>{order.createdAt}</div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Vendor info */}
                <div style={{ fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>
                  Producer: {order.vendorName}
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
                          width: '44px',
                          height: '44px',
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
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1B5E3B' }}>
                      ₹{order.totalAmount}
                    </span>
                  </div>

                  <button
                    type="button"
                    id={`track-order-${order.id}`}
                    onClick={() => setSelectedOrderForDetail(order)}
                    className="btn-outline"
                    style={{ padding: '6px 12px', fontSize: '11.5px' }}
                  >
                    <span>Track Order</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
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
                    }}
                  >
                    Order #{selectedOrderForDetail.id}
                  </h3>
                  {getStatusBadge(selectedOrderForDetail.status)}
                </div>
                <div style={{ fontSize: '11px', color: '#885E3C' }}>
                  {selectedOrderForDetail.estimatedDelivery}
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

            {/* Delivery Agent Card */}
            {selectedOrderForDetail.deliveryAgent && (
              <div
                style={{
                  background: '#F8F7ED',
                  border: '1px solid #E8E5D3',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#1B5E3B',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    {selectedOrderForDetail.deliveryAgent.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1C241E' }}>
                      {selectedOrderForDetail.deliveryAgent.name}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#885E3C' }}>
                      {selectedOrderForDetail.deliveryAgent.vehicle}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      `Calling delivery hero ${selectedOrderForDetail.deliveryAgent?.name}`,
                      'info'
                    )
                  }
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1px solid #D8D4BF',
                    color: '#1B5E3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Call Agent"
                >
                  <Phone size={15} />
                </button>
              </div>
            )}

            {/* Step by Step Tracking Timeline */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', marginBottom: '14px' }}>
                Delivery Journey
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
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '12.5px',
                              fontWeight: isCurrent || isDone ? 700 : 500,
                              color: isCurrent ? '#1B5E3B' : isDone ? '#1C241E' : '#8E9991',
                            }}
                          >
                            {language === 'kn' ? step.kannadaStep : step.step}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#885E3C' }}>{step.time}</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#5E6961', marginTop: '2px' }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Location & Items Breakdown */}
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
                <span>Destination:</span>
              </div>
              <p style={{ lineHeight: 1.4, marginBottom: '10px' }}>
                {selectedOrderForDetail.deliveryAddress}
              </p>

              <div style={{ borderTop: '1px solid #E8E5D3', paddingTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1B5E3B', fontSize: '13px' }}>
                  <span>Total Paid ({selectedOrderForDetail.paymentMethod})</span>
                  <span>₹{selectedOrderForDetail.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Cancel or Return */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {selectedOrderForDetail.status === 'delivered' ? (
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(true)}
                  style={{
                    background: '#E76F51',
                    color: '#FFF',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Request Return / Refund</span>
                </button>
              ) : selectedOrderForDetail.status !== 'cancelled' ? (
                <>
                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this order? Reserved stock will be returned to the store.')) {
                        cancelOrder(selectedOrderForDetail.id, 'Customer requested cancellation via tracking page');
                      }
                    }}
                    style={{
                      background: '#FFF',
                      color: '#E76F51',
                      border: '1.5px solid #E76F51',
                      padding: '9px 14px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel Order
                  </button>

                  {/* Demo Simulation Step Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus =
                        selectedOrderForDetail.status === 'confirmed'
                          ? 'packed'
                          : selectedOrderForDetail.status === 'packed'
                          ? 'shipped'
                          : 'delivered';
                      updateOrderStatus(
                        selectedOrderForDetail.id,
                        nextStatus,
                        `Simulated delivery progress: moved to ${nextStatus}`
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
                    ⚡ Demo: Advance Delivery Step
                  </button>
                </>
              ) : null}
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
