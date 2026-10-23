import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { BottomNav } from './BottomNav';
import {
  ArrowLeft,
  LayoutGrid,
  List,
  Star,
  Plus,
  Minus,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react';
import { Product } from '../types';

export const ProductListingScreen: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cart,
    addToCart,
    updateCartQuantity,
    setSelectedProduct,
    addToComparison,
    comparisonList,
    setCustomerScreen,
    language,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'distance'>('popularity');

  const filterChips = ['All', 'Vegetables', 'Fruits', 'Greens', 'Organic', 'Near Me'];

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  // Filter products
  const filteredProducts = products.filter((prod) => {
    // Category match
    if (selectedCategory && prod.category !== selectedCategory) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchKannada = prod.kannadaName.toLowerCase().includes(q);
      const matchVendor = prod.vendorName.toLowerCase().includes(q);
      const matchCategory = prod.category.toLowerCase().includes(q);
      if (!matchName && !matchKannada && !matchVendor && !matchCategory) {
        return false;
      }
    }

    // Subcategory chip filter
    if (subCategoryFilter === 'Vegetables') return prod.subCategory === 'Vegetables';
    if (subCategoryFilter === 'Fruits') return prod.subCategory === 'Fruits';
    if (subCategoryFilter === 'Greens') return prod.subCategory === 'Greens';
    if (subCategoryFilter === 'Organic') return prod.isOrganic;
    if (subCategoryFilter === 'Near Me') return prod.distanceKm <= 2.5;

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
    return b.rating - a.rating;
  });

  return (
    <div className="fade-in" style={{ paddingBottom: '96px' }}>
      <HeaderNav />

      {/* Screen Sub-header */}
      <div
        style={{
          padding: '12px 16px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              if (selectedCategory) {
                setSelectedCategory(null);
              } else {
                setCustomerScreen('home');
              }
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
            }}
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '18px',
                color: '#1B5E3B',
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {searchQuery
                ? `Results for "${searchQuery}"`
                : currentCategoryObj
                ? currentCategoryObj.name
                : 'All Fresh Products'}
            </h2>
            <span style={{ fontSize: '11px', color: '#885E3C' }}>
              {sortedProducts.length} items available in your santhe
            </span>
          </div>
        </div>

        {/* Grid / List toggle */}
        <div
          style={{
            display: 'flex',
            background: '#ECE9D8',
            borderRadius: '999px',
            padding: '2px',
            border: '1px solid #DDD8C4',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'grid' ? '#1B5E3B' : '#5E6961',
              border: 'none',
              borderRadius: '999px',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              background: viewMode === 'list' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'list' ? '#1B5E3B' : '#5E6961',
              border: 'none',
              borderRadius: '999px',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div
        className="scroll-horizontal"
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '8px 16px 12px',
        }}
      >
        {filterChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setSubCategoryFilter(chip)}
            style={{
              padding: '5px 12px',
              borderRadius: '999px',
              fontSize: '11.5px',
              fontWeight: 600,
              border: subCategoryFilter === chip ? 'none' : '1px solid #DDD8C4',
              background: subCategoryFilter === chip ? '#1B5E3B' : '#FFFFFF',
              color: subCategoryFilter === chip ? '#FFFFFF' : '#5E6961',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Sort Options Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px 10px',
          fontSize: '11.5px',
          color: '#5E6961',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <SlidersHorizontal size={12} color="#885E3C" />
          <span>Sort by:</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span
            onClick={() => setSortBy('popularity')}
            style={{
              cursor: 'pointer',
              color: sortBy === 'popularity' ? '#1B5E3B' : '#8E9991',
              fontWeight: sortBy === 'popularity' ? 700 : 500,
              textDecoration: sortBy === 'popularity' ? 'underline' : 'none',
            }}
          >
            Top Rated
          </span>
          <span
            onClick={() => setSortBy('price-asc')}
            style={{
              cursor: 'pointer',
              color: sortBy === 'price-asc' ? '#1B5E3B' : '#8E9991',
              fontWeight: sortBy === 'price-asc' ? 700 : 500,
              textDecoration: sortBy === 'price-asc' ? 'underline' : 'none',
            }}
          >
            Price: Low
          </span>
          <span
            onClick={() => setSortBy('distance')}
            style={{
              cursor: 'pointer',
              color: sortBy === 'distance' ? '#1B5E3B' : '#8E9991',
              fontWeight: sortBy === 'distance' ? 700 : 500,
              textDecoration: sortBy === 'distance' ? 'underline' : 'none',
            }}
          >
            Nearest
          </span>
        </div>
      </div>

      {/* Products Display */}
      {sortedProducts.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#5E6961',
          }}
        >
          <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
            No products found matching your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSubCategoryFilter('All');
              setSelectedCategory(null);
            }}
            className="btn-outline"
            style={{ marginTop: '10px' }}
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            padding: '0 16px',
          }}
        >
          {sortedProducts.map((prod) => {
            const inCart = cart.find((i) => i.product.id === prod.id);

            return (
              <div
                key={prod.id}
                className="card-base"
                style={{
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <div
                  onClick={() => {
                    setSelectedProduct(prod);
                    setCustomerScreen('detail');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={prod.image}
                      alt={prod.name}
                      style={{
                        width: '100%',
                        height: '110px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        marginBottom: '6px',
                      }}
                    />
                    {prod.isOrganic && (
                      <span
                        className="badge-green"
                        style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          fontSize: '9px',
                          padding: '2px 6px',
                          background: 'rgba(255,255,255,0.92)',
                        }}
                      >
                        Organic
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '10px',
                      color: '#885E3C',
                    }}
                  >
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prod.vendorName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#c49400', fontWeight: 700 }}>
                      <Star size={10} fill="#F2B705" color="#F2B705" />
                      {prod.rating}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1C241E',
                      margin: '2px 0 4px',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {language === 'kn' ? prod.kannadaName : prod.name}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      color: '#5E6961',
                    }}
                  >
                    <MapPin size={10} color="#885E3C" />
                    <span>{prod.distanceKm} km away</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid #F2EFE2',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1B5E3B' }}>
                      ₹{prod.price}
                    </span>
                    <span style={{ fontSize: '10px', color: '#5E6961' }}>/{prod.unit}</span>
                  </div>

                  {inCart ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#1B5E3B',
                        color: '#FFFFFF',
                        borderRadius: '999px',
                        padding: '3px 8px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(prod.id, -1)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>
                        {inCart.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(prod.id, 1)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id={`list-add-${prod.id}`}
                      onClick={() => addToCart(prod, 1)}
                      className="btn-primary"
                      style={{ padding: '5px 12px', fontSize: '11.5px' }}
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Layout */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 16px' }}>
          {sortedProducts.map((prod) => {
            const inCart = cart.find((i) => i.product.id === prod.id);

            return (
              <div
                key={prod.id}
                className="card-base"
                style={{
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  onClick={() => {
                    setSelectedProduct(prod);
                    setCustomerScreen('detail');
                  }}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#885E3C',
                    }}
                  >
                    <span>{prod.vendorName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#c49400', fontWeight: 700 }}>
                      <Star size={11} fill="#F2B705" color="#F2B705" />
                      {prod.rating}
                    </span>
                  </div>

                  <h3
                    onClick={() => {
                      setSelectedProduct(prod);
                      setCustomerScreen('detail');
                    }}
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1C241E',
                      margin: '2px 0 4px',
                      cursor: 'pointer',
                    }}
                  >
                    {language === 'kn' ? prod.kannadaName : prod.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#5E6961' }}>
                    <span>{prod.distanceKm} km</span>
                    <span>•</span>
                    <span style={{ color: '#1B5E3B', fontWeight: 600 }}>{prod.stockCount} in stock</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#1B5E3B' }}>
                        ₹{prod.price}
                      </span>
                      <span style={{ fontSize: '11px', color: '#5E6961' }}>/{prod.unit}</span>
                    </div>

                    {inCart ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#1B5E3B',
                          color: '#FFFFFF',
                          borderRadius: '999px',
                          padding: '4px 10px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(prod.id, -1)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(prod.id, 1)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(prod, 1)}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        <Plus size={13} />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clearance spacer so bottom items scroll fully above bottom navigation */}
      <div style={{ height: '96px', width: '100%', flexShrink: 0 }} aria-hidden="true" />

      <BottomNav />
    </div>
  );
};
