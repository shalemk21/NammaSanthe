import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerNav } from './SellerNav';
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Save,
  Plus,
  X,
  Store,
  Banknote,
  CheckCircle2,
} from 'lucide-react';
import { Shop } from '../../types';

export const SellerDeliverySettingsScreen: React.FC = () => {
  const { currentUser, shops, updateShopDeliverySettings, language, showToast } = useApp();

  const myShop = shops.find((s) => s.id === currentUser?.shopId) || shops[0];

  const [pincodes, setPincodes] = useState<string[]>(myShop?.serviceablePincodes || ['560003', '560055', '560010']);
  const [newPincode, setNewPincode] = useState('');
  const [minOrderValue, setMinOrderValue] = useState(myShop?.minOrderValue || 99);
  const [deliveryCharge, setDeliveryCharge] = useState(myShop?.deliveryCharge || 35);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(myShop?.freeDeliveryThreshold || 350);
  const [estimatedPrepTime, setEstimatedPrepTime] = useState(myShop?.estimatedPrepTimeMinutes || 30);
  const [allowPickup, setAllowPickup] = useState(myShop?.allowPickup !== false);
  const [allowCod, setAllowCod] = useState(myShop?.allowCod !== false);
  const [partnerType, setPartnerType] = useState(myShop?.deliveryPartnerType || 'self');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (myShop) {
      setPincodes(myShop.serviceablePincodes || ['560003', '560055', '560010']);
      setMinOrderValue(myShop.minOrderValue || 99);
      setDeliveryCharge(myShop.deliveryCharge || 35);
      setFreeDeliveryThreshold(myShop.freeDeliveryThreshold || 350);
      setEstimatedPrepTime(myShop.estimatedPrepTimeMinutes || 30);
      setAllowPickup(myShop.allowPickup !== false);
      setAllowCod(myShop.allowCod !== false);
      setPartnerType(myShop.deliveryPartnerType || 'self');
    }
  }, [myShop]);

  const handleAddPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = newPincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      showToast('Please enter a valid 6-digit PIN code', 'warning');
      return;
    }
    if (pincodes.includes(pin)) {
      showToast('PIN code is already in your serviceable list', 'info');
      return;
    }
    setPincodes([...pincodes, pin]);
    setNewPincode('');
  };

  const handleRemovePincode = (pin: string) => {
    if (pincodes.length <= 1) {
      showToast('You must have at least one serviceable PIN code', 'warning');
      return;
    }
    setPincodes(pincodes.filter((p) => p !== pin));
  };

  const handleSaveSettings = async () => {
    if (!myShop) return;
    setIsSaving(true);
    try {
      await updateShopDeliverySettings(myShop.id, {
        serviceablePincodes: pincodes,
        minOrderValue: Number(minOrderValue),
        deliveryCharge: Number(deliveryCharge),
        freeDeliveryThreshold: Number(freeDeliveryThreshold),
        estimatedPrepTimeMinutes: Number(estimatedPrepTime),
        allowPickup,
        allowCod,
        deliveryPartnerType: partnerType as any,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '90px', background: '#F8F7ED', minHeight: '100vh' }}>
      <SellerNav />

      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: '#1B5E3B', fontWeight: 800, margin: '0 0 4px' }}>
            {language === 'kn' ? 'ವಿತರಣಾ ಮತ್ತು ಪಿನ್‌ಕೋಡ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು' : 'Delivery & Serviceable PIN Settings'}
          </h1>
          <span style={{ fontSize: '11.5px', color: '#885E3C' }}>
            Configure delivery coverage, store pickup counter, and fulfillment rules
          </span>
        </div>

        {/* 1. Serviceable PIN Codes */}
        <div
          className="card-base"
          style={{
            padding: '16px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E8E5D3',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MapPin size={18} color="#1B5E3B" />
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Serviceable Delivery PIN Codes
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: '#5E6961', margin: '0 0 12px', lineHeight: 1.4 }}>
            Only customers with delivery addresses in these PIN codes can place Home Delivery orders. Addresses outside this area will be prompted to choose In-Store Pickup.
          </p>

          {/* Add PIN Code form */}
          <form onSubmit={handleAddPincode} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Enter 6-digit PIN code (e.g. 560003)"
              value={newPincode}
              maxLength={6}
              onChange={(e) => setNewPincode(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #D0CDBB',
                fontSize: '12px',
              }}
            />
            <button
              type="submit"
              style={{
                background: '#1B5E3B',
                color: '#FFF',
                border: 'none',
                padding: '0 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} />
              <span>Add PIN</span>
            </button>
          </form>

          {/* Tag cloud of active PIN codes */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {pincodes.map((pin) => (
              <span
                key={pin}
                style={{
                  background: '#F0F9F4',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{pin}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePincode(pin)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Remove PIN"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 2. Delivery Rates & Thresholds */}
        <div
          className="card-base"
          style={{
            padding: '16px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E8E5D3',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Truck size={18} color="#1B5E3B" />
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Rates, Minimums & Preparation Time
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5E6961', display: 'block', marginBottom: '4px' }}>
                Standard Delivery Charge (₹):
              </label>
              <input
                type="number"
                min="0"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5E6961', display: 'block', marginBottom: '4px' }}>
                Free Delivery Above (₹):
              </label>
              <input
                type="number"
                min="0"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5E6961', display: 'block', marginBottom: '4px' }}>
                Minimum Order Value (₹):
              </label>
              <input
                type="number"
                min="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#5E6961', display: 'block', marginBottom: '4px' }}>
                Estimated Prep Time (mins):
              </label>
              <input
                type="number"
                min="5"
                value={estimatedPrepTime}
                onChange={(e) => setEstimatedPrepTime(Number(e.target.value))}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* 3. In-Store Pickup & COD Policy Toggles */}
        <div
          className="card-base"
          style={{
            padding: '16px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E8E5D3',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Store size={18} color="#D97706" />
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Pickup Counter & COD Options
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <strong style={{ fontSize: '12.5px', color: '#1C241E', display: 'block' }}>Allow In-Store Pickup</strong>
                <span style={{ fontSize: '11px', color: '#5E6961' }}>Customers can pick up orders directly at your store counter</span>
              </div>
              <input
                type="checkbox"
                checked={allowPickup}
                onChange={(e) => setAllowPickup(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#1B5E3B' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderTop: '1px solid #F3F1E7', paddingTop: '10px' }}>
              <div>
                <strong style={{ fontSize: '12.5px', color: '#1C241E', display: 'block' }}>Accept Cash on Delivery (COD)</strong>
                <span style={{ fontSize: '11px', color: '#5E6961' }}>Customers can pay cash or scan QR at doorstep upon receipt</span>
              </div>
              <input
                type="checkbox"
                checked={allowCod}
                onChange={(e) => setAllowCod(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#1B5E3B' }}
              />
            </label>
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          style={{
            width: '100%',
            background: '#1B5E3B',
            color: '#FFFFFF',
            border: 'none',
            padding: '14px',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 800,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(27, 94, 59, 0.3)',
          }}
        >
          <Save size={18} />
          <span>{isSaving ? 'Saving Settings...' : 'Save Delivery Configuration'}</span>
        </button>
      </div>
    </div>
  );
};
