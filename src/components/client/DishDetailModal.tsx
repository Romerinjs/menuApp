import React, { useState } from 'react';
import { X, Plus, Minus, MessageSquare, Star, Flame } from 'lucide-react';
import { Dish } from '../../types/restaurant';
import { formatCurrency } from '../../services/whatsapp';

interface DishDetailModalProps {
  dish: Dish;
  currencySymbol: string;
  onAddToCart: (dish: Dish, quantity: number, notes?: string) => void;
  onClose: () => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  currencySymbol,
  onAddToCart,
  onClose
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const totalPrice = dish.price * quantity;

  const handleConfirm = () => {
    onAddToCart(dish, quantity, notes);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {dish.imageUrl && (
          <div style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
            <img src={dish.imageUrl} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.65)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div style={{ padding: '1.5rem' }}>
          {!dish.imageUrl && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <h3 style={{ fontSize: '1.35rem' }}>{dish.name}</h3>
            {dish.isFeatured && (
              <span className="badge badge-featured">
                <Star size={11} fill="var(--featured-gold)" /> Destacado
              </span>
            )}
            {dish.isBestSeller && (
              <span className="badge badge-bestseller">
                <Flame size={11} /> Top
              </span>
            )}
          </div>

          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
            {formatCurrency(dish.price, currencySymbol)}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            {dish.description || 'Plato preparado artesanalmente con ingredientes seleccionados de primera calidad.'}
          </p>

          {/* Notas personalizadas para el plato */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={14} /> Notas o Instrucciones Especiales
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Sin cebolla, aderezo aparte, bien cocido..."
              className="form-input"
            />
          </div>

          {/* Ajuste de cantidad y botón agregar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-surface-elevated)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontWeight: 700 }}
              >
                <Minus size={15} />
              </button>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontWeight: 700 }}
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="btn btn-primary btn-full"
              style={{ padding: '0.85rem' }}
            >
              Agregar • {formatCurrency(totalPrice, currencySymbol)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
