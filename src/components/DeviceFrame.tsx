import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Smartphone,
  Maximize2,
  Store,
  ShoppingBag,
  Globe,
  Wifi,
  Battery,
} from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const {
    activeRole,
    setActiveRole,
    viewMode,
    setViewMode,
    language,
    setLanguage,
    toast,
  } = useApp();

  return (
    <div className="app-viewport-container">
      {/* Top Global Control Toolbar */}
      <header className="global-control-bar" role="banner">
        <div className="brand-pill">
          <img
            src="/assets/logo.jpg"
            alt="Namma Santhe Logo"
            className="brand-pill-logo"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="brand-pill-title">Namma Santhe</div>
            <div className="brand-pill-tagline">
              {language === 'kn'
                ? 'ಸ್ಥಳೀಯ ಅಂಗಡಿಗಳು • ತಾಜಾ ಬೆಳೆ • ಬಲಿಷ್ಠ ಸಮುದಾಯ'
                : 'Local Shops • Fresh Produce • Stronger Communities'}
            </div>
          </div>
        </div>

        <div className="control-actions-group">
          {/* Role Switcher */}
          <div className="role-switcher-toggle" role="group" aria-label="Switch User Role">
            <button
              type="button"
              id="role-customer-btn"
              onClick={() => setActiveRole('customer')}
              className={`role-tab-btn ${activeRole === 'customer' ? 'active' : ''}`}
              title="Customer Shopping Experience"
            >
              <ShoppingBag size={14} />
              <span>Customer</span>
            </button>
            <button
              type="button"
              id="role-seller-btn"
              onClick={() => setActiveRole('seller')}
              className={`role-tab-btn ${activeRole === 'seller' ? 'seller-active' : ''}`}
              title="Seller & Vendor Dashboard"
            >
              <Store size={14} />
              <span>Vendor Hub</span>
            </button>
          </div>

          {/* Language Switcher */}
          <button
            type="button"
            id="lang-toggle-btn"
            className="icon-btn-toggle"
            onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
            title="Toggle Kannada / English"
          >
            <Globe size={13} />
            <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Viewport Mode Toggle */}
          <button
            type="button"
            id="viewport-toggle-btn"
            className="icon-btn-toggle"
            onClick={() => setViewMode(viewMode === 'mobile' ? 'fullscreen' : 'mobile')}
            title={viewMode === 'mobile' ? 'Expand to Fullscreen View' : 'Switch to Mobile Mockup Frame'}
          >
            {viewMode === 'mobile' ? (
              <>
                <Maximize2 size={13} />
                <span>Expand</span>
              </>
            ) : (
              <>
                <Smartphone size={13} />
                <span>Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className="toast-box">
            <div className="toast-dot" />
            <span>
              {language === 'kn' && toast.kannadaMessage
                ? toast.kannadaMessage
                : toast.message}
            </span>
          </div>
        </div>
      )}

      {/* Main Frame Device Container */}
      <main
        className={viewMode === 'mobile' ? 'device-mobile-frame' : 'device-fullscreen-frame'}
      >
        {/* Mobile Device Status Bar */}
        {viewMode === 'mobile' && (
          <div className="phone-status-bar" aria-hidden="true">
            <span>10:45</span>
            <div className="phone-dynamic-island">
              <span style={{ fontSize: '9px', color: '#9ef01a' }}>● Santhe Live</span>
              <div className="dynamic-island-indicator" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wifi size={13} />
              <Battery size={14} />
            </div>
          </div>
        )}

        {/* Dynamic screen content container */}
        <div className="screen-scroll-container">{children}</div>

        {/* Mobile Home Bar */}
        {viewMode === 'mobile' && <div className="phone-home-indicator" />}
      </main>
    </div>
  );
};
