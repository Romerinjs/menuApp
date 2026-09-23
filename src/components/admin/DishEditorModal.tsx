import React, { useState } from 'react';
import { X, Upload, Star, Flame, Eye, EyeOff, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Category, Dish } from '../../types/restaurant';
import { uploadTenantAsset } from '../../services/storage/r2Storage';
import { useToast } from '../../context/ToastContext';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currency';

interface DishEditorModalProps {
  dish?: Dish | null; // null si es un plato nuevo
  categories: Category[];
  currencySymbol: string;
  restaurantSlug?: string;
  onSave: (dish: Dish) => void;
  onClose: () => void;
}

// Galería de imágenes rápidas de alta calidad para probar sin necesidad de subir archivos
const CURATED_IMAGES = [
  { label: 'Hamburguesa Gourmet', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Smash Burger', url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80' },
  { label: 'Pizza Artesanal', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80' },
  { label: 'Papas Fritas Crispy', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80' },
  { label: 'Tacos Mexicanos', url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&auto=format&fit=crop&q=80' },
  { label: 'Sushi Rolls', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80' },
  { label: 'Bebida Refrescante', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Postre de Chocolate', url: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80' }
];

export const DishEditorModal: React.FC<DishEditorModalProps> = ({
  dish,
  categories,
  currencySymbol,
  restaurantSlug = 'general',
  onSave,
  onClose
}) => {
  const isEditing = Boolean(dish);
  const toast = useToast();

  const [name, setName] = useState(dish?.name || '');
  const [categoryId, setCategoryId] = useState(dish?.categoryId || categories[0]?.id || '');
  const [description, setDescription] = useState(dish?.description || '');
  const [price, setPrice] = useState<string>(dish ? formatCurrencyInput(dish.price) : '');
  const [imageUrl, setImageUrl] = useState(dish?.imageUrl || CURATED_IMAGES[0].url);
  const [isFeatured, setIsFeatured] = useState(dish?.isFeatured || false);
  const [isBestSeller, setIsBestSeller] = useState(dish?.isBestSeller || false);
  const [isAvailable, setIsAvailable] = useState(dish?.isAvailable ?? true);
  const [isUploading, setIsUploading] = useState(false);

  // Manejo de carga de archivo con R2 / Multi-Tenant
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const res = await uploadTenantAsset(file, restaurantSlug, 'dishes');
        setImageUrl(res.url);
        toast.success('¡Imagen del plato cargada a Cloudflare R2 con éxito!', 'Multimedia');
      } catch (err: any) {
        console.error('Error al subir imagen del plato:', err);
        toast.error('No se pudo subir la imagen a Cloudflare R2', 'Error de Carga');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const priceNum = parseCurrencyInput(price);

    const item: Dish = {
      id: dish ? dish.id : `dish-${Date.now()}`,
      categoryId,
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      imageUrl,
      isFeatured,
      isBestSeller,
      isAvailable,
      order: dish?.order ?? 1
    };

    onSave(item);
    toast.success(
      isEditing ? `¡Plato "${item.name}" actualizado!` : `¡Nuevo plato "${item.name}" creado!`,
      'Catálogo de Menú'
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Editar Plato' : 'Crear Nuevo Plato'}</h3>
          <button type="button" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Vista previa de Imagen y Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <ImageIcon size={16} /> Foto del Plato
              </label>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-main)', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Sin foto</div>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', width: 'fit-content', gap: '0.35rem' }}>
                    {isUploading ? <Loader2 size={14} className="spin-animation" /> : <Upload size={14} />}
                    {isUploading ? 'Subiendo...' : 'Subir foto desde mi equipo'}
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={isUploading} />
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="O pega una URL de imagen..."
                    className="form-input"
                    style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                  />
                </div>
              </div>

              {/* Selector de fotos sugeridas */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  O escoge una foto rápida de muestra:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.3rem' }}>
                  {CURATED_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        background: imageUrl === img.url ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                        color: imageUrl === img.url ? '#fff' : 'var(--text-secondary)',
                        fontSize: '0.72rem',
                        borderRadius: 'var(--radius-sm)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Nombre y Categoría */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre del Plato *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Hamburguesa Doble Queso"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="form-select"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Precio */}
            <div className="form-group">
              <label className="form-label">Precio ({currencySymbol}) *</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(formatCurrencyInput(e.target.value))}
                placeholder="25.000"
                className="form-input"
                required
              />
            </div>

            {/* Descripción */}
            <div className="form-group">
              <label className="form-label">Descripción & Ingredientes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Carne madurada, queso cheddar fundido, tocineta crujiente y pan brioche..."
                className="form-textarea"
              />
            </div>

            {/* Etiquetas (3 Cards en 1 sola fila) */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.6rem' }}>
                Etiquetas
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                {/* Card 1: Recomendado (isFeatured) */}
                <div
                  onClick={() => setIsFeatured(!isFeatured)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: isFeatured ? 'var(--featured-gold, #f59e0b)' : 'rgba(245, 158, 11, 0.1)',
                    border: isFeatured ? '1.5px solid var(--featured-gold, #f59e0b)' : '1px solid rgba(245, 158, 11, 0.25)',
                    color: isFeatured ? '#ffffff' : '#f59e0b',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    transition: 'all 0.2s ease',
                    userSelect: 'none'
                  }}
                >
                  <Star size={16} strokeWidth={2.2} color={isFeatured ? '#ffffff' : '#f59e0b'} fill="none" />
                  <span>Recomendado</span>
                </div>

                {/* Card 2: + Vendido (isBestSeller) */}
                <div
                  onClick={() => setIsBestSeller(!isBestSeller)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: isBestSeller ? '#ff5722' : 'rgba(255, 87, 34, 0.1)',
                    border: isBestSeller ? '1.5px solid #ff5722' : '1px solid rgba(255, 87, 34, 0.25)',
                    color: isBestSeller ? '#ffffff' : '#ff5722',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    transition: 'all 0.2s ease',
                    userSelect: 'none'
                  }}
                >
                  <Flame size={16} strokeWidth={2.2} color={isBestSeller ? '#ffffff' : '#ff5722'} fill="none" />
                  <span>+ Vendido</span>
                </div>

                {/* Card 3: Disponible / Agotado (isAvailable - mutable) */}
                <div
                  onClick={() => setIsAvailable(!isAvailable)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: isAvailable ? '#07bc0c' : 'rgba(231, 76, 60, 0.12)',
                    border: isAvailable ? '1.5px solid #07bc0c' : '1px solid rgba(231, 76, 60, 0.3)',
                    color: isAvailable ? '#ffffff' : '#e74c3c',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    transition: 'all 0.2s ease',
                    userSelect: 'none'
                  }}
                >
                  {isAvailable ? (
                    <Eye size={16} strokeWidth={2.2} color="#ffffff" fill="none" />
                  ) : (
                    <EyeOff size={16} strokeWidth={2.2} color="#e74c3c" fill="none" />
                  )}
                  <span>{isAvailable ? 'Disponible' : 'Agotado'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Guardar Cambios' : 'Crear Plato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
