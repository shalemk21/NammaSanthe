import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { BottomNav } from './BottomNav';
import {
  Carrot,
  Wheat,
  UtensilsCrossed,
  Sparkles,
  Shirt,
  HeartPulse,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const CategoriesScreen: React.FC = () => {
  const { categories, setSelectedCategory, setCustomerScreen, language } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');

  const filterChips = ['All', 'Farm Fresh', 'Desi Grains', 'Clay & Iron', 'GI Tagged'];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Carrot':
        return <Carrot size={28} color="#FFFFFF" />;
      case 'Wheat':
        return <Wheat size={28} color="#FFFFFF" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed size={28} color="#FFFFFF" />;
      case 'Sparkles':
        return <Sparkles size={28} color="#FFFFFF" />;
      case 'Shirt':
        return <Shirt size={28} color="#FFFFFF" />;
      case 'HeartPulse':
        return <HeartPulse size={28} color="#FFFFFF" />;
      default:
        return <Carrot size={28} color="#FFFFFF" />;
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (activeFilter === 'All') return true;
    return cat.badge?.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <div className="fade-in" style={{ paddingBottom: '96px' }}>
      <HeaderNav />

      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '22px',
              color: '#1B5E3B',
              fontWeight: 700,
            }}
          >
            {language === 'kn' ? 'ವರ್ಗಗಳನ್ನು ಅನ್ವೇಷಿಸಿ' : 'Explore Categories'}
          </h2>
          <p style={{ fontSize: '12px', color: '#885E3C' }}>
            Supporting 2,400+ local Karnataka farmers, potters & weavers
          </p>
        </div>

        {/* Filter chips */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            scrollbarWidth: 'none',
          }}
        >
          {filterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveFilter(chip)}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                border: activeFilter === chip ? 'none' : '1px solid #D8D4BF',
                background: activeFilter === chip ? '#1B5E3B' : '#FFFFFF',
                color: activeFilter === chip ? '#FFFFFF' : '#5E6961',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
            marginTop: '8px',
          }}
        >
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCustomerScreen('listing');
              }}
              className="card-base"
              style={{
                padding: '16px 14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '150px',
                position: 'relative',
                overflow: 'hidden',
                background: '#FFFFFF',
              }}
            >
              {cat.badge && (
                <span
                  className="badge-turmeric"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    fontSize: '9.5px',
                    padding: '2px 7px',
                  }}
                >
                  {cat.badge}
                </span>
              )}

              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: cat.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.12)',
                }}
              >
                {renderIcon(cat.iconName)}
              </div>

              <div>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#1C241E',
                    marginBottom: '3px',
                  }}
                >
                  {cat.name}
                </h3>
                {language === 'kn' && (
                  <div style={{ fontSize: '11px', color: '#885E3C', marginBottom: '3px' }}>
                    {cat.kannadaName}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#5E6961',
                    marginTop: '6px',
                  }}
                >
                  <span>{cat.itemCount} items</span>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(27,94,59,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1B5E3B',
                    }}
                  >
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clearance spacer so bottom items scroll fully above bottom navigation */}
      <div style={{ height: '96px', width: '100%', flexShrink: 0 }} aria-hidden="true" />
    </div>
  );
};

