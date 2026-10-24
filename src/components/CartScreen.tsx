import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { BottomNav } from './BottomNav';
import { CheckoutModal } from './CheckoutModal';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Leaf,
  Check,
} from 'lucide-react';

export const CartScreen: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotalCount,
    cartSubtotal,
    cartDeliveryFee,
    cartDiscount,
    cartEcoFee,
    cartFinalTotal,
    setIsCheckoutOpen,
    setCustomerScreen,
    language,
    showToast,
  } = useApp();

  const [couponInput, setCouponInput] = useState('SANTHE25');
  const [couponApplied, setCouponApplied] = useState(true);

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      <HeaderNav />

      <div style={{ padding: '14px 16px' }}>
        {/* Cart Screen Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '22px',
                color: '#1B5E3B',
                fontWeight: 700,
              }}
            >
              {language === 'kn' ? 'ನಿಮ್ಮ ಸಂತೆಯ ಬುಟ್ಟಿ' : 'Your Santhe Basket'}
            </h2>
            <span style={{ fontSize: '11.5px', color: '#885E3C' }}>
              {cartTotalCount} items selected for fresh delivery
            </span>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              id="clear-cart-btn"
              onClick={clearCart}
              style={{
                background: 'none',
                border: 'none',
                color: '#E76F51',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Empty state */}
        {cart.length === 0 ? (
          <div
            className="card-base"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(27,94,59,0.08)',
                color: '#1B5E3B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <ShoppingBag size={32} />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1C241E', marginBottom: '6px' }}>
              Your Basket is Empty
            </h3>
            <p style={{ fontSize: '12px', color: '#5E6961', maxWidth: '240px', margin: '0 auto 20px' }}>
              Add organic vegetables, fruits, or handmade crafts to support local farmers.
            </p>

            <button
              type="button"
              id="empty-cart-browse-btn"
              onClick={() => setCustomerScreen('home')}
              className="btn-primary"
            >
              <span>Explore Fresh Santhe</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          /* Itemized Cart List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Items list card */}
            <div className="card-base" style={{ padding: '12px' }}>
              {cart.map((item, idx) => (
                <div
                  key={item.product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 0',
                    borderBottom: idx < cart.length - 1 ? '1px solid #F0EEE4' : 'none',
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/v0/organic_tomatoes.png';
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1C241E',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.product.name}
                    </h4>

                    <div style={{ fontSize: '11px', color: '#885E3C' }}>
                      {item.product.vendorName}
                    </div>

                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1B5E3B', marginTop: '2px' }}>
                      ₹{item.product.price} <span style={{ fontSize: '10px', color: '#5E6961' }}>/{item.product.unit}</span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#F8F7ED',
                      border: '1px solid #D8D4BF',
                      borderRadius: '999px',
                      padding: '3px 8px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, -1)}
                      style={{ background: 'none', border: 'none', color: '#1B5E3B', cursor: 'pointer' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '14px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, 1)}
                      style={{ background: 'none', border: 'none', color: '#1B5E3B', cursor: 'pointer' }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Item Subtotal & Delete */}
                  <div style={{ textAlign: 'right', minWidth: '55px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>
                      ₹{item.product.price * item.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#C4BEA9',
                        cursor: 'pointer',
                        padding: '2px',
                        marginTop: '4px',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Strip */}
            <div
              className="card-base"
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Tag size={18} color="#F2B705" />
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter Santhe Coupon"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1C241E',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (couponInput === 'SANTHE25') {
                    setCouponApplied(true);
                    showToast('Coupon SANTHE25 applied! Saved ₹30', 'success');
                  } else {
                    showToast('Invalid promo coupon code', 'warning');
                  }
                }}
                className="btn-accent"
                style={{ padding: '5px 12px', fontSize: '11px' }}
              >
                {couponApplied ? 'Applied' : 'Apply'}
              </button>
            </div>

            {/* Eco Delivery Callout */}
            <div
              style={{
                background: 'rgba(27,94,59,0.07)',
                border: '1px solid rgba(27,94,59,0.18)',
                borderRadius: '12px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '11.5px',
                color: '#1B5E3B',
              }}
            >
              <Leaf size={16} />
              <span>
                Packed in reusable banana-fiber paper & cloth sacks. 100% plastic-free Santhe pledge.
              </span>
            </div>

            {/* Bill Summary Card */}
            <div className="card-base" style={{ padding: '14px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', marginBottom: '10px' }}>
                Bill Summary
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
                  <span>Item Total</span>
                  <span style={{ fontWeight: 600, color: '#1C241E' }}>₹{cartSubtotal}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
                  <span>Delivery Partner Fee</span>
                  <span>
                    {cartDeliveryFee === 0 ? (
                      <span style={{ color: '#1B5E3B', fontWeight: 600 }}>FREE (Order &gt; ₹299)</span>
                    ) : (
                      `₹${cartDeliveryFee}`
                    )}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
                  <span>Eco-Packaging & Bag</span>
                  <span style={{ color: '#1C241E' }}>₹{cartEcoFee}</span>
                </div>

                {cartDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E76F51', fontWeight: 600 }}>
                    <span>Santhe Community Discount</span>
                    <span>-₹{cartDiscount}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    marginTop: '4px',
                    borderTop: '1.5px dashed #E8E5D3',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#1B5E3B',
                  }}
                >
                  <span>To Pay</span>
                  <span>₹{cartFinalTotal}</span>
                </div>
              </div>
            </div>

            {/* Support Impact Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                border: '1px solid #E8E5D3',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '11px',
                color: '#885E3C',
              }}
            >
              <ShieldCheck size={15} color="#1B5E3B" />
              <span>
                <strong>92% of this bill</strong> goes straight into the farmer's bank account.
              </span>
            </div>

            {/* Minimum Order Value Status */}
            {cartFinalTotal < 99 ? (
              <div
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#92400E',
                }}
              >
                <span>Minimum order value is ₹99. Add <strong>₹{99 - cartFinalTotal}</strong> more fresh produce to proceed.</span>
              </div>
            ) : (
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11.5px',
                  color: '#166534',
                }}
              >
                <Check size={14} color="#16A34A" />
                <span>Minimum order requirement (₹99) satisfied! Bill is ₹{cartFinalTotal}.</span>
              </div>
            )}

            {/* Direct Proceed to Checkout Button */}
            <button
              type="button"
              id="proceed-to-checkout-btn"
              onClick={() => {
                if (cartFinalTotal < 99) {
                  showToast(`Minimum order requirement is ₹99. Add ₹${99 - cartFinalTotal} more.`, 'warning');
                  return;
                }
                setIsCheckoutOpen(true);
              }}
              disabled={cartFinalTotal < 99}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 700,
                marginTop: '6px',
                background: cartFinalTotal < 99 ? '#D1D5DB' : '#1B5E3B',
                cursor: cartFinalTotal < 99 ? 'not-allowed' : 'pointer',
                boxShadow: cartFinalTotal < 99 ? 'none' : '0 6px 18px rgba(27, 94, 59, 0.28)',
              }}
            >
              <span>
                {cartFinalTotal < 99
                  ? `Minimum Order ₹99 (Add ₹${99 - cartFinalTotal} more)`
                  : `Proceed to Checkout • ₹${cartFinalTotal}`}
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Checkout Drawer Modal */}
      <CheckoutModal />

      <BottomNav />
    </div>
  );
};
