import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Search,
  X,
  ChevronDown,
  Bell,
} from 'lucide-react';

const KARNATAKA_LOCATIONS = [
  'Bengaluru (Malleshwaram)',
  'Bengaluru (Indiranagar)',
  'Bengaluru (Jayanagar)',
  'Bengaluru (Koramangala)',
  'Mysuru (Devaraja Market)',
  'Hubballi-Dharwad',
  'Mangaluru',
  'Devanahalli (Farm Cluster)',
];

export const HeaderNav: React.FC = () => {
  const {
    selectedLocation,
    setSelectedLocation,
    searchQuery,
    setSearchQuery,
    setCustomerScreen,
    language,
    showToast,
  } = useApp();

  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  return (
    <header className="app-header">
      {/* Top row with location & notifications */}
      <div className="header-top-row">
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            id="location-selector-btn"
            className="location-picker-btn"
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            aria-expanded={isLocationDropdownOpen}
          >
            <MapPin size={14} color="#1B5E3B" />
            <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedLocation}
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
                {language === 'kn' ? 'ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'SELECT YOUR LOCATION'}
              </div>
              {KARNATAKA_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(loc);
                    setIsLocationDropdownOpen(false);
                    showToast(`Delivering to ${loc}`, 'info');
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    fontSize: '12px',
                    color: selectedLocation === loc ? '#1B5E3B' : '#1C241E',
                    fontWeight: selectedLocation === loc ? 700 : 500,
                    background: selectedLocation === loc ? 'rgba(27, 94, 59, 0.08)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand header click to home */}
        <div
          className="header-brand-mark"
          onClick={() => setCustomerScreen('home')}
          style={{ cursor: 'pointer' }}
        >
          <img src="/assets/logo.jpg" alt="Logo" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
          <span className="header-brand-text">Namma Santhe</span>
        </div>

        {/* Notifications alert */}
        <button
          type="button"
          id="notification-bell-btn"
          onClick={() => showToast('Fresh Sunday Santhe batch arrived from Kolar!', 'info')}
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
          }}
          title="Notifications"
        >
          <Bell size={15} />
        </button>
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
            if (e.target.value.trim() && setCustomerScreen) {
              setCustomerScreen('listing');
            }
          }}
          placeholder={
            language === 'kn'
              ? 'ತಾಜಾ ತರಕಾರಿ, ಹಣ್ಣು, ಕರಕುಶಲ ಹುಡುಕಿ...'
              : 'Search tomatoes, coconut oil, handicrafts...'
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
