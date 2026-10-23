import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  X,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Store,
  Truck,
  Plus,
  Lock,
  ChevronDown,
  Info,
} from 'lucide-react';
import { SavedAddress, FulfillmentType } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartEcoFee,
    cartDiscount,
    cartFinalTotal,
    placeOrder,
    setCustomerScreen,
    language,
    selectedLocality,
    savedAddresses,
    selectedAddress,
    setSelectedAddress,
    addSavedAddress,
    shops,
    showToast,
    fulfillmentType,
    setFulfillmentType,
  } = useApp();

  // Local states
  const [deliverySlot, setDeliverySlot] = useState('Today, 2:00 PM - 4:00 PM (Fresh Harvest Batch)');
  const [pickupSlot, setPickupSlot] = useState('Today, within 45-60 mins (Store Counter)');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');

  // New Address inline form
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('+91 98450 99887');
  const [newAddressLine, setNewAddressLine] = useState('');
  const [newLocality, setNewLocality] = useState(selectedLocality);
  const [newPincode, setNewPincode] = useState('560003');
  const [newLabel, setNewLabel] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Razorpay Sandbox modal states
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);
  const [sandboxOrderId, setSandboxOrderId] = useState('');
  const [sandboxAmount, setSandboxAmount] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [sandboxMethod, setSandboxMethod] = useState('UPI');

  // Verify PIN serviceability
  const activePincode = selectedAddress?.pincode || '560003';
  const cartVendorIds = Array.from(new Set(cart.map((i) => i.product.vendorId)));

  const unserviceableShops = cartVendorIds
    .map((vId) => shops.find((s) => s.id === vId))
    .filter(Boolean)
    .filter((s) => {
      if (!s!.serviceablePincodes || s!.serviceablePincodes.length === 0) return false;
      return !s!.serviceablePincodes.includes(activePincode.trim());
    });

  // Live PIN verification via api.payments.verifyPincode
  const [livePincodeServiceable, setLivePincodeServiceable] = useState<boolean | null>(true);
  const [isVerifyingPincode, setIsVerifyingPincode] = useState(false);
  const [pinVerificationNotice, setPinVerificationNotice] = useState<string>('');

  useEffect(() => {
    if (!activePincode) return;

    if (!/^\d{6}$/.test(activePincode.trim())) {
      setLivePincodeServiceable(false);
      setPinVerificationNotice('Please enter a valid 6-digit PIN code');
      return;
    }

    let isMounted = true;
    setIsVerifyingPincode(true);
    api.payments
      .verifyPincode(activePincode.trim())
      .then((res) => {
        if (!isMounted) return;
        setLivePincodeServiceable(res.serviceable);
        setPinVerificationNotice(res.message || '');
      })
      .catch(() => {
        if (!isMounted) return;
        setLivePincodeServiceable(unserviceableShops.length === 0);
      })
      .finally(() => {
        if (isMounted) setIsVerifyingPincode(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activePincode, unserviceableShops.length]);

  const isDeliveryBlocked =
    fulfillmentType === 'delivery' &&
    (livePincodeServiceable === false || unserviceableShops.length > 0);

  if (!isCheckoutOpen) return null;

  // Handle "+ Save Address"
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient || !newAddressLine || !newPincode) {
      showToast('Please fill all required address fields', 'warning');
      return;
    }
    if (!/^\d{6}$/.test(newPincode.trim())) {
      showToast('PIN code must be a valid 6-digit number', 'warning');
      return;
    }

    const success = await addSavedAddress({
      label: newLabel,
      recipientName: newRecipient,
      phone: newPhone,
      addressLine: newAddressLine,
      locality: newLocality,
      city: 'Bengaluru',
      pincode: newPincode.trim(),
      isDefault: savedAddresses.length === 0,
    });

    if (success) {
      setIsAddingAddress(false);
      setNewAddressLine('');
    }
  };

  // Step 1: Initiate Order / Payment
  const handleInitiateOrder = async () => {
    if (isDeliveryBlocked) {
      showToast('Delivery not available for this PIN code. Please choose In-Store Pickup.', 'warning');
      return;
    }

    // Cash on Delivery flow
    if (paymentMethod === 'cod') {
      setIsProcessingPayment(true);
      try {
        const res = await placeOrder({
          fulfillmentType,
          address: selectedAddress?.addressLine,
          pincode: selectedAddress?.pincode,
          locality: selectedAddress?.locality,
          slot: deliverySlot,
          pickupSlot,
          paymentMethod: 'Cash on Delivery (COD)',
        });
        if (res.success) {
          setCustomerScreen('payment_confirmation');
        }
      } finally {
        setIsProcessingPayment(false);
      }
      return;
    }

    // Online Gateway Payment: create Razorpay order on backend
    setIsProcessingPayment(true);
    try {
      const orderRes = await api.payments.createOrder({
        amount: cartFinalTotal,
        receipt: `NS-${Date.now().toString().slice(-6)}`,
        notes: {
          customerName: selectedAddress?.recipientName || 'Customer',
          fulfillmentType,
          paymentMethod,
        },
      });

      if (orderRes.success && orderRes.gatewayOrderId) {
        setSandboxOrderId(orderRes.gatewayOrderId);
        setSandboxAmount(cartFinalTotal);
        setSandboxMethod(paymentMethod.toUpperCase());
        setIsSandboxModalOpen(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Error initiating payment gateway', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Step 2: Simulate Razorpay Sandbox Actions
  const handleSandboxAuthorize = async () => {
    setIsProcessingPayment(true);
    try {
      // Generate deterministic cryptographic signature from backend
      const sigRes = await api.payments.generateSandboxSignature({
        orderId: sandboxOrderId,
      });

      // Verify signature on backend
      const verifyRes = await api.payments.verifyPayment({
        razorpay_order_id: sandboxOrderId,
        razorpay_payment_id: sigRes.paymentId,
        razorpay_signature: sigRes.signature,
        paymentMethod: sandboxMethod,
      });

      if (verifyRes.success && verifyRes.verified) {
        // Complete order placement atomically
        const res = await placeOrder({
          fulfillmentType,
          address: selectedAddress?.addressLine,
          pincode: selectedAddress?.pincode,
          locality: selectedAddress?.locality,
          slot: deliverySlot,
          pickupSlot,
          paymentMethod: `Razorpay (${sandboxMethod})`,
          razorpay_order_id: sandboxOrderId,
          razorpay_payment_id: sigRes.paymentId,
          razorpay_signature: sigRes.signature,
        });
        setIsSandboxModalOpen(false);
        if (res.success) {
          setCustomerScreen('payment_confirmation');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Signature verification failed', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSandboxFail = async () => {
    setIsProcessingPayment(true);
    try {
      await api.payments.recordFailure({
        razorpay_order_id: sandboxOrderId,
        reason: 'Simulated Card / Bank Authorization Failure (Testing)',
        code: 'PAYMENT_FAILED',
      });
      showToast('Simulated Payment Failure: Transaction declined by gateway sandbox', 'error');
      setIsSandboxModalOpen(false);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSandboxCancel = async () => {
    setIsProcessingPayment(true);
    try {
      await api.payments.recordFailure({
        razorpay_order_id: sandboxOrderId,
        reason: 'User cancelled payment in gateway sheet',
        code: 'PAYMENT_CANCELLED',
      });
      showToast('Payment Cancelled by user', 'info');
      setIsSandboxModalOpen(false);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: '430px',
          background: '#FFFFFF',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          padding: '20px 20px 32px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
                margin: 0,
              }}
            >
              {language === 'kn' ? 'ಆರ್ಡರ್ ಪರಿಶೀಲನೆ & ಪಾವತಿ' : 'Convenient Checkout'}
            </h3>
            <span style={{ fontSize: '11px', color: '#885E3C' }}>
              Phase 2: Secure Gateway • Serviceable PINs • Delivery & Pickup
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

        {/* 1. Fulfillment Mode Toggle (Home Delivery vs In-Store Pickup) */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '12px', fontWeight: 800, color: '#1C241E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            1. Select Fulfillment Mode
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              background: '#F5F3E8',
              padding: '4px',
              borderRadius: '14px',
            }}
          >
            <button
              type="button"
              onClick={() => setFulfillmentType('delivery')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                background: fulfillmentType === 'delivery' ? '#1B5E3B' : 'transparent',
                color: fulfillmentType === 'delivery' ? '#FFFFFF' : '#5E6961',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Truck size={16} />
              <span>Doorstep Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => setFulfillmentType('pickup')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                background: fulfillmentType === 'pickup' ? '#D97706' : 'transparent',
                color: fulfillmentType === 'pickup' ? '#FFFFFF' : '#5E6961',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Store size={16} />
              <span>In-Store Pickup (₹0)</span>
            </button>
          </div>
        </div>

        {/* 2. Destination / Location Section */}
        {fulfillmentType === 'delivery' ? (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#1C241E', textTransform: 'uppercase' }}>
                2. Delivery Address
              </label>
              <button
                type="button"
                onClick={() => setIsAddingAddress(!isAddingAddress)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1B5E3B',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} />
                <span>{isAddingAddress ? 'Cancel' : 'Add New'}</span>
              </button>
            </div>

            {/* Inline Add Address Form */}
            {isAddingAddress && (
              <form
                onSubmit={handleSaveAddress}
                style={{
                  background: '#FAF9F2',
                  border: '1px solid #E8E5D3',
                  borderRadius: '14px',
                  padding: '12px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewLabel(lbl)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #D0CDBB',
                        fontSize: '11px',
                        background: newLabel === lbl ? '#1B5E3B' : '#FFF',
                        color: newLabel === lbl ? '#FFF' : '#1C241E',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Recipient Name *"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
                />

                <input
                  type="text"
                  placeholder="House / Flat / Street Address *"
                  value={newAddressLine}
                  onChange={(e) => setNewAddressLine(e.target.value)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Locality"
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="6-digit PIN Code *"
                    value={newPincode}
                    maxLength={6}
                    onChange={(e) => setNewPincode(e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#1B5E3B',
                    color: '#FFF',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  Save Address & Use
                </button>
              </form>
            )}

            {/* Saved Addresses Radio List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {savedAddresses.map((addr) => {
                const isSelected = selectedAddress?.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr)}
                    style={{
                      border: isSelected ? '2px solid #1B5E3B' : '1px solid #E8E5D3',
                      background: isSelected ? '#F0F9F4' : '#FFFFFF',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="addressSelect"
                      checked={isSelected}
                      onChange={() => setSelectedAddress(addr)}
                      style={{ marginTop: '3px', accentColor: '#1B5E3B' }}
                    />
                    <div style={{ flex: 1, fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, color: '#1C241E' }}>{addr.recipientName}</span>
                        <span style={{ background: '#ECE9D8', color: '#885E3C', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span style={{ color: '#1B5E3B', fontSize: '10px', fontWeight: 700 }}>• Default</span>
                        )}
                      </div>
                      <span style={{ color: '#5E6961', display: 'block', lineHeight: 1.4 }}>
                        {addr.addressLine}, {addr.locality}
                      </span>
                      <span style={{ color: '#885E3C', fontSize: '11px', fontWeight: 600 }}>
                        PIN: {addr.pincode} • Phone: {addr.phone}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PIN Serviceability Warning */}
            {isDeliveryBlocked && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '11.5px', color: '#991B1B', lineHeight: 1.4 }}>
                  <strong>Delivery Unavailable for PIN {activePincode}:</strong>
                  <span>
                    {' '}
                    {pinVerificationNotice || (unserviceableShops.length > 0 ? `${unserviceableShops.map((s) => s?.name).join(', ')} does not service PIN code ${activePincode}.` : 'This area is outside current hyperlocal delivery network.')}
                  </span>
                  <div style={{ marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('pickup')}
                      style={{
                        background: '#DC2626',
                        color: '#FFF',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Switch to In-Store Pickup (₹0)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* In-Store Pickup Details */
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: '14px',
              padding: '14px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Store size={18} color="#D97706" />
              <strong style={{ fontSize: '13px', color: '#92400E' }}>Direct Store Counter Pickup</strong>
            </div>
            <p style={{ fontSize: '12px', color: '#78350F', margin: 0, lineHeight: 1.4 }}>
              Items will be packed at the shop counter. Show your Order ID at pickup. Zero delivery charges apply!
            </p>
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', display: 'block', marginBottom: '4px' }}>
                Pickup Time Slot:
              </label>
              <select
                value={pickupSlot}
                onChange={(e) => setPickupSlot(e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #FCD34D', fontSize: '12px', background: '#FFF' }}
              >
                <option value="Today, within 45-60 mins (Store Counter)">Today, within 45-60 mins (Fast Prep)</option>
                <option value="Today, 4:00 PM - 6:00 PM">Today, 4:00 PM - 6:00 PM (Evening)</option>
                <option value="Tomorrow Morning, 8:00 AM - 10:00 AM">Tomorrow Morning, 8:00 AM - 10:00 AM</option>
              </select>
            </div>
          </div>
        )}

        {/* 3. Transparent Order & Price Summary */}
        <div
          style={{
            background: '#F8F7ED',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '18px',
            border: '1px solid #E8E5D3',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5E6961', marginBottom: '4px' }}>
            <span>Items Subtotal ({cart.length} items):</span>
            <span style={{ fontWeight: 600, color: '#1C241E' }}>₹{cartSubtotal}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5E6961', marginBottom: '4px' }}>
            <span>Delivery Fee:</span>
            <span style={{ fontWeight: 600, color: cartDeliveryFee === 0 ? '#1B5E3B' : '#1C241E' }}>
              {cartDeliveryFee === 0 ? 'FREE' : `₹${cartDeliveryFee}`}
            </span>
          </div>

          {cartEcoFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5E6961', marginBottom: '4px' }}>
              <span>Eco Cloth Packaging:</span>
              <span style={{ fontWeight: 600, color: '#1C241E' }}>₹{cartEcoFee}</span>
            </div>
          )}

          {cartDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#1B5E3B', marginBottom: '4px' }}>
              <span>Local Fest Discount:</span>
              <span style={{ fontWeight: 700 }}>-₹{cartDiscount}</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '15px',
              fontWeight: 800,
              color: '#1B5E3B',
              borderTop: '1px dashed #D0CDBB',
              paddingTop: '8px',
              marginTop: '6px',
            }}
          >
            <span>Final Payable Total:</span>
            <span>₹{cartFinalTotal}</span>
          </div>
        </div>

        {/* 4. Payment Method Selection */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '12px', fontWeight: 800, color: '#1C241E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            3. Payment Method
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                border: paymentMethod === 'upi' ? '2px solid #1B5E3B' : '1px solid #E8E5D3',
                background: paymentMethod === 'upi' ? '#F0F9F4' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'upi'}
                onChange={() => setPaymentMethod('upi')}
                style={{ accentColor: '#1B5E3B' }}
              />
              <Smartphone size={18} color="#1B5E3B" />
              <div style={{ flex: 1, fontSize: '12px' }}>
                <strong style={{ color: '#1C241E', display: 'block' }}>UPI (Google Pay / PhonePe / Paytm / BHIM)</strong>
                <span style={{ color: '#5E6961', fontSize: '11px' }}>Instant & Zero Transaction Fee • Razorpay Gateway</span>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                border: paymentMethod === 'card' ? '2px solid #1B5E3B' : '1px solid #E8E5D3',
                background: paymentMethod === 'card' ? '#F0F9F4' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                style={{ accentColor: '#1B5E3B' }}
              />
              <CreditCard size={18} color="#1B5E3B" />
              <div style={{ flex: 1, fontSize: '12px' }}>
                <strong style={{ color: '#1C241E', display: 'block' }}>Cards (Debit / Credit / RuPay)</strong>
                <span style={{ color: '#5E6961', fontSize: '11px' }}>Encrypted 256-bit SSL • No Credentials Stored</span>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                border: paymentMethod === 'cod' ? '2px solid #1B5E3B' : '1px solid #E8E5D3',
                background: paymentMethod === 'cod' ? '#F0F9F4' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                style={{ accentColor: '#1B5E3B' }}
              />
              <Banknote size={18} color="#885E3C" />
              <div style={{ flex: 1, fontSize: '12px' }}>
                <strong style={{ color: '#1C241E', display: 'block' }}>Cash on Delivery / Pickup (COD)</strong>
                <span style={{ color: '#5E6961', fontSize: '11px' }}>Pay cash or scan QR at doorstep / store counter</span>
              </div>
            </label>
          </div>
        </div>

        {/* 5. Cancellation Policy Disclosure (Prompt Requirement #4) */}
        <div
          style={{
            background: '#F5F3E8',
            borderRadius: '10px',
            padding: '10px 12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '11px',
            color: '#5E6961',
            lineHeight: 1.4,
          }}
        >
          <ShieldCheck size={16} color="#1B5E3B" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong style={{ color: '#1C241E' }}>Cancellation & Refund Policy:</strong> You may cancel eligible orders
            anytime prior to store dispatch for an immediate 100% refund. COD orders cancel with zero penalty.
          </div>
        </div>

        {/* 6. Checkout CTA Button */}
        <button
          type="button"
          onClick={handleInitiateOrder}
          disabled={isDeliveryBlocked || isProcessingPayment}
          style={{
            width: '100%',
            background: isDeliveryBlocked ? '#D1D5DB' : '#1B5E3B',
            color: '#FFFFFF',
            border: 'none',
            padding: '15px',
            borderRadius: '16px',
            fontSize: '15px',
            fontWeight: 800,
            cursor: isDeliveryBlocked || isProcessingPayment ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: isDeliveryBlocked ? 'none' : '0 4px 16px rgba(27, 94, 59, 0.3)',
            transition: 'all 0.2s',
          }}
        >
          <Lock size={16} />
          <span>
            {isProcessingPayment
              ? 'Connecting Gateway...'
              : paymentMethod === 'cod'
              ? `Confirm & Place Order (₹${cartFinalTotal})`
              : `Proceed to Secure Pay (₹${cartFinalTotal})`}
          </span>
        </button>
      </div>

      {/* RAZORPAY PAYMENT GATEWAY SANDBOX SIMULATOR MODAL */}
      {isSandboxModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="fade-in"
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#FFFFFF',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Razorpay Branded Topbar */}
            <div
              style={{
                background: '#0C2340',
                color: '#FFF',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: '#0D94FB',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '14px',
                  }}
                >
                  R
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Razorpay Sandbox</h4>
                  <span style={{ fontSize: '10px', color: '#93C5FD' }}>Test Mode • Namma Santhe</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: '#93C5FD', display: 'block' }}>Payable</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>₹{sandboxAmount}</span>
              </div>
            </div>

            {/* Sandbox Simulation Content */}
            <div style={{ padding: '20px' }}>
              <div
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '11.5px',
                  color: '#1E40AF',
                }}
              >
                <strong>Sandbox Testing Console:</strong>
                <p style={{ margin: '4px 0 0', lineHeight: 1.4 }}>
                  Order ID: <code style={{ fontWeight: 700 }}>{sandboxOrderId}</code>
                  <br />
                  Select a payment outcome below to verify cryptographic HMAC signature verification and order state transitions.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 1. Authorize & Pay */}
                <button
                  type="button"
                  onClick={handleSandboxAuthorize}
                  disabled={isProcessingPayment}
                  style={{
                    background: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Authorize & Complete Payment (Success)</span>
                </button>

                {/* 2. Simulate Failure */}
                <button
                  type="button"
                  onClick={handleSandboxFail}
                  disabled={isProcessingPayment}
                  style={{
                    background: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={15} />
                  <span>Simulate Gateway Failure</span>
                </button>

                {/* 3. Cancel */}
                <button
                  type="button"
                  onClick={handleSandboxCancel}
                  disabled={isProcessingPayment}
                  style={{
                    background: '#F3F4F6',
                    color: '#4B5563',
                    border: '1px solid #D1D5DB',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
