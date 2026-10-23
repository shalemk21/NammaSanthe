import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, RotateCcw, AlertTriangle, CheckCircle, Upload, ShieldAlert, ArrowRight, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Order, OrderItemSnapshot, CartItem } from '../types';

interface ReturnRequestModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ order, isOpen, onClose }) => {
  const { submitReturnRequest, showToast, shops } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [reason, setReason] = useState<string>('damaged');
  const [reasonDetails, setReasonDetails] = useState<string>('');
  const [imageEvidence, setImageEvidence] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !order) return null;

  const items = order.items as any[];
  const shop = shops.find((s) => s.id === order.vendorId);
  const returnPolicyWindowDays = shop?.returnPolicyWindowDays || 7;

  // Check if delivered
  const isDelivered = order.status === 'delivered';

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageEvidence(reader.result);
        showToast('Evidence photo loaded from device!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      showToast('Please select the item you want to return', 'warning');
      return;
    }

    setIsSubmitting(true);
    const success = await submitReturnRequest({
      orderId: order.id,
      productId: selectedProductId,
      reason,
      reasonDetails,
      imageEvidence: imageEvidence || items.find((i) => (i.productId || i.product?.id) === selectedProductId)?.image,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          padding: '22px',
          position: 'relative',
          border: '1px solid #E8E5D3',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F0EFE6',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ background: 'rgba(231,111,81,0.12)', color: '#E76F51', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCcw size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
              Request Return & Refund
            </h2>
            <div style={{ fontSize: '12px', color: '#5E6961' }}>
              Order #{order.id} • {order.vendorName}
            </div>
          </div>
        </div>

        {/* Policy check warning/info */}
        <div style={{ background: '#FAF9F0', border: '1px solid #E8E5D3', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', color: '#885E3C', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Seller Policy ({returnPolicyWindowDays} Days Window):</strong>{' '}
            {shop?.returnPolicyDetails || 'Returns accepted for defective, damaged, or wilted produce.'}
          </div>
        </div>

        {!isDelivered ? (
          <div style={{ background: '#FDE8E8', color: '#9B1C1C', padding: '14px', borderRadius: '10px', fontSize: '13px', textAlign: 'center' }}>
            ⚠️ This order has not been marked as Delivered yet (Current status: {order.status.toUpperCase()}). You can only request a return after delivery. If you wish to cancel an in-progress order, use the "Cancel Order" option.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Choose item */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1C241E', marginBottom: '6px' }}>
                Select Item to Return:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {items.map((it: any) => {
                  const pId = it.productId || it.product?.id;
                  const pName = it.name || it.product?.name;
                  const pPrice = it.priceSnapshot || it.product?.price;
                  const pImg = it.image || it.product?.image;

                  const isSelected = selectedProductId === pId;

                  return (
                    <div
                      key={pId}
                      onClick={() => setSelectedProductId(pId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #1B5E3B' : '1px solid #E8E5D3',
                        background: isSelected ? 'rgba(27,94,59,0.06)' : '#FFF',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedProductId(pId)}
                        style={{ accentColor: '#1B5E3B' }}
                      />
                      <img src={pImg} alt={pName} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C241E' }}>{pName}</div>
                        <div style={{ fontSize: '11px', color: '#5E6961' }}>₹{pPrice} • Qty: {it.quantity}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reason selector */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1C241E', marginBottom: '6px' }}>
                Reason for Return:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D0CDBB',
                  fontSize: '13px',
                }}
              >
                <option value="damaged">Damaged in transit / Broken</option>
                <option value="expired">Wilted / Stale / Expired Produce</option>
                <option value="wrong_item">Wrong Item / Quantity Received</option>
                <option value="quality_issue">Quality Not as Described</option>
                <option value="changed_mind">No Longer Needed / Changed Mind</option>
                <option value="other">Other Reason</option>
              </select>
            </div>

            {/* Explanation */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1C241E', marginBottom: '6px' }}>
                Explanation Details:
              </label>
              <textarea
                required
                rows={3}
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                placeholder="Please describe the issue in detail so the seller can review and authorize..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #D0CDBB',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Supporting Photo Evidence with Drag-and-Drop FileReader Preview */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1C241E', marginBottom: '6px' }}>
                Supporting Photo Evidence (Drop File or Choose Preset):
              </label>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragging ? '2px dashed #1B5E3B' : '2px dashed #D0CDBB',
                  background: isDragging ? 'rgba(27,94,59,0.06)' : '#FAF9F0',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '10px',
                }}
              >
                <Upload size={24} color={isDragging ? '#1B5E3B' : '#5E6961'} style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1C241E' }}>
                  {isDragging ? 'Drop photo here...' : 'Drag & drop photo here or Browse files'}
                </div>
                <div style={{ fontSize: '11px', color: '#5E6961', marginTop: '2px' }}>
                  Supports JPG, PNG, WebP from your device
                </div>
              </div>

              {/* Preview Thumbnail if selected */}
              {imageEvidence && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: '#F0EFE6',
                    borderRadius: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <img
                    src={imageEvidence}
                    alt="Evidence Preview"
                    style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1B5E3B' }}>✓ Photo Evidence Attached</div>
                    <div style={{ fontSize: '10.5px', color: '#5E6961', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Ready to submit to seller
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageEvidence('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E76F51',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Remove Photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              {/* Preset buttons / Fallback URL */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setImageEvidence('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&auto=format&fit=crop&q=80')}
                  style={{
                    background: '#F0EFE6',
                    border: '1px solid #D0CDBB',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#1C241E',
                    cursor: 'pointer',
                  }}
                >
                  📷 Use Sample Damaged Photo
                </button>
                <span style={{ fontSize: '11px', color: '#5E6961' }}>or</span>
                <input
                  type="text"
                  value={imageEvidence.startsWith('data:') ? '' : imageEvidence}
                  onChange={(e) => setImageEvidence(e.target.value)}
                  placeholder="Paste direct image URL..."
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: '1px solid #D0CDBB',
                    fontSize: '11px',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: '#E76F51',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(231,111,81,0.25)',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Return & Refund Request'}
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
