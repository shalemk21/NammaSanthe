import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
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
  Scale,
  RotateCcw,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { Review, Product } from '../types';

export const ProductDetailScreen: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    setSelectedShop,
    setCustomerScreen,
    cart,
    addToCart,
    shops,
    products,
    comparisonList,
    addToComparison,
    toggleWishlist,
    isInWishlist,
    language,
    showToast,
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      api.reviews.getReviews({ productId: selectedProduct.id }).then((res) => {
        if (res.reviews) setReviews(res.reviews);
      }).catch(() => {});
    }
  }, [selectedProduct]);

  if (!selectedProduct) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>No product selected.</p>
        <button
          type="button"
          onClick={() => setCustomerScreen('home')}
          style={{ marginTop: '12px', background: '#1B5E3B', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const shop = shops.find((s) => s.id === selectedProduct.vendorId);
  const isWishlisted = isInWishlist(selectedProduct.id);
  const isInComparison = comparisonList.some((p) => p.id === selectedProduct.id);

  // Similar products from same category
  const similarProducts = products
    .filter((p) => p.id !== selectedProduct.id && p.category === selectedProduct.category)
    .slice(0, 4);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.reviews.createReview({
        productId: selectedProduct.id,
        rating: newRating,
        comment: newComment,
      });

      if (res.review) {
        setReviews((prev) => [res.review, ...prev]);
        setNewComment('');
        showToast('Review submitted successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1B5E3B' }}>
          Product Details
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => toggleWishlist(selectedProduct.id)}
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
          >
            <Heart size={16} fill={isWishlisted ? '#E76F51' : 'none'} />
          </button>

          <button
            type="button"
            onClick={() => addToComparison(selectedProduct)}
            style={{
              background: isInComparison ? '#E76F51' : '#FFFFFF',
              color: isInComparison ? '#FFF' : '#5E6961',
              border: '1px solid #E8E5D3',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Add to comparison"
          >
            <Scale size={16} />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div style={{ position: 'relative', width: '100%', height: '260px', overflow: 'hidden' }}>
        <img
          src={selectedProduct.image}
          alt={selectedProduct.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {selectedProduct.isOrganic && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(27,94,59,0.9)', color: '#FFF', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
            🌿 100% Certified Organic
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div style={{ padding: '16px' }}>
        {/* Name and Price */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E8E5D3', marginBottom: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1C241E', margin: '0 0 2px 0' }}>
                {selectedProduct.name}
              </h1>
              <div style={{ fontSize: '13px', color: '#885E3C', fontWeight: 600 }}>
                {selectedProduct.kannadaName}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1B5E3B' }}>
                ₹{selectedProduct.price}
              </div>
              <span style={{ fontSize: '11px', color: '#5E6961' }}>per {selectedProduct.unit}</span>
              {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                <div style={{ fontSize: '11px', color: '#8E9991', textDecoration: 'line-through' }}>
                  ₹{selectedProduct.originalPrice}
                </div>
              )}
            </div>
          </div>

          {/* Stock availability */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F0EEE4' }}>
            <span
              style={{
                background: selectedProduct.inStock ? '#D1E7DD' : '#F8D7DA',
                color: selectedProduct.inStock ? '#0F5132' : '#842029',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '8px',
              }}
            >
              {selectedProduct.inStock ? `✓ In Stock (${selectedProduct.stockCount} available)` : 'Out of Stock'}
            </span>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#885E3C', fontWeight: 600 }}>
              <RotateCcw size={12} />
              {selectedProduct.returnWindowDays || 7} Days Return Policy
            </span>
          </div>
        </div>

        {/* Seller Info Card */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '14px', border: '1px solid #E8E5D3', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#885E3C', marginBottom: '8px' }}>
            LOCAL PRODUCER / STOREFRONT
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <img
              src={shop?.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'}
              alt={selectedProduct.vendorName}
              style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
                  {selectedProduct.vendorName}
                </h4>
                <ShieldCheck size={14} color="#1B5E3B" />
              </div>
              <div style={{ fontSize: '11px', color: '#5E6961' }}>
                📍 {selectedProduct.vendorLocation} ({selectedProduct.distanceKm || 2.1} km)
              </div>
              <div style={{ fontSize: '11px', color: '#B7791F', fontWeight: 600 }}>
                ★ {selectedProduct.rating || 4.9} rating
              </div>
            </div>

            <button
              onClick={() => {
                if (shop) {
                  setSelectedShop(shop);
                  setCustomerScreen('shop');
                }
              }}
              style={{
                background: '#FAF9F0',
                border: '1px solid #1B5E3B',
                color: '#1B5E3B',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View Shop
            </button>
          </div>
        </div>

        {/* Description & Specifications */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '14px', border: '1px solid #E8E5D3', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: '0 0 6px 0' }}>
            Description & Origin
          </h3>
          <p style={{ fontSize: '12px', color: '#5E6961', lineHeight: '1.5', margin: '0 0 12px 0' }}>
            {selectedProduct.description}
          </p>

          {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
            <div style={{ borderTop: '1px solid #F0EEE4', paddingTop: '10px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#885E3C', marginBottom: '8px' }}>
                Specifications:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {selectedProduct.specifications.map((spec, i) => (
                  <div key={i} style={{ background: '#FAF9F0', padding: '6px 8px', borderRadius: '6px', fontSize: '11px' }}>
                    <span style={{ color: '#8E9991' }}>{spec.label}: </span>
                    <strong style={{ color: '#1C241E' }}>{spec.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add to Cart Stepper */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '14px', border: '1px solid #E8E5D3', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8F7ED', padding: '4px 12px', borderRadius: '20px', border: '1px solid #D0CDBB' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Minus size={14} color="#1B5E3B" />
            </button>
            <span style={{ fontWeight: 800, fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Plus size={14} color="#1B5E3B" />
            </button>
          </div>

          <button
            onClick={() => addToCart(selectedProduct, quantity)}
            disabled={!selectedProduct.inStock}
            style={{
              flex: 1,
              marginLeft: '14px',
              background: '#1B5E3B',
              color: '#FFF',
              border: 'none',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: selectedProduct.inStock ? 'pointer' : 'not-allowed',
              opacity: selectedProduct.inStock ? 1 : 0.6,
            }}
          >
            {selectedProduct.inStock ? `Add ${quantity} to Cart • ₹${selectedProduct.price * quantity}` : 'Out of Stock'}
          </button>
        </div>

        {/* Customer Reviews Section */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '14px', border: '1px solid #E8E5D3', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Customer Reviews ({reviews.length})
            </h3>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#B7791F' }}>
              ★ {selectedProduct.rating || 4.9} / 5
            </span>
          </div>

          {/* Write a review form */}
          <form onSubmit={handleReviewSubmit} style={{ background: '#FAF9F0', padding: '10px', borderRadius: '10px', border: '1px solid #E8E5D3', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#1C241E' }}>Rate:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Star size={16} fill={star <= newRating ? '#F2B705' : 'none'} color="#F2B705" />
                </button>
              ))}
            </div>

            <textarea
              required
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with this local farm produce..."
              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '11px', boxSizing: 'border-box', marginBottom: '6px' }}
            />

            <button
              type="submit"
              disabled={isSubmittingReview}
              style={{ background: '#1B5E3B', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              Post Review
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: '1px solid #F0EEE4', paddingBottom: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{rev.customerName}</strong>
                  <span style={{ color: '#F2B705' }}>{'★'.repeat(rev.rating)}</span>
                </div>
                <div style={{ color: '#5E6961', marginTop: '2px' }}>{rev.comment}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', marginBottom: '10px' }}>
              Similar Products from Nearby Sellers
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {similarProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  style={{
                    background: '#FFF',
                    borderRadius: '12px',
                    border: '1px solid #E8E5D3',
                    padding: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '6px' }} />
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1C241E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#1B5E3B', fontWeight: 800 }}>
                    ₹{p.price}/{p.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
