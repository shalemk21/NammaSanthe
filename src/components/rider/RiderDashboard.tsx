import React, { useState } from 'react';
import {
  Bike,
  MapPin,
  QrCode,
  Banknote,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  BatteryCharging,
  Package,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Eye,
  Store,
  User,
  X,
  Scan,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const RiderDashboard: React.FC = () => {
  const {
    orders,
    updateRiderGps,
    verifyRiderHandover,
    collectRiderCash,
    updateOrderStatus,
    triggerWebhookNotification,
    openInvoiceModal,
    setActiveRole,
    setCustomerScreen,
    showToast,
  } = useApp();

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // GPS Simulation state
  const [currentGps, setCurrentGps] = useState({
    latitude: 13.0031,
    longitude: 77.5643,
    landmark: 'Passing 8th Cross Sampige Rd, Malleshwaram',
  });
  const [isUpdatingGps, setIsUpdatingGps] = useState(false);

  // QR / OTP Scanner Modal state
  const [scannerTargetOrder, setScannerTargetOrder] = useState<Order | null>(null);
  const [otpInput, setOtpInput] = useState('4821');
  const [isVerifying, setIsVerifying] = useState(false);

  // Cash collection modal state
  const [cashTargetOrder, setCashTargetOrder] = useState<Order | null>(null);
  const [cashCollectedAmount, setCashCollectedAmount] = useState<number>(0);

  // Filter orders for delivery rider
  const deliveryOrders = orders.filter((o) => o.fulfillmentType !== 'pickup');
  const activeOrders = deliveryOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const completedOrders = deliveryOrders.filter((o) => o.status === 'delivered');

  // GPS Ping Simulation
  const handleSimulateGpsPing = async (orderId: string) => {
    setIsUpdatingGps(true);
    const newLat = Number((currentGps.latitude + 0.0004).toFixed(5));
    const newLng = Number((currentGps.longitude + 0.0003).toFixed(5));
    const newLandmark = 'Arrived at 4th Cross Sampige Rd (Near Delivery Doorstep)';

    setCurrentGps({
      latitude: newLat,
      longitude: newLng,
      landmark: newLandmark,
    });

    try {
      await updateRiderGps(orderId, newLat, newLng, newLandmark);
      showToast(`📍 Live GPS Broadcasted: ${newLat}° N, ${newLng}° E`, 'success');
    } finally {
      setIsUpdatingGps(false);
    }
  };

  // Dispatch / Out for Delivery Step
  const handleStartDelivery = async (order: Order) => {
    await updateOrderStatus(
      order.id,
      'shipped',
      'Rider Basavaraju M dispatched on EV scooter with fresh harvest basket',
      'SANTHE-EXP-4402'
    );
    await triggerWebhookNotification(order.id, 'out_for_delivery', 'both');
    showToast(`Order #${order.id} is now Out for Delivery!`, 'success');
  };

  // QR Handover Verification
  const handleCompleteHandover = async () => {
    if (!scannerTargetOrder) return;
    setIsVerifying(true);
    try {
      const success = await verifyRiderHandover(
        scannerTargetOrder.id,
        `TOKEN-DELIVERY-${scannerTargetOrder.id}`,
        otpInput
      );
      if (success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#1B5E3B', '#F2B705', '#10B981'],
        });
        await triggerWebhookNotification(scannerTargetOrder.id, 'delivered', 'both');
        showToast('🎉 Handover Verified! Order successfully delivered.', 'success');
        setScannerTargetOrder(null);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // COD Cash Confirmation
  const handleConfirmCash = async () => {
    if (!cashTargetOrder) return;
    const success = await collectRiderCash(cashTargetOrder.id, cashCollectedAmount);
    if (success) {
      showToast(`✓ Cash received: ₹${cashCollectedAmount}. Digital COD receipt generated.`, 'success');
      setCashTargetOrder(null);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '90px', background: '#F8F7ED', minHeight: '100vh' }}>
      {/* Rider Top Navigation Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          borderBottom: '1px solid #E8E5D3',
          zIndex: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#047857',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(4, 120, 87, 0.3)',
            }}
          >
            <Bike size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1C241E' }}>
              Basavaraju M (Rider #R-402)
            </div>
            <div style={{ fontSize: '11px', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BatteryCharging size={13} color="#059669" />
              <span>EV Scooter 84% • Malleshwaram Hub</span>
            </div>
          </div>
        </div>

        {/* On Duty Toggle & Customer View button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            id="rider-duty-toggle-btn"
            onClick={() => {
              setIsOnDuty(!isOnDuty);
              showToast(isOnDuty ? 'Rider set to OFF DUTY' : 'Rider is now ON DUTY', 'info');
            }}
            style={{
              background: isOnDuty ? '#DCFCE7' : '#FEE2E2',
              color: isOnDuty ? '#15803D' : '#B91C1C',
              border: isOnDuty ? '1px solid #86EFAC' : '1px solid #FCA5A5',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ● {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('customer');
              setCustomerScreen('home');
            }}
            style={{
              background: '#FFF',
              border: '1px solid #1B5E3B',
              color: '#1B5E3B',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Eye size={12} />
            <span>Customer View</span>
          </button>
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Rider Metric Summary Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E8E5D3', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#885E3C', fontWeight: 700, textTransform: 'uppercase' }}>Active Tasks</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1B5E3B', marginTop: '2px' }}>{activeOrders.length}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E8E5D3', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#885E3C', fontWeight: 700, textTransform: 'uppercase' }}>Completed</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>{completedOrders.length + 4}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '12px', border: '1px solid #E8E5D3', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: '#885E3C', fontWeight: 700, textTransform: 'uppercase' }}>Daily Earnings</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>₹480</div>
          </div>
        </div>

        {/* Live GPS Navigation Broadcast Strip */}
        <div
          style={{
            background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '16px',
            boxShadow: '0 4px 14px rgba(4, 120, 87, 0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={16} color="#A7F3D0" />
              <strong style={{ fontSize: '12.5px' }}>Real-Time Delivery GPS Ping</strong>
            </div>
            <span style={{ fontSize: '10.5px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px' }}>
              Accuracy ±3m
            </span>
          </div>

          <div style={{ fontSize: '11.5px', color: '#D1E7DD', marginBottom: '8px' }}>
            Coords: <strong>{currentGps.latitude}° N, {currentGps.longitude}° E</strong>
            <br />
            Position: <span style={{ color: '#FFFFFF' }}>{currentGps.landmark}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              id="rider-broadcast-gps-btn"
              onClick={() => handleSimulateGpsPing(activeOrders[0]?.id || 'NS-LIVE')}
              disabled={isUpdatingGps}
              style={{
                flex: 1,
                background: '#A7F3D0',
                color: '#065F46',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: isUpdatingGps ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {isUpdatingGps ? <RefreshCw size={13} className="spin" /> : <Navigation size={13} />}
              <span>Broadcast Live GPS Ping</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Active Deliveries vs Completed History */}
        <div
          style={{
            display: 'flex',
            background: '#F0EFE6',
            padding: '3px',
            borderRadius: '10px',
            marginBottom: '14px',
          }}
        >
          <button
            type="button"
            id="rider-tab-active"
            onClick={() => setActiveTab('active')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'active' ? '#1B5E3B' : 'transparent',
              color: activeTab === 'active' ? '#FFF' : '#5E6961',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Assigned Deliveries ({activeOrders.length})
          </button>
          <button
            type="button"
            id="rider-tab-completed"
            onClick={() => setActiveTab('completed')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'completed' ? '#1B5E3B' : 'transparent',
              color: activeTab === 'completed' ? '#FFF' : '#5E6961',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Delivered Today ({completedOrders.length})
          </button>
        </div>

        {/* Orders Feed */}
        {activeTab === 'active' ? (
          activeOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#FFF', borderRadius: '16px', border: '1px solid #E8E5D3' }}>
              <Package size={36} color="#885E3C" style={{ margin: '0 auto 8px' }} />
              <h4 style={{ margin: 0, fontSize: '15px', color: '#1C241E' }}>No Active Deliveries</h4>
              <p style={{ fontSize: '12px', color: '#5E6961', margin: '4px 0 0' }}>All pending parcels successfully delivered to customer doorsteps.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeOrders.map((order) => {
                const isCod = order.paymentMethod.toUpperCase().includes('COD') || order.paymentMethod.toUpperCase().includes('CASH');
                const isDispatched = order.status === 'shipped';

                return (
                  <div
                    key={order.id}
                    id={`rider-order-card-${order.id}`}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1.5px solid #E8E5D3',
                      padding: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Top Row: Order ID & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong style={{ fontSize: '14px', color: '#1B5E3B' }}>#{order.id}</strong>
                          <span
                            style={{
                              background: isDispatched ? '#FEF3C7' : '#E0F2FE',
                              color: isDispatched ? '#92400E' : '#0369A1',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {isDispatched ? 'Out for Delivery' : order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#885E3C', display: 'block', marginTop: '2px' }}>
                          From: <strong>{order.vendorName}</strong>
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#1B5E3B' }}>
                          ₹{order.totalAmount}
                        </span>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '10.5px',
                            fontWeight: 700,
                            color: isCod ? (order.cashCollected ? '#047857' : '#B45309') : '#047857',
                          }}
                        >
                          {isCod
                            ? order.cashCollected
                              ? '✓ Cash Collected'
                              : 'COD • Collect Cash'
                            : '✓ Paid Online (Razorpay)'}
                        </span>
                      </div>
                    </div>

                    {/* Customer Destination Card */}
                    <div
                      style={{
                        background: '#FAF9F0',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #E8E5D3',
                        marginBottom: '12px',
                        fontSize: '11.5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <MapPin size={16} color="#1B5E3B" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ flex: 1 }}>
                          <strong style={{ color: '#1C241E', display: 'block' }}>
                            {order.customerName || 'Priya Sharma'} (1.1 km away)
                          </strong>
                          <span style={{ color: '#4B5563', lineHeight: 1.4 }}>
                            {order.deliveryAddress}, {order.deliveryLocality} (PIN: {order.deliveryPincode || '560003'})
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E8E5D3' }}>
                        <a
                          href={`tel:${order.customerPhone || '+919845099887'}`}
                          style={{
                            flex: 1,
                            padding: '6px',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                            border: '1px solid #D0CDBB',
                            color: '#1B5E3B',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                          }}
                        >
                          <Phone size={12} />
                          <span>Call Customer</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => openInvoiceModal(order)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                            border: '1px solid #D0CDBB',
                            color: '#885E3C',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <span>View Tax Invoice</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Step 1: Start Delivery if not yet out */}
                      {!isDispatched && (
                        <button
                          type="button"
                          id={`start-delivery-btn-${order.id}`}
                          onClick={() => handleStartDelivery(order)}
                          style={{
                            width: '100%',
                            background: '#1B5E3B',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <Navigation size={14} />
                          <span>Start Route & Mark Out for Delivery</span>
                        </button>
                      )}

                      {/* Step 2: COD Cash Collection Card if COD and not yet collected */}
                      {isCod && !order.cashCollected && (
                        <div
                          style={{
                            background: '#FFFBEB',
                            border: '1.5px solid #FCD34D',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400E' }}>
                              Collect COD Cash: ₹{order.totalAmount}
                            </span>
                            <span style={{ display: 'block', fontSize: '10px', color: '#78350F' }}>
                              Count cash notes or accept UPI scan
                            </span>
                          </div>

                          <button
                            type="button"
                            id={`collect-cash-btn-${order.id}`}
                            onClick={() => {
                              setCashTargetOrder(order);
                              setCashCollectedAmount(order.totalAmount);
                            }}
                            style={{
                              background: '#D97706',
                              color: '#FFF',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                          >
                            Collect Cash
                          </button>
                        </div>
                      )}

                      {/* Step 3: Scan Delivery QR Code / Verify Handover */}
                      <button
                        type="button"
                        id={`scan-qr-handover-btn-${order.id}`}
                        onClick={() => {
                          setScannerTargetOrder(order);
                          setOtpInput(order.deliveryOtp || '4821');
                        }}
                        style={{
                          width: '100%',
                          background: '#047857',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '11px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(4, 120, 87, 0.25)',
                        }}
                      >
                        <QrCode size={16} />
                        <span>Scan Delivery QR / Verify Handover</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Completed Deliveries History */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {completedOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E8E5D3',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} color="#047857" />
                    <strong style={{ fontSize: '13px', color: '#1B5E3B' }}>#{order.id}</strong>
                    <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#15803D', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      Delivered
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#5E6961', display: 'block', marginTop: '2px' }}>
                    {order.customerName} • {order.deliveryLocality}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1C241E' }}>₹{order.totalAmount}</span>
                  <button
                    type="button"
                    onClick={() => openInvoiceModal(order)}
                    style={{ background: 'none', border: 'none', color: '#885E3C', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer', display: 'block', marginTop: '2px' }}
                  >
                    View Invoice →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Handover Scanner Modal */}
      {scannerTargetOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 3500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setScannerTargetOrder(null)}
        >
          <div
            className="fade-in"
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#FFFFFF',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div
              style={{
                background: '#047857',
                color: '#FFF',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scan size={18} />
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Scan Handover QR Code</h4>
              </div>
              <button
                type="button"
                onClick={() => setScannerTargetOrder(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Viewfinder Camera Simulation */}
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div
                style={{
                  width: '190px',
                  height: '190px',
                  margin: '0 auto 16px',
                  borderRadius: '16px',
                  border: '2px solid #047857',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QrCode size={110} color="#34D399" style={{ opacity: 0.9 }} />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: '#10B981',
                    boxShadow: '0 0 10px #10B981',
                  }}
                />
              </div>

              <span style={{ fontSize: '11px', color: '#5E6961', display: 'block', marginBottom: '12px' }}>
                Point rider camera at customer's delivery QR code on their screen
              </span>

              {/* Delivery OTP verification option */}
              <div style={{ background: '#F8F7ED', padding: '10px', borderRadius: '10px', border: '1px solid #E8E5D3', marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#885E3C', display: 'block', marginBottom: '4px' }}>
                  Or enter customer delivery OTP:
                </label>
                <input
                  type="text"
                  id="rider-otp-input"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    letterSpacing: '6px',
                    textAlign: 'center',
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1.5px solid #047857',
                    width: '120px',
                  }}
                />
              </div>

              <button
                type="button"
                id="rider-verify-handover-btn"
                onClick={handleCompleteHandover}
                disabled={isVerifying}
                style={{
                  width: '100%',
                  background: '#047857',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: isVerifying ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{isVerifying ? 'Verifying...' : 'Simulate Scan & Confirm Handover'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COD Cash Collection Modal */}
      {cashTargetOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 3500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setCashTargetOrder(null)}
        >
          <div
            className="fade-in"
            style={{
              width: '100%',
              maxWidth: '380px',
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', marginBottom: '12px' }}>
              <Banknote size={22} />
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C241E' }}>
                Collect Cash on Delivery
              </h4>
            </div>

            <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#78350F' }}>Order #{cashTargetOrder.id} Total Payable:</div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#92400E', marginTop: '2px' }}>
                ₹{cashTargetOrder.totalAmount}
              </div>
              <div style={{ fontSize: '11px', color: '#78350F', marginTop: '4px' }}>
                Customer: {cashTargetOrder.customerName}
              </div>
            </div>

            <button
              type="button"
              id="rider-confirm-cash-btn"
              onClick={handleConfirmCash}
              style={{
                width: '100%',
                background: '#D97706',
                color: '#FFF',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Confirm ₹{cashCollectedAmount} Received
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
