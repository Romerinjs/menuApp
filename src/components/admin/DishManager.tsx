import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Star, Flame, Eye, EyeOff, Search, Utensils } from 'lucide-react';
import { Dish, Category } from '../../types/restaurant';
import { formatCurrency } from '../../services/whatsapp';
import { ConfirmModal } from '../common/ConfirmModal';

interface DishManagerProps {
  dishes: Dish[];
  categories: Category[];
  selectedCategoryId: string | null;
  currencySymbol: string;
  onEditDish: (dish: Dish) => void;
  onNewDish: () => void;
  onDeleteDish: (dishId: string) => void;
  onToggleAvailability: (dishId: string) => void;
}

export const DishManager: React.FC<DishManagerProps> = ({
  dishes,
  categories,
  selectedCategoryId,
  currencySymbol,
  onEditDish,
  onNewDish,
  onDeleteDish,
  onToggleAvailability
}) => {
  const [search, setSearch] = useState('');
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

  // Filtrar por categoría y búsqueda
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategoryId ? dish.categoryId === selectedCategoryId : true;
    const matchesSearch = dish.name.toLowerCase().includes(search.toLowerCase()) ||
      dish.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 className="dashboard-card-title">
            <Utensils size={18} color="var(--primary)" /> Platos ({filteredDishes.length})
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar plato..."
              className="form-input"
              style={{ padding: '0.4rem 0.8rem 0.4rem 2rem', fontSize: '0.82rem', width: '180px' }}
            />
          </div>
        </div>

        <button type="button" onClick={onNewDish} className="btn btn-primary btn-sm">
          <Plus size={15} /> Añadir Plato
        </button>
      </div>

      {filteredDishes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Utensils size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>No hay platos en esta sección</p>
          <p style={{ fontSize: '0.85rem' }}>Haz clic en "Añadir Plato" para agregar uno nuevo con fotos y precios.</p>
        </div>
      ) : (
        <div className="admin-dishes-grid">
          {filteredDishes.map((dish) => {
            const cat = categories.find((c) => c.id === dish.categoryId);

            return (
              <div key={dish.id} className="admin-dish-card" style={{ opacity: dish.isAvailable ? 1 : 0.65 }}>
                <div className="admin-dish-img-wrap">
                  {dish.imageUrl ? (
                    <img src={dish.imageUrl} alt={dish.name} className="admin-dish-img" />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                      <Utensils size={28} />
                    </div>
                  )}

                  <div className="admin-dish-badges">
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
                    {!dish.isAvailable && (
                      <span className="badge badge-soldout">
                        Agotado
                      </span>
                    )}
                  </div>
                </div>

                <div className="admin-dish-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat?.name || 'General'}</span>
                    <span className="admin-dish-price">{formatCurrency(dish.price, currencySymbol)}</span>
                  </div>

                  <h4 className="admin-dish-title">{dish.name}</h4>
                  <p className="admin-dish-desc">{dish.description || 'Sin descripción detallada.'}</p>

                  <div className="admin-dish-footer">
                    <button
                      type="button"
                      onClick={() => onToggleAvailability(dish.id)}
                      className={`btn btn-sm ${dish.isAvailable ? 'btn-secondary' : 'btn-secondary'}`}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.3rem 0.6rem',
                        color: dish.isAvailable ? 'var(--success)' : 'var(--danger)'
                      }}
                      title={dish.isAvailable ? 'Marcar como Agotado' : 'Marcar como Disponible'}
                    >
                      {dish.isAvailable ? <Eye size={13} /> : <EyeOff size={13} />}
                      {dish.isAvailable ? 'Disponible' : 'Agotado'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => onEditDish(dish)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                        title="Editar plato"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDishToDelete(dish)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.6rem', color: 'var(--danger)' }}
                        title="Eliminar plato"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación para eliminar plato */}
      <ConfirmModal
        isOpen={Boolean(dishToDelete)}
        title="¿Eliminar plato?"
        message={
          <>
            ¿Estás seguro de que deseas eliminar el plato <strong>"{dishToDelete?.name}"</strong> del menú? Esta acción no se puede deshacer.
          </>
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (dishToDelete) {
            onDeleteDish(dishToDelete.id);
            setDishToDelete(null);
          }
        }}
        onClose={() => setDishToDelete(null)}
      />
    </div>
  );
};
