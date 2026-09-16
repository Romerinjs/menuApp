import React from 'react';
import { Plus, Star, Flame, EyeOff } from 'lucide-react';
import { Dish } from '../../types/restaurant';
import { formatCurrency } from '../../services/whatsapp';

interface DishCardProps {
  dish: Dish;
  currencySymbol: string;
  onSelect: (dish: Dish) => void;
  onQuickAdd: (dish: Dish) => void;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  currencySymbol,
  onSelect,
  onQuickAdd
}) => {
  return (
    <article
      className={`dish-card-client reveal-on-scroll ${!dish.isAvailable ? 'sold-out' : ''}`}
      onClick={() => dish.isAvailable && onSelect(dish)}
      style={{ cursor: dish.isAvailable ? 'pointer' : 'default' }}
    >
      {/* Columna Izquierda: Título, Badges, Descripción y Precio */}
      <div className="dish-client-info">
        <div className="dish-client-header">
          <h4 className="dish-client-name">{dish.name}</h4>
          {dish.isBestSeller && (
            <span className="badge badge-bestseller" style={{ fontSize: '0.65rem' }}>
              <Flame size={10} /> TOP
            </span>
          )}
          {dish.isFeatured && (
            <span className="badge badge-featured" style={{ fontSize: '0.65rem' }}>
              <Star size={10} fill="var(--featured-gold)" /> RECOMENDADO
            </span>
          )}
        </div>

        <p className="dish-client-desc">
          {dish.description || 'Ingredientes frescos y preparación artesanal al momento.'}
        </p>

        <div className="dish-client-price-row">
          <span className="dish-client-price">
            {formatCurrency(dish.price, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Columna Derecha: Imagen arriba + Botón "+ Añadir" alineado abajo de la imagen */}
      <div className="dish-client-right-col">
        {dish.imageUrl && (
          <div className="dish-client-img-wrap">
            <img src={dish.imageUrl} alt={dish.name} className="dish-client-img" loading="lazy" />
          </div>
        )}

        <div className="dish-client-action-wrap">
          {dish.isAvailable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(dish);
              }}
              className="btn btn-primary dish-add-btn"
            >
              <Plus size={14} /> Añadir
            </button>
          ) : (
            <span className="badge badge-soldout" style={{ fontSize: '0.72rem' }}>
              <EyeOff size={11} /> Agotado
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
