import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { BottomNav } from './BottomNav';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  HelpCircle,
  Settings,
  ChevronRight,
  Store,
  ShieldCheck,
  Globe,
  RotateCcw,
  LogOut,
  Scale,
  Plus,
  Trash2,
  Bell,
  CheckCircle2,
  X,
  Database,
} from 'lucide-react';
import { SavedAddress } from '../types';

export const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    switchRole,
    logout,
    setCustomerScreen,
    setActiveRole,
    language,
    orders,
    returns,
    savedAddresses,
    addSavedAddress,
    deleteSavedAddress,
    updateNotificationPreferences,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'addresses' | 'notifications'>('overview');

  // Address modal
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addrLabel, setAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [recipient, setRecipient] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98450 99887');
  const [addressLine, setAddressLine] = useState('');
  const [locality, setLocality] = useState(currentUser?.locality || 'Malleshwaram');
  const [pincode, setPincode] = useState(currentUser?.pincode || '560003');
  const [isDefault, setIsDefault] = useState(false);

  // Notification states
  const [prefs, setPrefs] = useState(
    currentUser?.notificationPreferences || {
      orderUpdates: true,
      deliveryAlerts: true,
      cancellationsAndRefunds: true,
      promotions: false,
      smsAlerts: true,
    }
  );

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'picked_up' && o.status !== 'cancelled');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');
  const refundedReturns = returns.filter((r) => r.status === 'refunded');

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !phone || !addressLine || !pincode) {
      showToast('Please fill all required fields', 'warning');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      showToast('PIN code must be 6 digits', 'warning');
      return;
    }

    const success = await addSavedAddress({
      label: addrLabel,
      recipientName: recipient,
      phone,
      addressLine,
      locality,
      city: 'Bengaluru',
      pincode: pincode.trim(),
      isDefault,
    });

    if (success) {
      setIsAddAddressOpen(false);
      setAddressLine('');
    }
  };

  const handleTogglePref = async (key: keyof typeof prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await updateNotificationPreferences(next);
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '90px', background: '#F8F7ED', minHeight: '100vh' }}>
      <HeaderNav />

      <div style={{ padding: '14px 16px' }}>
        {/* Profile Card */}
        <div
          className="card-base"
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '14px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8EE 100%)',
            border: '1px solid #E8E5D3',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#1B5E3B',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 800,
            }}
          >
            {currentUser?.name ? currentUser.name[0] : 'U'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
                {currentUser?.name || 'Local Shopper'}
              </h2>
              <span style={{ background: '#D1E7DD', color: '#0F5132', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                {currentUser?.role || 'Customer'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#5E6961', marginTop: '2px' }}>
              {currentUser?.email || 'customer@nammasanthe.com'}
            </div>
            <div style={{ fontSize: '11px', color: '#885E3C', marginTop: '2px' }}>
              📍 {currentUser?.locality || 'Malleshwaram'} • {savedAddresses.length} Saved Addresses
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
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
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: '11.5px',
              fontWeight: activeTab === 'overview' ? 700 : 500,
              color: activeTab === 'overview' ? '#1B5E3B' : '#5E6961',
              background: activeTab === 'overview' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
            }}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: '11.5px',
              fontWeight: activeTab === 'addresses' ? 700 : 500,
              color: activeTab === 'addresses' ? '#1B5E3B' : '#5E6961',
              background: activeTab === 'addresses' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
            }}
          >
            Addresses ({savedAddresses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: '11.5px',
              fontWeight: activeTab === 'notifications' ? 700 : 500,
              color: activeTab === 'notifications' ? '#1B5E3B' : '#5E6961',
              background: activeTab === 'notifications' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
            }}
          >
            Notifications
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* Order Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              <div
                onClick={() => setCustomerScreen('orders')}
                style={{ background: '#FFF', padding: '12px 8px', borderRadius: '12px', border: '1px solid #E8E5D3', textAlign: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E3B', display: 'block' }}>{activeOrders.length}</span>
                <span style={{ fontSize: '11px', color: '#5E6961' }}>Active Orders</span>
              </div>
              <div
                onClick={() => setCustomerScreen('orders')}
                style={{ background: '#FFF', padding: '12px 8px', borderRadius: '12px', border: '1px solid #E8E5D3', textAlign: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#DC2626', display: 'block' }}>{cancelledOrders.length}</span>
                <span style={{ fontSize: '11px', color: '#5E6961' }}>Cancellations</span>
              </div>
              <div
                onClick={() => setCustomerScreen('orders')}
                style={{ background: '#FFF', padding: '12px 8px', borderRadius: '12px', border: '1px solid #E8E5D3', textAlign: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#D97706', display: 'block' }}>{refundedReturns.length}</span>
                <span style={{ fontSize: '11px', color: '#5E6961' }}>Refunds</span>
              </div>
            </div>

            {/* Quick Demo Role Switcher Bar */}
            <div style={{ background: '#FAF9F0', border: '1px solid #E8E5D3', borderRadius: '14px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#885E3C', marginBottom: '8px', textTransform: 'uppercase' }}>
                Instant Persona Switcher:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  onClick={() => switchRole('customer')}
                  style={{ background: '#FFF', border: '1px solid #1B5E3B', color: '#1B5E3B', padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  🛍️ Customer
                </button>
                <button
                  onClick={() => switchRole('seller')}
                  style={{ background: '#FFF', border: '1px solid #F2B705', color: '#8A6800', padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  🌾 Seller
                </button>
                <button
                  onClick={() => switchRole('admin')}
                  style={{ background: '#FFF', border: '1px solid #E76F51', color: '#C65337', padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  🛡️ Admin
                </button>
              </div>
            </div>

            {/* Menu Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div
                onClick={() => setCustomerScreen('orders')}
                style={{ background: '#FFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E8E5D3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingBag size={18} color="#1B5E3B" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C241E' }}>My Orders & Real-time Tracking</span>
                </div>
                <ChevronRight size={16} color="#5E6961" />
              </div>

              <div
                onClick={() => setActiveTab('addresses')}
                style={{ background: '#FFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E8E5D3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={18} color="#1B5E3B" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C241E' }}>Saved Delivery Addresses ({savedAddresses.length})</span>
                </div>
                <ChevronRight size={16} color="#5E6961" />
              </div>

              <div
                onClick={() => setCustomerScreen('compare')}
                style={{ background: '#FFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E8E5D3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Scale size={18} color="#1B5E3B" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C241E' }}>Smart Product Comparison</span>
                </div>
                <ChevronRight size={16} color="#5E6961" />
              </div>

              <div
                onClick={() => setCustomerScreen('help')}
                style={{ background: '#FFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E8E5D3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HelpCircle size={18} color="#1B5E3B" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C241E' }}>Help, Policies & FAQ</span>
                </div>
                <ChevronRight size={16} color="#5E6961" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
                  Manage Delivery Addresses
                </h3>
                <span style={{ fontSize: '11px', color: '#885E3C' }}>Used for checkout & PIN serviceability check</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAddressOpen(true)}
                style={{
                  background: '#1B5E3B',
                  color: '#FFF',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} />
                <span>Add Address</span>
              </button>
            </div>

            {/* Address List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: addr.isDefault ? '2px solid #1B5E3B' : '1px solid #E8E5D3',
                    padding: '12px 14px',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ background: '#ECE9D8', color: '#885E3C', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                        {addr.label}
                      </span>
                      <strong style={{ fontSize: '13px', color: '#1C241E' }}>{addr.recipientName}</strong>
                      {addr.isDefault && (
                        <span style={{ color: '#1B5E3B', fontSize: '10px', fontWeight: 700 }}>• Default</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteSavedAddress(addr.id)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '2px' }}
                      title="Delete Address"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p style={{ fontSize: '12px', color: '#5E6961', margin: '0 0 4px', lineHeight: 1.4 }}>
                    {addr.addressLine}, {addr.locality}, {addr.city}
                  </p>
                  <span style={{ fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>
                    PIN: {addr.pincode} • Phone: {addr.phone}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Address Modal */}
            {isAddAddressOpen && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  zIndex: 1600,
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1B5E3B' }}>Add New Address</h3>
                    <button
                      type="button"
                      onClick={() => setIsAddAddressOpen(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5E6961' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateAddress} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {(['Home', 'Work', 'Other'] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setAddrLabel(l)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #D0CDBB',
                            fontSize: '11px',
                            background: addrLabel === l ? '#1B5E3B' : '#FFF',
                            color: addrLabel === l ? '#FFF' : '#1C241E',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {l}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Recipient Name *"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
                    />

                    <input
                      type="text"
                      placeholder="Contact Phone Number *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
                    />

                    <input
                      type="text"
                      placeholder="Flat, Wing, Street Address *"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        type="text"
                        placeholder="Locality"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
                      />
                      <input
                        type="text"
                        placeholder="6-digit PIN Code *"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#1C241E', margin: '4px 0' }}>
                      <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        style={{ accentColor: '#1B5E3B' }}
                      />
                      <span>Set as Default Delivery Address</span>
                    </label>

                    <button
                      type="submit"
                      style={{
                        background: '#1B5E3B',
                        color: '#FFF',
                        border: 'none',
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: '4px',
                      }}
                    >
                      Save Address
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTIFICATION PREFERENCES */}
        {activeTab === 'notifications' && (
          <div
            className="card-base"
            style={{
              padding: '16px',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8E5D3',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Bell size={18} color="#1B5E3B" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
                Notification Preferences
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <strong style={{ fontSize: '12.5px', color: '#1C241E', display: 'block' }}>Order Confirmation & Tracking</strong>
                  <span style={{ fontSize: '11px', color: '#5E6961' }}>Real-time updates as your order is accepted and packed</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.orderUpdates}
                  onChange={() => handleTogglePref('orderUpdates')}
                  style={{ width: '18px', height: '18px', accentColor: '#1B5E3B' }}
                />
              </label>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderTop: '1px solid #F3F1E7', paddingTop: '10px' }}>
                <div>
                  <strong style={{ fontSize: '12.5px', color: '#1C241E', display: 'block' }}>Delivery & Dispatch Alerts</strong>
                  <span style={{ fontSize: '11px', color: '#5E6961' }}>Notifications when rider starts or store counter is ready</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.deliveryAlerts}
                  onChange={() => handleTogglePref('deliveryAlerts')}
                  style={{ width: '18px', height: '18px', accentColor: '#1B5E3B' }}
                />
              </label>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderTop: '1px solid #F3F1E7', paddingTop: '10px' }}>
                <div>
                  <strong style={{ fontSize: '12.5px', color: '#1C241E', display: 'block' }}>Cancellations & Refunds</strong>
                  <span style={{ fontSize: '11px', color: '#5E6961' }}>Immediate alerts when refunds are credited or orders adjusted</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.cancellationsAndRefunds}
                  onChange={() => handleTogglePref('cancellationsAndRefunds')}
                  style={{ width: '18px', height: '18px', accentColor: '#1B5E3B' }}
                />
              </label>

              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderTop: '1px solid #F3F1E7', paddingTop: '10px' }}>
                <div>
                  <strong style={{ fontSize: '12.5px', color: '#1C241E', display: 'block' }}>Local Santhe Harvest Deals</strong>
                  <span style={{ fontSize: '11px', color: '#5E6961' }}>Weekly Sunday Santhe and festival harvest discounts</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.promotions}
                  onChange={() => handleTogglePref('promotions')}
                  style={{ width: '18px', height: '18px', accentColor: '#1B5E3B' }}
                />
              </label>
            </div>
          </div>
        )}

        {/* Database Login & Role Switcher */}
        <button
          type="button"
          id="profile-switch-account-db-btn"
          onClick={() => setCustomerScreen('login')}
          style={{
            width: '100%',
            background: '#F0F9F4',
            border: '1.5px solid #1B5E3B',
            color: '#1B5E3B',
            padding: '10px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '16px',
          }}
        >
          <Database size={16} />
          <span>Database Login & Role Switcher</span>
        </button>

        {/* Log out */}
        <button
          onClick={logout}
          style={{
            width: '100%',
            background: '#FFF',
            border: '1px solid #E76F51',
            color: '#E76F51',
            padding: '10px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '8px',
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

