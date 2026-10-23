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

  return (
    <div className="product-compare-screen" style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
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

      {comparisonList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFF', borderRadius: '16px', border: '1px solid #E8E5D3' }}>
          <Sparkles size={40} color="#F2B705" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1C241E', marginBottom: '8px' }}>
            No products in comparison yet
          </h3>
          <p style={{ fontSize: '13px', color: '#5E6961', maxWidth: '360px', margin: '0 auto 20px' }}>
            Browse any product card and click "Compare" to evaluate offers from different neighborhood stores.
          </p>
          <button
            onClick={() => setCustomerScreen('listing')}
            style={{
              background: '#1B5E3B',
              color: '#FFF',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Browse Products to Compare
          </button>
        </div>
      ) : (
        <>
          {/* Comparison Table */}
          <div
            className="scroll-horizontal"
            onWheel={(e) => {
              if (e.deltaY !== 0 && !e.shiftKey) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            style={{ overflowX: 'auto', background: '#FFF', borderRadius: '16px', border: '1px solid #E8E5D3', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#FAF9F0', borderBottom: '1px solid #E8E5D3' }}>
                  <th style={{ width: '160px', padding: '14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#885E3C' }}>
                    ATTRIBUTE
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
                {/* Row: Price */}
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
                        <div style={{ fontSize: '11px', color: '#8E9991', textDecoration: 'line-through' }}>
                          ₹{item.originalPrice}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Row: Seller Rating */}
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
                      <div style={{ fontSize: '10px', color: '#8E9991', marginTop: '2px' }}>
                        {item.reviewCount || 40} reviews
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row: Distance & Delivery */}
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

                {/* Row: Stock Availability */}
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
                          ✓ In Stock ({item.stockCount} units)
                        </span>
                      ) : (
                        <span style={{ color: '#E76F51', fontWeight: 600, fontSize: '12px' }}>
                          Out of stock
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Row: Return Policy */}
                <tr style={{ borderBottom: '1px solid #F0EEE4' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Return Policy</td>
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

                {/* Row: Specifications & Badges */}
                <tr style={{ borderBottom: '1px solid #F0EEE4' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Attributes</td>
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
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Row: Action Button */}
                <tr>
                  <td style={{ padding: '14px', fontWeight: 600, fontSize: '12px', color: '#5E6961' }}>Purchase</td>
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
                        onClick={() => addToCart(item, 1)}
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
