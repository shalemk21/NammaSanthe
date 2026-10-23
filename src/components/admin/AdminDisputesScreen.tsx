import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminNav } from './AdminNav';
import { Scale, CheckCircle, AlertTriangle, ShieldCheck, MessageSquare } from 'lucide-react';
import { Dispute } from '../../types';

export const AdminDisputesScreen: React.FC = () => {
  const { disputes, resolveDispute, showToast } = useApp();
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [decisionText, setDecisionText] = useState('');
  const [actionChoice, setActionChoice] = useState<'refund' | 'close'>('refund');

  const openDisputes = disputes.filter((d) => d.status !== 'resolved');
  const resolvedDisputes = disputes.filter((d) => d.status === 'resolved');

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute || !decisionText) return;

    await resolveDispute(selectedDispute.id, decisionText, 'resolved', actionChoice);
    setSelectedDispute(null);
    setDecisionText('');
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      <div style={{ background: '#FFF', padding: '16px', borderBottom: '1px solid #E8E5D3' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
          Customer-Seller Dispute Arbitration
        </h1>
        <p style={{ fontSize: '11px', color: '#5E6961', margin: '2px 0 0' }}>
          Mediate return and quality disputes with fair community arbitration
        </p>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {disputes.map((disp) => {
            const isResolved = disp.status === 'resolved';

            return (
              <div
                key={disp.id}
                style={{
                  background: '#FFF',
                  borderRadius: '12px',
                  border: isResolved ? '1px solid #E8E5D3' : '1.5px solid #E76F51',
                  padding: '14px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#885E3C' }}>
                      Dispute #{disp.id} • Order #{disp.orderId}
                    </span>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: '2px 0' }}>
                      {disp.subject}
                    </h3>
                  </div>
                  <span
                    style={{
                      background: isResolved ? '#D1E7DD' : '#F8D7DA',
                      color: isResolved ? '#0F5132' : '#842029',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {disp.status}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#5E6961', marginBottom: '10px' }}>
                  Claimant: <strong style={{ color: '#1C241E' }}>{disp.customerName}</strong> vs Respondent: <strong style={{ color: '#1C241E' }}>{disp.vendorName}</strong>
                </div>

                {/* Customer statement */}
                <div style={{ background: '#FAF9F0', padding: '10px', borderRadius: '8px', border: '1px solid #E8E5D3', marginBottom: '8px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 700, color: '#1B5E3B', fontSize: '11px', marginBottom: '2px' }}>Customer's Statement:</div>
                  <div style={{ color: '#1C241E' }}>"{disp.customerStatement}"</div>
                </div>

                {/* Seller statement */}
                {disp.sellerStatement && (
                  <div style={{ background: '#F8F7ED', padding: '10px', borderRadius: '8px', border: '1px solid #E8E5D3', marginBottom: '8px', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#885E3C', fontSize: '11px', marginBottom: '2px' }}>Seller's Reply:</div>
                    <div style={{ color: '#1C241E' }}>"{disp.sellerStatement}"</div>
                  </div>
                )}

                {/* Admin ruling if resolved */}
                {isResolved && disp.adminDecision && (
                  <div style={{ background: '#D1E7DD', color: '#0F5132', padding: '10px', borderRadius: '8px', fontSize: '12px', marginTop: '6px' }}>
                    <strong>Admin Ruling:</strong> {disp.adminDecision}
                  </div>
                )}

                {!isResolved && (
                  <button
                    onClick={() => setSelectedDispute(disp)}
                    style={{
                      marginTop: '8px',
                      background: '#E76F51',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Enter Arbitration Decision
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Modal */}
      {selectedDispute && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C241E', margin: '0 0 10px 0' }}>
              Arbitrate Dispute #{selectedDispute.id}
            </h3>

            <form onSubmit={handleResolve}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C241E', marginBottom: '4px' }}>
                  Action to Enforce:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActionChoice('refund')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: actionChoice === 'refund' ? '2px solid #1B5E3B' : '1px solid #D0CDBB',
                      background: actionChoice === 'refund' ? 'rgba(27,94,59,0.08)' : '#FFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: actionChoice === 'refund' ? '#1B5E3B' : '#5E6961',
                    }}
                  >
                    Mandate Customer Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionChoice('close')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: actionChoice === 'close' ? '2px solid #885E3C' : '1px solid #D0CDBB',
                      background: actionChoice === 'close' ? 'rgba(136,94,60,0.08)' : '#FFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: actionChoice === 'close' ? '#885E3C' : '#5E6961',
                    }}
                  >
                    Dismiss / Uphold Seller
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C241E', marginBottom: '4px' }}>
                  Arbitration Statement & Reason:
                </label>
                <textarea
                  required
                  rows={3}
                  value={decisionText}
                  onChange={(e) => setDecisionText(e.target.value)}
                  placeholder="Explain the administrative ruling to both parties..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, background: '#1B5E3B', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  Finalize & Notify Both Parties
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  style={{ background: '#F0EFE6', color: '#5E6961', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminNav />
    </div>
  );
};
