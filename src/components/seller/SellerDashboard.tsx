import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerNav } from './SellerNav';
import {
  Store,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const {
    sellerMetrics,
    weeklySales,
    isShopOpen,
    toggleShopOpen,
    setSellerScreen,
    setActiveRole,
    setCustomerScreen,
    orders,
    acceptSellerOrder,
    language,
    showToast,
  } = useApp();

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(6);

  const maxSale = Math.max(...weeklySales.map((d) => d.amount));
  const pendingOrders = orders.filter((o) => o.status === 'processing');

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      {/* Seller Top Bar */}
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
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#885E3C',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>
              Vendor Hub
            </div>
            <div style={{ fontSize: '10.5px', color: '#885E3C' }}>
              Lakshmi Stores & Mill
            </div>
          </div>
        </div>

        {/* View Customer Marketplace Button */}
        <button
          type="button"
          onClick={() => {
            setActiveRole('customer');
            setCustomerScreen('home');
          }}
          className="btn-outline"
          style={{ padding: '5px 10px', fontSize: '11px', borderColor: '#885E3C', color: '#885E3C' }}
        >
          <Eye size={12} />
          <span>Customer View</span>
        </button>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Store Overview Card */}
        <div
          className="card-base"
          style={{
            padding: '16px',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F9F8F0 100%)',
            border: '1.5px solid #E8E5D3',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                alt="Lakshmi Stores"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '2px solid #885E3C',
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1C241E' }}>
                    Lakshmi Stores & Mill
                  </h2>
                  <ShieldCheck size={14} color="#1B5E3B" />
                </div>
                <div style={{ fontSize: '11px', color: '#885E3C' }}>
                  Malleshwaram 8th Cross • Est. 1984
                </div>
              </div>
            </div>

            {/* Shop Status Toggle */}
            <button
              type="button"
              id="seller-status-toggle-btn"
              onClick={toggleShopOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isShopOpen ? 'rgba(27,94,59,0.1)' : 'rgba(231,111,81,0.1)',
                border: isShopOpen ? '1px solid #1B5E3B' : '1px solid #E76F51',
                padding: '5px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                color: isShopOpen ? '#1B5E3B' : '#E76F51',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isShopOpen ? '#1B5E3B' : '#E76F51',
                }}
              />
              <span>{isShopOpen ? 'Shop Active' : 'Paused'}</span>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid #F0EEE4',
            }}
          >
            <button
              type="button"
              id="seller-add-product-shortcut"
              onClick={() => setSellerScreen('add_product')}
              className="btn-primary"
              style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>

            <button
              type="button"
              onClick={() => setSellerScreen('orders')}
              className="btn-outline"
              style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
            >
              <ShoppingBag size={14} />
              <span>Orders ({pendingOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Key Metric Counters */}
        <div style={{ marginBottom: '16px' }}>
          <h3
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '16px',
              color: '#1B5E3B',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            Performance Metrics
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}
          >
            {/* 1. Total Sales */}
            <div
              className="card-base"
              style={{
                padding: '12px',
                background: '#FFFFFF',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '11px', color: '#5E6961' }}>Total Sales</span>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(27,94,59,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1B5E3B',
                  }}
                >
                  <DollarSign size={14} />
                </div>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 700, color: '#1B5E3B' }}>
                ₹{sellerMetrics.totalSales.toLocaleString('en-IN')}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10.5px',
                  color: '#1B5E3B',
                  fontWeight: 600,
                  marginTop: '4px',
                }}
              >
                <TrendingUp size={12} />
                <span>+18.4% this week</span>
              </div>
            </div>

            {/* 2. Total Orders */}
            <div
              className="card-base"
              style={{
                padding: '12px',
                background: '#FFFFFF',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '11px', color: '#5E6961' }}>Total Orders</span>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(242,183,5,0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c49400',
                  }}
                >
                  <ShoppingBag size={14} />
                </div>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 700, color: '#1C241E' }}>
                {sellerMetrics.totalOrders}
              </div>
              <div style={{ fontSize: '10.5px', color: '#885E3C', marginTop: '4px' }}>
                {pendingOrders.length} pending dispatch
              </div>
            </div>

            {/* 3. Active Products */}
            <div
              className="card-base"
              style={{
                padding: '12px',
                background: '#FFFFFF',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '11px', color: '#5E6961' }}>Active Products</span>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(136,94,60,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#885E3C',
                  }}
                >
                  <Package size={14} />
                </div>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 700, color: '#1C241E' }}>
                {sellerMetrics.activeProducts}
              </div>
              <div style={{ fontSize: '10.5px', color: '#1B5E3B', fontWeight: 600, marginTop: '4px' }}>
                All catalog verified
              </div>
            </div>

            {/* 4. Low Stock Alerts */}
            <div
              className="card-base"
              onClick={() => setSellerScreen('inventory')}
              style={{
                padding: '12px',
                background: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '11px', color: '#5E6961' }}>Low Stock</span>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(231,111,81,0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#E76F51',
                  }}
                >
                  <AlertTriangle size={14} />
                </div>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 700, color: '#E76F51' }}>
                {sellerMetrics.lowStockCount}
              </div>
              <div style={{ fontSize: '10.5px', color: '#E76F51', fontWeight: 600, marginTop: '4px' }}>
                Restock needed →
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Sales Overview Interactive Bar Chart */}
        <div
          className="card-base"
          style={{
            padding: '16px',
            marginBottom: '16px',
            background: '#FFFFFF',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '16px',
                  color: '#1B5E3B',
                  fontWeight: 700,
                }}
              >
                7-Day Sales Overview
              </h3>
              <span style={{ fontSize: '11px', color: '#885E3C' }}>
                Revenue peak on Sunday Santhe Market Day
              </span>
            </div>

            {hoveredBarIndex !== null && (
              <div
                style={{
                  background: '#F8F7ED',
                  border: '1px solid #D8D4BF',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textAlign: 'right',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1B5E3B' }}>
                  ₹{weeklySales[hoveredBarIndex].amount}
                </span>
                <div style={{ fontSize: '9px', color: '#885E3C' }}>
                  {weeklySales[hoveredBarIndex].orders} orders
                </div>
              </div>
            )}
          </div>

          {/* SVG Bar Chart */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '140px',
              paddingTop: '20px',
              gap: '8px',
            }}
          >
            {weeklySales.map((item, idx) => {
              const heightPercent = Math.round((item.amount / maxSale) * 100);
              const isHovered = hoveredBarIndex === idx;

              return (
                <div
                  key={item.day}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onClick={() => setHoveredBarIndex(idx)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '28px',
                      height: `${heightPercent}%`,
                      minHeight: '12px',
                      borderRadius: '6px 6px 0 0',
                      background: isHovered
                        ? 'linear-gradient(180deg, #F2B705 0%, #1B5E3B 100%)'
                        : idx === 6
                        ? '#1B5E3B'
                        : '#92AE9E',
                      boxShadow: isHovered ? '0 0 10px rgba(242,183,5,0.4)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      color: isHovered ? '#1B5E3B' : '#5E6961',
                      fontWeight: isHovered ? 700 : 500,
                      marginTop: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.day.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Pending Orders Section */}
        {pendingOrders.length > 0 && (
          <div className="card-base" style={{ padding: '14px', background: '#FFFFFF' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#E76F51" />
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>
                  Orders Awaiting Action ({pendingOrders.length})
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setSellerScreen('orders')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#885E3C',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View All →
              </button>
            </div>

            {pendingOrders.slice(0, 1).map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: '#F8F7ED',
                  borderRadius: '10px',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid #E8E5D3',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1C241E' }}>
                    Order #{ord.id} • ₹{ord.totalAmount}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#5E6961' }}>
                    {ord.items.length} items • Delivery to {ord.deliveryAddress.slice(0, 24)}...
                  </div>
                </div>

                <button
                  type="button"
                  id={`quick-accept-order-${ord.id}`}
                  onClick={() => acceptSellerOrder(ord.id)}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                >
                  <CheckCircle2 size={13} />
                  <span>Accept Order</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <SellerNav />
    </div>
  );
};
