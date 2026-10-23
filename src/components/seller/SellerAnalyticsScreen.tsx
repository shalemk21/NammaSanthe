import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerNav } from './SellerNav';
import {
  TrendingUp,
  Award,
  DollarSign,
  ShoppingBag,
  Users,
  Repeat,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const SellerAnalyticsScreen: React.FC = () => {
  const { weeklySales, topProducts, sellerMetrics, language } = useApp();
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | 'month'>('7d');

  const maxVal = Math.max(...weeklySales.map((w) => w.amount));
  const minVal = Math.min(...weeklySales.map((w) => w.amount));

  // Compute SVG polyline points for the 7-day trend graph
  const width = 340;
  const height = 130;
  const padding = 16;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = weeklySales
    .map((d, i) => {
      const x = padding + (i / (weeklySales.length - 1)) * usableWidth;
      const y = height - padding - ((d.amount - minVal * 0.7) / (maxVal - minVal * 0.7)) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      {/* Top Header */}
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
        <div>
          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '18px',
              color: '#1B5E3B',
              fontWeight: 700,
            }}
          >
            {language === 'kn' ? 'ಮಾರಾಟ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ' : 'Sales Analytics'}
          </h2>
          <span style={{ fontSize: '11px', color: '#885E3C' }}>
            Store growth & top-performing products
          </span>
        </div>

        {/* Range Selector */}
        <div
          style={{
            display: 'flex',
            background: '#ECE9D8',
            borderRadius: '999px',
            padding: '2px',
          }}
        >
          {(['7d', '30d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRange(r)}
              style={{
                background: selectedRange === r ? '#FFFFFF' : 'transparent',
                color: selectedRange === r ? '#1B5E3B' : '#5E6961',
                border: 'none',
                borderRadius: '999px',
                padding: '4px 8px',
                fontSize: '10.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Sales Graph Card */}
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
              marginBottom: '10px',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#5E6961' }}>Total Revenue (Last 7 Days)</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1B5E3B' }}>
                ₹{sellerMetrics.totalSales.toLocaleString('en-IN')}
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                background: 'rgba(27,94,59,0.1)',
                color: '#1B5E3B',
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '999px',
              }}
            >
              <TrendingUp size={13} />
              <span>+{sellerMetrics.growthPercentage}%</span>
            </div>
          </div>

          {/* SVG Trendline Graph */}
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B5E3B" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#1B5E3B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid guide lines */}
              <line
                x1={padding}
                y1={padding}
                x2={width - padding}
                y2={padding}
                stroke="#F0EEE4"
                strokeDasharray="4 4"
              />
              <line
                x1={padding}
                y1={height / 2}
                x2={width - padding}
                y2={height / 2}
                stroke="#F0EEE4"
                strokeDasharray="4 4"
              />
              <line
                x1={padding}
                y1={height - padding}
                x2={width - padding}
                y2={height - padding}
                stroke="#E8E5D3"
              />

              {/* Shaded Area */}
              <polygon points={areaPoints} fill="url(#salesGrad)" />

              {/* Trendline */}
              <polyline
                points={points}
                fill="none"
                stroke="#1B5E3B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {weeklySales.map((d, i) => {
                const x = padding + (i / (weeklySales.length - 1)) * usableWidth;
                const y =
                  height - padding - ((d.amount - minVal * 0.7) / (maxVal - minVal * 0.7)) * usableHeight;

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={i === 6 ? '5' : '3.5'}
                    fill={i === 6 ? '#F2B705' : '#1B5E3B'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>

            {/* X Axis Labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#8E9991',
                marginTop: '6px',
                padding: '0 6px',
              }}
            >
              {weeklySales.map((d) => (
                <span key={d.day}>{d.day.split(' ')[0]}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary KPI Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <div
            className="card-base"
            style={{ padding: '10px 8px', textAlign: 'center', background: '#FFFFFF' }}
          >
            <div style={{ fontSize: '10px', color: '#5E6961', marginBottom: '2px' }}>Avg Order</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E' }}>₹340</div>
            <div style={{ fontSize: '9.5px', color: '#1B5E3B', fontWeight: 600 }}>+8.2%</div>
          </div>

          <div
            className="card-base"
            style={{ padding: '10px 8px', textAlign: 'center', background: '#FFFFFF' }}
          >
            <div style={{ fontSize: '10px', color: '#5E6961', marginBottom: '2px' }}>Repeat Buyers</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E' }}>74%</div>
            <div style={{ fontSize: '9.5px', color: '#885E3C', fontWeight: 600 }}>High Loyalty</div>
          </div>

          <div
            className="card-base"
            style={{ padding: '10px 8px', textAlign: 'center', background: '#FFFFFF' }}
          >
            <div style={{ fontSize: '10px', color: '#5E6961', marginBottom: '2px' }}>Fulfillment</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1B5E3B' }}>98.6%</div>
            <div style={{ fontSize: '9.5px', color: '#1B5E3B', fontWeight: 600 }}>Under 45m</div>
          </div>
        </div>

        {/* Top Performing Products Ranking */}
        <div className="card-base" style={{ padding: '14px', background: '#FFFFFF' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} color="#c49400" />
              <h3
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '16px',
                  color: '#1B5E3B',
                  fontWeight: 700,
                }}
              >
                Top-Performing Products
              </h3>
            </div>
            <span style={{ fontSize: '10.5px', color: '#885E3C', fontWeight: 600 }}>
              By Revenue Generated
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topProducts.map((p, idx) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 0',
                  borderBottom: idx < topProducts.length - 1 ? '1px solid #F0EEE4' : 'none',
                }}
              >
                {/* Rank Badge */}
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background:
                      idx === 0
                        ? '#F2B705'
                        : idx === 1
                        ? '#D8D4BF'
                        : idx === 2
                        ? '#E76F51'
                        : '#ECE9D8',
                    color: idx === 0 ? '#261E05' : '#1C241E',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>

                <img
                  src={p.image}
                  alt={p.name}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#1C241E',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.name}
                  </h4>
                  <div style={{ fontSize: '10.5px', color: '#5E6961' }}>
                    {p.salesCount} units sold
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1B5E3B' }}>
                    ₹{p.revenue.toLocaleString('en-IN')}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '2px',
                      fontSize: '10px',
                      color: '#1B5E3B',
                      fontWeight: 600,
                    }}
                  >
                    <ArrowUpRight size={10} />
                    <span>+{p.growth}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Co-op Certificate Badge */}
        <div
          style={{
            marginTop: '16px',
            background: 'linear-gradient(135deg, #FAF8EE 0%, #F5F1DC 100%)',
            border: '1px solid #D8D4BF',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Sparkles size={20} color="#c49400" />
          <div style={{ fontSize: '11px', color: '#5E6961' }}>
            <strong style={{ color: '#1B5E3B' }}>Top 5% Karnataka Producer Partner:</strong> Your
            store qualifies for zero platform fees for the next 30 days!
          </div>
        </div>
      </div>

      <SellerNav />
    </div>
  );
};
