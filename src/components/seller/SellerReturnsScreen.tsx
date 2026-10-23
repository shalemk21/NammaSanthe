import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerNav } from './SellerNav';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Truck,
  ArrowRight,
  Shield,
  Eye,
} from 'lucide-react';
import { ReturnRequest } from '../../types';

export const SellerReturnsScreen: React.FC = () => {
  const {
    returns,
    decideReturnRequest,
    progressReturnStatus,
    currentUser,
    shops,
    updateShop,
    language,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);

  // Policy configuration state
  const myShop = shops.find((s) => s.id === currentUser?.shopId) || shops[0];
  const [returnWindow, setReturnWindow] = useState(myShop?.returnPolicyWindowDays || 7);
  const [returnDetails, setReturnDetails] = useState(myShop?.returnPolicyDetails || '');

  const myReturns = returns.filter((r) => !currentUser?.shopId || r.vendorId === currentUser.shopId);

  const pendingReturns = myReturns.filter((r) => r.status === 'requested');
  const activeReturns = myReturns.filter((r) =>
    ['approved', 'pickup_pending', 'returned', 'refund_processing'].includes(r.status)
  );
  const completedReturns = myReturns.filter((r) =>
    ['refunded', 'rejected'].includes(r.status)
  );

  const displayedReturns =
    activeTab === 'pending'
      ? pendingReturns
      : activeTab === 'active'
      ? activeReturns
      : completedReturns;

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!selectedReturn) return;
    setIsDeciding(true);
    await decideReturnRequest(selectedReturn.id, decision, decisionNotes);
    setIsDeciding(false);
    setSelectedReturn(null);
    setDecisionNotes('');
  };

  const handleProgress = async (nextStatus: string, note?: string) => {
    if (!selectedReturn) return;
    setIsDeciding(true);
    await progressReturnStatus(selectedReturn.id, nextStatus, note);
    setIsDeciding(false);
    setSelectedReturn(null);
  };

  const handleSavePolicy = async () => {
    if (myShop) {
      await updateShop(myShop.id, {
        returnPolicyWindowDays: Number(returnWindow),
        returnPolicyDetails: returnDetails,
      });
      showToast('Store return policy saved successfully!', 'success');
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      {/* Header */}
      <div style={{ background: '#FFFFFF', padding: '16px', borderBottom: '1px solid #E8E5D3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1B5E3B', margin: 0 }}>
            Returns & Refunds Manager
          </h1>
          <p style={{ fontSize: '11px', color: '#5E6961', margin: '2px 0 0 0' }}>
            Review customer claims, authorize replacements, and maintain inventory audit records
          </p>
        </div>
        <div style={{ background: 'rgba(231,111,81,0.12)', color: '#E76F51', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
          {pendingReturns.length} Pending
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Store Return Policy Configuration Box */}
        <div style={{ background: '#FAF9F0', border: '1px solid #E8E5D3', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: '#885E3C', marginBottom: '8px' }}>
            <Shield size={15} />
            <span>Store Return Policy Configuration</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#5E6961', marginBottom: '3px' }}>
                Return Window (Days)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={returnWindow}
                onChange={(e) => setReturnWindow(Number(e.target.value))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#5E6961', marginBottom: '3px' }}>
                Policy Description & Conditions
              </label>
              <input
                type="text"
                value={returnDetails}
                onChange={(e) => setReturnDetails(e.target.value)}
                placeholder="e.g. 7-day return on sealed items, perishable 48hrs"
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
              />
            </div>

            <button
              onClick={handleSavePolicy}
              style={{
                background: '#1B5E3B',
                color: '#FFF',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Update Policy
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#F0EFE6', borderRadius: '10px', padding: '3px', marginBottom: '14px' }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'pending' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'pending' ? '#1B5E3B' : '#5E6961',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Pending Approval ({pendingReturns.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'active' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'active' ? '#1B5E3B' : '#5E6961',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            In Progress ({activeReturns.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: activeTab === 'completed' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'completed' ? '#1B5E3B' : '#5E6961',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Resolved ({completedReturns.length})
          </button>
        </div>

        {/* Returns list */}
        {displayedReturns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#FFF', borderRadius: '14px', border: '1px solid #E8E5D3', color: '#8E9991', fontSize: '13px' }}>
            No return requests in this tab.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayedReturns.map((ret) => (
              <div
                key={ret.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E8E5D3',
                  padding: '14px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#885E3C' }}>
                      Claim #{ret.id} • Order #{ret.orderId}
                    </span>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: '2px 0' }}>
                      {ret.productName} (x{ret.quantity})
                    </h3>
                    <div style={{ fontSize: '11px', color: '#5E6961' }}>
                      Requested by {ret.customerName} on {new Date(ret.requestedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <span
                    style={{
                      background:
                        ret.status === 'approved'
                          ? '#D1E7DD'
                          : ret.status === 'refunded'
                          ? '#CFF4FC'
                          : ret.status === 'rejected'
                          ? '#F8D7DA'
                          : '#FFF3CD',
                      color:
                        ret.status === 'approved'
                          ? '#0F5132'
                          : ret.status === 'refunded'
                          ? '#055160'
                          : ret.status === 'rejected'
                          ? '#842029'
                          : '#664D03',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {ret.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Reason & Evidence snippet */}
                <div style={{ background: '#FAF9F0', padding: '10px', borderRadius: '8px', border: '1px solid #E8E5D3', marginBottom: '10px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#1C241E', marginBottom: '3px' }}>
                    Reason: <span style={{ color: '#E76F51', textTransform: 'capitalize' }}>{ret.reason.replace('_', ' ')}</span>
                  </div>
                  <div style={{ color: '#5E6961' }}>{ret.reasonDetails}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E3B' }}>
                    Refund Amount: ₹{ret.refundAmount}
                  </div>

                  <button
                    onClick={() => setSelectedReturn(ret)}
                    style={{
                      background: '#1B5E3B',
                      color: '#FFF',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Eye size={13} />
                    <span>Manage Claim</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Detail & Decision Drawer */}
      {selectedReturn && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
                Manage Return #{selectedReturn.id}
              </h3>
              <button onClick={() => setSelectedReturn(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XCircle size={20} color="#8E9991" />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <img src={selectedReturn.productImage} alt={selectedReturn.productName} style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1C241E' }}>{selectedReturn.productName}</div>
                <div style={{ fontSize: '12px', color: '#5E6961' }}>Quantity: {selectedReturn.quantity} • Value: ₹{selectedReturn.refundAmount}</div>
                <div style={{ fontSize: '12px', color: '#885E3C', marginTop: '2px' }}>Customer: {selectedReturn.customerName}</div>
              </div>
            </div>

            {selectedReturn.imageEvidence && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5E6961', marginBottom: '4px' }}>Customer Photo Evidence:</label>
                <img src={selectedReturn.imageEvidence} alt="Evidence" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #D0CDBB' }} />
              </div>
            )}

            {/* Audit Trail */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5E6961', marginBottom: '6px' }}>Audit Trail History:</label>
              <div style={{ background: '#FAF9F0', padding: '10px', borderRadius: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedReturn.auditTrail?.map((trail, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid #E8E5D3', paddingBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#1B5E3B' }}>{trail.status.toUpperCase()}</span> by {trail.updatedBy}: {trail.note}
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Actions */}
            {selectedReturn.status === 'requested' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  rows={2}
                  placeholder="Decision reason or pickup instruction for customer..."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={isDeciding}
                    onClick={() => handleDecision('approved')}
                    style={{ flex: 1, background: '#1B5E3B', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                  >
                    ✓ Approve Return
                  </button>
                  <button
                    disabled={isDeciding}
                    onClick={() => handleDecision('rejected')}
                    style={{ flex: 1, background: '#FFF', color: '#E76F51', border: '1.5px solid #E76F51', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                  >
                    ✕ Reject Claim
                  </button>
                </div>
              </div>
            )}

            {selectedReturn.status === 'approved' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={isDeciding}
                  onClick={() => handleProgress('pickup_pending', 'Rider scheduled for item pickup')}
                  style={{ flex: 1, background: '#F2B705', color: '#1C241E', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  Schedule Pickup
                </button>
              </div>
            )}

            {selectedReturn.status === 'pickup_pending' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={isDeciding}
                  onClick={() => handleProgress('returned', 'Physical item received back at store. Inventory restored.')}
                  style={{ flex: 1, background: '#1B5E3B', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  ✓ Confirm Item Returned (Restores Stock)
                </button>
              </div>
            )}

            {selectedReturn.status === 'returned' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={isDeciding}
                  onClick={() => handleProgress('refunded', `Refund of ₹${selectedReturn.refundAmount} authorized and processed via Demo Payment Gateway.`)}
                  style={{ flex: 1, background: '#2A9D8F', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  💰 Issue Demo Refund (₹{selectedReturn.refundAmount})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <SellerNav />
    </div>
  );
};
