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
  Leaf,
  ShieldCheck,
  Globe,
  Award,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    setCustomerScreen,
    setActiveRole,
    language,
    setLanguage,
    showToast,
  } = useApp();

  const menuItems = [
    {
      id: 'orders',
      title: 'My Orders & Track',
      kannadaTitle: 'ನನ್ನ ಆರ್ಡರ್‌ಗಳು',
      icon: ShoppingBag,
      action: () => setCustomerScreen('orders'),
      badge: '2 active',
    },
    {
      id: 'wishlist',
      title: 'My Saved Produce & Wishlist',
      kannadaTitle: 'ಉಳಿಸಿದ ವಸ್ತುಗಳು',
      icon: Heart,
      action: () => showToast('Wishlist: 4 fresh items saved', 'info'),
      badge: '4 items',
    },
    {
      id: 'addresses',
      title: 'Delivery Addresses',
      kannadaTitle: 'ವಿತರಣಾ ವಿಳಾಸಗಳು',
      icon: MapPin,
      action: () => showToast('Default: Malleshwaram 4th Cross', 'info'),
    },
    {
      id: 'payments',
      title: 'Santhe Pay & Wallets',
      kannadaTitle: 'ಸಂತೆ ಪೇ ಮತ್ತು ವ್ಯಾಲೆಟ್',
      icon: CreditCard,
      action: () => showToast('Santhe Wallet Balance: ₹450', 'success'),
      badge: '₹450 Bal',
    },
    {
      id: 'support',
      title: 'Farmer Co-op Help & Support',
      kannadaTitle: 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
      icon: HelpCircle,
      action: () => showToast('Toll-free helpline: 1800-425-SANTHE', 'info'),
    },
    {
      id: 'settings',
      title: 'App Preferences & Notifications',
      kannadaTitle: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
      icon: Settings,
      action: () => showToast('Preferences updated', 'info'),
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
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Ananya Rao"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2.5px solid #1B5E3B',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#F2B705',
                borderRadius: '50%',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={13} color="#261E05" />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '18px',
                  color: '#1C241E',
                  fontWeight: 700,
                }}
              >
                Ananya Rao
              </h2>
            </div>
            <div style={{ fontSize: '11px', color: '#5E6961' }}>ananya.rao@santhe.in</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span className="badge-green" style={{ fontSize: '10px', padding: '2px 8px' }}>
                Member since 2024
              </span>
              <span style={{ fontSize: '10.5px', color: '#885E3C', fontWeight: 600 }}>
                Green Patron
              </span>
            </div>
          </div>
        </div>

        {/* Community Impact Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1B5E3B 0%, #246d47 100%)',
            borderRadius: '16px',
            padding: '16px',
            color: '#FFFFFF',
            marginBottom: '16px',
            boxShadow: '0 6px 18px rgba(27,94,59,0.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Leaf size={16} color="#F2B705" />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#F2B705',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Your Local Impact
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '17px',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '8px',
            }}
          >
            Direct Support to Karnataka Producers
          </h3>

          <p style={{ fontSize: '11.5px', opacity: 0.9, lineHeight: 1.4, marginBottom: '12px' }}>
            You have contributed <strong>₹2,450 directly</strong> to 14 farmer co-operatives in
            Kolar & Mysore, saving 12 kg CO2 from long haul logistics.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              background: 'rgba(255,255,255,0.14)',
              borderRadius: '10px',
              padding: '8px 12px',
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>14 Farmers</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>Direct Co-ops</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>100%</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>Plastic-Free Packaging</div>
            </div>
          </div>
        </div>

        {/* Seller switch shortcut */}
        <div
          onClick={() => setActiveRole('seller')}
          className="card-base"
          style={{
            padding: '14px',
            marginBottom: '16px',
            border: '1.5px solid #F2B705',
            background: '#FFFDF5',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#885E3C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>
                Manage Your Store (Lakshmi Stores)
              </div>
              <div style={{ fontSize: '11px', color: '#885E3C' }}>
                Switch to Seller & Vendor Portal
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#885E3C" />
        </div>

        {/* Menu Links */}
        <div className="card-base" style={{ overflow: 'hidden', marginBottom: '16px' }}>
          {menuItems.map((item, idx) => {
            const IconComp = item.icon;

            return (
              <div
                key={item.id}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 14px',
                  borderBottom: idx < menuItems.length - 1 ? '1px solid #F0EEE4' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IconComp size={16} color="#1B5E3B" />
                  <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#1C241E' }}>
                    {language === 'kn' ? item.kannadaTitle : item.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.badge && (
                    <span
                      style={{
                        background: '#ECE9D8',
                        color: '#885E3C',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight size={16} color="#C4BEA9" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Promotional Banner: Support Local, Support Small */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FAF8EE 0%, #F0EAD6 100%)',
            border: '1.5px dashed #C4BEA9',
            borderRadius: '14px',
            padding: '14px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '15px',
              fontWeight: 700,
              color: '#885E3C',
              marginBottom: '3px',
            }}
          >
            "Support Local, Support Small"
          </div>
          <div style={{ fontSize: '11px', color: '#5E6961' }}>
            Namma Santhe App • Version 2.4.0 • Made with pride for Karnataka
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
