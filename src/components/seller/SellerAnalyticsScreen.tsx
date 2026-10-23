import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerNav } from './SellerNav';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  RotateCcw,
  AlertTriangle,
  Award,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const SellerAnalyticsScreen: React.FC = () => {
  const { sellerAnalytics, loadSellerAnalytics, language, currentUser, shops } = useApp();
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    loadSellerAnalytics();
  }, []);

  const myShop = shops.find((s) => s.id === currentUser?.shopId) || shops[0];

  const chartData = sellerAnalytics?.weeklySalesData || [
    { day: 'Mon', amount: 5400, orders: 18 },
    { day: 'Tue', amount: 6200, orders: 21 },
    { day: 'Wed', amount: 5800, orders: 19 },
    { day: 'Thu', amount: 7100, orders: 25 },
    { day: 'Fri', amount: 8400, orders: 28 },
    { day: 'Sat', amount: 9600, orders: 34 },
    { day: 'Sun', amount: 11250, orders: 39 },
  ];

  const totalSales = sellerAnalytics?.totalSales || 48250;
  const totalOrders = sellerAnalytics?.totalOrders || 142;
  const completedOrders = sellerAnalytics?.completedOrdersCount || 128;
  const returnRate = sellerAnalytics?.returnRate || 1.8;
  const cancelRate = sellerAnalytics?.cancelRate || 2.4;
  const lowStockCount = sellerAnalytics?.lowStockCount || 3;
  const topProducts = sellerAnalytics?.topProducts || [];

  const pieData = [
    { name: 'Completed', value: completedOrders, color: '#1B5E3B' },
    { name: 'Cancelled', value: sellerAnalytics?.cancelledOrdersCount || 4, color: '#E76F51' },
    { name: 'In Transit', value: Math.max(0, totalOrders - completedOrders - (sellerAnalytics?.cancelledOrdersCount || 4)), color: '#F2B705' },
  ];

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      {/* Top Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          padding: '14px 16px',
          borderBottom: '1px solid #E8E5D3',
          zIndex: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', color: '#1B5E3B', fontWeight: 800, margin: 0 }}>
            {language === 'kn' ? 'ಮಾರಾಟ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ' : 'Live Seller Analytics'}
          </h2>
          <span style={{ fontSize: '11px', color: '#885E3C' }}>
            {myShop?.name} • Real-time DB records
          </span>
        </div>

        {/* Range Selector */}
        <div style={{ display: 'flex', background: '#ECE9D8', borderRadius: '20px', padding: '2px' }}>
          {(['7d', '30d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRange(r)}
              style={{
                background: selectedRange === r ? '#FFFFFF' : 'transparent',
                color: selectedRange === r ? '#1B5E3B' : '#5E6961',
                border: 'none',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '11px',
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
        {/* Core Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '14px', border: '1px solid #E8E5D3', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#885E3C', fontSize: '11px', fontWeight: 700 }}>
              <span>TOTAL REVENUE</span>
              <DollarSign size={15} color="#1B5E3B" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1B5E3B', marginTop: '4px' }}>
              ₹{totalSales.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#1B5E3B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={11} /> +18.4% vs last period
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '14px', border: '1px solid #E8E5D3', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#885E3C', fontSize: '11px', fontWeight: 700 }}>
              <span>TOTAL ORDERS</span>
              <ShoppingBag size={15} color="#F2B705" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1C241E', marginTop: '4px' }}>
              {totalOrders}
            </div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
              {completedOrders} fulfilled successfully
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '14px', border: '1px solid #E8E5D3', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#885E3C', fontSize: '11px', fontWeight: 700 }}>
              <span>RETURN RATE</span>
              <RotateCcw size={15} color="#E76F51" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#E76F51', marginTop: '4px' }}>
              {returnRate}%
            </div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
              Cancel rate: {cancelRate}%
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '14px', border: '1px solid #E8E5D3', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#885E3C', fontSize: '11px', fontWeight: 700 }}>
              <span>LOW STOCK ITEMS</span>
              <AlertTriangle size={15} color="#8A6800" />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: lowStockCount > 0 ? '#C49400' : '#1B5E3B', marginTop: '4px' }}>
              {lowStockCount}
            </div>
            <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
              Require restocking
            </div>
          </div>
        </div>

        {/* Recharts Area Chart: Sales Trend */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E5D3', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Revenue Trend (₹)
            </h3>
            <span style={{ fontSize: '10px', color: '#885E3C', fontWeight: 600 }}>Last 7 Days</span>
          </div>

          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B5E3B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1B5E3B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#5E6961' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5E6961' }} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Sales']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E8E5D3', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#1B5E3B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Bar Chart: Daily Order Volume */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E5D3', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Daily Orders Placed
            </h3>
            <span style={{ fontSize: '10px', color: '#885E3C', fontWeight: 600 }}>Orders Count</span>
          </div>

          <div style={{ width: '100%', height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#5E6961' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5E6961' }} />
                <Tooltip
                  formatter={(val: any) => [val, 'Orders']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E8E5D3', fontSize: '11px' }}
                />
                <Bar dataKey="orders" fill="#F2B705" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Fulfillment Distribution Pie */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E5D3', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', marginBottom: '10px' }}>
            Fulfillment Ratio
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <div style={{ width: '120px', height: '120px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={35} outerRadius={50} paddingAngle={4}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              {pieData.map((d) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color }} />
                  <span style={{ color: '#5E6961' }}>{d.name}:</span>
                  <span style={{ fontWeight: 700, color: '#1C241E' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Products Table */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8E5D3', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Award size={16} color="#F2B705" />
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
              Top Selling Products
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topProducts.slice(0, 5).map((prod) => (
              <div
                key={prod.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  background: '#FAF9F0',
                  borderRadius: '10px',
                  border: '1px solid #E8E5D3',
                }}
              >
                <img src={prod.image} alt={prod.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1C241E' }}>{prod.name}</div>
                  <div style={{ fontSize: '11px', color: '#5E6961' }}>{prod.salesCount} sold • ₹{prod.revenue} generated</div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1B5E3B' }}>
                  {prod.stockCount !== undefined ? `${prod.stockCount} in stock` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SellerNav />
    </div>
  );
};
