import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Star,
  RotateCcw,
  ShoppingBag,
  Scale,
  Search,
  Truck,
  CheckCircle,
} from 'lucide-react';
import { Product, Shop, Review } from '../types';

export const ShopProfileScreen: React.FC = () => {
  const {
    selectedShop,
    setSelectedShop,
    setSelectedProduct,
    setCustomerScreen,
    addToCart,
    addToComparison,
    comparisonList,
    language,
    selectedLocality,
  } = useApp();

  const [shopDetails, setShopDetails] = useState<Shop | null>(selectedShop);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [shopReviews, setShopReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'reviews'>('products');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (selectedShop) {
      api.shops
        .getShopById(selectedShop.id)
        .then((res) => {
          if (res.success) {
            setShopDetails(res.shop);
            setShopProducts(res.products);
            setShopReviews(res.reviews);
          }
        })
        .catch(() => {
          // Keep current selected shop
        });
    }
  }, [selectedShop]);

  if (!shopDetails) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>No shop selected.</p>
        <button onClick={() => setCustomerScreen('home')}>Return to Marketplace</button>
      </div>
    );
  }

  const filteredProducts = shopProducts.filter((p) =>
    searchFilter ? p.name.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  return (
    <div className="shop-profile-screen" style={{ paddingBottom: '80px' }}>
      {/* Cover Banner */}
      <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden' }}>
        <img
          src={shopDetails.coverImage}
          alt={shopDetails.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />

        {/* Back button */}
        <button
          onClick={() => setCustomerScreen('home')}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <ArrowLeft size={18} color="#1C241E" />
        </button>
      </div>

      {/* Store Header Card */}
      <div style={{ padding: '0 16px', marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px', border: '1px solid #E8E5D3', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <img
              src={shopDetails.avatar}
              alt={shopDetails.name}
              style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover', border: '2px solid #FFF', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1C241E', margin: 0 }}>
                  {shopDetails.name}
                </h1>
                {shopDetails.verificationStatus === 'verified' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#D1E7DD', color: '#0F5132', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                    <ShieldCheck size={12} />
                    Verified Local Seller
                  </span>
                )}
              </div>

              {shopDetails.kannadaName && (
                <div style={{ fontSize: '12px', color: '#885E3C', marginTop: '2px' }}>
                  {shopDetails.kannadaName}
                </div>
              )}

              <div style={{ fontSize: '12px', color: '#5E6961', marginTop: '4px' }}>
                {shopDetails.speciality}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F0EEE4', textAlign: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 700, fontSize: '14px', color: '#1B5E3B' }}>
                <Star size={14} fill="#F2B705" color="#F2B705" />
                <span>{shopDetails.rating || 4.9}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#5E6961' }}>{shopDetails.reviewsCount || 120}+ reviews</div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#885E3C' }}>
                {shopDetails.distanceKm || 1.8} km
              </div>
              <div style={{ fontSize: '10px', color: '#5E6961' }}>From {selectedLocality}</div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: shopDetails.openStatus ? '#1B5E3B' : '#E76F51' }}>
                {shopDetails.openStatus ? 'Open Now' : 'Closed'}
              </div>
              <div style={{ fontSize: '10px', color: '#5E6961' }}>{shopDetails.operatingHours?.split('(')[0] || 'Daily'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E8E5D3', margin: '16px 16px 0', background: '#F8F7ED', borderRadius: '10px', padding: '3px' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '8px',
            background: activeTab === 'products' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'products' ? '#1B5E3B' : '#5E6961',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Catalog ({shopProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('about')}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '8px',
            background: activeTab === 'about' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'about' ? '#1B5E3B' : '#5E6961',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Shop Info & Policies
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            flex: 1,
            padding: '8px',
            border: 'none',
            borderRadius: '8px',
            background: activeTab === 'reviews' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'reviews' ? '#1B5E3B' : '#5E6961',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Reviews ({shopReviews.length})
        </button>
      </div>

      {/* Tab: Products */}
      {activeTab === 'products' && (
        <div style={{ padding: '16px' }}>
          {/* Search inside shop */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#5E6961' }} />
            <input
              type="text"
              placeholder={`Search products from ${shopDetails.name}...`}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #D0CDBB',
                fontSize: '12px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E8E5D3',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ position: 'relative', height: '110px', width: '100%' }}>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {prod.isOrganic && (
                    <span style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(27,94,59,0.9)', color: '#FFF', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                      Organic
                    </span>
                  )}
                </div>

                <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4
                      onClick={() => {
                        setSelectedProduct(prod);
                        setCustomerScreen('detail');
                      }}
                      style={{ fontSize: '12px', fontWeight: 700, color: '#1C241E', margin: '0 0 2px 0', cursor: 'pointer', lineHeight: '1.2' }}
                    >
                      {prod.name}
                    </h4>
                    <div style={{ fontSize: '10px', color: '#885E3C' }}>
                      {prod.kannadaName}
                    </div>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#1B5E3B' }}>₹{prod.price}</span>
                      <span style={{ fontSize: '10px', color: '#5E6961' }}>/{prod.unit}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                      <button
                        onClick={() => addToCart(prod, 1)}
                        style={{
                          flex: 1,
                          background: '#1B5E3B',
                          color: '#FFF',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        <ShoppingBag size={12} />
                        <span>Add</span>
                      </button>

                      <button
                        onClick={() => addToComparison(prod)}
                        title="Add to comparison"
                        style={{
                          background: '#F0EFE6',
                          color: '#5E6961',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Scale size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: About & Policies */}
      {activeTab === 'about' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Location & Contact */}
          <div style={{ background: '#FFF', padding: '14px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', marginBottom: '10px' }}>
              Store Location & Contact
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5E6961', marginBottom: '6px' }}>
              <MapPin size={15} color="#1B5E3B" />
              <span>{shopDetails.location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5E6961', marginBottom: '6px' }}>
              <Phone size={15} color="#1B5E3B" />
              <span>{shopDetails.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5E6961' }}>
              <Clock size={15} color="#1B5E3B" />
              <span>{shopDetails.operatingHours}</span>
            </div>
          </div>

          {/* Serviceable Delivery Areas */}
          <div style={{ background: '#FFF', padding: '14px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={16} color="#885E3C" />
              <span>Serviceable Delivery Localities ({shopDetails.serviceableRadiusKm || 10} km radius)</span>
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {shopDetails.serviceableLocalities?.map((loc) => (
                <span
                  key={loc}
                  style={{
                    background: '#FAF9F0',
                    border: '1px solid #E8E5D3',
                    color: '#1B5E3B',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  ✓ {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Return Policy */}
          <div style={{ background: '#FFF', padding: '14px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1C241E', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={16} color="#1B5E3B" />
              <span>Store Return & Replacement Policy</span>
            </h3>
            <div style={{ display: 'inline-block', background: 'rgba(27,94,59,0.08)', color: '#1B5E3B', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              {shopDetails.returnPolicyWindowDays || 7} Days Return Window
            </div>
            <p style={{ fontSize: '12px', color: '#5E6961', margin: 0, lineHeight: '1.4' }}>
              {shopDetails.returnPolicyDetails || 'Standard return policy: Returns accepted for defective, damaged, or unsealed goods.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab: Reviews */}
      {activeTab === 'reviews' && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {shopReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#5E6961', fontSize: '13px' }}>
              No reviews for this shop yet.
            </div>
          ) : (
            shopReviews.map((rev) => (
              <div key={rev.id} style={{ background: '#FFF', padding: '12px', borderRadius: '12px', border: '1px solid #E8E5D3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#1C241E' }}>{rev.customerName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#F2B705' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={12} fill="#F2B705" />
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#5E6961' }}>{rev.comment}</div>
                {rev.verifiedPurchase && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#1B5E3B', fontWeight: 600, marginTop: '4px' }}>
                    <CheckCircle size={10} /> Verified Neighborhood Purchase
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

