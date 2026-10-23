import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Leaf, ShieldCheck, HeartHandshake } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { setCustomerScreen, setActiveRole, language } = useApp();

  return (
    <div
      className="fade-in"
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#F8F7ED',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Banner Artwork */}
      <div style={{ position: 'relative', width: '100%', height: '360px', overflow: 'hidden' }}>
        <img
          src="/assets/hero.jpg"
          alt="Karnataka Village Santhe Illustration"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(27,94,59,0.2) 0%, rgba(248,247,237,0.4) 60%, #F8F7ED 100%)',
          }}
        />
        {/* Floating Brand Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#FFFFFF',
            padding: '8px',
            borderRadius: '26px',
            boxShadow: '0 8px 24px rgba(27,94,59,0.18)',
            border: '2px solid #F2B705',
          }}
        >
          <img
            src="/assets/logo.jpg"
            alt="Namma Santhe Logo"
            style={{ width: '82px', height: '82px', borderRadius: '20px', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Content Section */}
      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          flex: 1,
        }}
      >
        <span
          className="badge-turmeric"
          style={{ marginBottom: '8px', letterSpacing: '0.04em' }}
        >
          {language === 'kn' ? 'ಕರ್ನಾಟಕದ ಹೆಮ್ಮೆಯ ಸಂತೆ' : 'KARNATAKA HYPERLOCAL MARKET'}
        </span>

        <h1
          style={{
            fontSize: '30px',
            color: '#1B5E3B',
            lineHeight: 1.2,
            marginBottom: '8px',
          }}
        >
          Namma Santhe
        </h1>

        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#885E3C',
            marginBottom: '6px',
          }}
        >
          Local Shops • Fresh Produce • Stronger Communities
        </p>

        <p
          style={{
            fontSize: '12px',
            color: '#5E6961',
            maxWidth: '310px',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          {language === 'kn'
            ? 'ನಮ್ಮ ನೆಲದ ರೈತರು, ಕುಶಲಕರ್ಮಿಗಳು ಮತ್ತು ಸಣ್ಣ ವ್ಯಾಪಾರಿಗಳಿಂದ ನೇರವಾಗಿ ನಿಮ್ಮ ಮನೆಬಾಗಿಲಿಗೆ ತಾಜಾ ಉತ್ಪನ್ನಗಳು.'
            : 'Connecting Karnataka farmers, weavers, and small-town vendors directly with your kitchen table.'}
        </p>

        {/* Feature Highlights Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#FFFFFF',
              border: '1px solid #E8E5D3',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#1B5E3B',
            }}
          >
            <Leaf size={12} color="#1B5E3B" />
            <span>Farm Harvested Today</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#FFFFFF',
              border: '1px solid #E8E5D3',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#885E3C',
            }}
          >
            <ShieldCheck size={12} color="#885E3C" />
            <span>100% Chemical-Free</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#FFFFFF',
              border: '1px solid #E8E5D3',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#E76F51',
            }}
          >
            <HeartHandshake size={12} color="#E76F51" />
            <span>Direct Co-op Fair Price</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            id="splash-get-started-btn"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            onClick={() => setCustomerScreen('home')}
          >
            <span>{language === 'kn' ? 'ಪ್ರಾರಂಭಿಸಿ (Get Started)' : 'Get Started'}</span>
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            id="splash-vendor-login-btn"
            className="btn-outline"
            style={{ width: '100%', padding: '11px', fontSize: '13px' }}
            onClick={() => {
              setActiveRole('seller');
            }}
          >
            <span>{language === 'kn' ? 'ರೈತರು/ಮಾರಾಟಗಾರರ ಲಾಗಿನ್' : 'Vendor & Farmer Partner Login'}</span>
          </button>
        </div>

        <div style={{ marginTop: '16px', fontSize: '11px', color: '#8E9991' }}>
          By continuing, you agree to support fair community trade across Karnataka.
        </div>
      </div>
    </div>
  );
};
