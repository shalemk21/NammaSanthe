import React from 'react';
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
} from 'lucide-react';

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
    wishlist,
    showToast,
  } = useApp();

  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const activeReturnsCount = returns.filter((r) => r.status !== 'refunded' && r.status !== 'rejected').length;

  const menuItems = [
    {
      id: 'orders',
      title: 'My Orders & Real-time Tracking',
      kannadaTitle: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ಟ್ರ್ಯಾಕಿಂಗ್',
      icon: ShoppingBag,
      action: () => setCustomerScreen('orders'),
      badge: activeOrdersCount > 0 ? `${activeOrdersCount} active` : undefined,
    },
    {
      id: 'returns',
      title: 'Returns & Refund Requests',
      kannadaTitle: 'ರಿಟರ್ನ್ಸ್ ಮತ್ತು ಮರುಪಾವತಿಗಳು',
      icon: RotateCcw,
      action: () => setCustomerScreen('orders'),
      badge: activeReturnsCount > 0 ? `${activeReturnsCount} pending` : undefined,
    },
    {
      id: 'compare',
      title: 'Smart Product Comparison',
      kannadaTitle: 'ಉತ್ಪನ್ನಗಳ ಹೋಲಿಕೆ',
      icon: Scale,
      action: () => setCustomerScreen('compare'),
    },
    {
      id: 'support',
      title: 'Help, FAQ & Marketplace Policies',
      kannadaTitle: 'ಸಹಾಯ ಮತ್ತು ನಿಯಮಾವಳಿಗಳು',
      icon: HelpCircle,
      action: () => setCustomerScreen('help'),
    },
    {
      id: 'addresses',
      title: 'Saved Delivery Addresses',
      kannadaTitle: 'ವಿತರಣಾ ವಿಳಾಸಗಳು',
      icon: MapPin,
      action: () => showToast(`Saved Address: ${currentUser?.address || 'Malleshwaram 4th Cross'}`, 'info'),
    },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
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
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF8EE 100%)',
            border: '1px solid #E8E5D3',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#1B5E3B',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
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
              📍 {currentUser?.locality || 'Malleshwaram'}, {currentUser?.city || 'Bengaluru'}
            </div>
          </div>
        </div>

        {/* Quick Demo Role Switcher Bar */}
        <div style={{ background: '#FAF9F0', border: '1px solid #E8E5D3', borderRadius: '14px', padding: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#885E3C', marginBottom: '8px', textTransform: 'uppercase' }}>
            Fast Switch Roles for Testing:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              onClick={() => switchRole('customer')}
              style={{
                background: '#FFF',
                border: '1px solid #1B5E3B',
                color: '#1B5E3B',
                padding: '6px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🛍️ Customer
            </button>
            <button
              onClick={() => switchRole('seller')}
              style={{
                background: '#FFF',
                border: '1px solid #F2B705',
                color: '#8A6800',
                padding: '6px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🌾 Seller
            </button>
            <button
              onClick={() => switchRole('admin')}
              style={{
                background: '#FFF',
                border: '1px solid #E76F51',
                color: '#C65337',
                padding: '6px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {menuItems.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.action}
                style={{
                  background: '#FFF',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #E8E5D3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: '#1B5E3B' }}>
                    <IconComp size={18} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C241E' }}>
                    {language === 'kn' ? item.kannadaTitle : item.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.badge && (
                    <span style={{ background: 'rgba(27,94,59,0.1)', color: '#1B5E3B', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={16} color="#8E9991" />
                </div>
              </div>
            );
          })}
        </div>

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
