import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Search,
  X,
  ChevronDown,
  Bell,
  Scale,
  ShoppingBag,
  ExternalLink,
  User,
} from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const {
    currentUser,
    selectedLocality,
    setSelectedLocality,
    availableLocalities,
    searchQuery,
    setSearchQuery,
    setCustomerScreen,
    language,
    showToast,
    notifications,
    unreadNotifCount,
    comparisonList,
    cartTotalCount,
    setIsCheckoutOpen,
  } = useApp();

  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  return (
    <header className="app-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top row with location & notifications */}
      <div className="header-top-row">
        {/* Hyperlocal location picker */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            id="location-selector-btn"
            className="location-picker-btn"
            onClick={() => {
              setIsLocationDropdownOpen(!isLocationDropdownOpen);
              setIsNotifDropdownOpen(false);
            }}
            aria-expanded={isLocationDropdownOpen}
            title="Change Delivery Locality"
          >
            <MapPin size={14} color="#1B5E3B" />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedLocality}
            </span>
            <ChevronDown size={13} />
          </button>

          {/* Location dropdown */}
          {isLocationDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                width: '240px',
                maxHeight: '260px',
                overflowY: 'auto',
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E8E5D3',
                boxShadow: '0 8px 24px rgba(27, 94, 59, 0.16)',
                padding: '6px',
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#885E3C',
                  padding: '6px 10px',
                  borderBottom: '1px solid #F0EEE4',
                }}
              >
                {language === 'kn' ? 'ಸ್ಥಳೀಯ ಪ್ರದೇಶ ಆಯ್ಕೆಮಾಡಿ' : 'SELECT LOCALITY / HUB'}
              </div>
              {availableLocalities.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setSelectedLocality(loc);
                    setIsLocationDropdownOpen(false);
                    showToast(`Hyperlocal hub set to: ${loc}`, 'info');
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    fontSize: '12px',
                    color: selectedLocality === loc ? '#1B5E3B' : '#1C241E',
                    fontWeight: selectedLocality === loc ? 700 : 500,
                    background: selectedLocality === loc ? 'rgba(27, 94, 59, 0.08)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand header click to home */}
        <div
          className="header-brand-mark"
          onClick={() => setCustomerScreen('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          title="Namma Santhe - Home"
        >
          <img
            src="/logo-mark.png"
            alt="Namma Santhe Logo"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).src = '/logo-mark.png'; }}
          />
          <span className="header-brand-text" style={{ fontSize: '15px', fontWeight: 800, color: '#1B5E3B', letterSpacing: '-0.2px' }}>
            Namma Santhe
          </span>
        </div>

        {/* Action icons: Compare, Notifications, Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Smart compare link */}
          {comparisonList.length > 0 && (
            <button
              type="button"
              onClick={() => setCustomerScreen('compare')}
              style={{
                background: '#E76F51',
                color: '#FFF',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
              }}
              title="Compare selected products"
            >
              <Scale size={14} />
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  background: '#1B5E3B',
                  color: '#FFF',
                  fontSize: '9px',
                  fontWeight: 700,
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {comparisonList.length}
              </span>
            </button>
          )}

          {/* Notifications Alert with Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              id="notification-bell-btn"
              onClick={() => {
                setIsNotifDropdownOpen(!isNotifDropdownOpen);
                setIsLocationDropdownOpen(false);
              }}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E5D3',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1B5E3B',
                position: 'relative',
              }}
              title="Notifications"
            >
              <Bell size={15} />
              {unreadNotifCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#E76F51',
                    color: '#FFF',
                    fontSize: '9px',
                    fontWeight: 700,
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {isNotifDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '280px',
                  maxHeight: '340px',
                  overflowY: 'auto',
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E8E5D3',
                  boxShadow: '0 8px 24px rgba(27, 94, 59, 0.16)',
                  padding: '8px',
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 8px',
                    borderBottom: '1px solid #F0EEE4',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#1C241E',
                  }}
                >
                  <span>Notifications</span>
                  <span style={{ fontSize: '10px', color: '#885E3C' }}>{notifications.length} recent</span>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#5E6961' }}>
                    No notifications right now
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '8px',
                        borderBottom: '1px solid #FAF9F0',
                        fontSize: '11px',
                        background: n.isRead ? 'transparent' : 'rgba(27,94,59,0.04)',
                        borderRadius: '6px',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#1B5E3B', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ color: '#5E6961', lineHeight: '1.3' }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <button
            type="button"
            onClick={() => setCustomerScreen('cart')}
            style={{
              background: '#1B5E3B',
              color: '#FFF',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
            title="View Cart"
          >
            <ShoppingBag size={14} />
            {cartTotalCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  background: '#F2B705',
                  color: '#1C241E',
                  fontSize: '9px',
                  fontWeight: 800,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartTotalCount}
              </span>
            )}
          </button>

          {/* User Auth / Profile Access Button */}
          <button
            type="button"
            id="header-user-auth-btn"
            onClick={() => setCustomerScreen(currentUser ? 'profile' : 'login')}
            style={{
              background: currentUser ? '#1B5E3B' : '#FFFFFF',
              color: currentUser ? '#FFFFFF' : '#1B5E3B',
              border: '1px solid #E8E5D3',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '11px',
            }}
            title={currentUser ? `Account: ${currentUser.name}` : 'Login / Register with Database'}
          >
            {currentUser ? currentUser.name[0] : <User size={14} />}
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="search-bar-wrapper">
        <Search size={15} className="search-input-icon" />
        <input
          type="text"
          id="global-product-search-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim()) {
              setCustomerScreen('listing');
            }
          }}
          placeholder={
            language === 'kn'
              ? 'ತಾಜಾ ತರಕಾರಿ, ಮರದ ಗಾಣದ ಎಣ್ಣೆ, ಕರಕುಶಲ ಹುಡುಕಿ...'
              : 'Search tomatoes, coconut oil, handicrafts, snacks...'
          }
          className="search-input"
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </header>
  );
};

