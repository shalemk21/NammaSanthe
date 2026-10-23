import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminNav } from './AdminNav';
import { api } from '../../services/api';
import { Megaphone, Plus, CheckCircle, Percent, Shield, Image } from 'lucide-react';
import { PromotionalBanner } from '../../types';

export const AdminBannersScreen: React.FC = () => {
  const { showToast } = useApp();
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadge, setNewBadge] = useState('Featured Promotion');
  const [newImage, setNewImage] = useState('');

  // Policy Settings
  const [commissionRate, setCommissionRate] = useState(5.0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(300);
  const [ecoPackagingFee, setEcoPackagingFee] = useState(5);

  useEffect(() => {
    api.admin.getBanners().then((res) => {
      if (res.banners) setBanners(res.banners);
    }).catch(() => {});
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newImage) return;

    try {
      const res = await api.admin.createBanner({
        title: newTitle,
        subtitle: newSubtitle,
        badge: newBadge,
        image: newImage,
        active: true,
      });

      if (res.banner) {
        setBanners((prev) => [...prev, res.banner]);
        showToast('Banner created and published!', 'success');
        setIsAddOpen(false);
        setNewTitle('');
        setNewSubtitle('');
        setNewImage('');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create banner', 'error');
    }
  };

  const handleToggleBanner = async (id: string, current: boolean) => {
    try {
      await api.admin.updateBanner(id, { active: !current });
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, active: !current } : b))
      );
      showToast('Banner visibility toggled', 'info');
    } catch (err: any) {
      showToast('Failed to update banner', 'error');
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '90px' }}>
      <div style={{ background: '#FFF', padding: '16px', borderBottom: '1px solid #E8E5D3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
            Marketplace Policies & Promotions
          </h1>
          <p style={{ fontSize: '11px', color: '#5E6961', margin: '2px 0 0' }}>
            Curate hero festival banners and configure platform commission fees
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          style={{
            background: '#1B5E3B',
            color: '#FFF',
            border: 'none',
            padding: '7px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Plus size={14} />
          <span>New Banner</span>
        </button>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Marketplace Policy Controls */}
        <div style={{ background: '#FAF9F0', border: '1px solid #E8E5D3', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#885E3C', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Percent size={15} />
            <span>Platform Economics & Fee Policy</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#5E6961', marginBottom: '3px' }}>
                Seller Commission (%)
              </label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#5E6961', marginBottom: '3px' }}>
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#5E6961', marginBottom: '3px' }}>
                Eco Packaging Fee (₹)
              </label>
              <input
                type="number"
                value={ecoPackagingFee}
                onChange={(e) => setEcoPackagingFee(Number(e.target.value))}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Banners List */}
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', margin: '0 0 10px 0' }}>
          Active Promotional Banners
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {banners.map((b) => (
            <div
              key={b.id}
              style={{
                background: '#FFF',
                borderRadius: '12px',
                border: '1px solid #E8E5D3',
                overflow: 'hidden',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ position: 'relative', height: '110px' }}>
                <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(27,94,59,0.9)',
                    color: '#FFF',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {b.badge}
                </span>
                <button
                  onClick={() => handleToggleBanner(b.id, b.active)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: b.active ? '#1B5E3B' : '#8E9991',
                    color: '#FFF',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ● {b.active ? 'Active' : 'Hidden'}
                </button>
              </div>

              <div style={{ padding: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C241E' }}>{b.title}</div>
                <div style={{ fontSize: '11px', color: '#5E6961' }}>{b.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Banner Modal */}
      {isAddOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1C241E', margin: '0 0 12px 0' }}>
              Create Promotional Banner
            </h3>
            <form onSubmit={handleCreateBanner}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#1C241E', marginBottom: '3px' }}>Banner Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dasara Heritage Craft Festival"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#1C241E', marginBottom: '3px' }}>Subtitle / Promo Offer</label>
                <input
                  type="text"
                  placeholder="e.g. Direct from Mysore potters • Up to 25% Off"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#1C241E', marginBottom: '3px' }}>Image URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D0CDBB', fontSize: '12px', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setNewImage('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&auto=format&fit=crop&q=80')}
                  style={{ marginTop: '4px', background: 'none', border: 'none', color: '#1B5E3B', fontSize: '10px', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Use sample artisan festival photo
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, background: '#1B5E3B', color: '#FFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  Publish Banner
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  style={{ background: '#F0EFE6', color: '#5E6961', border: 'none', padding: '10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminNav />
    </div>
  );
};
