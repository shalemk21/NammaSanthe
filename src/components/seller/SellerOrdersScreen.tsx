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
} from 'lucide-react';

export const SellerOrdersScreen: React.FC = () => {
  const {
    orders,
    acceptSellerOrder,
    declineSellerOrder,
    markOrderDelivered,
    language,
  } = useApp();

  const [orderFilter, setOrderFilter] = useState<'new' | 'processing' | 'delivered'>('new');

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'new') return o.status === 'processing';
    if (orderFilter === 'processing') return o.status === 'shipped';
    if (orderFilter === 'delivered') return o.status === 'delivered';
    return true;
  });

  const newOrdersCount = orders.filter((o) => o.status === 'processing').length;
  const inTransitCount = orders.filter((o) => o.status === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      {/* Top Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderBottom: '1px solid #E8E5D3',
          zIndex: 800,
        }}
      >
        <h2
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '18px',
            color: '#1B5E3B',
            fontWeight: 700,
          }}
        >
          {language === 'kn' ? 'ಆರ್ಡರ್ ನಿರ್ವಹಣೆ' : 'Store Orders Management'}
        </h2>
        <span style={{ fontSize: '11px', color: '#885E3C' }}>
          Accept, pack, and hand over fresh produce to Santhe riders
        </span>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#ECE9D8',
            borderRadius: '999px',
            padding: '3px',
            marginBottom: '14px',
            border: '1px solid #DDD8C4',
          }}
        >
          <button
            type="button"
            id="seller-orders-tab-new"
            onClick={() => setOrderFilter('new')}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: '11.5px',
              fontWeight: orderFilter === 'new' ? 700 : 500,
              color: orderFilter === 'new' ? '#1B5E3B' : '#5E6961',
              background: orderFilter === 'new' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              boxShadow: orderFilter === 'new' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            New ({newOrdersCount})
          </button>

          <button
            type="button"
            id="seller-orders-tab-processing"
            onClick={() => setOrderFilter('processing')}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: '11.5px',
              fontWeight: orderFilter === 'processing' ? 700 : 500,
              color: orderFilter === 'processing' ? '#c49400' : '#5E6961',
              background: orderFilter === 'processing' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              boxShadow: orderFilter === 'processing' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            In Transit ({inTransitCount})
          </button>

          <button
            type="button"
            id="seller-orders-tab-delivered"
            onClick={() => setOrderFilter('delivered')}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: '11.5px',
              fontWeight: orderFilter === 'delivered' ? 700 : 500,
              color: orderFilter === 'delivered' ? '#1B5E3B' : '#5E6961',
              background: orderFilter === 'delivered' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              boxShadow: orderFilter === 'delivered' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            Delivered ({deliveredCount})
          </button>
        </div>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <div
            className="card-base"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            <Package size={36} color="#885E3C" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C241E', marginBottom: '4px' }}>
              No {orderFilter} orders currently
            </h3>
            <p style={{ fontSize: '11.5px', color: '#5E6961' }}>
              New customer purchases will pop up here with instant notification.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="card-base"
                style={{
                  padding: '14px',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  border: ord.status === 'processing' ? '1.5px solid #F2B705' : '1px solid #E8E5D3',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>
                      Order #{ord.id}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#8E9991' }}>{ord.createdAt}</div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '999px',
                      background:
                        ord.status === 'processing'
                          ? 'rgba(242,183,5,0.18)'
                          : ord.status === 'shipped'
                          ? 'rgba(27,94,59,0.1)'
                          : 'rgba(27,94,59,0.1)',
                      color: ord.status === 'processing' ? '#8A6800' : '#1B5E3B',
                    }}
                  >
                    {ord.status === 'processing'
                      ? 'New Order'
                      : ord.status === 'shipped'
                      ? 'Out for Delivery'
                      : 'Delivered'}
                  </span>
                </div>

                {/* Items preview list */}
                <div
                  style={{
                    background: '#F8F7ED',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '11.5px',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#885E3C', marginBottom: '4px' }}>
                    Items to Pack ({ord.items.length})
                  </div>
                  {ord.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '3px 0',
                        color: '#1C241E',
                      }}
                    >
                      <span>
                        • {item.product.name} ({item.product.unit})
                      </span>
                      <span style={{ fontWeight: 700 }}>x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Address & Slot */}
                <div style={{ fontSize: '11px', color: '#5E6961' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1C241E', fontWeight: 600 }}>
                    <MapPin size={12} color="#1B5E3B" />
                    <span>{ord.deliveryAddress}</span>
                  </div>
                  <div style={{ marginTop: '2px', color: '#885E3C' }}>Slot: {ord.deliverySlot}</div>
                </div>

                {/* Amount */}
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
                    <span style={{ fontSize: '11px', color: '#5E6961' }}>Store Revenue: </span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1B5E3B' }}>
                      ₹{ord.totalAmount}
                    </span>
                  </div>

                  {/* Actions */}
                  {ord.status === 'processing' ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        id={`decline-order-${ord.id}`}
                        onClick={() => declineSellerOrder(ord.id)}
                        className="btn-outline"
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          borderColor: '#E76F51',
                          color: '#E76F51',
                        }}
                      >
                        <XCircle size={12} />
                        <span>Decline</span>
                      </button>

                      <button
                        type="button"
                        id={`accept-order-${ord.id}`}
                        onClick={() => acceptSellerOrder(ord.id)}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '11.5px' }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Accept & Dispatch</span>
                      </button>
                    </div>
                  ) : ord.status === 'shipped' ? (
                    <button
                      type="button"
                      id={`deliver-order-${ord.id}`}
                      onClick={() => markOrderDelivered(ord.id)}
                      className="btn-accent"
                      style={{ padding: '6px 14px', fontSize: '11.5px' }}
                    >
                      <Truck size={13} />
                      <span>Confirm Handover</span>
                    </button>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        color: '#1B5E3B',
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SellerNav />
    </div>
  );
};
