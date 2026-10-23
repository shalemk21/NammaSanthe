import React, { useState } from 'react';
import {
  X,
  Star,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, Product } from '../types';

interface CustomerReviewModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  order?: Order | null;
  targetProduct?: Product | null;
}

const SAMPLE_PRODUCE_PHOTOS = [
  {
    name: 'Woven Basket Tomatoes',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Morning Palak Bundle',
    url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Yelakki Banana Bunch',
    url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pure Cold Pressed Ghee',
    url: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&auto=format&fit=crop&q=80',
  },
];

export const CustomerReviewModal: React.FC<CustomerReviewModalProps> = (props) => {
  const {
    products,
    showToast,
    submitReviewWithPhotos,
    isReviewModalOpen,
    closeReviewModal,
    reviewTargetOrder,
    reviewTargetProduct,
  } = useApp();

  const isOpen = props.isOpen !== undefined ? props.isOpen : isReviewModalOpen;
  const onClose = props.onClose || closeReviewModal;
  const order = props.order !== undefined ? props.order : reviewTargetOrder;
  const targetProduct = props.targetProduct !== undefined ? props.targetProduct : reviewTargetProduct;

  const orderItems = order?.items || [];
  const initialProductId =
    targetProduct?.id ||
    (orderItems[0] ? (orderItems[0] as any).productId || (orderItems[0] as any).product?.id : 'p1');

  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('Extremely fresh produce! The country tomatoes are vibrant and aromatic, harvested directly from Devanahalli with zero chemicals. Fast 30-min local delivery.');
  const [photos, setPhotos] = useState<string[]>([SAMPLE_PRODUCE_PHOTOS[0].url]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentProduct =
    products.find((p) => p.id === selectedProductId) ||
    products[0];

  const handleAddSamplePhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos([...photos, url]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleAddCustomPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPhotoUrl && customPhotoUrl.startsWith('http')) {
      setPhotos([...photos, customPhotoUrl]);
      setCustomPhotoUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please enter a review comment', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitReviewWithPhotos({
        orderId: order?.id || '',
        productId: selectedProductId,
        rating,
        comment,
        photos,
      });

      if (success) {
        showToast('Thank you! Your verified produce review with photos has been posted.', 'success');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="customer-review-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 3200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1B5E3B 0%, #13462B 100%)',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="#A7F3D0" />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>
                Review Produce with Photos
              </h3>
              <span style={{ fontSize: '10.5px', color: '#D1E7DD' }}>
                Verified Farmer Co-op Purchase • Namma Santhe
              </span>
            </div>
          </div>

          <button
            type="button"
            id="close-review-modal-btn"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Delivered Product Selector Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#F8F7ED',
              borderRadius: '14px',
              border: '1px solid #E8E5D3',
            }}
          >
            {currentProduct && (
              <img
                src={currentProduct.image}
                alt={currentProduct.name}
                style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '10.5px', color: '#885E3C', fontWeight: 700, textTransform: 'uppercase' }}>
                Delivered Harvest
              </span>
              <h4 style={{ margin: '2px 0', fontSize: '13.5px', fontWeight: 800, color: '#1C241E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentProduct?.name || 'Fresh Produce'}
              </h4>
              <span style={{ fontSize: '11px', color: '#1B5E3B', fontWeight: 600 }}>
                {currentProduct?.vendorName || 'Ravi Organic Farms'} • ₹{currentProduct?.price} / {currentProduct?.unit}
              </span>
            </div>

            <div style={{ background: '#DCFCE7', color: '#15803D', padding: '4px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 800 }}>
              ✓ Delivered
            </div>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#1C241E', display: 'block', marginBottom: '6px' }}>
              Your Quality Rating:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  id={`review-star-${star}`}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transform: rating >= star ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s',
                  }}
                >
                  <Star
                    size={28}
                    fill={rating >= star ? '#F59E0B' : '#E5E7EB'}
                    color={rating >= star ? '#D97706' : '#9CA3AF'}
                  />
                </button>
              ))}
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#D97706', marginLeft: '6px' }}>
                {rating === 5 ? '5.0 ★ Exceptional Freshness!' : `${rating}.0 ★`}
              </span>
            </div>
          </div>

          {/* Review Comment Textarea */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 800, color: '#1C241E', display: 'block', marginBottom: '6px' }}>
              Produce Feedback & Experience:
            </label>
            <textarea
              id="review-comment-input"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the freshness, taste, and packaging of your harvest..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px solid #D0CDBB',
                fontSize: '12.5px',
                lineHeight: 1.4,
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Customer Produce Photos Attachment Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#1C241E', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Camera size={15} color="#1B5E3B" />
                <span>Attach Fresh Produce Photos ({photos.length})</span>
              </label>
              <span style={{ fontSize: '10.5px', color: '#885E3C' }}>Helps fellow local shoppers</span>
            </div>

            {/* Attached Photo Previews */}
            {photos.length > 0 && (
              <div
                id="review-photos-preview-gallery"
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '10px',
                }}
              >
                {photos.map((photo, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      position: 'relative',
                      width: '74px',
                      height: '74px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                      border: '2px solid #1B5E3B',
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Attached produce ${pIdx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(pIdx)}
                      title="Remove photo"
                      style={{
                        position: 'absolute',
                        top: '3px',
                        right: '3px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Sample Photos Selector for Easy Testing */}
            <div
              style={{
                background: '#F0F9F4',
                padding: '10px',
                borderRadius: '10px',
                border: '1px dashed #A7F3D0',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', display: 'block', marginBottom: '6px' }}>
                📷 Add Farm Harvest Snapshot (Click to attach):
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {SAMPLE_PRODUCE_PHOTOS.map((samp, sIdx) => {
                  const isAdded = photos.includes(samp.url);
                  return (
                    <button
                      key={sIdx}
                      type="button"
                      id={`attach-sample-photo-${sIdx}`}
                      onClick={() => handleAddSamplePhoto(samp.url)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: isAdded ? '1px solid #15803D' : '1px solid #D1D5DB',
                        background: isAdded ? '#DCFCE7' : '#FFFFFF',
                        color: isAdded ? '#15803D' : '#374151',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isAdded ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                      <span>{samp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#15803D',
              background: '#F0FDF4',
              padding: '6px 10px',
              borderRadius: '8px',
            }}
          >
            <ShieldCheck size={14} />
            <span>Verified Purchase Badge will be awarded to this review.</span>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            id="submit-photo-review-btn"
            disabled={isSubmitting}
            style={{
              background: '#1B5E3B',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: isSubmitting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(27, 94, 59, 0.3)',
            }}
          >
            <Sparkles size={16} />
            <span>{isSubmitting ? 'Publishing Review...' : 'Submit Photo Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
