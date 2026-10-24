import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { HeaderNav } from './HeaderNav';
import { BottomNav } from './BottomNav';
import {
  Sparkles,
  Star,
  Plus,
  Minus,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Carrot,
  Wheat,
  UtensilsCrossed,
  Shirt,
  HeartPulse,
  Award,
} from 'lucide-react';
import { Product } from '../types';
import { handleProductImageError, resolveProductImage } from '../utils/imageUtils';

export const HomeScreen: React.FC = () => {
  const {
    products,
    categories,
    shops: vendors,
    cart,
    addToCart,
    updateCartQuantity,
    setSelectedProduct,
    setSelectedShop,
    addToComparison,
    comparisonList,
    setCustomerScreen,
    setSelectedCategory,
    language,
    selectedLocality,
  } = useApp();

  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const dealsRef = useRef<HTMLDivElement>(null);
  const sundaySantheRef = useRef<HTMLDivElement>(null);

  const scrollHorizontally = (ref: React.RefObject<HTMLDivElement | null>, amount: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  const banners = [
    {
      id: 1,
      badge: 'FRESH • LOCAL • SUSTAINABLE',
      title: 'From Our Farmers To Your Home',
      kannadaTitle: 'ನಮ್ಮ ರೈತರಿಂದ ನೇರ ನಿಮ್ಮ ಮನೆಗೆ',
      desc: "Fresh, authentic produce and handmade treasures from Karnataka's local communities, delivered right to your doorstep.",
      code: 'USE CODE: SANTHE25',
      image: '/images/v0/santhe_market_art.png',
      bg: 'linear-gradient(135deg, #1B5E3B 0%, #297a4f 100%)',
    },
    {
      id: 2,
      badge: 'Sunday Special Santhe',
      title: 'Dawn Harvested Organic Produce',
      kannadaTitle: 'ಸ್ಥಳೀಯ ರೈತರಿಂದ ನೇರ ತಾಜಾ ತರಕಾರಿಗಳು',
      desc: 'Plucked at 5:00 AM in Kolar & Devanahalli. Direct farm prices without middlemen.',
      code: 'FARM FRESH GUARANTEE',
      image: '/images/v0/hero_banner.png',
      bg: 'linear-gradient(135deg, #885E3C 0%, #a6744c 100%)',
    },
    {
      id: 3,
      badge: 'Heritage Artisans & GI Craft',
      title: 'Channapatna Wooden Toys & Decor',
      kannadaTitle: 'ಚನ್ನಪಟ್ಟಣ ಸಾಂಪ್ರದಾಯಿಕ ಕರಕುಶಲ ಆಟಿಕೆಗಳು',
      desc: '100% natural vegetable-lacquer dye craft supporting rural artisan families.',
      code: 'GI TAG CERTIFIED',
      image: '/images/v0/categories/handicrafts.png',
      bg: 'linear-gradient(135deg, #c49400 0%, #F2B705 100%)',
    },
  ];

  const nextBanner = () => {
    setActiveBannerIdx((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setActiveBannerIdx((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const viewProductDetail = (prod: Product) => {
    setSelectedProduct(prod);
    setCustomerScreen('detail');
  };

  // Map category icon names
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Carrot':
        return <Carrot size={22} color="#FFFFFF" />;
      case 'Wheat':
        return <Wheat size={22} color="#FFFFFF" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed size={22} color="#FFFFFF" />;
      case 'Sparkles':
        return <Sparkles size={22} color="#FFFFFF" />;
      case 'Shirt':
        return <Shirt size={22} color="#FFFFFF" />;
      case 'HeartPulse':
        return <HeartPulse size={22} color="#FFFFFF" />;
      default:
        return <Carrot size={22} color="#FFFFFF" />;
    }
  };

  const dealsOfTheDay = products.filter((p) => p.isDealOfTheDay || p.dealDiscount);

  return (
    <div className="fade-in" style={{ paddingBottom: '96px' }}>
      <HeaderNav />

      {/* Banner Carousel */}
      <section style={{ padding: '14px 16px 8px' }}>
        <div
          style={{
            background: banners[activeBannerIdx].bg,
            borderRadius: '20px',
            padding: '18px 20px',
            color: '#FFFFFF',
            position: 'relative',
            boxShadow: '0 8px 20px rgba(27, 94, 59, 0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Background village santhe artwork */}
          {banners[activeBannerIdx].image && (
            <img
              src={banners[activeBannerIdx].image}
              alt="Santhe Art"
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '60%',
                objectFit: 'cover',
                opacity: 0.3,
                pointerEvents: 'none',
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}

          {/* Rangoli corner accent */}
          <div
            style={{
              position: 'absolute',
              right: '-15px',
              bottom: '-15px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '18px solid rgba(255,255,255,0.08)',
              pointerEvents: 'none',
            }}
          />

          {/* Top Row: Badge & Navigation Chevrons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                background: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(6px)',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                display: 'inline-block',
              }}
            >
              {banners[activeBannerIdx].badge}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                id="hero-banner-prev-btn"
                onClick={prevBanner}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
                title="Previous Slide"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                id="hero-banner-next-btn"
                onClick={nextBanner}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
                title="Next Slide"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: 1.25,
              marginBottom: '6px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {language === 'kn'
              ? banners[activeBannerIdx].kannadaTitle
              : banners[activeBannerIdx].title}
          </h2>

          <p
            style={{
              fontSize: '12px',
              opacity: 0.95,
              marginBottom: '14px',
              lineHeight: 1.4,
              maxWidth: '280px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {banners[activeBannerIdx].desc}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: '#F2B705',
                color: '#261E05',
                padding: '4px 10px',
                borderRadius: '8px',
              }}
            >
              {banners[activeBannerIdx].code}
            </span>

            <button
              type="button"
              id="banner-shop-now-btn"
              onClick={() => setCustomerScreen('listing')}
              style={{
                background: '#FFFFFF',
                color: '#1B5E3B',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <span>{language === 'kn' ? 'ಸಂತೆ ಶಾಪಿಂಗ್ ಮಾಡಿ' : 'Shop Now'}</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '14px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveBannerIdx(idx)}
                style={{
                  width: activeBannerIdx === idx ? '22px' : '7px',
                  height: '7px',
                  borderRadius: '999px',
                  background: activeBannerIdx === idx ? '#F2B705' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Category Icons */}
      <section style={{ padding: '16px 0 10px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px 10px',
          }}
        >
          <h3
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '17px',
              color: '#1B5E3B',
              fontWeight: 700,
            }}
          >
            {language === 'kn' ? 'ವರ್ಗಗಳು' : 'Shop by Category'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Scroll navigation arrows */}
            <button
              type="button"
              onClick={() => scrollHorizontally(categoriesRef, -200)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D0CDBB',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1B5E3B',
              }}
              title="Scroll Left"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollHorizontally(categoriesRef, 200)}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D0CDBB',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1B5E3B',
              }}
              title="Scroll Right"
            >
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              id="see-all-categories-btn"
              onClick={() => setCustomerScreen('categories')}
              style={{
                background: 'none',
                border: 'none',
                color: '#885E3C',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                marginLeft: '4px',
              }}
            >
              <span>See All</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div
          ref={categoriesRef}
          onWheel={handleWheelScroll}
          className="scroll-horizontal"
          style={{
            padding: '0 16px 8px',
            gap: '14px',
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCustomerScreen('listing');
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                flexShrink: 0,
                width: '74px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '62px',
                  height: '62px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '2px solid #E8E5D3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s ease',
                  overflow: 'hidden',
                }}
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  renderCategoryIcon(cat.iconName)
                )}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#1C241E',
                  lineHeight: 1.2,
                }}
              >
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Deal of the Day Section */}
      {dealsOfTheDay.length > 0 && (
        <section style={{ padding: '14px 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={18} color="#E76F51" />
              <h3
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '17px',
                  color: '#1B5E3B',
                  fontWeight: 700,
                }}
              >
                {language === 'kn' ? 'ಇಂದಿನ ರಿಯಾಯಿತಿ ಕೊಡುಗೆಗಳು' : 'Deal of the Day'}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#E76F51',
                  fontWeight: 600,
                  background: 'rgba(231,111,81,0.12)',
                  padding: '3px 8px',
                  borderRadius: '999px',
                }}
              >
                <Clock size={12} />
                <span>Ends in 03h 45m</span>
              </div>
              {/* Carousel arrows */}
              <button
                type="button"
                onClick={() => scrollHorizontally(dealsRef, -240)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D0CDBB',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#1B5E3B',
                }}
                title="Scroll Deals Left"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => scrollHorizontally(dealsRef, 240)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D0CDBB',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#1B5E3B',
                }}
                title="Scroll Deals Right"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div
            ref={dealsRef}
            onWheel={handleWheelScroll}
            className="scroll-horizontal"
            style={{
              paddingBottom: '8px',
              gap: '12px',
            }}
          >
            {dealsOfTheDay.map((prod) => {
              const inCartItem = cart.find((i) => i.product.id === prod.id);

              return (
                <div
                  key={prod.id}
                  className="card-base"
                  style={{
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    minWidth: '200px',
                    maxWidth: '220px',
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="badge-terracotta"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 2,
                    }}
                  >
                    {prod.dealDiscount}% OFF
                  </span>

                  <div
                    onClick={() => viewProductDetail(prod)}
                    style={{ cursor: 'pointer', textAlign: 'center' }}
                  >
                    <img
                      src={resolveProductImage(prod.image, prod.name, prod.category)}
                      alt={prod.name}
                      style={{
                        width: '100%',
                        height: '110px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        marginBottom: '8px',
                      }}
                      onError={(e) => handleProductImageError(e, prod.name, prod.category)}
                    />
                    <div
                      style={{
                        fontSize: '10px',
                        color: '#885E3C',
                        fontWeight: 600,
                        textAlign: 'left',
                      }}
                    >
                      {prod.vendorName}
                    </div>
                    <h4
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1C241E',
                        textAlign: 'left',
                        margin: '2px 0 4px',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {language === 'kn' ? prod.kannadaName : prod.name}
                    </h4>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '6px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#1B5E3B' }}>
                          ₹{prod.price}
                        </span>
                        {prod.originalPrice && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#5E6961',
                              textDecoration: 'line-through',
                            }}
                          >
                            ₹{prod.originalPrice}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: '#5E6961' }}>per {prod.unit}</span>
                    </div>

                    {inCartItem ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#1B5E3B',
                          color: '#FFFFFF',
                          borderRadius: '999px',
                          padding: '3px 8px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(prod.id, -1)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>
                          {inCartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(prod.id, 1)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        id={`add-deal-${prod.id}`}
                        onClick={() => addToCart(prod, 1)}
                        className="btn-accent"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Plus size={13} />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Sunday Special Santhe Showcase Carousel with Smooth Right Scrolling */}
      <section style={{ padding: '14px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px' }}>🧺</span>
              <h3
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '17px',
                  color: '#1B5E3B',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {language === 'kn' ? 'ಭಾನುವಾರದ ವಿಶೇಷ ಸಂತೆ' : 'Sunday Special Santhe'}
              </h3>
            </div>
            <span style={{ fontSize: '11px', color: '#885E3C' }}>
              {language === 'kn'
                ? 'ರೈತರಿಂದ ನೇರ ಬೆಳಗಿನ ಕೊಯ್ಲು • ಸುಲಭ ಸ್ಕ್ರೋಲ್'
                : 'Direct dawn harvest from rural taluk farms'}
            </span>
          </div>

          {/* Smooth Scroll Navigation Arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              id="sunday-santhe-scroll-left-btn"
              onClick={() => scrollHorizontally(sundaySantheRef, -240)}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #1B5E3B',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1B5E3B',
                boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
              }}
              title="Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              id="sunday-santhe-scroll-right-btn"
              onClick={() => scrollHorizontally(sundaySantheRef, 240)}
              style={{
                background: '#1B5E3B',
                border: '1.5px solid #1B5E3B',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#FFFFFF',
                boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
              }}
              title="Scroll Right Smoothly"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={sundaySantheRef}
          onWheel={handleWheelScroll}
          className="scroll-horizontal"
          style={{
            paddingBottom: '8px',
            gap: '12px',
            display: 'flex',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            scrollSnapType: 'x mandatory',
          }}
        >
          {products.map((prod) => {
            const inCartItem = cart.find((i) => i.product.id === prod.id);

            return (
              <div
                key={`santhe-${prod.id}`}
                className="card-base"
                style={{
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  minWidth: '190px',
                  maxWidth: '210px',
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                  border: '1px solid #E8E5D3',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 2,
                    background: '#1B5E3B',
                    color: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '9.5px',
                    fontWeight: 700,
                  }}
                >
                  🌱 Dawn Harvest
                </span>

                <div
                  onClick={() => viewProductDetail(prod)}
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                >
                  <img
                    src={resolveProductImage(prod.image, prod.name, prod.category)}
                    alt={prod.name}
                    style={{
                      width: '100%',
                      height: '115px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      marginBottom: '8px',
                    }}
                    onError={(e) => handleProductImageError(e, prod.name, prod.category)}
                  />
                  <div
                    style={{
                      fontSize: '10px',
                      color: '#885E3C',
                      fontWeight: 600,
                      textAlign: 'left',
                    }}
                  >
                    {prod.vendorName}
                  </div>
                  <h4
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1C241E',
                      textAlign: 'left',
                      margin: '2px 0 4px',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {language === 'kn' ? prod.kannadaName : prod.name}
                  </h4>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#1B5E3B' }}>
                        ₹{prod.price}
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#5E6961' }}>per {prod.unit}</span>
                  </div>

                  {inCartItem ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#1B5E3B',
                        color: '#FFFFFF',
                        borderRadius: '999px',
                        padding: '3px 8px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(prod.id, -1)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>
                        {inCartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(prod.id, 1)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id={`add-santhe-item-${prod.id}`}
                      onClick={() => addToCart(prod, 1)}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '11.5px' }}
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Near You (Local Stores) */}
      <section style={{ padding: '14px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '17px',
                color: '#1B5E3B',
                fontWeight: 700,
              }}
            >
              {language === 'kn' ? 'ನಿಮ್ಮ ಸಮೀಪದ ಸ್ಥಳೀಯ ಮಳಿಗೆಗಳು' : 'Popular Near You'}
            </h3>
            <span style={{ fontSize: '11px', color: '#885E3C' }}>Direct farmer co-ops and local stores</span>
          </div>
          <button
            type="button"
            onClick={() => setCustomerScreen('listing')}
            style={{
              background: 'none',
              border: 'none',
              color: '#885E3C',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View All
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="card-base"
              onClick={() => {
                setSelectedShop(vendor);
                setCustomerScreen('shop');
              }}
              style={{
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
              }}
            >
              <img
                src={vendor.coverImage}
                alt={vendor.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1C241E',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {language === 'kn' ? vendor.kannadaName : vendor.name}
                  </h4>
                  {(vendor.verificationStatus === 'verified' || (vendor as any).verified) && (
                    <span title="Verified Producer" style={{ display: 'inline-flex' }}>
                      <Award size={14} color="#1B5E3B" />
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    color: '#5E6961',
                    margin: '2px 0 4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {vendor.speciality}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px' }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontWeight: 700,
                      color: '#c49400',
                    }}
                  >
                    <Star size={12} fill="#F2B705" color="#F2B705" />
                    <span>{vendor.rating}</span>
                  </span>
                  <span style={{ color: '#885E3C' }}>• {vendor.distanceKm} km away</span>
                  <span style={{ color: '#1B5E3B', fontWeight: 600 }}>
                    {vendor.openStatus ? 'Open Now' : 'Closed'}
                  </span>
                </div>
              </div>

              <ChevronRight size={18} color="#5E6961" />
            </div>
          ))}
        </div>
      </section>

      {/* Fresh Farm Harvest Grid */}
      <section style={{ padding: '14px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <h3
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '17px',
              color: '#1B5E3B',
              fontWeight: 700,
            }}
          >
            {language === 'kn' ? 'ತಾಜಾ ಬೆಳೆಗಳು (Fresh Harvest)' : 'Fresh From Local Farms'}
          </h3>
          <button
            type="button"
            onClick={() => setCustomerScreen('listing')}
            style={{
              background: 'none',
              border: 'none',
              color: '#1B5E3B',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            See All Products →
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {products.map((prod) => {
            const inCart = cart.find((i) => i.product.id === prod.id);

            return (
              <div
                key={prod.id}
                className="card-base"
                style={{
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  onClick={() => viewProductDetail(prod)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={resolveProductImage(prod.image, prod.name, prod.category)}
                      alt={prod.name}
                      style={{
                        width: '100%',
                        height: '110px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        marginBottom: '8px',
                      }}
                      onError={(e) => handleProductImageError(e, prod.name, prod.category)}
                    />
                    {prod.isOrganic && (
                      <span
                        className="badge-green"
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '6px',
                          fontSize: '9.5px',
                          padding: '2px 6px',
                          background: 'rgba(255,255,255,0.92)',
                        }}
                      >
                        100% Organic
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '10px', color: '#885E3C', fontWeight: 600 }}>
                    {prod.vendorLocation}
                  </div>
                  <h4
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1C241E',
                      margin: '2px 0 4px',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {language === 'kn' ? prod.kannadaName : prod.name}
                  </h4>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1B5E3B' }}>
                      ₹{prod.price}
                    </span>
                    <div style={{ fontSize: '10px', color: '#5E6961' }}>per {prod.unit}</div>
                  </div>

                  {inCart ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#1B5E3B',
                        color: '#FFFFFF',
                        borderRadius: '999px',
                        padding: '3px 8px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(prod.id, -1)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ fontSize: '11px', fontWeight: 700 }}>
                        {inCart.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(prod.id, 1)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id={`home-add-${prod.id}`}
                      onClick={() => addToCart(prod, 1)}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <Plus size={13} />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Clearance spacer so bottom product cards scroll fully above bottom navigation */}
      <div style={{ height: '96px', width: '100%', flexShrink: 0 }} aria-hidden="true" />
    </div>
  );
};

