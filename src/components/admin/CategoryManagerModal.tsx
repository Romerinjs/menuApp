import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Layers } from 'lucide-react';
import { Category } from '../../types/restaurant';
import { CategoryIcon, CATEGORY_ICON_OPTIONS } from '../common/CategoryIcon';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../../context/ToastContext';

interface CategoryManagerModalProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onClose: () => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  onClose
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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card reveal-on-scroll"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', width: '92%' }}
      >
        {/* Encabezado del Modal */}
        <div className="modal-header" style={{ paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Tag size={19} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                Categorías del Menú ({categories.length})
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Organiza las líneas de productos que se muestran en tu carta
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="modal-body" style={{ paddingTop: '1rem', paddingBottom: '1.25rem' }}>
          {/* Botón superior de crear nueva categoría */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="btn btn-primary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Plus size={15} /> Nueva Categoría
            </button>
          </div>

          {/* Formulario desplegable para agregar categoría */}
          {isAdding && (
            <form
              onSubmit={handleSubmit}
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                border: '1px solid var(--border-subtle)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr auto', gap: '0.6rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      border: '1px solid var(--border-subtle)',
                      flexShrink: 0
                    }}
                  >
                    <CategoryIcon iconName={icon} size={18} />
                  </div>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="form-select"
                    style={{ padding: '0.55rem 0.5rem', fontSize: '0.82rem' }}
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
                    style={{ padding: '0.6rem 0.8rem', fontSize: '0.88rem' }}
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

          {/* Chips de filtro / gestión de categorías */}
          <div className="category-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                onSelectCategory(null);
                onClose();
              }}
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
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onClose();
                  }}
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
    </div>
  );
};
