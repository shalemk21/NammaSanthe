import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminNav } from './AdminNav';
import { api } from '../../services/api';
import { Review, AuditLog, Order } from '../../types';
import {
  Shield,
  TrendingUp,
  Store,
  Users,
  ShoppingBag,
  Scale,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ArrowRight,
  DollarSign,
  Filter,
  MessageSquare,
  FileText,
  Clock,
  RotateCcw,
  Truck,
  CreditCard,
  Search,
  Check,
  X,
  RefreshCw,
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
} from 'recharts';

type AdminTab = 'overview' | 'orders' | 'reviews' | 'audit';

export const AdminDashboard: React.FC = () => {
  const {
    adminStats,
    loadAdminStats,
    shops,
    disputes,
    products,
    orders,
    verifySeller,
    resolveDispute,
    moderateReview,
    setAdminScreen,
    adminScreen,
    setActiveRole,
    setCustomerScreen,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (adminScreen === 'reviews_moderation') return 'reviews';
    if (adminScreen === 'audit_logs') return 'audit';
    return 'overview';
  });

  // Orders & Financials Filters
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');
  const [refundFilter, setRefundFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Reported Reviews state
  const [reportedReviews, setReportedReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [auditSearch, setAuditSearch] = useState<string>('');

  useEffect(() => {
    loadAdminStats();
    fetchReportedReviews();
    fetchAuditLogs();
  }, []);

  const fetchReportedReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const res = await api.admin.getReportedReviews();
      if (res.success) {
        setReportedReviews(res.reviews);
      }
    } catch (err) {
      console.warn('Failed to fetch reported reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchAuditLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await api.admin.getAuditLogs();
      if (res.success) {
        setAuditLogs(res.logs);
      }
    } catch (err) {
      console.warn('Failed to fetch audit logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleModerate = async (reviewId: string, action: 'keep' | 'hide' | 'dismiss') => {
    const ok = await moderateReview(reviewId, action);
    if (ok) {
      setReportedReviews((prev) => prev.filter((r) => r.id !== reviewId));
      fetchAuditLogs();
    }
  };

  const totalGMV = adminStats?.totalGMV || 184500;
  const platformRevenue = adminStats?.platformFeeRevenue || Math.round(totalGMV * 0.05);
  const totalSellers = adminStats?.totalSellers || shops.length;
  const pendingSellers = shops.filter((s) => s.verificationStatus === 'pending');
  const openDisputes = disputes.filter((d) => d.status !== 'resolved');
  const flaggedProducts = products.filter((p) => p.isSuspicious);

  const platformTrendData = [
    { day: 'Mon', gmv: 21000, fee: 1050 },
    { day: 'Tue', gmv: 24500, fee: 1225 },
    { day: 'Wed', gmv: 22000, fee: 1100 },
    { day: 'Thu', gmv: 28000, fee: 1400 },
    { day: 'Fri', gmv: 34000, fee: 1700 },
    { day: 'Sat', gmv: 42000, fee: 2100 },
    { day: 'Sun (Santhe)', gmv: 58000, fee: 2900 },
  ];

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
    if (fulfillmentFilter !== 'all' && o.status !== fulfillmentFilter) return false;
    if (refundFilter !== 'all') {
      const rStatus = o.refundStatus || 'none';
      if (rStatus !== refundFilter) return false;
    }
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      const matchId = o.id.toLowerCase().includes(q);
      const matchVendor = o.vendorName.toLowerCase().includes(q);
      const matchPaymentId = o.paymentTransactionId?.toLowerCase().includes(q);
      const matchTracking = o.trackingReference?.toLowerCase().includes(q);
      if (!matchId && !matchVendor && !matchPaymentId && !matchTracking) return false;
    }
    return true;
  });

  // Filtered audit logs
  const filteredLogs = auditLogs.filter((log) => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.targetType.toLowerCase().includes(q) ||
      (log.targetId && log.targetId.toLowerCase().includes(q))
    );
  });

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
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#E76F51',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
              Marketplace Command Center
            </h1>
            <div style={{ fontSize: '11px', color: '#885E3C' }}>
              Platform Governance, Payments, Deliveries & Audits
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveRole('customer');
            setCustomerScreen('home');
          }}
          style={{
            padding: '5px 12px',
            fontSize: '11px',
            border: '1px solid #E76F51',
            color: '#E76F51',
            background: '#FFF',
            borderRadius: '20px',
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

      {/* Sub Navigation Bar for Admin Operations */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #E8E5D3',
          background: '#FFFFFF',
          padding: '0 16px',
          overflowX: 'auto',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '12px 10px',
            fontSize: '12px',
            fontWeight: activeTab === 'overview' ? 700 : 500,
            color: activeTab === 'overview' ? '#1B5E3B' : '#5E6961',
            borderBottom: activeTab === 'overview' ? '2px solid #1B5E3B' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Overview & Health
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '12px 10px',
            fontSize: '12px',
            fontWeight: activeTab === 'orders' ? 700 : 500,
            color: activeTab === 'orders' ? '#1B5E3B' : '#5E6961',
            borderBottom: activeTab === 'orders' ? '2px solid #1B5E3B' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Orders & Payments</span>
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: '10px',
              background: '#E8E5D3',
              color: '#1C241E',
            }}
          >
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '12px 10px',
            fontSize: '12px',
            fontWeight: activeTab === 'reviews' ? 700 : 500,
            color: activeTab === 'reviews' ? '#1B5E3B' : '#5E6961',
            borderBottom: activeTab === 'reviews' ? '2px solid #1B5E3B' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Review Moderation</span>
          {reportedReviews.length > 0 && (
            <span
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '10px',
                background: '#E76F51',
                color: '#FFF',
                fontWeight: 700,
              }}
            >
              {reportedReviews.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '12px 10px',
            fontSize: '12px',
            fontWeight: activeTab === 'audit' ? 700 : 500,
            color: activeTab === 'audit' ? '#1B5E3B' : '#5E6961',
            borderBottom: activeTab === 'audit' ? '2px solid #1B5E3B' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Platform Audit Trail
        </button>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* ================= VIEW 1: OVERVIEW & HEALTH ================= */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  background: '#FFF',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #E8E5D3',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#885E3C',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  <span>GROSS MERCHANDISE VALUE</span>
                  <DollarSign size={14} color="#1B5E3B" />
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#1B5E3B',
                    marginTop: '4px',
                  }}
                >
                  ₹{totalGMV.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
                  Platform 5% take: ₹{platformRevenue.toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  background: '#FFF',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #E8E5D3',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#885E3C',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  <span>REGISTERED SELLERS</span>
                  <Store size={14} color="#F2B705" />
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#1C241E',
                    marginTop: '4px',
                  }}
                >
                  {totalSellers}
                </div>
                <div
                  style={{
                    fontSize: '10px',
                    color: pendingSellers.length > 0 ? '#E76F51' : '#1B5E3B',
                    marginTop: '2px',
                    fontWeight: 600,
                  }}
                >
                  {pendingSellers.length} pending review
                </div>
              </div>

              <div
                style={{
                  background: '#FFF',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #E8E5D3',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#885E3C',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  <span>OPEN DISPUTES</span>
                  <Scale size={14} color="#E76F51" />
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: openDisputes.length > 0 ? '#E76F51' : '#1B5E3B',
                    marginTop: '4px',
                  }}
                >
                  {openDisputes.length}
                </div>
                <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
                  Require arbitration
                </div>
              </div>

              <div
                style={{
                  background: '#FFF',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #E8E5D3',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#885E3C',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  <span>REPORTED REVIEWS</span>
                  <MessageSquare size={14} color="#E76F51" />
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: reportedReviews.length > 0 ? '#E76F51' : '#1B5E3B',
                    marginTop: '4px',
                  }}
                >
                  {reportedReviews.length}
                </div>
                <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
                  Awaiting moderation
                </div>
              </div>
            </div>

            {/* Recharts GMV Graph */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8E5D3',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
                  Platform GMV & Commission Growth
                </h3>
                <span style={{ fontSize: '10px', color: '#885E3C' }}>Daily Platform Totals</span>
              </div>

              <div style={{ width: '100%', height: '170px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={platformTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="adminGMV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B5E3B" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1B5E3B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#885E3C' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#885E3C' }} />
                    <Tooltip
                      contentStyle={{
                        background: '#1C241E',
                        color: '#FFF',
                        borderRadius: '8px',
                        fontSize: '11px',
                        border: 'none',
                      }}
                      formatter={(val: any) => [`₹${Number(val || 0).toLocaleString()}`, '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="gmv"
                      stroke="#1B5E3B"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#adminGMV)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pending Seller Approvals */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8E5D3',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
                  Seller Verification Requests ({pendingSellers.length})
                </h3>
                <button
                  onClick={() => setAdminScreen('sellers')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1B5E3B',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View All Sellers →
                </button>
              </div>

              {pendingSellers.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#8E9991',
                    fontSize: '12px',
                  }}
                >
                  ✓ All registered sellers are currently verified and active!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pendingSellers.map((seller) => (
                    <div
                      key={seller.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px',
                        background: '#FAF9F0',
                        borderRadius: '10px',
                        border: '1px solid #E8E5D3',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={seller.avatar}
                          alt={seller.name}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>
                            {seller.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#885E3C' }}>
                            {seller.location} • {seller.type}
                          </div>
                          <div style={{ fontSize: '10px', color: '#5E6961', marginTop: '2px' }}>
                            {seller.verificationNotes || 'FSSAI License submitted'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() =>
                            verifySeller(
                              seller.id,
                              'verified',
                              'Approved by Administrator after document verification'
                            )
                          }
                          style={{
                            background: '#1B5E3B',
                            color: '#FFF',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            verifySeller(
                              seller.id,
                              'rejected',
                              'Missing clear trade license proof'
                            )
                          }
                          style={{
                            background: '#FFF',
                            color: '#E76F51',
                            border: '1px solid #E76F51',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dispute Resolution Queue */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8E5D3',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E', margin: 0 }}>
                  Customer-Seller Disputes ({openDisputes.length})
                </h3>
                <button
                  onClick={() => setAdminScreen('disputes')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#E76F51',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Dispute Center →
                </button>
              </div>

              {openDisputes.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#8E9991',
                    fontSize: '12px',
                  }}
                >
                  ✓ No active disputes right now. Community trust index is 99.4%!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {openDisputes.map((disp) => (
                    <div
                      key={disp.id}
                      style={{
                        background: '#FFF5F5',
                        border: '1px solid #FED7D7',
                        borderRadius: '10px',
                        padding: '10px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '4px',
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#C53030' }}>
                          #{disp.id}: {disp.subject}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            background: '#F8D7DA',
                            color: '#842029',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {disp.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#5E6961', marginBottom: '8px' }}>
                        Customer: {disp.customerName} vs Seller: {disp.vendorName}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#1C241E',
                          background: '#FFF',
                          padding: '6px',
                          borderRadius: '6px',
                          marginBottom: '8px',
                        }}
                      >
                        "{disp.customerStatement}"
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() =>
                            resolveDispute(
                              disp.id,
                              'Admin arbitrated in favor of customer: full refund authorized.',
                              'resolved',
                              'refund'
                            )
                          }
                          style={{
                            background: '#1B5E3B',
                            color: '#FFF',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Arbitrate: Refund Customer
                        </button>
                        <button
                          onClick={() =>
                            resolveDispute(
                              disp.id,
                              'Admin arbitrated in favor of seller: pickup fulfilled.',
                              'resolved',
                              'close'
                            )
                          }
                          style={{
                            background: '#FFF',
                            color: '#5E6961',
                            border: '1px solid #D0CDBB',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          Dismiss Claim
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links to other admin screens */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                onClick={() => setAdminScreen('sellers')}
                style={{
                  background: '#FAF9F0',
                  border: '1px solid #E8E5D3',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <Store size={18} color="#1B5E3B" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1C241E' }}>Sellers</div>
              </button>
              <button
                onClick={() => setAdminScreen('listings')}
                style={{
                  background: '#FAF9F0',
                  border: '1px solid #E8E5D3',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <AlertTriangle size={18} color="#F2B705" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1C241E' }}>Listings Mod</div>
              </button>
              <button
                onClick={() => setAdminScreen('banners')}
                style={{
                  background: '#FAF9F0',
                  border: '1px solid #E8E5D3',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                }}
              >
                <DollarSign size={18} color="#E76F51" style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1C241E' }}>Promotions</div>
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: ORDERS & PAYMENTS / REFUNDS ================= */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
                Orders & Financial Surveillance
              </h2>
              <p style={{ fontSize: '11px', color: '#5E6961', margin: '2px 0 0' }}>
                Monitor online transactions, COD settlements, fulfillment pipelines, and refunds.
              </p>
            </div>

            {/* Filter Controls */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E8E5D3',
                padding: '12px',
                marginBottom: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Search input */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#FAF9F0',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  border: '1px solid #E8E5D3',
                }}
              >
                <Search size={14} color="#885E3C" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Search by Order ID, Vendor, Payment ID, or Tracking Ref..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '12px',
                    width: '100%',
                    color: '#1C241E',
                  }}
                />
                {orderSearch && (
                  <button
                    onClick={() => setOrderSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#885E3C' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Dropdowns Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#885E3C', display: 'block', marginBottom: '2px' }}>
                    Payment Status
                  </label>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #E8E5D3',
                      fontSize: '11px',
                      background: '#FFF',
                      color: '#1C241E',
                    }}
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid (Online)</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#885E3C', display: 'block', marginBottom: '2px' }}>
                    Fulfillment Status
                  </label>
                  <select
                    value={fulfillmentFilter}
                    onChange={(e) => setFulfillmentFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #E8E5D3',
                      fontSize: '11px',
                      background: '#FFF',
                      color: '#1C241E',
                    }}
                  >
                    <option value="all">All Fulfillments</option>
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#885E3C', display: 'block', marginBottom: '2px' }}>
                    Refund Status
                  </label>
                  <select
                    value={refundFilter}
                    onChange={(e) => setRefundFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #E8E5D3',
                      fontSize: '11px',
                      background: '#FFF',
                      color: '#1C241E',
                    }}
                  >
                    <option value="all">All Refunds</option>
                    <option value="none">No Refund</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#8E9991', fontSize: '12px' }}>
                  No orders match the selected filters.
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E8E5D3',
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C241E' }}>
                          #{o.id}
                          {o.parentOrderId && (
                            <span style={{ fontSize: '10px', color: '#885E3C', marginLeft: '6px', fontWeight: 500 }}>
                              (Package of {o.parentOrderId})
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#5E6961' }}>
                          Vendor: <strong>{o.vendorName}</strong> • {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#1B5E3B' }}>
                          ₹{o.totalAmount}
                        </div>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            background:
                              o.status === 'delivered'
                                ? '#E8F5E9'
                                : o.status === 'cancelled'
                                ? '#FFEBEE'
                                : '#FFF8E1',
                            color:
                              o.status === 'delivered'
                                ? '#2E7D32'
                                : o.status === 'cancelled'
                                ? '#C62828'
                                : '#F57F17',
                          }}
                        >
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {/* Fulfillment */}
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: o.fulfillmentType === 'pickup' ? '#E1F5FE' : '#F3E5F5',
                          color: o.fulfillmentType === 'pickup' ? '#0277BD' : '#6A1B9A',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        {o.fulfillmentType === 'pickup' ? <Store size={10} /> : <Truck size={10} />}
                        {o.fulfillmentType === 'pickup' ? 'In-Store Pickup' : 'Home Delivery'}
                      </span>

                      {/* Payment Status */}
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background:
                            o.paymentStatus === 'paid'
                              ? '#E8F5E9'
                              : o.paymentStatus === 'failed'
                              ? '#FFEBEE'
                              : '#FFF3E0',
                          color:
                            o.paymentStatus === 'paid'
                              ? '#2E7D32'
                              : o.paymentStatus === 'failed'
                              ? '#C62828'
                              : '#E65100',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <CreditCard size={10} />
                        {o.paymentMethod.toUpperCase()}: {(o.paymentStatus || 'pending').toUpperCase()}
                      </span>

                      {/* Refund status badge */}
                      {o.refundStatus && o.refundStatus !== 'none' && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#FCE4EC',
                            color: '#C2185B',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <RotateCcw size={10} />
                          Refund: {o.refundStatus.toUpperCase()}
                        </span>
                      )}

                      {/* Tracking Ref */}
                      {o.trackingReference && (
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#FAF9F0',
                            border: '1px solid #E8E5D3',
                            color: '#5E6961',
                          }}
                        >
                          Tracking: {o.trackingReference}
                        </span>
                      )}
                    </div>

                    {/* Transaction Reference & Signatures info (strictly sanitized) */}
                    {o.paymentTransactionId && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '6px 8px',
                          background: '#FAF9F0',
                          borderRadius: '6px',
                          fontSize: '10px',
                          color: '#5E6961',
                          fontFamily: 'monospace',
                        }}
                      >
                        Gateway Ref: {o.paymentTransactionId}
                        {o.paymentGatewayOrderId && ` • Gateway Order: ${o.paymentGatewayOrderId}`}
                        {o.paymentSignature && ` • HMAC-Verified ✓`}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= VIEW 3: REVIEWS MODERATION QUEUE ================= */}
        {activeTab === 'reviews' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
                  Review Moderation Queue
                </h2>
                <p style={{ fontSize: '11px', color: '#5E6961', margin: '2px 0 0' }}>
                  Examine community reports regarding inappropriate or abusive product reviews.
                </p>
              </div>

              <button
                onClick={fetchReportedReviews}
                style={{
                  background: '#FAF9F0',
                  border: '1px solid #E8E5D3',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  color: '#1B5E3B',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {isLoadingReviews ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#8E9991', fontSize: '12px' }}>
                Loading reported reviews...
              </div>
            ) : reportedReviews.length === 0 ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E8E5D3',
                  padding: '30px',
                  textAlign: 'center',
                }}
              >
                <CheckCircle size={32} color="#1B5E3B" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E' }}>
                  No Pending Moderation Reports
                </div>
                <div style={{ fontSize: '11px', color: '#5E6961', marginTop: '4px' }}>
                  All customer reviews comply with marketplace guidelines.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reportedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #FED7D7',
                      padding: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C241E' }}>
                          Product: {rev.productName || rev.productId}
                        </div>
                        <div style={{ fontSize: '11px', color: '#5E6961' }}>
                          Author: <strong>{rev.customerName}</strong> • {new Date(rev.createdAt).toLocaleDateString()}
                          {rev.verifiedPurchase && (
                            <span style={{ color: '#1B5E3B', marginLeft: '6px', fontWeight: 600 }}>
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#F2B705' }}>
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>

                    {/* Reported reason highlight */}
                    <div
                      style={{
                        background: '#FFF5F5',
                        borderLeft: '3px solid #E76F51',
                        padding: '6px 10px',
                        borderRadius: '0 6px 6px 0',
                        marginBottom: '8px',
                        fontSize: '11px',
                        color: '#C53030',
                      }}
                    >
                      <strong>Reported Reason:</strong> {rev.reportReason || 'User flagged as inappropriate'}
                    </div>

                    {/* Review text */}
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#1C241E',
                        background: '#FAF9F0',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        fontStyle: 'italic',
                      }}
                    >
                      "{rev.comment}"
                    </div>

                    {/* Moderation Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => handleModerate(rev.id, 'dismiss')}
                        style={{
                          background: '#FFF',
                          border: '1px solid #D0CDBB',
                          color: '#5E6961',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Dismiss Report (Keep Visible)
                      </button>

                      <button
                        onClick={() => handleModerate(rev.id, 'hide')}
                        style={{
                          background: '#E76F51',
                          border: 'none',
                          color: '#FFF',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <X size={12} /> Hide Review (Remove from Store)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= VIEW 4: PLATFORM AUDIT TRAIL ================= */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
                  Administrative Audit Trail
                </h2>
                <p style={{ fontSize: '11px', color: '#5E6961', margin: '2px 0 0' }}>
                  Immutable record of privileged operations, refunds, and order status transitions.
                </p>
              </div>

              <button
                onClick={fetchAuditLogs}
                style={{
                  background: '#FAF9F0',
                  border: '1px solid #E8E5D3',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  color: '#1B5E3B',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {/* Audit Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#FFFFFF',
                borderRadius: '8px',
                padding: '6px 10px',
                border: '1px solid #E8E5D3',
                marginBottom: '10px',
              }}
            >
              <Search size={14} color="#885E3C" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search audit trail by actor, action, or target ID..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  width: '100%',
                  color: '#1C241E',
                }}
              />
              {auditSearch && (
                <button
                  onClick={() => setAuditSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#885E3C' }}
                >
                  ✕
                </button>
              )}
            </div>

            {isLoadingLogs ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#8E9991', fontSize: '12px' }}>
                Loading audit trail...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#8E9991', fontSize: '12px' }}>
                No audit entries found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E8E5D3',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#1B5E3B',
                          fontFamily: 'monospace',
                        }}
                      >
                        {log.action}
                      </span>
                      <span style={{ fontSize: '10px', color: '#885E3C' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#1C241E', marginBottom: '4px' }}>
                      {log.details}
                    </div>

                    <div style={{ fontSize: '10px', color: '#5E6961' }}>
                      Actor: <strong>{log.actorName}</strong> ({log.actorRole.toUpperCase()}) • Target: {log.targetType} {log.targetId ? `(#${log.targetId})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AdminNav />
    </div>
  );
};
