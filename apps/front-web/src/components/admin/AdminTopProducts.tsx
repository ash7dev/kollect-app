'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';
import { COLORS, StoreIcon, EyeIcon } from './AdminIcons';

export function AdminTopProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminApi.getTopProducts(5);
        // getTopProducts ne passe pas par normalize*, res.data est directement le tableau
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(data);
      } catch (err) {
        console.error('Top Products Fetch Error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatCurrency = (n: number) => {
    return `${n.toLocaleString('fr-SN')} FCFA`;
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 24,
      border: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(20px)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StoreIcon size={24} color={COLORS.primary} />
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
            Top Produits
          </h3>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
             <div style={{ 
              width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)', 
              borderTopColor: COLORS.primary, borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            Aucun produit à afficher.
          </div>
        ) : (
          products.map((product, i) => (
            <div
              key={product.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.01)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.03)',
                transition: 'all 0.2s ease',
              }}
            >
               <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff'
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.name}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <EyeIcon size={12} color="rgba(255,255,255,0.3)" />
                  {product.viewCount} vues
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.primary }}>
                  {formatCurrency(product.price)}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                  En stock: {product.stock}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
