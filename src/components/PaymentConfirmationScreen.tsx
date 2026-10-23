import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle,
  Truck,
  Store,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '../types';

export const PaymentConfirmationScreen: React.FC = () => {
  const {
    lastPlacedOrder,
    lastPlacedOrders,
    setCustomerScreen,
    setSelectedOrderForDetail,
    language,
  } = useApp();

  const ordersToDisplay = lastPlacedOrders.length > 0 ? lastPlacedOrders : (lastPlacedOrder ? [lastPlacedOrder] : []);

  if (ordersToDisplay.length === 0) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#5E6961' }}>No recent order found.</p>
        <button
          onClick={() => setCustomerScreen('home')}
          style={{
            marginTop: '12px',
            background: '#1B5E3B',
            color: '#FFF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const primaryOrder = ordersToDisplay[0];
  const isMultiShop = ordersToDisplay.length > 1;
  const grandTotal = ordersToDisplay.reduce((sum, o) => sum + o.totalAmount, 0);
  const isPickup = primaryOrder.fulfillmentType === 'pickup';
  const isCod = primaryOrder.paymentMethod.toUpperCase().includes('COD') || primaryOrder.paymentMethod.toUpperCase().includes('CASH');

  return (
    <div className="fade-in" style={{ padding: '20px 16px 100px', background: '#F8F7ED', minHeight: '100vh' }}>
      {/* Success Badge Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1B5E3B 0%, #13462B 100%)',
          color: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px 20px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(27, 94, 59, 0.25)',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
          }}
        />

        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <CheckCircle size={38} color="#A7F3D0" />
        </div>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 800, margin: '0 0 6px' }}>
          {language === 'kn' ? 'ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ & ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ!' : 'Payment Confirmed & Order Placed!'}
        </h1>
        <p style={{ fontSize: '13px', color: '#D1E7DD', margin: 0 }}>
          {isPickup
            ? 'Your store pickup request has been accepted by local merchants'
            : 'Direct harvest order dispatched to Karnataka local producers'}
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.15)',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          <span>{isMultiShop ? `Parent Order: #${primaryOrder.parentOrderId}` : `Order ID: #${primaryOrder.id}`}</span>
          <span>•</span>
          <span style={{ color: isCod ? '#FEF08A' : '#6EE7B7' }}>
            {isCod ? 'Pay on Delivery (COD)' : 'Paid Online via Gateway'}
          </span>
        </div>
      </div>

      {/* Transaction & Payment Reference Card */}
      <div
        className="card-base"
        style={{
          padding: '16px',
          marginBottom: '16px',
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E8E5D3',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <CreditCard size={18} color="#1B5E3B" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
            Payment & Gateway Receipt
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
            <span>Payment Method:</span>
            <strong style={{ color: '#1C241E' }}>{primaryOrder.paymentMethod}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
            <span>Transaction Ref ID:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1B5E3B' }}>
              {primaryOrder.paymentTransactionId || 'TXN-RAZORPAY-SECURE'}
            </span>
          </div>

          {primaryOrder.paymentGatewayOrderId && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
              <span>Gateway Order ID:</span>
              <span style={{ fontFamily: 'monospace', color: '#5E6961' }}>{primaryOrder.paymentGatewayOrderId}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
            <span>Payment Status:</span>
            <span
              style={{
                background: isCod ? '#FEF3C7' : '#D1E7DD',
                color: isCod ? '#92400E' : '#0F5132',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {primaryOrder.paymentStatus}
            </span>
          </div>

          <div
            style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px dashed #E8E5D3',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontWeight: 800,
              color: '#1B5E3B',
            }}
          >
            <span>Total Payable Amount:</span>
            <span>₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Fulfillment Destination Card */}
      <div
        className="card-base"
        style={{
          padding: '16px',
          marginBottom: '16px',
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E8E5D3',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          {isPickup ? <Store size={18} color="#D97706" /> : <Truck size={18} color="#1B5E3B" />}
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
            {isPickup ? 'In-Store Pickup Details' : 'Delivery Destination'}
          </h3>
        </div>

        <div style={{ fontSize: '12.5px', color: '#4B5563', lineHeight: 1.5 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
            <MapPin size={16} color="#885E3C" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#1C241E', display: 'block' }}>
                {isPickup ? 'Store Counter Location:' : primaryOrder.customerName}
              </strong>
              <span>{primaryOrder.deliveryAddress}</span>
              {primaryOrder.deliveryPincode && (
                <span style={{ display: 'block', color: '#885E3C', fontSize: '11.5px', marginTop: '2px' }}>
                  PIN: {primaryOrder.deliveryPincode} • {primaryOrder.deliveryLocality}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #F3F1E7' }}>
            <Calendar size={15} color="#1B5E3B" />
            <span>
              Estimated Time: <strong>{primaryOrder.estimatedDelivery}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Shop Split Orders or Single Order Packages */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#885E3C', textTransform: 'uppercase', marginBottom: '10px' }}>
          {isMultiShop ? `Split Merchant Orders (${ordersToDisplay.length})` : 'Order Item Summary'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ordersToDisplay.map((subOrder) => (
            <div
              key={subOrder.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '14px',
                border: '1px solid #E8E5D3',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#1B5E3B' }}>{subOrder.vendorName}</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: '#5E6961' }}>
                    Order #{subOrder.id} • {subOrder.items.length} items
                  </span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1C241E' }}>
                  ₹{subOrder.totalAmount}
                </span>
              </div>

              {/* Items in this sub order */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #F5F3E9' }}>
                {subOrder.items.map((it: any, itIdx: number) => {
                  const itName = it.name || it.product?.name || 'Product';
                  const itImage = it.image || it.product?.image || '';
                  const itUnit = it.unit || it.product?.unit || 'unit';
                  const itPrice = it.priceSnapshot || it.product?.price || 0;
                  const itKey = it.productId || it.product?.id || `it-${itIdx}`;
                  return (
                    <div key={itKey} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {itImage && (
                        <img
                          src={itImage}
                          alt={itName}
                          style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ flex: 1, fontSize: '12px' }}>
                        <span style={{ fontWeight: 600, color: '#1C241E', display: 'block' }}>{itName}</span>
                        <span style={{ color: '#885E3C', fontSize: '11px' }}>
                          Qty: {it.quantity} {itUnit} @ ₹{itPrice}/{itUnit}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C241E' }}>
                        ₹{itPrice * it.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          onClick={() => {
            setSelectedOrderForDetail(primaryOrder);
            setCustomerScreen('order_tracking');
          }}
          style={{
            background: '#1B5E3B',
            color: '#FFFFFF',
            border: 'none',
            padding: '14px',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(27, 94, 59, 0.3)',
          }}
        >
          <span>Track Live Order Status</span>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          onClick={() => setCustomerScreen('home')}
          style={{
            background: '#FFFFFF',
            color: '#5E6961',
            border: '1px solid #D0CDBB',
            padding: '12px',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShoppingBag size={16} />
          <span>Continue Shopping at Santhe</span>
        </button>
      </div>
    </div>
  );
};

