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
  Flag,
  Trash2,
  Edit2,
  X,
  AlertCircle,
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
    orders,
    currentUser,
    comparisonList,
    addToComparison,
    toggleWishlist,
    isInWishlist,
    language,
    showToast,
    reportReview,
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  // Report modal state
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

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

  // Check verified purchase eligibility: Customer must have completed order for this item
  const hasPurchasedDelivered = orders.some(
    (o) =>
      o.customerId === currentUser?.id &&
      (o.status === 'delivered' || o.status === 'picked_up') &&
      o.items.some((i: any) => i.productId === selectedProduct.id)
  );

  const myExistingReview = reviews.find((r) => r.customerId === currentUser?.id);

  // Similar products from same category
  const similarProducts = products
    .filter((p) => p.id !== selectedProduct.id && p.category === selectedProduct.category)
    .slice(0, 4);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

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

  const handleEditSubmit = async (reviewId: string) => {
    try {
      const res = await api.reviews.updateReview(reviewId, {
        rating: editRating,
        comment: editComment,
      });
      if (res.review) {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? res.review : r)));
        setEditingReviewId(null);
        showToast('Review updated', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update review', 'error');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const res = await api.reviews.deleteReview(reviewId);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        showToast('Review removed', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review', 'error');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReviewId || !reportReason.trim()) return;
    setIsReporting(true);
    try {
      await reportReview(reportingReviewId, reportReason);
      setReportingReviewId(null);
      setReportReason('');
    } finally {
      setIsReporting(false);
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
            </div>
          </div>

          {/* Ratings & Seller tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              ★ {selectedProduct.rating || 5.0}
            </span>
            <span style={{ fontSize: '11.5px', color: '#5E6961' }}>
              ({reviews.length} customer reviews)
            </span>
            <span style={{ color: '#D0CDBB' }}>•</span>
            <span style={{ fontSize: '11.5px', color: '#1B5E3B', fontWeight: 600 }}>
              {selectedProduct.inStock ? `${selectedProduct.stockCount} in stock` : 'Out of Stock'}
            </span>
          </div>

          {/* Description */}
          <p style={{ fontSize: '12.5px', color: '#4B5563', lineHeight: 1.5, marginTop: '12px', marginBottom: 0 }}>
            {selectedProduct.description}
          </p>
        </div>

        {/* Shop Info Card */}
        {shop && (
          <div
            onClick={() => {
              setSelectedShop(shop);
              setCustomerScreen('shop');
            }}
            style={{
              background: '#FFF',
              borderRadius: '14px',
              padding: '12px 14px',
              border: '1px solid #E8E5D3',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Store size={20} color="#1B5E3B" />
              <div>
                <strong style={{ fontSize: '13px', color: '#1C241E', display: 'block' }}>{shop.name}</strong>
                <span style={{ fontSize: '11px', color: '#885E3C' }}>
                  {shop.locality} • Services PIN: {shop.serviceablePincodes?.slice(0, 3).join(', ')}...
                </span>
              </div>
            </div>
            <span style={{ fontSize: '11px', color: '#1B5E3B', fontWeight: 700 }}>Visit Store →</span>
          </div>
        )}

        {/* Add to Cart Bar */}
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '14px', border: '1px solid #E8E5D3', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #D0CDBB', background: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Minus size={14} />
            </button>
            <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #D0CDBB', background: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
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
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E8E5D3', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
                Verified Customer Reviews ({reviews.length})
              </h3>
              <span style={{ fontSize: '11px', color: '#885E3C' }}>Only customers with completed orders can review</span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#B7791F' }}>
              ★ {selectedProduct.rating || 5.0} / 5
            </span>
          </div>

          {/* Phase 2: Verified purchase check banner */}
          {!hasPurchasedDelivered && !myExistingReview && (
            <div
              style={{
                background: '#FAF9F0',
                border: '1px solid #E8E5D3',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '14px',
                fontSize: '11.5px',
                color: '#5E6961',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={18} color="#1B5E3B" style={{ flexShrink: 0 }} />
              <span>
                <strong>Verified Purchase Policy:</strong> Reviews are strictly restricted to customers who have placed and received an order for this product.
              </span>
            </div>
          )}

          {/* Write a review form for eligible verified purchaser */}
          {hasPurchasedDelivered && !myExistingReview && (
            <form onSubmit={handleReviewSubmit} style={{ background: '#F0F9F4', padding: '12px', borderRadius: '12px', border: '1px solid #A7F3D0', marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#065F46', marginBottom: '6px' }}>
                ✓ You purchased this item! Share your verified review:
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1C241E' }}>Your Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Star size={18} fill={star <= newRating ? '#F2B705' : 'none'} color="#F2B705" />
                  </button>
                ))}
              </div>

              <textarea
                required
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="How was the harvest freshness, aroma, or quality?"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px', boxSizing: 'border-box', marginBottom: '8px' }}
              />

              <button
                type="submit"
                disabled={isSubmittingReview}
                style={{ background: '#1B5E3B', color: '#FFF', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                Submit Verified Review
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reviews.map((rev) => {
              const isMyReview = rev.customerId === currentUser?.id;
              const isEditing = editingReviewId === rev.id;

              return (
                <div key={rev.id} style={{ borderBottom: '1px solid #F0EEE4', paddingBottom: '10px', fontSize: '12px' }}>
                  {isEditing ? (
                    /* Edit Form */
                    <div style={{ background: '#FAF9F0', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} type="button" onClick={() => setEditRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Star size={16} fill={s <= editRating ? '#F2B705' : 'none'} color="#F2B705" />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '11.5px', marginBottom: '6px', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleEditSubmit(rev.id)}
                          style={{ background: '#1B5E3B', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          style={{ background: '#E2E8F0', color: '#4A5568', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ color: '#1C241E' }}>{rev.customerName}</strong>
                          {rev.verifiedPurchase && (
                            <span style={{ background: '#D1E7DD', color: '#0F5132', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                              ✓ Verified Buyer
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#F2B705', fontWeight: 700 }}>{'★'.repeat(rev.rating)}</span>

                          {/* Actions: Edit/Delete if own review, Report if other */}
                          {isMyReview ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingReviewId(rev.id);
                                  setEditRating(rev.rating);
                                  setEditComment(rev.comment);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1B5E3B', padding: '2px' }}
                                title="Edit Review"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '2px' }}
                                title="Delete Review"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setReportingReviewId(rev.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px' }}
                              title="Report inappropriate review"
                            >
                              <Flag size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p style={{ color: '#4B5563', margin: '4px 0 0', lineHeight: 1.4 }}>{rev.comment}</p>
                    </div>
                  )}
                </div>
              );
            })}
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

      {/* REPORT REVIEW MODAL */}
      {reportingReviewId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '360px',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flag size={16} />
                <span>Report Review</span>
              </h3>
              <button
                type="button"
                onClick={() => setReportingReviewId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5E6961' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit}>
              <p style={{ fontSize: '12px', color: '#5E6961', margin: '0 0 10px', lineHeight: 1.4 }}>
                Please specify why this review violates community standards (e.g. spam, abusive language, or fraudulent claims):
              </p>

              <textarea
                required
                rows={3}
                placeholder="Reason for reporting this review..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #D0CDBB', fontSize: '12px', boxSizing: 'border-box', marginBottom: '12px' }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={isReporting}
                  style={{ flex: 1, background: '#DC2626', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isReporting ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                  type="button"
                  onClick={() => setReportingReviewId(null)}
                  style={{ background: '#E5E7EB', color: '#4B5563', border: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

