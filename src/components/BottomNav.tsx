import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Package,
  User,
  Compass,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { CustomerScreen } from '../types';

export const BottomNav: React.FC = () => {
  const { customerScreen, setCustomerScreen, cartTotalCount, language } = useApp();

  // Floating Icon Mode: true = compact circular floating icon (FAB), false = floating dock capsule
  const [isFloatingIconMode, setIsFloatingIconMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nammasanthe_nav_floating_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Track if popup drawer is open when in floating icon mode
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('nammasanthe_nav_floating_mode', isFloatingIconMode ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, [isFloatingIconMode]);

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

  const handleSelectScreen = (screen: CustomerScreen) => {
    setCustomerScreen(screen);
    if (isFloatingIconMode) {
      setIsMenuOpen(false);
    }
  };

  // --- FLOATING ICON MODE (Compact Floating Button + Popover) ---
  if (isFloatingIconMode) {
    return (
      <div
        className="floating-nav-container"
        style={{
          position: 'absolute',
          bottom: '18px',
          right: '18px',
          zIndex: 950,
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        {/* Floating Navigation Popover Menu (when tapped) */}
        {isMenuOpen && (
          <div
            className="floating-menu-popover animate-fade-in"
            style={{
              position: 'absolute',
              bottom: '68px',
              right: '0',
              width: '280px',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(27, 94, 59, 0.2)',
              borderRadius: '24px',
              padding: '12px',
              boxShadow: '0 16px 40px rgba(27, 94, 59, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {/* Header with expand back to full dock */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px 8px',
                borderBottom: '1px solid #EFECE0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E3B' }}>
                  {language === 'kn' ? 'ನಮ್ಮ ಸಂತೆ ಮೆನು' : 'Santhe Menu'}
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: '#E8F5E9',
                    color: '#1B5E3B',
                  }}
                >
                  Floating
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFloatingIconMode(false)}
                title="Expand to Full Dock"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#885E3C',
                  cursor: 'pointer',
                  padding: '2px 4px',
                }}
              >
                Expand Dock ↗
              </button>
            </div>

            {/* Menu Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = customerScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  type="button"
                  id={`nav-floating-item-${item.screen}`}
                  onClick={() => handleSelectScreen(item.screen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    border: 'none',
                    background: isActive ? '#1B5E3B' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#1C241E',
                    cursor: 'pointer',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <Icon size={18} color={isActive ? '#FFFFFF' : '#1B5E3B'} />
                      {item.hasBadge && cartTotalCount > 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-8px',
                            background: '#E76F51',
                            color: '#FFF',
                            fontSize: '9px',
                            fontWeight: 800,
                            borderRadius: '10px',
                            padding: '1px 5px',
                          }}
                        >
                          {cartTotalCount}
                        </span>
                      )}
                    </div>
                    <span>{language === 'kn' ? item.kannadaLabel : item.label}</span>
                  </div>
                  {isActive && <span style={{ fontSize: '11px', opacity: 0.85 }}>● Active</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Floating Circular Action Button (FAB) */}
        <button
          type="button"
          id="nav-floating-fab-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Santhe Navigation Menu"
          aria-expanded={isMenuOpen}
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1B5E3B 0%, #2d8a57 100%)',
            color: '#FFFFFF',
            border: '2px solid rgba(255, 255, 255, 0.85)',
            boxShadow: '0 8px 24px rgba(27, 94, 59, 0.4), 0 2px 6px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isMenuOpen ? (
            <X size={24} />
          ) : (
            <>
              <Compass size={24} />
              {cartTotalCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: '#E76F51',
                    color: '#FFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    borderRadius: '10px',
                    padding: '2px 6px',
                    border: '2px solid #FFF',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {cartTotalCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    );
  }

  // --- FLOATING DOCK WINDOW MODE (Constant Floating Capsule Bar) ---
  return (
    <div
      className="floating-dock-wrapper"
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 24px)',
        maxWidth: '430px',
        zIndex: 950,
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <nav
        className="floating-dock-pill"
        role="navigation"
        aria-label="Customer Floating Navigation"
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(27, 94, 59, 0.18)',
          borderRadius: '9999px',
          boxShadow: '0 12px 36px rgba(27, 94, 59, 0.18), 0 2px 10px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          gap: '4px',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = customerScreen === item.screen;

          return (
            <button
              key={item.screen}
              type="button"
              id={`nav-tab-${item.screen}`}
              onClick={() => handleSelectScreen(item.screen)}
              className={`floating-dock-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                padding: '6px 4px',
                borderRadius: '9999px',
                border: 'none',
                background: isActive ? '#1B5E3B' : 'transparent',
                color: isActive ? '#FFFFFF' : '#5E6961',
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={isActive ? '#FFFFFF' : '#1B5E3B'} />
                {item.hasBadge && cartTotalCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-10px',
                      background: '#E76F51',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 800,
                      borderRadius: '10px',
                      padding: '1px 5px',
                      border: isActive ? '1.5px solid #1B5E3B' : '1.5px solid #FFFFFF',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                    }}
                    aria-label={`${cartTotalCount} items in cart`}
                  >
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '9.5px', whiteSpace: 'nowrap' }}>
                {language === 'kn' ? item.kannadaLabel : item.label}
              </span>
            </button>
          );
        })}

        {/* Minimize to Floating Icon button */}
        <button
          type="button"
          id="nav-minimize-btn"
          onClick={() => setIsFloatingIconMode(true)}
          title="Minimize to Floating Icon"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(27, 94, 59, 0.08)',
            color: '#1B5E3B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginLeft: '2px',
            flexShrink: 0,
            transition: 'background 0.2s ease',
          }}
          aria-label="Minimize navigation bar to floating icon"
        >
          <ChevronDown size={14} />
        </button>
      </nav>
    </div>
  );
};
