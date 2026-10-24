import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { BottomNav } from './BottomNav';
import { CheckoutModal } from './CheckoutModal';
import { handleProductImageError, resolveProductImage } from '../utils/imageUtils';
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
  X,
  Sparkles,
  Percent,
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
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    availableCoupons,
    setIsCheckoutOpen,
    setCustomerScreen,
    language,
    showToast,
  } = useApp();

  const [couponInput, setCouponInput] = useState(appliedCoupon ? appliedCoupon.code : 'SANTHE25');
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  React.useEffect(() => {
    if (appliedCoupon) {
      setCouponInput(appliedCoupon.code);
    }
  }, [appliedCoupon]);

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
                    src={resolveProductImage(item.product.image, item.product.name, item.product.category)}
                    alt={item.product.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                    onError={(e) => handleProductImageError(e, item.product.name, item.product.category)}
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

            {/* Coupon Code Section */}
            {appliedCoupon ? (
              /* Active Applied Coupon Card */
              <div
                className="card-base"
                style={{
                  padding: '12px 14px',
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
                  border: '1.5px solid #1B5E3B',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#1B5E3B',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Tag size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '13.5px', color: '#1B5E3B', letterSpacing: '0.5px' }}>
                        {appliedCoupon.code}
                      </strong>
                      <span
                        style={{
                          background: '#DCFCE7',
                          color: '#166534',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Check size={10} /> Applied
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#5E6961', marginTop: '2px' }}>
                      {language === 'kn' && appliedCoupon.kannadaDescription
                        ? appliedCoupon.kannadaDescription
                        : appliedCoupon.description}
                    </div>
                    {cartDiscount > 0 ? (
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1B5E3B', marginTop: '2px' }}>
                        Saved ₹{cartDiscount} on this bill
                      </div>
                    ) : appliedCoupon.minOrderValue && cartSubtotal < appliedCoupon.minOrderValue ? (
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#D97706', marginTop: '2px' }}>
                        Add ₹{appliedCoupon.minOrderValue - cartSubtotal} more items to activate {appliedCoupon.discountValue}{appliedCoupon.discountType === 'percentage' ? '%' : ''} discount
                      </div>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  id="remove-coupon-btn"
                  onClick={() => {
                    removeCoupon();
                    setCouponInput('');
                  }}
                  style={{
                    background: '#FFF1F2',
                    border: '1px solid #FECDD3',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: '#E11D48',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <X size={12} />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              /* Coupon Input & Available Suggestions */
              <div
                className="card-base"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (couponInput.trim()) {
                      applyCoupon(couponInput.trim());
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#F9F8F2',
                    border: '1px solid #E2DFCE',
                    borderRadius: '10px',
                    padding: '4px 10px',
                  }}
                >
                  <Tag size={17} color="#F2B705" />
                  <input
                    type="text"
                    id="coupon-input"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Santhe Promo Coupon"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      color: '#1C241E',
                    }}
                  />
                  <button
                    type="submit"
                    id="apply-coupon-btn"
                    className="btn-accent"
                    style={{ padding: '6px 14px', fontSize: '11.5px', fontWeight: 700 }}
                  >
                    Apply
                  </button>
                </form>

                {/* Quick Suggestion Chips */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#5E6961' }}>
                      Available Santhe Coupons:
                    </span>
                    <button
                      type="button"
                      id="view-all-coupons-btn"
                      onClick={() => setShowAllCoupons(!showAllCoupons)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1B5E3B',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showAllCoupons ? 'Hide' : 'View All'}
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: showAllCoupons ? 'column' : 'row',
                      flexWrap: showAllCoupons ? 'nowrap' : 'wrap',
                      gap: '6px',
                    }}
                  >
                    {availableCoupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        id={`quick-coupon-${coupon.code.toLowerCase()}`}
                        onClick={() => {
                          setCouponInput(coupon.code);
                          applyCoupon(coupon.code);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: showAllCoupons ? '8px 10px' : '4px 8px',
                          background: '#F0FDF4',
                          border: '1px dashed #86EFAC',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          gap: '8px',
                        }}
                      >
                        <div>
                          <strong style={{ color: '#1B5E3B', marginRight: '4px' }}>{coupon.code}</strong>
                          <span style={{ color: '#5E6961' }}>
                            {showAllCoupons
                              ? `— ${coupon.description}`
                              : `(${coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`})`}
                          </span>
                        </div>
                        <span style={{ color: '#1B5E3B', fontWeight: 700, fontSize: '10.5px' }}>
                          Apply
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1B5E3B', fontWeight: 700 }}>
                    <span>
                      Santhe Coupon Discount ({appliedCoupon ? appliedCoupon.code : 'Special'})
                    </span>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {cartDiscount > 0 && (
                      <span
                        style={{
                          textDecoration: 'line-through',
                          fontSize: '12px',
                          color: '#9CA3AF',
                          fontWeight: 500,
                        }}
                      >
                        ₹{cartSubtotal + cartDeliveryFee + cartEcoFee}
                      </span>
                    )}
                    <span>₹{cartFinalTotal}</span>
                  </div>
                </div>
              </div>

              {cartDiscount > 0 && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '8px 10px',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#065F46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={14} color="#059669" />
                  <span>
                    You are saving <strong>₹{cartDiscount}</strong> on this Santhe order with code{' '}
                    <strong>{appliedCoupon?.code}</strong>!
                  </span>
                </div>
              )}
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
    </div>
  );
};
