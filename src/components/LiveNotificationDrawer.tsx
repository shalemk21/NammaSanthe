import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Smartphone,
  Send,
  CheckCheck,
  ExternalLink,
  Bell,
  RefreshCw,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WebhookNotification } from '../types';
import { api } from '../services/api';

interface LiveNotificationDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const LiveNotificationDrawer: React.FC<LiveNotificationDrawerProps> = (props) => {
  const { orders, showToast, isLiveNotifDrawerOpen, closeLiveNotifDrawer } = useApp();
  const isOpen = props.isOpen !== undefined ? props.isOpen : isLiveNotifDrawerOpen;
  const onClose = props.onClose || closeLiveNotifDrawer;
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [logs, setLogs] = useState<WebhookNotification[]>([
    {
      id: 'wh-1',
      orderId: 'NS-8841',
      recipientPhone: '+91 98450 99887',
      recipientName: 'Priya Sharma',
      channel: 'whatsapp',
      templateName: 'santhe_payment_confirmed',
      message:
        '🌿 *Namaskara Priya!* Your Namma Santhe order *#NS-8841* (₹162) is confirmed with *Ravi Organic Farms*. Payment verified via Razorpay Gateway (Ref: `pay_test_77665544`). Direct farm harvest initiated at Devanahalli.',
      trackingLink: 'http://localhost:5000/track/NS-8841',
      status: 'delivered',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
    },
    {
      id: 'wh-2',
      orderId: 'NS-8841',
      recipientPhone: '+91 98450 99887',
      recipientName: 'Priya Sharma',
      channel: 'whatsapp',
      templateName: 'santhe_out_for_delivery',
      message:
        '🛵 *Out for Delivery!* Santhe Rider *Basavaraju M (EV #R-402)* has picked up your fresh organic harvest. Real-time GPS: 13.0031° N, 77.5643° E. 🔑 Share delivery OTP: *4821* at doorstep.',
      trackingLink: 'http://localhost:5000/track/NS-8841',
      status: 'delivered',
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'wh-3',
      orderId: 'NS-8841',
      recipientPhone: '+91 98450 99887',
      recipientName: 'Priya Sharma',
      channel: 'sms',
      templateName: 'dlt_order_dispatch',
      message:
        'VK-SANTHE: Order #NS-8841 of Rs.162 confirmed with Ravi Organic Farms. Payment verified via Razorpay. Live tracking: http://localhost:5000/track/NS-8841 - Namma Santhe',
      trackingLink: 'http://localhost:5000/track/NS-8841',
      status: 'delivered',
      timestamp: new Date(Date.now() - 1180000).toISOString(),
    },
    {
      id: 'wh-4',
      orderId: 'NS-8841',
      recipientPhone: '+91 98450 99887',
      recipientName: 'Priya Sharma',
      channel: 'sms',
      templateName: 'dlt_rider_otp',
      message:
        'VK-SANTHE: Rider Basavaraju M is 5 mins away on Sampige Rd with your fresh farm produce. Share delivery OTP 4821 at doorstep. - Namma Santhe',
      trackingLink: 'http://localhost:5000/track/NS-8841',
      status: 'delivered',
      timestamp: new Date(Date.now() - 580000).toISOString(),
    },
  ]);

  const [simEvent, setSimEvent] = useState<'order_confirmed' | 'packed' | 'out_for_delivery' | 'delivered'>('order_confirmed');
  const [simChannel, setSimChannel] = useState<'whatsapp' | 'sms' | 'both'>('both');
  const [isSending, setIsSending] = useState(false);

  // Load from backend on mount
  useEffect(() => {
    if (isOpen) {
      api.notifications.getWebhookLogs().then((res) => {
        if (res.success && res.logs && res.logs.length > 0) {
          setLogs(res.logs);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  const handleSimulateDispatch = async () => {
    setIsSending(true);
    try {
      const activeOrder = orders[0];
      const orderId = activeOrder?.id || `NS-${Date.now().toString().slice(-4)}`;
      const amount = activeOrder?.totalAmount || 162;
      const vendorName = activeOrder?.vendorName || 'Ravi Organic Farms';

      const res = await api.notifications.simulateWebhook({
        orderId,
        event: simEvent,
        recipientPhone: '+91 98450 99887',
        recipientName: 'Priya Sharma',
        channel: simChannel,
        amount,
        vendorName,
        riderName: 'Basavaraju M (Santhe EV Rider)',
        otp: '4821',
      });

      if (res.success && res.notifications) {
        setLogs((prev) => [...res.notifications, ...prev]);
        showToast(`Dispatched simulated ${simChannel.toUpperCase()} webhook!`, 'success');
      }
    } catch {
      showToast('Dispatched simulated webhook (offline mode)', 'info');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const filteredLogs = logs.filter((l) => l.channel === activeTab);

  return (
    <div
      id="notification-drawer-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
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
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Smartphone size={20} color="#A7F3D0" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>
                Automated Customer Comms Feed
              </h3>
              <span style={{ fontSize: '11px', color: '#D1E7DD' }}>
                Simulated WhatsApp & SMS Webhooks to +91 98450 99887
              </span>
            </div>
          </div>

          <button
            type="button"
            id="close-notification-drawer-btn"
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

        {/* Channel Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#F5F3E8',
            padding: '4px',
            borderBottom: '1px solid #E8E5D3',
          }}
        >
          <button
            type="button"
            id="channel-tab-whatsapp"
            onClick={() => setActiveTab('whatsapp')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === 'whatsapp' ? '#25D366' : 'transparent',
              color: activeTab === 'whatsapp' ? '#FFFFFF' : '#5E6961',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <MessageSquare size={15} />
            <span>WhatsApp Business (Verified)</span>
          </button>

          <button
            type="button"
            id="channel-tab-sms"
            onClick={() => setActiveTab('sms')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              background: activeTab === 'sms' ? '#1B5E3B' : 'transparent',
              color: activeTab === 'sms' ? '#FFFFFF' : '#5E6961',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Smartphone size={15} />
            <span>DLT Carrier SMS (VK-SANTHE)</span>
          </button>
        </div>

        {/* Simulation Control Strip */}
        <div
          style={{
            background: '#FAF9F2',
            padding: '12px 16px',
            borderBottom: '1px solid #E8E5D3',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#885E3C', textTransform: 'uppercase' }}>
            Trigger Webhook:
          </span>

          <select
            id="simulate-event-select"
            value={simEvent}
            onChange={(e) => setSimEvent(e.target.value as any)}
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              border: '1px solid #D0CDBB',
              fontSize: '11.5px',
              background: '#FFF',
              fontWeight: 600,
            }}
          >
            <option value="order_confirmed">Payment Confirmed</option>
            <option value="packed">Produce Packed</option>
            <option value="out_for_delivery">Out for Delivery (Rider + OTP)</option>
            <option value="delivered">Delivered Fresh</option>
          </select>

          <select
            id="simulate-channel-select"
            value={simChannel}
            onChange={(e) => setSimChannel(e.target.value as any)}
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              border: '1px solid #D0CDBB',
              fontSize: '11.5px',
              background: '#FFF',
              fontWeight: 600,
            }}
          >
            <option value="both">Both Channels</option>
            <option value="whatsapp">WhatsApp Only</option>
            <option value="sms">SMS Only</option>
          </select>

          <button
            type="button"
            id="trigger-webhook-btn"
            onClick={handleSimulateDispatch}
            disabled={isSending}
            style={{
              background: '#1B5E3B',
              color: '#FFF',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: isSending ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Send size={12} />
            <span>Dispatch Webhook</span>
          </button>
        </div>

        {/* Message Logs View */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: activeTab === 'whatsapp' ? '#EFEAE2' : '#F8F7ED',
          }}
        >
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5E6961' }}>
              <MessageSquare size={32} color="#C4BEA9" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>No {activeTab.toUpperCase()} notifications sent yet.</p>
              <span style={{ fontSize: '11px', color: '#885E3C' }}>Use the control strip above to trigger a mock webhook.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="fade-in"
                  style={{
                    background: activeTab === 'whatsapp' ? '#DCF8C6' : '#FFFFFF',
                    borderRadius: activeTab === 'whatsapp' ? '12px 12px 2px 12px' : '14px',
                    padding: '12px 14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    border: activeTab === 'whatsapp' ? '1px solid #C3E6CB' : '1px solid #E8E5D3',
                    alignSelf: activeTab === 'whatsapp' ? 'flex-end' : 'stretch',
                    maxWidth: activeTab === 'whatsapp' ? '92%' : '100%',
                  }}
                >
                  {/* Sender Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                      fontSize: '11px',
                    }}
                  >
                    <span style={{ fontWeight: 800, color: activeTab === 'whatsapp' ? '#075E54' : '#1B5E3B' }}>
                      {activeTab === 'whatsapp' ? '🌿 Namma Santhe Official ✓' : 'VK-SANTHE'}
                    </span>
                    <span style={{ fontSize: '10px', color: '#5E6961' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Body Text */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#1C241E',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {log.message}
                  </div>

                  {/* Footer Meta */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                      paddingTop: '6px',
                      borderTop: '1px solid rgba(0,0,0,0.05)',
                      fontSize: '10.5px',
                      color: '#5E6961',
                    }}
                  >
                    <span>To: <strong>{log.recipientPhone}</strong> ({log.recipientName})</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: activeTab === 'whatsapp' ? '#34B7F1' : '#15803D' }}>Delivered</span>
                      <CheckCheck size={14} color={activeTab === 'whatsapp' ? '#34B7F1' : '#15803D'} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
