import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerNav } from './SellerNav';
import {
  ArrowLeft,
  Upload,
  Check,
  Leaf,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    name: 'Kolar Tomatoes',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fresh Greens (Palak)',
    url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Yelakki Bananas',
    url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cold Pressed Oil',
    url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Terracotta Clay Pot',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Channapatna Craft',
    url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80',
  },
];

export const SellerAddProductScreen: React.FC = () => {
  const { setSellerScreen, addNewProduct, language, categories } = useApp();

  const [name, setName] = useState('');
  const [kannadaName, setKannadaName] = useState('');
  const [category, setCategory] = useState('fresh-produce');
  const [subCategory, setSubCategory] = useState('Vegetables');
  const [price, setPrice] = useState('45');
  const [originalPrice, setOriginalPrice] = useState('60');
  const [unit, setUnit] = useState('kg');
  const [stockCount, setStockCount] = useState('30');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [isOrganic, setIsOrganic] = useState(true);
  const [noChemicals, setNoChemicals] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addNewProduct({
      name,
      kannadaName: kannadaName.trim() || name,
      category,
      subCategory,
      price: Number(price) || 50,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      unit,
      stockCount: Number(stockCount) || 25,
      description: description.trim() || 'Fresh authentic produce direct from farm.',
      image: selectedImage,
      isOrganic,
      noChemicals,
    });
  };

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
          gap: '10px',
        }}
      >
        <button
          type="button"
          onClick={() => setSellerScreen('dashboard')}
          style={{
            background: '#F8F7ED',
            border: '1px solid #E8E5D3',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#885E3C',
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '18px',
              color: '#1B5E3B',
              fontWeight: 700,
            }}
          >
            {language === 'kn' ? 'ಹೊಸ ಉತ್ಪನ್ನ ಸೇರಿಸಿ' : 'Add New Product'}
          </h2>
          <span style={{ fontSize: '11px', color: '#885E3C' }}>
            Publish to live Namma Santhe Marketplace
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '14px 16px' }}>
        {/* Image Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1C241E',
              marginBottom: '6px',
            }}
          >
            Product Photo
          </label>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '160px',
              borderRadius: '14px',
              overflow: 'hidden',
              border: '2px dashed #C4BEA9',
              background: '#F8F7ED',
              marginBottom: '8px',
            }}
          >
            <img
              src={selectedImage}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <span style={{ fontSize: '11px', color: '#885E3C', display: 'block', marginBottom: '6px' }}>
            Choose a photo template or paste image link:
          </span>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}
          >
            {PRESET_IMAGES.map((img) => (
              <div
                key={img.name}
                onClick={() => setSelectedImage(img.url)}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedImage === img.url ? '2px solid #1B5E3B' : '1px solid #D8D4BF',
                  flexShrink: 0,
                }}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Names */}
        <div style={{ marginBottom: '14px' }}>
          <label
            htmlFor="product-name-input"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1C241E',
              marginBottom: '4px',
            }}
          >
            Product Title (English) *
          </label>
          <input
            id="product-name-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Organic Mysore Betel Leaves / Naati Carrots"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #D8D4BF',
              fontSize: '13px',
              background: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label
            htmlFor="product-kannada-name-input"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1C241E',
              marginBottom: '4px',
            }}
          >
            ಕನ್ನಡ ಹೆಸರು (Kannada Title)
          </label>
          <input
            id="product-kannada-name-input"
            type="text"
            value={kannadaName}
            onChange={(e) => setKannadaName(e.target.value)}
            placeholder="ಉದಾಹರಣೆಗೆ: ಸಾವಯವ ಎಲೆಗಳು / ನಾಟಿ ಕ್ಯಾರೆಟ್"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #D8D4BF',
              fontSize: '13px',
              background: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>

        {/* Category & Subcategory Row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="product-category-select"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1C241E',
                marginBottom: '4px',
              }}
            >
              Category *
            </label>
            <select
              id="product-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #D8D4BF',
                fontSize: '12px',
                background: '#FFFFFF',
                outline: 'none',
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label
              htmlFor="product-subcategory-input"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1C241E',
                marginBottom: '4px',
              }}
            >
              Sub-type
            </label>
            <input
              id="product-subcategory-input"
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. Vegetables"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #D8D4BF',
                fontSize: '12px',
                background: '#FFFFFF',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Price, Original Price & Unit */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <label
              htmlFor="product-price-input"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1C241E',
                marginBottom: '4px',
              }}
            >
              Selling Price (₹) *
            </label>
            <input
              id="product-price-input"
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #D8D4BF',
                fontSize: '13px',
                background: '#FFFFFF',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label
              htmlFor="product-original-price-input"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1C241E',
                marginBottom: '4px',
              }}
            >
              MRP (₹)
            </label>
            <input
              id="product-original-price-input"
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #D8D4BF',
                fontSize: '13px',
                background: '#FFFFFF',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ width: '80px' }}>
            <label
              htmlFor="product-unit-select"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1C241E',
                marginBottom: '4px',
              }}
            >
              Unit
            </label>
            <select
              id="product-unit-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 8px',
                borderRadius: '10px',
                border: '1px solid #D8D4BF',
                fontSize: '12px',
                background: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value="kg">kg</option>
              <option value="bunch">bunch</option>
              <option value="piece">piece</option>
              <option value="jar">jar</option>
              <option value="pack">pack</option>
              <option value="box">box</option>
            </select>
          </div>
        </div>

        {/* Stock Quantity */}
        <div style={{ marginBottom: '14px' }}>
          <label
            htmlFor="product-stock-input"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1C241E',
              marginBottom: '4px',
            }}
          >
            Available Stock Quantity *
          </label>
          <input
            id="product-stock-input"
            type="number"
            required
            value={stockCount}
            onChange={(e) => setStockCount(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #D8D4BF',
              fontSize: '13px',
              background: '#FFFFFF',
              outline: 'none',
            }}
          />
        </div>

        {/* Checkbox Badges */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              style={{ accentColor: '#1B5E3B' }}
            />
            <span style={{ fontWeight: 600, color: '#1B5E3B' }}>Organic Certified</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={noChemicals}
              onChange={(e) => setNoChemicals(e.target.checked)}
              style={{ accentColor: '#1B5E3B' }}
            />
            <span style={{ fontWeight: 600, color: '#885E3C' }}>No Chemical Ripening</span>
          </label>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="product-desc-textarea"
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1C241E',
              marginBottom: '4px',
            }}
          >
            Description & Farm Story
          </label>
          <textarea
            id="product-desc-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share where it was harvested, soil details, or traditional recipe tips..."
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #D8D4BF',
              fontSize: '12px',
              background: '#FFFFFF',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="save-product-submit-btn"
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: 700 }}
        >
          <Check size={16} />
          <span>Save & Publish Product</span>
        </button>
      </form>

      <SellerNav />
    </div>
  );
};
