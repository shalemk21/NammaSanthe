import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import { SellerScreen } from '../../types';

export const SellerNav: React.FC = () => {
  const { sellerScreen, setSellerScreen, orders, sellerMetrics, language } = useApp();

  const pendingOrdersCount = orders.filter((o) => o.status === 'processing').length;

  const navItems: {
    screen: SellerScreen;
    label: string;
    kannadaLabel: string;
    icon: React.ComponentType<{ size?: number }>;
    badge?: number | string;
  }[] = [
    {
      screen: 'dashboard',
      label: 'Dashboard',
      kannadaLabel: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      icon: LayoutDashboard,
    },
    {
      screen: 'inventory',
      label: 'Inventory',
      kannadaLabel: 'ದಾಸ್ತಾನು',
      icon: Package,
      badge: sellerMetrics.lowStockCount > 0 ? `${sellerMetrics.lowStockCount} Low` : undefined,
    },
    {
      screen: 'add_product',
      label: '+ Product',
      kannadaLabel: '+ ಹೊಸದು',
      icon: PlusCircle,
    },
    {
      screen: 'orders',
      label: 'Orders',
      kannadaLabel: 'ಆರ್ಡರ್‌ಗಳು',
      icon: ClipboardList,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      screen: 'analytics',
      label: 'Analytics',
      kannadaLabel: 'ವರದಿಗಳು',
      icon: BarChart3,
    },
  ];

  return (
    <nav
      className="bottom-nav-bar"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E8E5D3',
      }}
      role="navigation"
      aria-label="Vendor Navigation"
    >
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = sellerScreen === item.screen;

        return (
          <button
            key={item.screen}
            type="button"
            id={`seller-nav-${item.screen}`}
            onClick={() => setSellerScreen(item.screen)}
            className={`nav-tab-item ${isActive ? 'active' : ''}`}
            style={{
              color: isActive ? '#885E3C' : '#5E6961',
            }}
          >
            <div className="nav-icon-container">
              <IconComponent size={19} />
              {item.badge && (
                <span
                  className="nav-badge-bubble"
                  style={{
                    background: '#E76F51',
                    fontSize: '9px',
                    height: '16px',
                    padding: '0 5px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span style={{ fontWeight: isActive ? 700 : 500, fontSize: '10px' }}>
              {language === 'kn' ? item.kannadaLabel : item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
