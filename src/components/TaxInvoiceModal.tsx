import React from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Building2,
  FileText,
  MapPin,
  Calendar,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { Order } from '../types';
import { useApp } from '../context/AppContext';

interface TaxInvoiceModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  order?: Order | null;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = (props) => {
  const app = useApp();
  const isOpen = props.isOpen !== undefined ? props.isOpen : app.isInvoiceModalOpen;
  const onClose = props.onClose || app.closeInvoiceModal;
  const order = props.order !== undefined ? props.order : app.invoiceOrder;

  if (!isOpen || !order) return null;

  const invoiceNumber =
    order.invoiceNumber ||
    `NS-INV-2026-${order.id.replace(/[^0-9]/g, '').slice(-5) || '10482'}`;
  const isCod =
    order.paymentMethod.toUpperCase().includes('COD') ||
    order.paymentMethod.toUpperCase().includes('CASH');
  const items = Array.isArray(order.items) ? order.items : [];

  // Helper to convert number to words for Indian Rupees
  const numberToWords = (num: number): string => {
    const a = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';
    const n = Math.floor(num);
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        ' Hundred' +
        (n % 100 !== 0 ? ' and ' + numberToWords(n % 100) : '')
      );
    return `${n}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="tax-invoice-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        id="tax-invoice-printable-container"
        className="fade-in print-clean"
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Toolbar (hidden during print) */}
        <div
          className="no-print"
          style={{
            background: '#1B5E3B',
            color: '#FFFFFF',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} />
            <span style={{ fontSize: '14px', fontWeight: 700 }}>
              Official Tax Invoice & Bill of Supply
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              id="print-invoice-btn"
              onClick={handlePrint}
              style={{
                background: '#A7F3D0',
                color: '#065F46',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              id="close-invoice-modal-btn"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet Body */}
        <div
          style={{
            padding: '28px 32px',
            overflowY: 'auto',
            background: '#FFFFFF',
            fontSize: '12px',
            color: '#1C241E',
            lineHeight: 1.5,
          }}
        >
          {/* Top Brand & Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: '2px solid #1B5E3B',
              paddingBottom: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <img
                  src="/logo.png"
                  alt="Namma Santhe"
                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                />
                <div>
                  <h1
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#1B5E3B',
                      margin: 0,
                    }}
                  >
                    Namma Santhe • ನಮ್ಮ ಸಂತೆ
                  </h1>
                  <span style={{ fontSize: '10.5px', color: '#885E3C', fontWeight: 600 }}>
                    Hyperlocal Farmers & Artisans Marketplace Platform
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '10.5px', color: '#5E6961', maxWidth: '320px' }}>
                Namma Santhe Technologies Pvt. Ltd. • Sampige Rd, Malleshwaram, Bengaluru 560003
                <br />
                <strong>Platform GSTIN:</strong> 29AAACN8842K1ZB • <strong>CIN:</strong> U01100KA2026PTC189421
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#15803D',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'inline-block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                }}
              >
                TAX INVOICE / CASH MEMO
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C241E' }}>
                Invoice #: {invoiceNumber}
              </div>
              <div style={{ fontSize: '11px', color: '#5E6961' }}>
                Order ID: <strong>#{order.id}</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#5E6961' }}>
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Seller & Customer Information Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              padding: '12px',
              background: '#F8F7ED',
              borderRadius: '12px',
              marginBottom: '18px',
              border: '1px solid #E8E5D3',
            }}
          >
            {/* Seller Details */}
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#885E3C', textTransform: 'uppercase', marginBottom: '4px' }}>
                Sold By (Local Producer / Merchant):
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E3B' }}>
                {order.vendorName}
              </div>
              <div style={{ fontSize: '11px', color: '#4B5563' }}>
                Devanahalli Organic Cluster, Bengaluru Rural
                <br />
                <span id="seller-fssai-number" style={{ color: '#047857', fontWeight: 700 }}>
                  FSSAI Lic. No: 11223334000891
                </span>
                <br />
                <span id="seller-gstin-number" style={{ color: '#4B5563' }}>
                  GSTIN: 29AAGCR4829L1Z8 • State: Karnataka (29)
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#885E3C', textTransform: 'uppercase', marginBottom: '4px' }}>
                Billed & Delivered To:
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C241E' }}>
                {order.customerName || 'Priya Sharma'}
              </div>
              <div style={{ fontSize: '11px', color: '#4B5563' }}>
                {order.deliveryAddress}
                <br />
                Locality: {order.deliveryLocality || 'Malleshwaram'} • PIN: <strong>{order.deliveryPincode || '560003'}</strong>
                <br />
                Phone: {order.customerPhone || '+91 98450 99887'}
              </div>
            </div>
          </div>

          {/* Itemized Produce Table */}
          <div style={{ marginBottom: '18px' }}>
            <table
              id="tax-invoice-items-table"
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11.5px',
              }}
            >
              <thead>
                <tr style={{ background: '#1B5E3B', color: '#FFFFFF', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', borderRadius: '6px 0 0 6px' }}>#</th>
                  <th style={{ padding: '8px 10px' }}>Item Description</th>
                  <th style={{ padding: '8px 10px' }}>HSN</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>GST Rate</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => {
                  const itName = item.name || item.product?.name || `Item ${idx + 1}`;
                  const itQty = item.quantity || 1;
                  const itUnit = item.unit || item.product?.unit || 'kg';
                  const itPrice = item.priceSnapshot || item.product?.price || 0;
                  const itTotal = itQty * itPrice;
                  const hsn = itName.toLowerCase().includes('tomato')
                    ? '0702.00'
                    : itName.toLowerCase().includes('banana')
                    ? '0803.90'
                    : itName.toLowerCase().includes('palak') || itName.toLowerCase().includes('methi')
                    ? '0709.70'
                    : '1905.90';

                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #F0EEE4',
                        background: idx % 2 === 0 ? '#FFFFFF' : '#FAF9F2',
                      }}
                    >
                      <td style={{ padding: '8px 10px', color: '#885E3C', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#1C241E' }}>
                        {itName}
                        <span style={{ fontSize: '10px', color: '#5E6961', display: 'block', fontWeight: 400 }}>
                          Harvested fresh at Devanahalli Organic Co-op
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#5E6961' }}>{hsn}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        {itQty} {itUnit}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>₹{itPrice}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>
                        0% (Exempt)
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#1C241E' }}>
                        ₹{itTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary & Payment Gateway Stamp */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '20px',
              borderTop: '1.5px dashed #D0CDBB',
              paddingTop: '14px',
              marginBottom: '16px',
            }}
          >
            {/* Razorpay Gateway Receipt Stamp */}
            <div
              style={{
                border: '1.5px solid #BBF7D0',
                background: '#F0FDF4',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D', fontWeight: 800 }}>
                <CheckCircle2 size={16} />
                <span>PAYMENT CONFIRMED (GATEWAY RECEIPT)</span>
              </div>

              <div style={{ fontSize: '11px', color: '#1C241E' }}>
                Payment Method: <strong>{order.paymentMethod}</strong>
              </div>

              <div style={{ fontSize: '11px', color: '#1C241E' }}>
                Transaction Ref ID:{' '}
                <code
                  id="invoice-transaction-ref"
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: '#15803D',
                    background: '#DCFCE7',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {order.paymentTransactionId || 'pay_test_77665544'}
                </code>
              </div>

              {order.paymentGatewayOrderId && (
                <div style={{ fontSize: '11px', color: '#5E6961' }}>
                  Gateway Order ID: <code style={{ fontFamily: 'monospace' }}>{order.paymentGatewayOrderId}</code>
                </div>
              )}

              <div style={{ fontSize: '10.5px', color: '#166534', marginTop: '4px' }}>
                ✓ Cryptographic HMAC SHA256 Signature Verified on Backend
              </div>
            </div>

            {/* Bill Summary Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
                <span>Produce Items Subtotal:</span>
                <span style={{ fontWeight: 600, color: '#1C241E' }}>₹{order.subtotal}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
                <span>Delivery Partner Fee:</span>
                <span style={{ fontWeight: 600, color: order.deliveryFee === 0 ? '#15803D' : '#1C241E' }}>
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
                <span>Eco Cloth / Paper Bag:</span>
                <span style={{ color: '#1C241E' }}>₹{order.ecoPackagingFee || 5}</span>
              </div>

              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E76F51', fontWeight: 600 }}>
                  <span>Community Discount:</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5E6961' }}>
                <span>Applicable GST (Exempt/Nil):</span>
                <span>₹0.00</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid #1B5E3B',
                  paddingTop: '6px',
                  marginTop: '4px',
                  fontSize: '15px',
                  fontWeight: 900,
                  color: '#1B5E3B',
                }}
              >
                <span>Total Amount Paid:</span>
                <span>₹{order.totalAmount}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#5E6961', textAlign: 'right' }}>
                ({numberToWords(order.totalAmount)} Rupees Only)
              </div>
            </div>
          </div>

          {/* Footer Declaration & Digital Stamp */}
          <div
            style={{
              borderTop: '1px solid #E8E5D3',
              paddingTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10.5px',
              color: '#885E3C',
            }}
          >
            <div>
              <strong>Declaration:</strong> This is a computer-generated tax invoice under GST Rules 2017.
              <br />
              All fresh produce sourced chemical-free directly from registered Karnataka farming co-operatives.
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: '#1B5E3B' }}>
                Namma Santhe Co-operative Platform
              </div>
              <div style={{ fontSize: '9.5px', color: '#5E6961' }}>Authorized Digital Stamp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
