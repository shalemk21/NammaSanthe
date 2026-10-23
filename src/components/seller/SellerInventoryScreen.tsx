import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerNav } from './SellerNav';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  Search,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Product } from '../../types';

export const SellerInventoryScreen: React.FC = () => {
  const {
    products,
    updateProductStock,
    setSellerScreen,
    language,
    showToast,
  } = useApp();

  const [inventoryTab, setInventoryTab] = useState<'all' | 'low_stock'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const lowStockThreshold = 15;

  const filteredProducts = products.filter((p) => {
    if (inventoryTab === 'low_stock' && p.stockCount >= lowStockThreshold) {
      return false;
    }
    if (searchTerm.trim()) {
      return p.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const lowStockCount = products.filter((p) => p.stockCount < lowStockThreshold).length;

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
            {language === 'kn' ? 'ದಾಸ್ತಾನು ನಿರ್ವಹಣೆ' : 'Inventory Management'}
          </h2>
          <span style={{ fontSize: '11px', color: '#885E3C' }}>
            {products.length} live items in your catalog
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSellerScreen('add_product')}
          className="btn-primary"
          style={{ padding: '6px 12px', fontSize: '11.5px' }}
        >
          <Plus size={13} />
          <span>Add New</span>
        </button>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Tabs: All Products vs Low Stock */}
        <div
          style={{
            display: 'flex',
            background: '#ECE9D8',
            borderRadius: '999px',
            padding: '3px',
            marginBottom: '14px',
            border: '1px solid #DDD8C4',
          }}
        >
          <button
            type="button"
            id="inventory-tab-all"
            onClick={() => setInventoryTab('all')}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: '12px',
              fontWeight: inventoryTab === 'all' ? 700 : 500,
              color: inventoryTab === 'all' ? '#1B5E3B' : '#5E6961',
              background: inventoryTab === 'all' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              boxShadow: inventoryTab === 'all' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            All Products ({products.length})
          </button>

          <button
            type="button"
            id="inventory-tab-low"
            onClick={() => setInventoryTab('low_stock')}
            style={{
              flex: 1,
              padding: '7px 0',
              fontSize: '12px',
              fontWeight: inventoryTab === 'low_stock' ? 700 : 500,
              color: inventoryTab === 'low_stock' ? '#E76F51' : '#5E6961',
              background: inventoryTab === 'low_stock' ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: inventoryTab === 'low_stock' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <AlertTriangle size={12} color="#E76F51" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search size={14} className="search-input-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items in inventory..."
            className="search-input"
            style={{ padding: '8px 12px 8px 36px', fontSize: '12px' }}
          />
        </div>

        {/* Low Stock Warning Banner if on low stock tab */}
        {inventoryTab === 'low_stock' && lowStockCount > 0 && (
          <div
            style={{
              background: 'rgba(231,111,81,0.12)',
              border: '1px solid #E76F51',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px',
              fontSize: '11.5px',
              color: '#8A321E',
            }}
          >
            <AlertTriangle size={16} color="#E76F51" />
            <span>
              <strong>{lowStockCount} items</strong> have under {lowStockThreshold} units. Use
              the + button to update inventory count.
            </span>
          </div>
        )}

        {/* Inventory Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredProducts.map((prod) => {
            const isLow = prod.stockCount < lowStockThreshold;

            return (
              <div
                key={prod.id}
                className="card-base"
                style={{
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#FFFFFF',
                }}
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#1C241E',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {prod.name}
                    </h4>
                  </div>

                  {/* Price Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    {editingPriceId === prod.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>₹</span>
                        <input
                          type="number"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          style={{
                            width: '50px',
                            padding: '2px 4px',
                            border: '1px solid #1B5E3B',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempPrice) {
                              prod.price = Number(tempPrice);
                              showToast(`Updated price to ₹${tempPrice}`, 'success');
                            }
                            setEditingPriceId(null);
                          }}
                          style={{
                            background: '#1B5E3B',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '3px 6px',
                            cursor: 'pointer',
                          }}
                        >
                          <Check size={11} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingPriceId(prod.id);
                          setTempPrice(String(prod.price));
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#1B5E3B',
                        }}
                        title="Click to edit price"
                      >
                        <span>
                          ₹{prod.price}/{prod.unit}
                        </span>
                        <Edit2 size={10} color="#8E9991" />
                      </div>
                    )}
                  </div>

                  {/* Stock pill */}
                  <div style={{ marginTop: '4px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: isLow ? 'rgba(231,111,81,0.14)' : 'rgba(27,94,59,0.1)',
                        color: isLow ? '#E76F51' : '#1B5E3B',
                      }}
                    >
                      {prod.stockCount} {prod.unit} in stock
                    </span>
                  </div>
                </div>

                {/* Stock Quick Stepper */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: '#F8F7ED',
                    border: '1px solid #D8D4BF',
                    borderRadius: '999px',
                    padding: '3px 6px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => updateProductStock(prod.id, prod.stockCount - 1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1B5E3B',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    title="Decrease 1"
                  >
                    <Minus size={12} />
                  </button>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      minWidth: '24px',
                      textAlign: 'center',
                      color: isLow ? '#E76F51' : '#1C241E',
                    }}
                  >
                    {prod.stockCount}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateProductStock(prod.id, prod.stockCount + 5)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#1B5E3B',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    title="Add 5 units"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SellerNav />
    </div>
  );
};
