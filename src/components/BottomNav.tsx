import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Package,
  User,
} from 'lucide-react';
import { CustomerScreen } from '../types';

export const BottomNav: React.FC = () => {
  const { customerScreen, setCustomerScreen, cartTotalCount, language } = useApp();

  const navItems: {
    screen: CustomerScreen;
    label: string;
    kannadaLabel: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    hasBadge?: boolean;
  }[] = [
    {
      screen: 'home',
      label: 'Home',
      kannadaLabel: 'ಮುಖಪುಟ',
      icon: Home,
    },
    {
      screen: 'categories',
      label: 'Categories',
      kannadaLabel: 'ವರ್ಗಗಳು',
      icon: LayoutGrid,
    },
    {
      screen: 'cart',
      label: 'Cart',
      kannadaLabel: 'ಬುಟ್ಟಿ',
      icon: ShoppingBag,
      hasBadge: true,
    },
    {
      screen: 'orders',
      label: 'Orders',
      kannadaLabel: 'ಆರ್ಡರ್‌ಗಳು',
      icon: Package,
    },
    {
      screen: 'profile',
      label: 'Profile',
      kannadaLabel: 'ಪ್ರೊಫೈಲ್',
      icon: User,
    },
  ];

  return (
    <nav className="bottom-nav-bar" role="navigation" aria-label="Customer Navigation">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = customerScreen === item.screen;

        return (
          <button
            key={item.screen}
            type="button"
            id={`nav-tab-${item.screen}`}
            onClick={() => setCustomerScreen(item.screen)}
            className={`nav-tab-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="nav-icon-container">
              <IconComponent size={20} />
              {item.hasBadge && cartTotalCount > 0 && (
                <span className="nav-badge-bubble" aria-label={`${cartTotalCount} items in cart`}>
                  {cartTotalCount}
                </span>
              )}
            </div>
            <span>{language === 'kn' ? item.kannadaLabel : item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
