import React, { useState } from 'react';
import { Plus, Trash2, Tag, Layers } from 'lucide-react';
import { Category } from '../../types/restaurant';
import { CategoryIcon, CATEGORY_ICON_OPTIONS } from '../common/CategoryIcon';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../../context/ToastContext';

interface CategoryManagerProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('sandwich');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      icon,
      order: categories.length + 1
    };

    onAddCategory(newCat);
    toast.success(`¡Categoría "${newCat.name}" creada con éxito!`, 'Organización de Menú');
    setName('');
    setIsAdding(false);
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">
          <Tag size={18} color="var(--primary)" /> Categorías del Menú ({categories.length})
        </h3>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="btn btn-secondary btn-sm"
        >
          <Plus size={15} /> Nueva Categoría
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '0.6rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                <CategoryIcon iconName={icon} size={18} />
              </div>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="form-select"
                style={{ padding: '0.55rem 0.6rem', fontSize: '0.85rem' }}
              >
                {CATEGORY_ICON_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la categoría..."
                className="form-input"
                style={{ padding: '0.6rem 0.8rem' }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="submit" className="btn btn-primary btn-sm">Guardar</button>
              <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary btn-sm">Cancelar</button>
            </div>
          </div>
        </form>
      )}

      {/* Chips de filtro / gestión */}
      <div className="category-chips">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`category-chip ${selectedCategoryId === null ? 'active' : ''}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Layers size={14} />
          <span>Todos los platos</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`category-chip ${isSelected ? 'active' : ''}`}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <CategoryIcon iconName={cat.icon} size={14} />
                {cat.name}
              </span>
              {categories.length > 1 && (
                <span
                  className="category-chip-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategoryToDelete(cat);
                  }}
                  title="Eliminar categoría"
                >
                  <Trash2 size={13} />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de confirmación para eliminar categoría */}
      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        title="¿Eliminar categoría?"
        message={
          <>
            ¿Estás seguro de que deseas eliminar la categoría <strong>"{categoryToDelete?.name}"</strong>? Sus platos asociados serán removidos.
          </>
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (categoryToDelete) {
            onDeleteCategory(categoryToDelete.id);
            toast.info(`Categoría "${categoryToDelete.name}" eliminada`, 'Categorías');
            setCategoryToDelete(null);
          }
        }}
        onClose={() => setCategoryToDelete(null)}
      />
    </div>
  );
};
