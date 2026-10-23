import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  ArrowLeft,
  CheckCircle,
  X,
  Plus,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Clock,
  RotateCcw,
  Star,
  Award,
  AlertCircle,
  Info,
  Tag,
  Truck,
  Check,
} from 'lucide-react';
import { Product } from '../types';

export const ProductComparisonScreen: React.FC = () => {
  const {
    comparisonList,
    removeFromComparison,
    clearComparison,
    addToCart,
    setCustomerScreen,
    setSelectedProduct,
    products,
    addToComparison,
    language,
    showToast,
  } = useApp();

  const [comparedData, setComparedData] = useState<any[]>([]);
  const [bestPriceId, setBestPriceId] = useState<string>('');
  const [bestRatedId, setBestRatedId] = useState<string>('');
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);

  useEffect(() => {
    if (comparisonList.length >= 2) {
      api.products
        .compareProducts(comparisonList.map((p) => p.id))
        .then((res) => {
          if (res.success) {
            setComparedData(res.comparedProducts);
            setBestPriceId(res.bestPriceProductId);
            setBestRatedId(res.bestRatedProductId);
          }
        })
        .catch(() => {
          // Fallback to local comparison
          setComparedData(
            comparisonList.map((p) => ({
              ...p,
              shopRating: p.rating,
              shopVerified: true,
              estimatedDeliveryTime: `${Math.round(p.distanceKm * 12 + 20)} mins`,
              returnPolicyDays: p.returnWindowDays || 7,
            }))
          );
          const minP = Math.min(...comparisonList.map((p) => p.price));
          const bestP = comparisonList.find((p) => p.price === minP);
          if (bestP) setBestPriceId(bestP.id);
        });
    } else {
      setComparedData(
        comparisonList.map((p) => ({
          ...p,
          shopRating: p.rating,
          shopVerified: true,
          estimatedDeliveryTime: `${Math.round(p.distanceKm * 12 + 20)} mins`,
          returnPolicyDays: p.returnWindowDays || 7,
        }))
      );
    }
  }, [comparisonList]);

  const candidatesToAdd = products.filter(
    (p) => !comparisonList.some((cp) => cp.id === p.id)
  );

  // Distinct categories calculation
  const distinctCategories = Array.from(new Set(comparisonList.map((p) => p.category)));
  const hasMixedCategories = distinctCategories.length > 1;

  // Popular items recommendation candidates (up to 4)
  const popularPicks = candidatesToAdd
    .filter((p) => (comparisonList.length > 0 ? p.category === comparisonList[0].category : true))
    .concat(candidatesToAdd)
    .slice(0, 4);

  return (
    <div className="product-compare-screen" style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '90px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={() => setCustomerScreen('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#1B5E3B',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
          <span>{language === 'kn' ? 'ಹಿಂದಕ್ಕೆ' : 'Back to Marketplace'}</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {comparisonList.length < 4 && (
            <button
              onClick={() => setIsAddPickerOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: '#1B5E3B',
                color: '#FFF',
                border: 'none',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>Add Product ({comparisonList.length}/4)</span>
            </button>
          )}

          {comparisonList.length > 0 && (
            <button
              onClick={clearComparison}
              style={{
                background: '#F0EFE6',
                color: '#5E6961',
                border: 'none',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1C241E', margin: '0 0 4px 0' }}>
          Smart Product Comparison
        </h1>
        <p style={{ fontSize: '13px', color: '#5E6961', margin: 0 }}>
          Compare prices, local seller ratings, stock availability, specifications, and return policies side-by-side.
        </p>
      </div>

      {/* Guardrail: Cross Category Warning Notice */}
      {comparisonList.length >= 2 && hasMixedCategories && (
        <div
          style={{
            background: '#FFFBEA',
            border: '1.5px solid #F2B705',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(242,183,5,0.08)',
          }}
        >
          <AlertCircle size={20} color="#B7791F" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1, fontSize: '12.5px', color: '#1C241E', lineHeight: '1.4' }}>
            <strong style={{ color: '#8A6800' }}>Different Categories Comparison Notice:</strong>{' '}
            You are comparing items across different categories ({distinctCategories.map((c) => c.replace('-', ' ')).join(' & ')}).
            Specifications like storage longevity, unit metrics, and return windows may differ naturally by category.
          </div>
        </div>
      )}

      {/* When fewer than 2 items are selected: Empty / Prompt State */}
      {comparisonList.length < 2 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#FFF',
              borderRadius: '16px',
              border: '1px solid #E8E5D3',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(242,183,5,0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <Sparkles size={28} color="#D97706" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C241E', marginBottom: '8px' }}>
              {comparisonList.length === 0
                ? 'No products in comparison yet'
                : '1 Product Selected — Need at least 2 to compare'}
            </h3>
            <p style={{ fontSize: '13px', color: '#5E6961', maxWidth: '420px', margin: '0 auto 20px', lineHeight: '1.4' }}>
              {comparisonList.length === 0
                ? 'Select any 2 to 4 products from neighborhood stores to evaluate prices, freshness, distances, and seller ratings side-by-side.'
                : `You currently have "${comparisonList[0].name}" in comparison. Add at least one more item to generate side-by-side matrix.`}
            </p>

            <button
              id="browse-popular-compare-btn"
              onClick={() => setCustomerScreen('listing')}
              style={{
                background: '#1B5E3B',
                color: '#FFF',
                border: 'none',
                padding: '11px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(27,94,59,0.2)',
              }}
            >
              <ShoppingBag size={16} />
              <span>Browse Popular Items to Compare</span>
            </button>
          </div>

          {/* Quick Add Suggestions Strip */}
          {popularPicks.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
                  {comparisonList.length === 1
                    ? `Similar Items to Compare with ${comparisonList[0].name}:`
                    : 'Recommended Items to Compare:'}
                </h4>
                <span style={{ fontSize: '11px', color: '#5E6961' }}>Click + to add instantly</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px',
                }}
              >
                {popularPicks.map((pick) => (
                  <div
                    key={pick.id}
                    style={{
                      background: '#FFF',
                      border: '1px solid #E8E5D3',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <img
                      src={pick.image}
                      alt={pick.name}
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>{pick.name}</div>
                      <div style={{ fontSize: '11px', color: '#885E3C' }}>{pick.vendorName}</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E3B', marginTop: '2px' }}>
                        ₹{pick.price} <span style={{ fontSize: '10px', color: '#5E6961' }}>/{pick.unit}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addToComparison(pick);
                        showToast(`Added ${pick.name} to comparison`, 'success');
                      }}
                      style={{
                        marginTop: 'auto',
                        background: '#FAF9F0',
                        color: '#1B5E3B',
                        border: '1px solid #1B5E3B',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Plus size={14} />
                      <span>Compare This</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Comparison Table Grouped by Category Attributes */}
          <div
            className="scroll-horizontal"
            onWheel={(e) => {
              if (e.deltaY !== 0 && !e.shiftKey) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            style={{
              overflowX: 'auto',
              background: '#FFF',
              borderRadius: '16px',
              border: '1px solid #E8E5D3',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#FAF9F0', borderBottom: '1px solid #E8E5D3' }}>
                  <th style={{ width: '170px', padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: '#885E3C' }}>
                    COMPARISON MATRIX
                  </th>
                  {comparedData.map((item) => (
                    <th
                      key={item.id}
                      style={{
                        padding: '14px',
                        textAlign: 'center',
                        position: 'relative',
                        borderLeft: '1px solid #E8E5D3',
                        background: item.id === bestPriceId ? 'rgba(242,183,5,0.06)' : 'transparent',
                      }}
                    >
                      <button
                        onClick={() => removeFromComparison(item.id)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#F0EFE6',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title="Remove from comparison"
                      >
                        <X size={13} color="#5E6961" />
                      </button>

                      {/* Best price highlight badge */}
                      {item.id === bestPriceId && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#F2B705',
                            color: '#1C241E',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 800,
                            marginBottom: '8px',
                          }}
                        >
                          <Award size={12} />
                          <span>BEST VALUE</span>
                        </div>
                      )}

                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', margin: '0 auto 8px', display: 'block' }}
                      />
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', lineHeight: '1.2' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#885E3C', marginTop: '2px' }}>
                        {item.vendorName}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* ================= GROUP 1: PRICING & VALUE ================= */}
                <tr style={{ background: '#F4F2E6', borderTop: '1px solid #E8E5D3', borderBottom: '1px solid #E8E5D3' }}>
                  <td
                    colSpan={comparedData.length + 1}
                    style={{
                      padding: '8px 14px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#1B5E3B',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    💰 1. Pricing & Value Proposition
                  </td>
                </tr>

                {/* Price & Unit */}
                <tr style={{ borderBottom: '1px solid #F0EEE4' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Price & Unit</td>
                  {comparedData.map((item) => (
                    <td
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        borderLeft: '1px solid #F0EEE4',
                        background: item.id === bestPriceId ? 'rgba(242,183,5,0.06)' : 'transparent',
                      }}
                    >
                      <span style={{ fontSize: '17px', fontWeight: 800, color: '#1B5E3B' }}>₹{item.price}</span>
                      <span style={{ fontSize: '11px', color: '#5E6961' }}> /{item.unit}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <div style={{ fontSize: '11px', color: '#5E6961', textDecoration: 'line-through' }}>
                          ₹{item.originalPrice}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Savings / Discount */}
                <tr style={{ borderBottom: '1px solid #F0EEE4' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Discount & Savings</td>
                  {comparedData.map((item) => {
                    const discount = item.originalPrice && item.originalPrice > item.price
                      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                      : 0;
                    return (
                      <td
                        key={item.id}
                        style={{
                          padding: '12px 14px',
                          textAlign: 'center',
                          borderLeft: '1px solid #F0EEE4',
                          background: item.id === bestPriceId ? 'rgba(242,183,5,0.06)' : 'transparent',
                        }}
                      >
                        {discount > 0 ? (
                          <span style={{ background: 'rgba(27,94,59,0.1)', color: '#1B5E3B', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                            {discount}% OFF (Save ₹{item.originalPrice - item.price})
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#5E6961' }}>Standard Local Rate</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* ================= GROUP 2: SELLER & HYPERLOCAL DELIVERY ================= */}
                <tr style={{ background: '#F4F2E6', borderTop: '1px solid #E8E5D3', borderBottom: '1px solid #E8E5D3' }}>
                  <td
                    colSpan={comparedData.length + 1}
                    style={{
                      padding: '8px 14px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#1B5E3B',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    🏪 2. Hyperlocal Seller & Speed
                  </td>
                </tr>

                {/* Seller Rating */}
                <tr style={{ borderBottom: '1px solid #F0EEE4' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Seller Rating</td>
                  {comparedData.map((item) => (
                    <td
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        borderLeft: '1px solid #F0EEE4',
                        background: item.id === bestPriceId ? 'rgba(242,183,5,0.06)' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#FFF8E1', padding: '3px 8px', borderRadius: '12px', fontWeight: 700, fontSize: '12px', color: '#B7791F' }}>
                        <Star size={13} fill="#F2B705" color="#F2B705" />
                        <span>{item.rating || 4.8}★</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
                        {item.reviewCount || 40} verified reviews
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Distance & Speed */}
                <tr style={{ borderBottom: '1px solid #F0EEE4' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Distance & Speed</td>
                  {comparedData.map((item) => (
                    <td
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        borderLeft: '1px solid #F0EEE4',
                        background: item.id === bestPriceId ? 'rgba(242,183,5,0.06)' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1B5E3B' }}>
                        <Clock size={13} />
                        <span>{item.estimatedDeliveryTime || '35 mins'}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#885E3C', marginTop: '2px' }}>
                        📍 {item.distanceKm || 2.1} km away
                      </div>
                    </td>
                  ))}
                </tr>

                {/* ================= GROUP 3: CATEGORY ATTRIBUTES & QUALITY ================= */}
                <tr style={{ background: '#F4F2E6', borderTop: '1px solid #E8E5D3', borderBottom: '1px solid #E8E5D3' }}>
                  <td
                    colSpan={comparedData.length + 1}
                    style={{
                      padding: '8px 14px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#1B5E3B',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    🌿 3. Category Attributes & Quality
                  </td>
                </tr>

                {/* Category Classification */}
                <tr style={{ borderBottom: '1px solid #F0EEE4' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Category & Sub-type</td>
                  {comparedData.map((item) => (
                    <td
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        borderLeft: '1px solid #F0EEE4',
                        background: item.id === bestPriceId ? 'rgba(242,183,5,0.06)' : 'transparent',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1C241E', background: '#F0EFE6', padding: '3px 8px', borderRadius: '6px' }}>
                        {item.category?.replace('-', ' ')}
                      </span>
                      {item.subCategory && (
                        <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '4px' }}>
                          Sub: {item.subCategory}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Stock Availability */}
                <tr style={{ borderBottom: '1px solid #F0EEE4' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Stock Availability</td>
                  {comparedData.map((item) => (
                    <td
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        borderLeft: '1px solid #F0EEE4',
                        background: item.id === bestPriceId ? 'rgba(242,183,5,0.06)' : 'transparent',
                      }}
                    >
                      {item.stockCount > 0 ? (
                        <span style={{ color: '#1B5E3B', fontWeight: 600, fontSize: '12px' }}>
                          ✓ In Stock ({item.stockCount} {item.unit})
                        </span>
                      ) : (
                        <span style={{ color: '#E76F51', fontWeight: 600, fontSize: '12px' }}>
                          Out of stock
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Return Policy */}
                <tr style={{ borderBottom: '1px solid #F0EEE4' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Return Window</td>
                  {comparedData.map((item) => (
                    <td
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        borderLeft: '1px solid #F0EEE4',
                        background: item.id === bestPriceId ? 'rgba(242,183,5,0.06)' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1C241E' }}>
                        <RotateCcw size={13} color="#885E3C" />
                        <span>{item.returnPolicyDays || 7} Days Window</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Quality & Organic Badges */}
                <tr style={{ borderBottom: '1px solid #F0EEE4' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Quality Highlights</td>
                  {comparedData.map((item) => (
                    <td
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'center',
                        borderLeft: '1px solid #F0EEE4',
                        background: item.id === bestPriceId ? 'rgba(242,183,5,0.06)' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        {item.isOrganic && (
                          <span style={{ background: 'rgba(27,94,59,0.08)', color: '#1B5E3B', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            🌿 100% Organic
                          </span>
                        )}
                        {item.noChemicals && (
                          <span style={{ background: 'rgba(242,183,5,0.12)', color: '#8A6800', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            ✨ Zero Chemicals
                          </span>
                        )}
                        {item.isLocallySourced && (
                          <span style={{ background: 'rgba(136,94,60,0.08)', color: '#885E3C', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            📍 Local Farm Sourced
                          </span>
                        )}
                        {!item.isOrganic && !item.noChemicals && !item.isLocallySourced && (
                          <span style={{ fontSize: '11px', color: '#5E6961' }}>Standard Market Quality</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* ================= GROUP 4: PURCHASE ACTION ================= */}
                <tr style={{ background: '#FAF9F0' }}>
                  <td style={{ padding: '14px', fontWeight: 700, fontSize: '12px', color: '#1C241E' }}>Direct Purchase</td>
                  {comparedData.map((item) => (
                    <td
                      key={item.id}
                      style={{
                        padding: '14px',
                        textAlign: 'center',
                        borderLeft: '1px solid #F0EEE4',
                        background: item.id === bestPriceId ? 'rgba(242,183,5,0.06)' : 'transparent',
                      }}
                    >
                      <button
                        onClick={() => {
                          addToCart(item, 1);
                          showToast(`Added ${item.name} to Cart`, 'success');
                        }}
                        style={{
                          width: '100%',
                          background: item.id === bestPriceId ? '#1B5E3B' : '#FFFFFF',
                          color: item.id === bestPriceId ? '#FFFFFF' : '#1B5E3B',
                          border: '1.5px solid #1B5E3B',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        }}
                      >
                        <ShoppingBag size={14} />
                        <span>Add to Cart</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add candidate product modal */}
      {isAddPickerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1C241E', margin: 0 }}>Select Product to Compare</h3>
              <button onClick={() => setIsAddPickerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {candidatesToAdd.slice(0, 10).map((cand) => (
                <div
                  key={cand.id}
                  onClick={() => {
                    addToComparison(cand);
                    setIsAddPickerOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #E8E5D3',
                    cursor: 'pointer',
                    background: '#FAF9F0',
                  }}
                >
                  <img src={cand.image} alt={cand.name} style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C241E' }}>{cand.name}</div>
                    <div style={{ fontSize: '11px', color: '#885E3C' }}>{cand.vendorName} • ₹{cand.price}/{cand.unit}</div>
                  </div>
                  <Plus size={16} color="#1B5E3B" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
