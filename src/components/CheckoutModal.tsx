import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cartFinalTotal,
    placeOrder,
    language,
    selectedLocation,
  } = useApp();

  const [address, setAddress] = useState(
    '#42, 4th Cross, Sampige Road, Malleshwaram, Bengaluru 560003'
  );
  const [slot, setSlot] = useState('Today, 2:00 PM - 4:00 PM (Fresh Afternoon Harvest)');
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder({
        address,
        slot,
        paymentMethod,
      });
      setIsSubmitting(false);
    }, 700);
  };

  const deliverySlots = [
    'Today, 2:00 PM - 4:00 PM (Fresh Afternoon Harvest)',
    'Today, 6:00 PM - 8:00 PM (Evening Batch)',
    'Tomorrow, 7:00 AM - 9:00 AM (Dawn Santhe Pluck)',
  ];

  const paymentOptions = [
    {
      id: 'upi',
      name: 'UPI (Google Pay / PhonePe / Paytm)',
      icon: Smartphone,
      detail: 'Instant & Zero Transaction Fee',
    },
    {
      id: 'wallet',
      name: 'Santhe Pay Co-op Wallet',
      icon: CreditCard,
      detail: 'Available Balance: ₹450',
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: Banknote,
      detail: 'Pay cash or scan QR at doorstep',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1500,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={() => setIsCheckoutOpen(false)}
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
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '14px',
            borderBottom: '1px solid #F0EEE4',
            marginBottom: '16px',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '19px',
                color: '#1B5E3B',
                fontWeight: 700,
              }}
            >
              {language === 'kn' ? 'ಆರ್ಡರ್ ಪರಿಶೀಲನೆ' : 'Checkout & Confirm'}
            </h3>
            <span style={{ fontSize: '11px', color: '#885E3C' }}>
              Direct doorstep delivery from Karnataka producers
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(false)}
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

        {/* 1. Delivery Address */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1C241E',
              marginBottom: '6px',
            }}
          >
            <MapPin size={14} color="#1B5E3B" />
            <span>Delivery Address</span>
          </div>
          <div
            style={{
              background: '#F8F7ED',
              border: '1px solid #E8E5D3',
              borderRadius: '12px',
              padding: '10px 12px',
            }}
          >
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                color: '#1C241E',
              }}
            />
            <div style={{ fontSize: '10px', color: '#885E3C', marginTop: '4px' }}>
              Area: {selectedLocation}
            </div>
          </div>
        </div>

        {/* 2. Delivery Time Slot */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1C241E',
              marginBottom: '8px',
            }}
          >
            <Clock size={14} color="#1B5E3B" />
            <span>Select Delivery Slot</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {deliverySlots.map((s) => (
              <div
                key={s}
                onClick={() => setSlot(s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: slot === s ? '1.5px solid #1B5E3B' : '1px solid #E8E5D3',
                  background: slot === s ? 'rgba(27,94,59,0.06)' : '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                  color: slot === s ? '#1B5E3B' : '#5E6961',
                  fontWeight: slot === s ? 600 : 500,
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: slot === s ? '5px solid #1B5E3B' : '2px solid #C4BEA9',
                  }}
                />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Payment Method */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1C241E',
              marginBottom: '8px',
            }}
          >
            <CreditCard size={14} color="#1B5E3B" />
            <span>Payment Method</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paymentOptions.map((opt) => {
              const IconComp = opt.icon;
              const isSelected = paymentMethod === opt.name;

              return (
                <div
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: isSelected ? '1.5px solid #1B5E3B' : '1px solid #E8E5D3',
                    background: isSelected ? 'rgba(27,94,59,0.06)' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isSelected ? '#1B5E3B' : '#F0EEE4',
                        color: isSelected ? '#FFFFFF' : '#885E3C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComp size={16} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: isSelected ? '#1B5E3B' : '#1C241E',
                        }}
                      >
                        {opt.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#885E3C' }}>{opt.detail}</div>
                    </div>
                  </div>

                  {isSelected && <CheckCircle2 size={16} color="#1B5E3B" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety & Guarantee Note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(242,183,5,0.14)',
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '11px',
            color: '#705400',
            marginBottom: '18px',
          }}
        >
          <ShieldCheck size={16} color="#c49400" />
          <span>Direct Payment to Farmers & Artisans. 100% Quality Assurance.</span>
        </div>

        {/* CTA Place Order */}
        <button
          type="button"
          id="confirm-place-order-btn"
          disabled={isSubmitting}
          onClick={handleConfirmOrder}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 700,
          }}
        >
          {isSubmitting ? (
            <span>Processing Order...</span>
          ) : (
            <span>Place Order • Pay ₹{cartFinalTotal}</span>
          )}
        </button>
      </div>
    </div>
  );
};
