import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Store,
  Shield,
  ShoppingBag,
  Bike,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Database,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Globe,
  AlertCircle,
  Wheat,
} from 'lucide-react';
import { UserRole } from '../types';

export const LoginScreen: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    setActiveRole,
    setCustomerScreen,
    setSellerScreen,
    setAdminScreen,
    showToast,
    language,
    setLanguage,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Malleshwaram');
  const [shopName, setShopName] = useState('');
  const [speciality, setSpeciality] = useState('Fresh Organic Vegetables');

  // State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Fetch live database status
  const loadDbStatus = async () => {
    try {
      setDbLoading(true);
      const res = await api.auth.getDbStatus();
      if (res.database) {
        setDbStatus(res.database);
      }
    } catch (e) {
      console.error('Failed to query DB status:', e);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    loadDbStatus();
  }, []);

  const handleLogin = async (loginEmail?: string, loginPass?: string, forcedRole?: UserRole) => {
    const targetEmail = loginEmail || email;
    const targetPass = loginPass || password;

    if (!targetEmail || !targetPass) {
      setErrorMsg(language === 'kn' ? 'ದಯವಿಟ್ಟು ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ' : 'Please enter email and password');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.auth.login(targetEmail, targetPass);
      if (res.user) {
        setCurrentUser(res.user);
        const roleToSet = forcedRole || res.user.role;
        setActiveRole(roleToSet);

        showToast(
          language === 'kn'
            ? `ಸ್ವಾಗತ ${res.user.name}! ಡೇಟಾಬೇಸ್ ಪರಿಶೀಲನೆ ಯಶಸ್ವಿ.`
            : `Welcome back, ${res.user.name}! Database verified.`,
          'success'
        );

        // Route to respective screen
        if (roleToSet === 'seller') {
          setSellerScreen('dashboard');
        } else if (roleToSet === 'admin') {
          setAdminScreen('dashboard');
        } else if (roleToSet === 'rider') {
          // Handled by activeRole === 'rider'
        } else {
          setCustomerScreen('home');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials or database connection issue');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Name, email, and password are required');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.auth.register({
        name,
        email,
        password,
        role: selectedRole,
        phone: phone || '+91 98450 11223',
        locality,
        city: 'Bengaluru',
        pincode: '560003',
        shopName: selectedRole === 'seller' ? shopName || `${name}'s Fresh Santhe Store` : undefined,
        speciality: selectedRole === 'seller' ? speciality : undefined,
      });

      if (res.user) {
        setCurrentUser(res.user);
        setActiveRole(res.user.role);
        showToast(
          language === 'kn'
            ? 'ಖಾತೆ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ರಚನೆಯಾಗಿದೆ!'
            : 'Account registered and saved into database!',
          'success'
        );

        if (res.user.role === 'seller') {
          setSellerScreen('dashboard');
        } else {
          setCustomerScreen('home');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        minHeight: '100%',
        background: '#F8F7ED',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowY: 'auto',
      }}
    >
      {/* Top Background Artwork & Brand Header */}
      <div
        style={{
          position: 'relative',
          height: '180px',
          width: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1B5E3B 0%, #2A7E4F 100%)',
        }}
      >
        <img
          src="/images/v0/santhe_market_art.png"
          alt="Karnataka Santhe"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.28,
            mixBlendMode: 'overlay',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/v0/hero_banner.png';
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(27,94,59,0.4) 0%, rgba(27,94,59,0.85) 75%, #F8F7ED 100%)',
          }}
        />

        {/* Top Controls: Language Switch & Skip/Guest */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Globe size={13} />
            <span>{language === 'kn' ? 'English' : 'ಕನ್ನಡ'}</span>
          </button>

          <button
            type="button"
            id="login-skip-to-santhe-btn"
            onClick={() => setCustomerScreen('home')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{language === 'kn' ? 'ನೇರ ಸಂತೆ ವೀಕ್ಷಿಸಿ' : 'Browse as Guest'}</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Brand Logo & Name Center */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              padding: '6px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
              border: '2px solid #F2B705',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '6px',
            }}
          >
            <img
              src="/logo.png"
              alt="Namma Santhe Logo"
              style={{ width: '42px', height: '42px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#1C241E',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Namma Santhe</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1B5E3B' }}>• ನಮ್ಮ ಸಂತೆ</span>
          </h1>
          <p style={{ fontSize: '11px', color: '#5E6961', margin: '2px 0 0' }}>
            {language === 'kn'
              ? 'ಕರ್ನಾಟಕದ ಅಧಿಕೃತ ಹೈಪರ್‌ಲೋಕಲ್ ಮಾರುಕಟ್ಟೆ ಮತ್ತು ದೃಢೀಕೃತ ಲಾಗಿನ್'
              : 'Karnataka Hyperlocal Marketplace • Direct Farmer Portal'}
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {/* Real-time Database Status Box */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '12px 14px',
            border: '1px solid #D0CDBB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#28A745',
                  boxShadow: '0 0 6px #28A745',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#1B5E3B' }}>
                {language === 'kn' ? 'ಡೇಟಾಬೇಸ್ ಸಕ್ರಿಯವಾಗಿದೆ (Live DB)' : 'Connected Database Included'}
              </span>
            </div>
            <button
              type="button"
              onClick={loadDbStatus}
              title="Refresh DB Status"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#5E6961',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RefreshCw size={12} className={dbLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div style={{ fontSize: '10.5px', color: '#5E6961', lineHeight: 1.4 }}>
            Storage: <code style={{ color: '#885E3C', fontWeight: 600 }}>server/data/db.json</code> (REST API +
            bcrypt)
          </div>

          {/* Database Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              marginTop: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ background: '#F8F7ED', padding: '6px 4px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1B5E3B' }}>
                {dbStatus?.stats?.usersCount || 7}
              </div>
              <div style={{ fontSize: '9px', color: '#5E6961', fontWeight: 600 }}>Users</div>
            </div>
            <div style={{ background: '#F8F7ED', padding: '6px 4px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#885E3C' }}>
                {dbStatus?.stats?.shopsCount || 5}
              </div>
              <div style={{ fontSize: '9px', color: '#5E6961', fontWeight: 600 }}>Shops</div>
            </div>
            <div style={{ background: '#F8F7ED', padding: '6px 4px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#E76F51' }}>
                {dbStatus?.stats?.productsCount || 7}
              </div>
              <div style={{ fontSize: '9px', color: '#5E6961', fontWeight: 600 }}>Products</div>
            </div>
            <div style={{ background: '#F8F7ED', padding: '6px 4px', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#2A9D8F' }}>
                {dbStatus?.stats?.ordersCount || 4}
              </div>
              <div style={{ fontSize: '9px', color: '#5E6961', fontWeight: 600 }}>Orders</div>
            </div>
          </div>
        </div>

        {/* 1-Click Fast Demo Logins for All 4 Roles */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '12px 14px',
            border: '1px solid #D0CDBB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#885E3C',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={13} color="#F2B705" />
            <span>
              {language === 'kn' ? '೧-ಕ್ಲಿಕ್ ಡೆಮೊ ಲಾಗಿನ್ (೪ ಪಾತ್ರಗಳು)' : '1-Click Quick Demo Accounts (Database-Backed)'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {/* Customer */}
            <button
              type="button"
              id="quick-login-customer-btn"
              onClick={() => handleLogin('customer@nammasanthe.com', 'pass123', 'customer')}
              disabled={loading}
              style={{
                background: '#F0F9F4',
                border: '1.5px solid #1B5E3B',
                borderRadius: '10px',
                padding: '8px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShoppingBag size={14} color="#1B5E3B" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#1B5E3B' }}>Customer</span>
              </div>
              <span style={{ fontSize: '10px', color: '#1C241E', fontWeight: 600 }}>Priya Sharma</span>
              <span style={{ fontSize: '9px', color: '#5E6961' }}>customer@nammasanthe.com</span>
            </button>

            {/* Seller */}
            <button
              type="button"
              id="quick-login-seller-btn"
              onClick={() => handleLogin('ravi@organicfarms.com', 'pass123', 'seller')}
              disabled={loading}
              style={{
                background: '#FEF9EE',
                border: '1.5px solid #F2B705',
                borderRadius: '10px',
                padding: '8px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Wheat size={14} color="#8A6800" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#8A6800' }}>Seller / Farmer</span>
              </div>
              <span style={{ fontSize: '10px', color: '#1C241E', fontWeight: 600 }}>Ravi Organic Farms</span>
              <span style={{ fontSize: '9px', color: '#5E6961' }}>ravi@organicfarms.com</span>
            </button>

            {/* Admin */}
            <button
              type="button"
              id="quick-login-admin-btn"
              onClick={() => handleLogin('admin@nammasanthe.com', 'admin123', 'admin')}
              disabled={loading}
              style={{
                background: '#FDF4F2',
                border: '1.5px solid #E76F51',
                borderRadius: '10px',
                padding: '8px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Shield size={14} color="#E76F51" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#E76F51' }}>Admin Controller</span>
              </div>
              <span style={{ fontSize: '10px', color: '#1C241E', fontWeight: 600 }}>Santhe Admin</span>
              <span style={{ fontSize: '9px', color: '#5E6961' }}>admin@nammasanthe.com</span>
            </button>

            {/* Rider */}
            <button
              type="button"
              id="quick-login-rider-btn"
              onClick={() => handleLogin('rider@nammasanthe.com', 'pass123', 'rider')}
              disabled={loading}
              style={{
                background: '#EFF8F7',
                border: '1.5px solid #2A9D8F',
                borderRadius: '10px',
                padding: '8px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Bike size={14} color="#2A9D8F" />
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#2A9D8F' }}>Delivery Rider</span>
              </div>
              <span style={{ fontSize: '10px', color: '#1C241E', fontWeight: 600 }}>Basavaraju M (EV)</span>
              <span style={{ fontSize: '9px', color: '#5E6961' }}>rider@nammasanthe.com</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div
          style={{
            display: 'flex',
            background: '#ECE9D8',
            borderRadius: '10px',
            padding: '4px',
            border: '1px solid #DDD8C4',
          }}
        >
          <button
            type="button"
            id="login-tab-signin-btn"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              background: mode === 'login' ? '#FFFFFF' : 'transparent',
              color: mode === 'login' ? '#1B5E3B' : '#5E6961',
              boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
            }}
          >
            {language === 'kn' ? 'ಸೈನ್ ಇನ್ (Sign In)' : 'Sign In'}
          </button>
          <button
            type="button"
            id="login-tab-register-btn"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              background: mode === 'register' ? '#FFFFFF' : 'transparent',
              color: mode === 'register' ? '#1B5E3B' : '#5E6961',
              boxShadow: mode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
            }}
          >
            {language === 'kn' ? 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ (Register)' : 'New Account (Register)'}
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div
            style={{
              background: '#FDF2F2',
              border: '1px solid #F5C6CB',
              color: '#721C24',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={15} color="#721C24" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM CONTAINER */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #E8E5D3',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          {mode === 'login' ? (
            /* Sign In Form */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#1C241E',
                    marginBottom: '5px',
                  }}
                >
                  {language === 'kn' ? 'ಇಮೇಲ್ ವಿಳಾಸ' : 'Email Address'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={15}
                    color="#885E3C"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="email"
                    id="login-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@nammasanthe.com"
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '10px',
                      border: '1px solid #D0CDBB',
                      fontSize: '13px',
                      color: '#1C241E',
                      background: '#FDFDF9',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#1C241E',
                    marginBottom: '5px',
                  }}
                >
                  {language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್' : 'Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={15}
                    color="#885E3C"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 40px 10px 36px',
                      borderRadius: '10px',
                      border: '1px solid #D0CDBB',
                      fontSize: '13px',
                      color: '#1C241E',
                      background: '#FDFDF9',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#5E6961',
                      padding: '2px',
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #1B5E3B 0%, #2A7E4F 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px',
                  boxShadow: '0 4px 12px rgba(27,94,59,0.25)',
                }}
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <>
                    <Database size={16} />
                    <span>
                      {language === 'kn' ? 'ಡೇಟಾಬೇಸ್ ಸೈನ್ ಇನ್' : 'Sign In with Database Authentication'}
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#1C241E',
                    marginBottom: '5px',
                  }}
                >
                  {language === 'kn' ? 'ಖಾತೆ ಪ್ರಕಾರ' : 'Register Account As'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('customer')}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: selectedRole === 'customer' ? '2px solid #1B5E3B' : '1px solid #D0CDBB',
                      background: selectedRole === 'customer' ? '#F0F9F4' : '#FFFFFF',
                      color: selectedRole === 'customer' ? '#1B5E3B' : '#5E6961',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    🛍️ Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: selectedRole === 'seller' ? '2px solid #F2B705' : '1px solid #D0CDBB',
                      background: selectedRole === 'seller' ? '#FEF9EE' : '#FFFFFF',
                      color: selectedRole === 'seller' ? '#8A6800' : '#5E6961',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    🌾 Seller / Farmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('rider')}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: selectedRole === 'rider' ? '2px solid #2A9D8F' : '1px solid #D0CDBB',
                      background: selectedRole === 'rider' ? '#EFF8F7' : '#FFFFFF',
                      color: selectedRole === 'rider' ? '#2A9D8F' : '#5E6961',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    🛵 Rider Partner
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#1C241E',
                    marginBottom: '4px',
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={15}
                    color="#885E3C"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    id="register-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '10px',
                      border: '1px solid #D0CDBB',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#1C241E',
                    marginBottom: '4px',
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={15}
                    color="#885E3C"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="email"
                    id="register-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '10px',
                      border: '1px solid #D0CDBB',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#1C241E',
                    marginBottom: '4px',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={15}
                    color="#885E3C"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="password"
                    id="register-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '10px',
                      border: '1px solid #D0CDBB',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#1C241E',
                      marginBottom: '4px',
                    }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #D0CDBB',
                      fontSize: '12px',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#1C241E',
                      marginBottom: '4px',
                    }}
                  >
                    Locality / Hub
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #D0CDBB',
                      fontSize: '12px',
                      background: '#FFF',
                    }}
                  >
                    <option value="Malleshwaram">Malleshwaram</option>
                    <option value="Devanahalli">Devanahalli</option>
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="Jayanagar">Jayanagar</option>
                    <option value="Basavanagudi">Basavanagudi</option>
                    <option value="Kolar Farm Hub">Kolar Farm Hub</option>
                  </select>
                </div>
              </div>

              {/* Extra seller fields */}
              {selectedRole === 'seller' && (
                <div
                  style={{
                    background: '#FEF9EE',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #F2B705',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#8A6800' }}>
                    🌾 Store / Farm Details (Saved to Database)
                  </div>
                  <div>
                    <label style={{ fontSize: '10.5px', color: '#1C241E', display: 'block', marginBottom: '2px' }}>
                      Shop or Co-op Farm Name
                    </label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Kaveri Organic Greens"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #D0CDBB',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10.5px', color: '#1C241E', display: 'block', marginBottom: '2px' }}>
                      Produce Speciality
                    </label>
                    <input
                      type="text"
                      value={speciality}
                      onChange={(e) => setSpeciality(e.target.value)}
                      placeholder="e.g. Desi Grains & Country Eggs"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #D0CDBB',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                id="register-submit-btn"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #1B5E3B 0%, #2A7E4F 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <>
                    <Database size={16} />
                    <span>
                      {language === 'kn' ? 'ಖಾತೆ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸೇರಿಸಿ' : 'Save New Account to Database'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security / Fair Community Note */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#5E6961', paddingBottom: '16px' }}>
          🔒 Passwords securely salted & hashed with bcrypt • Stored in local JSON document DB.
        </div>
      </div>
    </div>
  );
};
