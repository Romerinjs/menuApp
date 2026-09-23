import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Restaurant } from '../../types/restaurant';
import { formatCurrency } from '../../services/whatsapp';

interface CartDrawerProps {
  restaurant: Restaurant;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  restaurant,
  onProceedToCheckout
}) => {
  const { items, itemsCount, subtotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem' }}>Tu Pedido ({itemsCount})</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem' }}>Tu carrito está vacío</p>
            <p style={{ fontSize: '0.85rem' }}>Selecciona platos del menú para armar tu pedido.</p>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Trash2 size={13} /> Vaciar carrito
                </button>
              </div>

              {items.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-details" style={{ flex: 1, paddingRight: '0.75rem' }}>
                    <h4>{item.dish.name}</h4>
                    <div className="cart-item-price">
                      {formatCurrency(item.dish.price * item.quantity, restaurant.currencySymbol)}
                    </div>
                    {item.notes && (
                      <div className="cart-item-notes">
                        "{item.notes}"
                      </div>
                    )}
                  </div>

                  <div className="cart-item-controls">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="qty-btn"
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: '18px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="qty-btn"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      style={{ color: 'var(--danger)', marginLeft: '0.4rem' }}
                      title="Quitar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer-footer">
              <div className="cart-subtotal-row">
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Subtotal del Pedido:</span>
                <span style={{ color: 'var(--primary)' }}>
                  {formatCurrency(subtotal, restaurant.currencySymbol)}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1rem', lineHeight: 1.4 }}>
                {restaurant.modalities?.delivery && restaurant.modalities?.deliveryFeeEnabled && (restaurant.modalities?.deliveryFee || 0) > 0 ? (
                  <span>
                    Tarifa de domicilio fija: {formatCurrency(restaurant.modalities.deliveryFee || 0, restaurant.currencySymbol)} (se aplica al elegir Domicilio).
                  </span>
                ) : (
                  <span>Cobro en físico en caja o contra entrega con el domiciliario.</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="btn btn-primary btn-lg btn-full"
              >
                Completar Pedido <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
