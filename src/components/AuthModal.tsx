import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { X, User, Lock, Mail, Phone, MapPin, Store, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    setCurrentUser,
    setActiveRole,
    setCustomerScreen,
    setSellerScreen,
    setAdminScreen,
    showToast,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Malleshwaram');
  const [shopName, setShopName] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await api.auth.login(email, password);
        if (res.user) {
          setCurrentUser(res.user);
          setActiveRole(res.user.role);
          if (res.user.role === 'customer') setCustomerScreen('home');
          else if (res.user.role === 'seller') setSellerScreen('dashboard');
          else if (res.user.role === 'admin') setAdminScreen('dashboard');

          showToast(`Welcome back, ${res.user.name}!`, 'success');
          setIsAuthModalOpen(false);
        }
      } else {
        const res = await api.auth.register({
          name,
          email,
          password,
          role,
          phone,
          locality,
          city: 'Bengaluru',
          pincode: '560003',
          shopName,
          speciality,
        });

        if (res.user) {
          setCurrentUser(res.user);
          setActiveRole(res.user.role);
          if (res.user.role === 'seller') setSellerScreen('dashboard');
          else setCustomerScreen('home');

          showToast('Account created successfully!', 'success');
          setIsAuthModalOpen(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string, demoPass: string, demoRole: UserRole) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.auth.login(demoEmail, demoPass);
      if (res.user) {
        setCurrentUser(res.user);
        setActiveRole(demoRole);
        if (demoRole === 'customer') setCustomerScreen('home');
        else if (demoRole === 'seller') setSellerScreen('dashboard');
        else if (demoRole === 'admin') setAdminScreen('dashboard');

        showToast(`Logged in as ${res.user.name} (${demoRole.toUpperCase()})`, 'success');
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      <div
        className="auth-modal-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          padding: '24px',
          position: 'relative',
          border: '1px solid #E8E5D3',
        }}
      >
        <button
          onClick={() => setIsAuthModalOpen(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F4F1E8',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} color="#5E6961" />
        </button>

        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(27,94,59,0.08)', padding: '6px 14px', borderRadius: '30px', color: '#1B5E3B', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
            <Store size={16} />
            <span>Namma Santhe • ನಮ್ಮ ಸಂತೆ</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1C241E', margin: '4px 0' }}>
            {authModalMode === 'login' ? 'Welcome Back!' : 'Join Namma Santhe'}
          </h2>
          <p style={{ fontSize: '13px', color: '#5E6961' }}>
            {authModalMode === 'login'
              ? 'Access your storefront, orders, and neighborhood marketplace'
              : 'Create your digital storefront or customer shopping account'}
          </p>
        </div>

        {/* Quick Demo Fast Login Pills */}
        <div style={{ marginBottom: '20px', background: '#F8F7ED', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#885E3C', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={13} color="#1B5E3B" /> Quick 1-Click Demo Accounts:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('customer@nammasanthe.com', 'pass123', 'customer')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #1B5E3B',
                color: '#1B5E3B',
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              🛍️ Customer<br /><span style={{ fontSize: '9px', fontWeight: 400 }}>Priya S.</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ravi@organicfarms.com', 'pass123', 'seller')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #F2B705',
                color: '#8A6800',
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              🌾 Seller<br /><span style={{ fontSize: '9px', fontWeight: 400 }}>Ravi Farms</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@nammasanthe.com', 'admin123', 'admin')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E76F51',
                color: '#C65337',
                padding: '6px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              🛡️ Admin<br /><span style={{ fontSize: '9px', fontWeight: 400 }}>Controller</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: '#F0EFE6', borderRadius: '10px', padding: '4px', marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => { setAuthModalMode('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: authModalMode === 'login' ? '#FFFFFF' : 'transparent',
              color: authModalMode === 'login' ? '#1B5E3B' : '#5E6961',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: authModalMode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalMode('register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '8px',
              background: authModalMode === 'register' ? '#FFFFFF' : 'transparent',
              color: authModalMode === 'register' ? '#1B5E3B' : '#5E6961',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: authModalMode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#FDE8E8', color: '#9B1C1C', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {authModalMode === 'register' && (
            <>
              {/* Role Picker */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C241E', marginBottom: '6px' }}>
                  Register As:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: role === 'customer' ? '2px solid #1B5E3B' : '1px solid #D0CDBB',
                      background: role === 'customer' ? 'rgba(27,94,59,0.08)' : '#FFF',
                      color: role === 'customer' ? '#1B5E3B' : '#5E6961',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: role === 'seller' ? '2px solid #F2B705' : '1px solid #D0CDBB',
                      background: role === 'seller' ? 'rgba(242,183,5,0.12)' : '#FFF',
                      color: role === 'seller' ? '#8A6800' : '#5E6961',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Local Store / Farmer
                  </button>
                </div>
              </div>

              {/* Name */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C241E', marginBottom: '4px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#8E9991' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #D0CDBB',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Seller shop fields */}
              {role === 'seller' && (
                <div style={{ background: '#FAF9F0', padding: '10px', borderRadius: '8px', border: '1px solid #E8E5D3', marginBottom: '12px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#1C241E', marginBottom: '2px' }}>
                      Store / Farm Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Kaveri Organic Stalls"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #D0CDBB',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#1C241E', marginBottom: '2px' }}>
                      Primary Speciality
                    </label>
                    <input
                      type="text"
                      value={speciality}
                      onChange={(e) => setSpeciality(e.target.value)}
                      placeholder="e.g. Chemical-Free Greens & Cold-Pressed Oils"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #D0CDBB',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C241E', marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#8E9991' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid #D0CDBB',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1C241E', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#8E9991' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid #D0CDBB',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: '#1B5E3B',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(27,94,59,0.25)',
            }}
          >
            {loading ? 'Please wait...' : authModalMode === 'login' ? 'Sign In to Account' : 'Create Free Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};
