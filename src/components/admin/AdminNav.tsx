import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Users,
  Store,
  Layers,
  Scale,
  Megaphone,
} from 'lucide-react';
import { AdminScreen } from '../../types';

export const AdminNav: React.FC = () => {
  const { adminScreen, setAdminScreen, shops, disputes } = useApp();

  const pendingSellersCount = shops.filter((s) => s.verificationStatus === 'pending').length;
  const openDisputesCount = disputes.filter((d) => d.status !== 'resolved').length;

  const tabs: {
    screen: AdminScreen;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    badge?: number;
  }[] = [
    { screen: 'dashboard', label: 'Overview', icon: Shield },
    {
      screen: 'sellers',
      label: 'Sellers',
      icon: Store,
      badge: pendingSellersCount > 0 ? pendingSellersCount : undefined,
    },
    { screen: 'listings', label: 'Listings', icon: Layers },
    {
      screen: 'disputes',
      label: 'Disputes',
      icon: Scale,
      badge: openDisputesCount > 0 ? openDisputesCount : undefined,
    },
    { screen: 'banners', label: 'Banners', icon: Megaphone },
  ];

  return (
    <nav
      className="bottom-nav-bar"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E8E5D3',
      }}
      role="navigation"
      aria-label="Admin Navigation"
    >
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = adminScreen === tab.screen;

        return (
          <button
            key={tab.screen}
            type="button"
            onClick={() => setAdminScreen(tab.screen)}
            className={`nav-tab-item ${isActive ? 'active' : ''}`}
            style={{
              color: isActive ? '#E76F51' : '#5E6961',
            }}
          >
            <div className="nav-icon-container">
              <IconComponent size={18} />
              {tab.badge && (
                <span
                  className="nav-badge-bubble"
                  style={{
                    background: '#E76F51',
                    fontSize: '9px',
                    height: '16px',
                    padding: '0 5px',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span style={{ fontWeight: isActive ? 700 : 500, fontSize: '10px' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
