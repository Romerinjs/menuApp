import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingBag, ArrowRight, SearchX } from 'lucide-react';
import { Restaurant, Dish } from '../../types/restaurant';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../services/whatsapp';
import { ClientHeader } from './ClientHeader';
import { FeaturedDishes } from './FeaturedDishes';
import { CategoryNav } from './CategoryNav';
import { DishCard } from './DishCard';
import { DishDetailModal } from './DishDetailModal';
import { CartDrawer } from './CartDrawer';
import { CheckoutModal } from './CheckoutModal';
import { SearchBar, QuickFilterType } from './SearchBar';
import { CategoryIcon } from '../common/CategoryIcon';
import { ClientAboutSection } from './ClientAboutSection';
import { ClientFooter } from './ClientFooter';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface ClientMenuViewProps {
  restaurant: Restaurant;
  onBackToAdmin?: () => void;
  isPreview?: boolean;
}

function adjustHexBrightness(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
  let b = (num & 0x0000ff) + Math.round(2.55 * percent);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const ClientMenuView: React.FC<ClientMenuViewProps> = ({
  restaurant,
  onBackToAdmin,
  isPreview = false
}) => {
  const { itemsCount, subtotal, isCartOpen, setIsCartOpen, addToCart } = useCart();

  // Activar Scroll Reveal en la vista del menú cliente
  useScrollReveal([restaurant.id]);

  // Variables CSS dinámicas para la paleta de 5 colores del restaurante
  const primaryColor = restaurant.palette?.primary || restaurant.themeColor || '#ff5722';
  const secondaryColor = restaurant.palette?.secondary || '#ff9800';
  const accentColor = restaurant.palette?.accent || '#f59e0b';
  const customBg = restaurant.palette?.backgroundDark;
  const customSurface = restaurant.palette?.surfaceDark;

  const themeStyles = useMemo(() => {
    const styles: Record<string, string> = {
      '--primary': primaryColor,
      '--primary-hover': adjustHexBrightness(primaryColor, -12),
      '--primary-glow': `${primaryColor}40`,
      '--primary-light': `${primaryColor}18`,
      '--secondary': secondaryColor,
      '--accent': accentColor,
      '--featured-gold': accentColor,
    };

    if (customBg) {
      styles['--bg-main'] = customBg;
    }
    if (customSurface) {
      styles['--bg-surface'] = customSurface;
      styles['--bg-surface-elevated'] = adjustHexBrightness(customSurface, 10);
    }

    return styles as React.CSSProperties;
  }, [primaryColor, secondaryColor, accentColor, customBg, customSurface]);

  const [activeCategoryId, setActiveCategoryId] = useState(restaurant.categories[0]?.id || '');
  const [selectedDishForModal, setSelectedDishForModal] = useState<Dish | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Animación de growth/degrowth para cuando se añade un plato
  const [isCartBumping, setIsCartBumping] = useState(false);
  const prevItemsCount = useRef(itemsCount);

  useEffect(() => {
    if (itemsCount > prevItemsCount.current) {
      setIsCartBumping(true);
      const timer = setTimeout(() => setIsCartBumping(false), 400);
      return () => clearTimeout(timer);
    }
    prevItemsCount.current = itemsCount;
  }, [itemsCount]);

  // Estados de Búsqueda y Filtros Rápidos
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');

  // Normalizador para búsqueda insensible a acentos y mayúsculas
  const normalize = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const isFiltered = searchTerm.trim() !== '' || quickFilter !== 'all';

  // Platos filtrados en tiempo real
  const filteredDishes = useMemo(() => {
    const cleanQuery = normalize(searchTerm);

    return restaurant.dishes.filter((dish) => {
      // Filtros rápidos
      if (quickFilter === 'featured' && !dish.isFeatured) return false;
      if (quickFilter === 'bestseller' && !dish.isBestSeller) return false;
      if (quickFilter === 'available' && !dish.isAvailable) return false;

      // Filtro de texto por nombre, descripción o categoría
      if (cleanQuery !== '') {
        const matchName = normalize(dish.name).includes(cleanQuery);
        const matchDesc = normalize(dish.description || '').includes(cleanQuery);
        const category = restaurant.categories.find((c) => c.id === dish.categoryId);
        const matchCat = category ? normalize(category.name).includes(cleanQuery) : false;

        if (!matchName && !matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [restaurant.dishes, restaurant.categories, searchTerm, quickFilter]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setQuickFilter('all');
  };

  // Scroll suave hacia la categoría
  const handleScrollToCategory = (catId: string) => {
    setActiveCategoryId(catId);
    const element = document.getElementById(`cat-section-${catId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="client-layout" style={themeStyles}>
      {/* Cabecera con datos del negocio y enlace a Google Maps */}
      <ClientHeader
        restaurant={restaurant}
        onBackToAdmin={onBackToAdmin}
      />

      {/* Barra de Búsqueda y Filtros Rápidos */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={quickFilter}
        onFilterChange={setQuickFilter}
        resultsCount={filteredDishes.length}
        isFiltered={isFiltered}
        onClearAll={handleClearAllFilters}
      />

      {/* Si no hay búsqueda/filtros, mostrar Carrusel de Destacados y Navegación de Categorías */}
      {!isFiltered && (
        <>
          {/* Carrusel de Platos Destacados del Chef ⭐ */}
          <FeaturedDishes
            dishes={restaurant.dishes}
            currencySymbol={restaurant.currencySymbol}
            onSelectDish={(dish) => setSelectedDishForModal(dish)}
            onQuickAdd={(dish) => addToCart(dish, 1)}
          />

          {/* Sección de Historia & Filosofía del Restaurante */}
          <ClientAboutSection restaurant={restaurant} />

          {/* Navegación Pegajosa de Categorías */}
          {restaurant.categories.length > 0 && (
            <CategoryNav
              categories={restaurant.categories}
              activeCategoryId={activeCategoryId}
              onSelectCategory={handleScrollToCategory}
            />
          )}
        </>
      )}

      {/* Listado de Platos */}
      <main className="client-menu-container">
        {isFiltered ? (
          // Vista de Resultados Filtrados
          filteredDishes.length === 0 ? (
            <div className="search-empty-state">
              <div className="search-empty-icon">
                <SearchX size={28} />
              </div>
              <div className="search-empty-title">No encontramos platos coincidentes</div>
              <div className="search-empty-desc">
                No hay platos que coincidan con tu búsqueda o filtros seleccionados. Prueba con otros términos como "hamburguesa", "papas", o ingredientes.
              </div>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="btn btn-secondary btn-sm"
              >
                Restablecer búsqueda
              </button>
            </div>
          ) : (
            <div className="dishes-list">
              {filteredDishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  currencySymbol={restaurant.currencySymbol}
                  onSelect={(d) => setSelectedDishForModal(d)}
                  onQuickAdd={(d) => addToCart(d, 1)}
                />
              ))}
            </div>
          )
        ) : (
          // Vista Estándar Agrupada por Categorías
          restaurant.categories.map((category) => {
            const categoryDishes = restaurant.dishes.filter((d) => d.categoryId === category.id);
            if (categoryDishes.length === 0) return null;

            return (
              <section
                key={category.id}
                id={`cat-section-${category.id}`}
                className="category-group reveal-on-scroll"
              >
                <h3 className="category-group-header">
                  <CategoryIcon iconName={category.icon} size={20} />
                  <span>{category.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    ({categoryDishes.length})
                  </span>
                </h3>

                <div className="dishes-list">
                  {categoryDishes.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      currencySymbol={restaurant.currencySymbol}
                      onSelect={(d) => setSelectedDishForModal(d)}
                      onQuickAdd={(d) => addToCart(d, 1)}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* Barra flotante inferior de Carrito cuando hay productos seleccionados */}
      {itemsCount > 0 && !isCartOpen && !isPreview && (
        <div
          className={`floating-cart-bar ${isCartBumping ? 'cart-pop-animation' : ''}`}
          onClick={() => setIsCartOpen(true)}
        >
          <div className="floating-cart-info">
            <div className="cart-count-bubble">{itemsCount}</div>
            <span style={{ fontWeight: 600 }}>Ver Mi Pedido</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="floating-cart-total">
              {formatCurrency(subtotal, restaurant.currencySymbol)}
            </span>
            <ArrowRight size={18} />
          </div>
        </div>
      )}

      {/* Modal de Detalle de Plato (Notas e Instrucciones) */}
      {selectedDishForModal && (
        <DishDetailModal
          dish={selectedDishForModal}
          currencySymbol={restaurant.currencySymbol}
          onAddToCart={(dish, qty, notes) => addToCart(dish, qty, notes)}
          onClose={() => setSelectedDishForModal(null)}
        />
      )}

      {/* Drawer Deslizable del Carrito */}
      <CartDrawer
        restaurant={restaurant}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Modal de Checkout & Envío por WhatsApp */}
      {isCheckoutOpen && (
        <CheckoutModal
          restaurant={restaurant}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}

      {/* Footer Dinámico del Restaurante */}
      <ClientFooter
        restaurant={restaurant}
        onSelectCategory={handleScrollToCategory}
        onOpenCart={() => setIsCartOpen(true)}
      />
    </div>
  );
};
