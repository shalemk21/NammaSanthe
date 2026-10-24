import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { BottomNav } from './BottomNav';
import {
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  Truck,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const HelpScreen: React.FC = () => {
  const { showToast, language } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'How does hyperlocal ordering and delivery work?',
      a: 'Namma Santhe connects you directly with verified neighborhood provision stores, organic farms, and artisan workshops within a 5-15km radius of your chosen locality. When you place an order, your items are picked and packed directly at the local store and delivered to your doorstep within 30 to 90 minutes using eco-friendly electric delivery partners.',
    },
    {
      q: 'What is the return and refund policy?',
      a: 'Each verified local seller sets an eligible return window (typically 2 days for fresh produce and 7 to 10 days for groceries and handicrafts). If an item arrives damaged, wilted, or incorrect, you can request a return directly from your Order Tracking page by providing a reason and optional photo. Once authorized, our delivery partner collects the item, stock is restored, and your refund is processed.',
    },
    {
      q: 'How are small businesses and local farmers verified?',
      a: 'Every seller profile is reviewed by our platform administrators. Sellers submit valid trade licenses, FSSAI certifications for food items, and farm origin documentation before receiving the "Verified Local Seller" badge.',
    },
    {
      q: 'How does the Smart Product Comparison tool work?',
      a: 'You can select between 2 and 4 products across any local storefronts to compare pricing, seller ratings, stock availability, origin specifications, and delivery speed. Our engine automatically highlights the best-value option while keeping all seller options transparent.',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been sent to our local support team!', 'success');
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      <HeaderNav />

      <div style={{ padding: '16px' }}>
        {/* Header Banner */}
        <div style={{ background: '#1B5E3B', color: '#FFF', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <HelpCircle size={20} color="#9EF01A" />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9EF01A' }}>
              COMMUNITY SUPPORT
            </span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0' }}>
            How can we help you today?
          </h1>
          <p style={{ fontSize: '12px', color: '#D1E7DD', margin: 0 }}>
            Find answers to common questions about hyperlocal delivery, return windows, and local artisan support.
          </p>
        </div>

        {/* FAQ Accordions */}
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1C241E', marginBottom: '10px' }}>
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: '#FFF',
                  borderRadius: '12px',
                  border: '1px solid #E8E5D3',
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isOpen ? '#FAF9F0' : '#FFF',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} color="#1B5E3B" /> : <ChevronDown size={16} color="#5E6961" />}
                </div>

                {isOpen && (
                  <div style={{ padding: '12px 14px', fontSize: '12px', color: '#5E6961', lineHeight: '1.5', borderTop: '1px solid #F0EEE4' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Form */}
        <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E8E5D3', padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1C241E', margin: '0 0 4px 0' }}>
            Contact Neighborhood Support Team
          </h3>
          <p style={{ fontSize: '11px', color: '#5E6961', margin: '0 0 14px 0' }}>
            Have a question about an order or want to register your local shop? Send us a message.
          </p>

          {submitted ? (
            <div style={{ background: '#D1E7DD', color: '#0F5132', padding: '14px', borderRadius: '10px', fontSize: '12px', textAlign: 'center' }}>
              ✓ Thank you! We received your message and will respond within 2 hours.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#1C241E', marginBottom: '3px' }}>Your Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#1C241E', marginBottom: '3px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@domain.com"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#1C241E', marginBottom: '3px' }}>Message</label>
                <textarea
                  required
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="How can we assist you with local shops or deliveries?..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#1B5E3B',
                  color: '#FFF',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

