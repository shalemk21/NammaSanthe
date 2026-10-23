import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Smartphone,
  Maximize2,
  Store,
  ShoppingBag,
  Shield,
  Globe,
  Wifi,
  Battery,
  User as UserIcon,
  LogOut,
  Bell,
  Scale,
  SlidersHorizontal,
  ChevronDown,
  Bike,
  MessageSquare,
} from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    activeRole,
    switchRole,
    viewMode,
    setViewMode,
    language,
    setLanguage,
    currentUser,
    logout,
    setIsAuthModalOpen,
    toast,
    unreadNotifCount,
    setCustomerScreen,
    comparisonList,
    openLiveNotifDrawer,
  } = useApp();

  return (
    <div className="app-viewport-container">
      {/* Top Global Control Toolbar */}
      <header className="global-control-bar" role="banner">
        <div className="brand-pill" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#1B5E3B',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
              boxShadow: '0 2px 8px rgba(27,94,59,0.3)',
            }}
          >
            🌱
          </div>
          <div>
            <div className="brand-pill-title" style={{ fontSize: '15px', fontWeight: 800, color: '#1B5E3B' }}>
              Namma Santhe <span style={{ fontSize: '12px', fontWeight: 600, color: '#885E3C' }}>• ನಮ್ಮ ಸಂತೆ</span>
            </div>
            <div className="brand-pill-tagline" style={{ fontSize: '10px', color: '#5E6961' }}>
              {language === 'kn'
                ? 'ಸ್ಥಳೀಯ ಅಂಗಡಿಗಳು • ಹೈಪರ್ ಲೋಕಲ್ ಮಾರುಕಟ್ಟೆ • 30 ನಿಮಿಷ ವಿತರಣೆ'
                : 'Hyperlocal Marketplace • Direct Farm-to-Door • Zero Middlemen'}
            </div>
          </div>
        </div>

        <div className="control-actions-group">
          {/* --- DESKTOP CONTROLS --- */}
          <div className="desktop-demo-controls">
            {/* 3-Role Switcher */}
            <div className="role-switcher-toggle" role="group" aria-label="Switch User Role" style={{ display: 'flex', background: '#F0EFE6', padding: '3px', borderRadius: '10px' }}>
              <button
                type="button"
                id="role-customer-btn"
                onClick={() => switchRole('customer')}
                className={`role-tab-btn ${activeRole === 'customer' ? 'active' : ''}`}
                title="Customer Shopping Experience"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeRole === 'customer' ? '#1B5E3B' : 'transparent',
                  color: activeRole === 'customer' ? '#FFF' : '#5E6961',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ShoppingBag size={13} />
                <span>Customer</span>
              </button>
              <button
                type="button"
                id="role-seller-btn"
                onClick={() => switchRole('seller')}
                className={`role-tab-btn ${activeRole === 'seller' ? 'seller-active' : ''}`}
                title="Seller & Vendor Dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeRole === 'seller' ? '#F2B705' : 'transparent',
                  color: activeRole === 'seller' ? '#5A4400' : '#5E6961',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Store size={13} />
                <span>Vendor Hub</span>
              </button>
              <button
                type="button"
                id="role-admin-btn"
                onClick={() => switchRole('admin')}
                className={`role-tab-btn ${activeRole === 'admin' ? 'active' : ''}`}
                title="Platform Administrator"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeRole === 'admin' ? '#E76F51' : 'transparent',
                  color: activeRole === 'admin' ? '#FFF' : '#5E6961',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Shield size={13} />
                <span>Admin</span>
              </button>
              <button
                type="button"
                id="role-rider-btn"
                onClick={() => switchRole('rider')}
                className={`role-tab-btn ${activeRole === 'rider' ? 'active' : ''}`}
                title="Delivery Rider Companion Dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeRole === 'rider' ? '#0284C7' : 'transparent',
                  color: activeRole === 'rider' ? '#FFF' : '#5E6961',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Bike size={13} />
                <span>Delivery Rider</span>
              </button>
            </div>

            {/* Quick Comparison floating badge if active */}
            {comparisonList.length > 0 && activeRole === 'customer' && (
              <button
                type="button"
                onClick={() => setCustomerScreen('compare')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#E76F51',
                  color: '#FFF',
                  padding: '5px 9px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(231,111,81,0.3)',
                }}
                title="View Product Comparison"
              >
                <Scale size={12} />
                <span>Compare ({comparisonList.length})</span>
              </button>
            )}

            {/* User Profile Pill / Auth */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F8F7ED', padding: '4px 10px', borderRadius: '20px', border: '1px solid #E8E5D3' }}>
                <UserIcon size={13} color="#1B5E3B" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#1C241E', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  title="Log out"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#5E6961', padding: '2px' }}
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                style={{
                  background: '#1B5E3B',
                  color: '#FFF',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            )}

            {/* Live WhatsApp / SMS Comms Feed Drawer Toggle */}
            <button
              type="button"
              id="whatsapp-sms-drawer-btn"
              className="icon-btn-toggle"
              onClick={openLiveNotifDrawer}
              title="Open Live WhatsApp & SMS Notification Feed"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #86EFAC',
                background: '#F0FDF4',
                color: '#15803D',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <MessageSquare size={13} color="#16A34A" />
              <span>Live Comms</span>
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              id="lang-toggle-btn"
              className="icon-btn-toggle"
              onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
              title="Toggle Kannada / English"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #D0CDBB', background: '#FFF', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >
              <Globe size={12} color="#1B5E3B" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
            </button>

            {/* Viewport Mode Toggle */}
            <button
              type="button"
              id="viewport-toggle-btn"
              className="icon-btn-toggle"
              onClick={() => setViewMode(viewMode === 'mobile' ? 'fullscreen' : 'mobile')}
              title={viewMode === 'mobile' ? 'Expand to Fullscreen View' : 'Switch to Mobile Mockup Frame'}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #D0CDBB', background: '#FFF', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >
              {viewMode === 'mobile' ? (
                <>
                  <Maximize2 size={12} />
                  <span>Fullscreen</span>
                </>
              ) : (
                <>
                  <Smartphone size={12} />
                  <span>Mobile Frame</span>
                </>
              )}
            </button>
          </div>

          {/* --- MOBILE COMPACT CONTROLS & DROPDOWN --- */}
          <div className="mobile-demo-controls">
            {/* Active role mini badge */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '8px',
                background:
                  activeRole === 'customer'
                    ? '#E8F5E9'
                    : activeRole === 'seller'
                    ? '#FEF3C7'
                    : activeRole === 'rider'
                    ? '#E0F2FE'
                    : '#FEE2E2',
                color:
                  activeRole === 'customer'
                    ? '#1B5E3B'
                    : activeRole === 'seller'
                    ? '#92400E'
                    : activeRole === 'rider'
                    ? '#0369A1'
                    : '#991B1B',
                textTransform: 'capitalize',
              }}
            >
              {activeRole === 'seller' ? 'Vendor Hub' : activeRole === 'rider' ? 'Rider' : activeRole}
            </span>

            {/* Collapsible Dropdown Toggle */}
            <button
              type="button"
              id="mobile-demo-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: isMobileMenuOpen ? '#1B5E3B' : '#F0EFE6',
                color: isMobileMenuOpen ? '#FFFFFF' : '#1C241E',
                border: '1px solid #D0CDBB',
                padding: '6px 10px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Open Demo Role Switcher"
            >
              <SlidersHorizontal size={13} />
              <span>Demo</span>
              <ChevronDown size={13} style={{ transform: isMobileMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Mobile Dropdown Popover */}
            {isMobileMenuOpen && (
              <div
                className="fade-in"
                style={{
                  position: 'absolute',
                  top: '42px',
                  right: 0,
                  width: '260px',
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  border: '1px solid #E8E5D3',
                  padding: '12px',
                  zIndex: 2000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#885E3C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Switch Demo Role
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      switchRole('customer');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeRole === 'customer' ? '#1B5E3B' : '#FAF9F0',
                      color: activeRole === 'customer' ? '#FFF' : '#1C241E',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>Customer Experience</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchRole('seller');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeRole === 'seller' ? '#F2B705' : '#FAF9F0',
                      color: activeRole === 'seller' ? '#5A4400' : '#1C241E',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Store size={14} />
                    <span>Vendor Hub (Seller)</span>
                  </button>

                  <button
                    type="button"
                    id="mobile-role-rider-btn"
                    onClick={() => {
                      switchRole('rider');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeRole === 'rider' ? '#0284C7' : '#FAF9F0',
                      color: activeRole === 'rider' ? '#FFF' : '#1C241E',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Bike size={14} />
                    <span>Delivery Rider Companion</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchRole('admin');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeRole === 'admin' ? '#E76F51' : '#FAF9F0',
                      color: activeRole === 'admin' ? '#FFF' : '#1C241E',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Shield size={14} />
                    <span>Marketplace Admin</span>
                  </button>
                </div>

                <div style={{ height: '1px', background: '#F0EFE6' }} />

                {/* Mobile Comms Feed Button */}
                <button
                  type="button"
                  onClick={() => {
                    openLiveNotifDrawer();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #86EFAC',
                    background: '#F0FDF4',
                    color: '#15803D',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <MessageSquare size={14} color="#16A34A" />
                  <span>Open WhatsApp & SMS Feed</span>
                </button>

                <div style={{ height: '1px', background: '#F0EFE6' }} />

                {/* Viewport and Language */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode(viewMode === 'mobile' ? 'fullscreen' : 'mobile');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #D0CDBB',
                      background: '#FFF',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {viewMode === 'mobile' ? <Maximize2 size={12} /> : <Smartphone size={12} />}
                    <span>{viewMode === 'mobile' ? 'Fullscreen' : 'Mobile'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage(language === 'en' ? 'kn' : 'en');
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #D0CDBB',
                      background: '#FFF',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Globe size={12} color="#1B5E3B" />
                    <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
                  </button>
                </div>

                {/* Auth / Profile in menu */}
                {currentUser ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#F8F7ED', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600 }}>
                      <UserIcon size={12} color="#1B5E3B" />
                      <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentUser.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E76F51', fontSize: '11px', fontWeight: 600 }}
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      background: '#1B5E3B',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    Sign In to Namma Santhe
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite" style={{ position: 'fixed', top: '75px', right: '20px', zIndex: 9999 }}>
          <div className="toast-box" style={{ background: toast.type === 'error' ? '#9B1C1C' : toast.type === 'warning' ? '#8A6800' : '#1B5E3B', color: '#FFF', padding: '10px 18px', borderRadius: '10px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 500 }}>
            <div className="toast-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#9EF01A' }} />
            <span>
              {language === 'kn' && toast.kannadaMessage ? toast.kannadaMessage : toast.message}
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
