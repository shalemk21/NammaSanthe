import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  Plus,
  Minus,
  MapPin,
  ShieldCheck,
  Leaf,
  Store,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ProductDetailScreen: React.FC = () => {
  const {
    selectedProduct,
    setCustomerScreen,
    cart,
    addToCart,
    updateCartQuantity,
    vendors,
    language,
    showToast,
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!selectedProduct) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>No product selected.</p>
        <button
          type="button"
          onClick={() => setCustomerScreen('home')}
          className="btn-primary"
          style={{ marginTop: '12px' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const vendor = vendors.find((v) => v.id === selectedProduct.vendorId);
  const inCartItem = cart.find((i) => i.product.id === selectedProduct.id);

  return (
    <div className="fade-in" style={{ paddingBottom: '90px', background: '#F8F7ED' }}>
      {/* Top Floating App Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(248, 247, 237, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 800,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E8E5D3',
        }}
      >
        <button
          type="button"
          id="detail-back-btn"
          onClick={() => setCustomerScreen('home')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E5D3',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1B5E3B',
          }}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <span
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '16px',
            fontWeight: 700,
            color: '#1B5E3B',
          }}
        >
          Product Details
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setIsWishlisted(!isWishlisted);
              showToast(!isWishlisted ? 'Saved to Wishlist' : 'Removed from Wishlist', 'info');
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5D3',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isWishlisted ? '#E76F51' : '#5E6961',
            }}
            aria-label="Wishlist"
          >
            <Heart size={18} fill={isWishlisted ? '#E76F51' : 'none'} />
          </button>

          <button
            type="button"
            onClick={() => showToast('Product link copied to clipboard!', 'success')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5D3',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#5E6961',
            }}
            aria-label="Share"
          >
            <Share2 size={17} />
          </button>
        </div>
      </div>

      {/* Hero Image Section */}
      <div style={{ position: 'relative', width: '100%', height: '280px', background: '#EAE6D6' }}>
        <img
          src={selectedProduct.image}
          alt={selectedProduct.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'linear-gradient(to top, #F8F7ED, transparent)',
          }}
        />
      </div>

      <div style={{ padding: '0 16px 20px' }}>
        {/* Badges / Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {selectedProduct.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                background: '#FFFFFF',
                color: '#1B5E3B',
                border: '1px solid #D8D4BF',
                padding: '4px 10px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Leaf size={11} color="#1B5E3B" />
              <span>{tag}</span>
            </span>
          ))}
          {selectedProduct.noChemicals && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                background: 'rgba(242,183,5,0.18)',
                color: '#8A6800',
                padding: '4px 10px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldCheck size={11} />
              <span>No Chemical Use</span>
            </span>
          )}
        </div>

        {/* Title & Price */}
        <div style={{ marginBottom: '14px' }}>
          <h1
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px',
              color: '#1C241E',
              fontWeight: 700,
              lineHeight: 1.25,
              marginBottom: '4px',
            }}
          >
            {selectedProduct.name}
          </h1>

          <div style={{ fontSize: '15px', color: '#885E3C', fontWeight: 600, marginBottom: '8px' }}>
            {selectedProduct.kannadaName}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#1B5E3B' }}>
              ₹{selectedProduct.price}
            </span>
            {selectedProduct.originalPrice && (
              <span style={{ fontSize: '14px', color: '#8E9991', textDecoration: 'line-through' }}>
                ₹{selectedProduct.originalPrice}
              </span>
            )}
            <span style={{ fontSize: '13px', color: '#5E6961' }}>
              per {selectedProduct.unit} (Inclusive of all taxes)
            </span>
          </div>

          {/* Rating */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '6px',
              fontSize: '12px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: '#F2B705',
                color: '#241D04',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 700,
              }}
            >
              <Star size={12} fill="#241D04" />
              <span>{selectedProduct.rating}</span>
            </div>
            <span style={{ color: '#5E6961' }}>({selectedProduct.reviewCount} verified reviews)</span>
          </div>
        </div>

        {/* Harvest / Origin highlight */}
        {selectedProduct.harvestDate && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5D3',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            <Clock size={16} color="#1B5E3B" />
            <div style={{ fontSize: '12px' }}>
              <span style={{ fontWeight: 600, color: '#1C241E' }}>Harvested: </span>
              <span style={{ color: '#5E6961' }}>{selectedProduct.harvestDate}</span>
            </div>
          </div>
        )}

        {/* Vendor Info Card */}
        <div
          className="card-base"
          style={{
            padding: '14px',
            marginBottom: '16px',
            border: '1.5px solid #E8E5D3',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#885E3C', marginBottom: '8px' }}>
            PRODUCED & SUPPLIED BY
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={
                vendor?.avatar ||
                'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
              }
              alt={selectedProduct.vendorName}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #1B5E3B',
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E' }}>
                  {selectedProduct.vendorName}
                </h4>
                <ShieldCheck size={14} color="#1B5E3B" />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#5E6961',
                  margin: '2px 0',
                }}
              >
                <MapPin size={11} color="#885E3C" />
                <span>
                  {selectedProduct.vendorLocation} ({selectedProduct.distanceKm} km away)
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#c49400', fontWeight: 600 }}>
                ★ {vendor?.rating || 4.9} • Direct Co-op Producer
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                showToast(`Viewing shop: ${selectedProduct.vendorName}`, 'info');
                setCustomerScreen('listing');
              }}
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '11.5px' }}
            >
              <Store size={12} />
              <span>View Shop</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <h3
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '16px',
              color: '#1B5E3B',
              fontWeight: 700,
              marginBottom: '6px',
            }}
          >
            About This Farm Produce
          </h3>
          <p style={{ fontSize: '12.5px', color: '#5E6961', lineHeight: 1.6 }}>
            {selectedProduct.description}
          </p>
        </div>

        {/* Nutritional Benefits */}
        {selectedProduct.nutritionalBenefits && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', marginBottom: '8px' }}>
              Why Choose Fresh & Local:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedProduct.nutritionalBenefits.map((benefit) => (
                <span
                  key={benefit}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E8E5D3',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '11px',
                    color: '#1B5E3B',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={11} color="#F2B705" />
                  <span>{benefit}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quantity & Add to Cart Card inside content */}
        <div
          className="card-base"
          style={{
            padding: '16px',
            marginBottom: '20px',
            background: '#FFFFFF',
            border: '1.5px solid #E8E5D3',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#5E6961' }}>Selected Quantity:</span>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>
                {quantity} {selectedProduct.unit}
              </div>
            </div>

            {/* Quantity stepper */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#F8F7ED',
                border: '1.5px solid #D8D4BF',
                borderRadius: '999px',
                padding: '6px 14px',
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ background: 'none', border: 'none', color: '#1B5E3B', cursor: 'pointer' }}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span style={{ fontSize: '15px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                style={{ background: 'none', border: 'none', color: '#1B5E3B', cursor: 'pointer' }}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          <button
            type="button"
            id="detail-add-to-cart-btn-inline"
            onClick={() => {
              addToCart(selectedProduct, quantity);
            }}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700 }}
          >
            <span>
              {inCartItem ? 'Add More to Basket' : 'Add to Basket'} • ₹{selectedProduct.price * quantity}
            </span>
          </button>
        </div>
      </div>

      {/* Sticky Bottom Add to Cart Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid #E8E5D3',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 850,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
          maxWidth: '420px',
          margin: '0 auto',
        }}
      >
        {/* Quantity selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F8F7ED',
            border: '1.5px solid #D8D4BF',
            borderRadius: '999px',
            padding: '5px 12px',
          }}
        >
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            style={{ background: 'none', border: 'none', color: '#1B5E3B', cursor: 'pointer' }}
            aria-label="Decrease quantity"
          >
            <Minus size={15} />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            style={{ background: 'none', border: 'none', color: '#1B5E3B', cursor: 'pointer' }}
            aria-label="Increase quantity"
          >
            <Plus size={15} />
          </button>
        </div>

        {/* Add to Cart button */}
        <button
          type="button"
          id="detail-add-to-cart-btn"
          onClick={() => {
            addToCart(selectedProduct, quantity);
          }}
          className="btn-primary"
          style={{ flex: 1, marginLeft: '14px', padding: '12px 18px', fontSize: '14px' }}
        >
          <span>
            {inCartItem ? 'Add More' : 'Add to Basket'} • ₹{selectedProduct.price * quantity}
          </span>
        </button>
      </div>
    </div>
  );
};
