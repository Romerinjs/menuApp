import React, { useState } from 'react';
import {
  Menu,
  ChevronRight,
  PlusCircle,
  AlertTriangle,
  Sparkles,
  Phone,
  MapPin,
  CheckCircle,
  SlidersHorizontal,
  Settings,
  UtensilsCrossed,
  Tags,
  QrCode,
  Star,
  Flame,
  CheckCircle2,
  ExternalLink,
  Store,
  Layers,
  Bike,
  ShoppingBag,
  Utensils
} from 'lucide-react';
import { Restaurant, Dish } from '../../types/restaurant';
import { useTenant } from '../../context/TenantContext';
import { OnboardingWizard } from './OnboardingWizard';
import { CategoryManager } from './CategoryManager';
import { DishManager } from './DishManager';
import { DishEditorModal } from './DishEditorModal';
import { QRCodeCard } from './QRCodeCard';
import { RestaurantSettingsModal, SettingsTabType } from './RestaurantSettingsModal';
import { MobilePreviewModal } from './MobilePreviewModal';
import { AdminSidebar, AdminModuleType } from './AdminSidebar';
import { ThemeToggle } from '../common/ThemeToggle';
import { CategoryIcon } from '../common/CategoryIcon';
import { ConfirmModal } from '../common/ConfirmModal';
import { MenuSetupChecklist } from './MenuSetupChecklist';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface DashboardProps {
  initialRestaurant?: Restaurant;
  onNavigateToClient: (slug: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToClient }) => {
  useScrollReveal();
  const {
    restaurants,
    activeRestaurant,
    setActiveRestaurant,
    saveRestaurant,
    saveCategory,
    deleteCategory,
    saveDish,
    deleteDish,
    toggleDishAvailability,
    createBlankRestaurant
  } = useTenant();

  // Estados de navegación y módulos
  const [activeModule, setActiveModule] = useState<AdminModuleType>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Estados de modales y filtros
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null | undefined>(undefined); // undefined = cerrado, null = nuevo
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTabType>('general');
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isReconfigureConfirmOpen, setIsReconfigureConfirmOpen] = useState(false);

  // Si no hay restaurante seleccionado, usar el primero o crear uno nuevo
  const currentRestaurant = activeRestaurant || restaurants[0];

  const handleCreateNewRestaurant = () => {
    const fresh = createBlankRestaurant();
    setActiveRestaurant(fresh);
  };

  const handleCompleteOnboarding = async (completed: Restaurant) => {
    await saveRestaurant(completed);
  };

  if (!currentRestaurant) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>No hay restaurantes registrados</h2>
        <button
          type="button"
          onClick={() => createBlankRestaurant()}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Crear Primer Restaurante
        </button>
      </div>
    );
  }

  // REGLA CLAVE: Si el onboarding no está completado, mostrar el Wizard obligatorio
  if (!currentRestaurant.onboardingCompleted) {
    return (
      <div className="admin-layout">
        <header className="admin-navbar">
          <div className="admin-brand">
            <div className="admin-brand-icon">
              <UtensilsCrossed size={22} color="#fff" />
            </div>
            <div className="admin-brand-info">
              <h2>MenuApp Backoffice</h2>
              <span>Configuración inicial del negocio</span>
            </div>
          </div>
          <div className="admin-nav-actions">
            {restaurants.length > 0 && (
              <select
                value={currentRestaurant.id}
                onChange={(e) => {
                  const found = restaurants.find((r) => r.id === e.target.value);
                  if (found) setActiveRestaurant(found);
                }}
                className="form-select"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', width: 'auto' }}
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.slug} {r.onboardingCompleted ? '(Completado)' : '(Incompleto)'}
                  </option>
                ))}
              </select>
            )}
            <ThemeToggle />
          </div>
        </header>

        <main className="onboarding-full-container">
          <OnboardingWizard
            initialRestaurant={currentRestaurant}
            onComplete={handleCompleteOnboarding}
          />
        </main>
      </div>
    );
  }

  // DASHBOARD DESBLOQUEADO (ARQUITECTURA SAAS CON SIDEBAR MODULAR)
  const featuredDishes = currentRestaurant.dishes.filter((d) => d.isFeatured);
  const bestSellerDishes = currentRestaurant.dishes.filter((d) => d.isBestSeller);
  const availableDishes = currentRestaurant.dishes.filter((d) => d.isAvailable);

  return (
    <div className="admin-shell">
      {/* Barra Lateral Persistente (Sidebar) */}
      <AdminSidebar
        currentRestaurant={currentRestaurant}
        restaurants={restaurants}
        activeModule={activeModule}
        onSelectModule={(mod) => {
          if (mod === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setActiveModule(mod);
          }
        }}
        onSelectRestaurant={(id) => {
          const found = restaurants.find((r) => r.id === id);
          if (found) setActiveRestaurant(found);
        }}
        onCreateNewRestaurant={handleCreateNewRestaurant}
        onOpenMobileSimulator={() => setIsMobilePreviewOpen(true)}
        onNavigateToClient={onNavigateToClient}
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Contenedor Principal */}
      <div className="admin-main-wrapper">
        {/* Barra Superior con Breadcrumb y Acciones Contextuales */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="admin-mobile-menu-btn"
              title="Abrir menú de navegación"
            >
              <Menu size={18} />
            </button>

            <div className="admin-topbar-breadcrumb">
              <span className="breadcrumb-restaurant-name">{currentRestaurant.name}</span>
              <ChevronRight size={14} className="breadcrumb-separator" color="var(--text-muted)" />
              <strong className="breadcrumb-module-name">
                {activeModule === 'overview' && 'Resumen General'}
                {activeModule === 'dishes' && 'Platos & Menú'}
                {activeModule === 'categories' && 'Categorías'}
                {activeModule === 'qr' && 'Códigos QR & Mesas'}
                {activeModule === 'settings' && 'Ajustes del Negocio'}
              </strong>
            </div>
          </div>

          <div className="admin-topbar-actions">
            {activeModule === 'dishes' && (
              <button
                type="button"
                onClick={() => setEditingDish(null)}
                className="btn btn-primary btn-sm topbar-action-btn"
              >
                <PlusCircle size={15} />
                <span className="topbar-btn-text">Nuevo Plato</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateToClient(currentRestaurant.slug)}
              className="btn btn-primary btn-sm topbar-action-btn"
              title="Ver cómo ve el cliente el menú virtual"
            >
              <ExternalLink size={15} />
              <span className="topbar-btn-text-optional">Menú Cliente</span>
            </button>
          </div>
        </header>

        {/* Vista del Módulo Activo */}
        <main className="admin-content-view">
          {/* MÓDULO 1: RESUMEN GENERAL (OVERVIEW) */}
          {activeModule === 'overview' && (
            <div>
              {/* Checklist Interactivo: Termina de Configurar tu Menú */}
              <MenuSetupChecklist
                restaurant={currentRestaurant}
                onOpenSettings={(tab) => {
                  setSettingsInitialTab(tab);
                  setIsSettingsOpen(true);
                }}
                onNavigateToDishes={() => setActiveModule('dishes')}
              />

              {/* Banner de Bienvenida y Estado del Local */}
              <div className="overview-welcome-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {currentRestaurant.logoUrl ? (
                    <img
                      src={currentRestaurant.logoUrl}
                      alt={currentRestaurant.name}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                        border: '1px solid var(--border-glass)'
                      }}
                    />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px var(--primary-glow)', color: '#fff' }}>
                      <UtensilsCrossed size={26} />
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{currentRestaurant.name}</h2>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={13} color="var(--whatsapp-green)" /> {currentRestaurant.whatsappCountryCode} {currentRestaurant.whatsappNumber}
                      </span>
                      {currentRestaurant.address && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={13} color="#38bdf8" /> {currentRestaurant.address}
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                        {currentRestaurant.modalities?.delivery && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Bike size={14} color="var(--primary)" /> Domicilio
                          </span>
                        )}
                        {currentRestaurant.modalities?.pickup && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ShoppingBag size={14} color="var(--primary)" /> Retiro en Local
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Settings size={14} /> Editar Perfil
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsReconfigureConfirmOpen(true)}
                    className="btn btn-secondary btn-sm"
                    title="Reiniciar los 5 pasos"
                  >
                    <SlidersHorizontal size={14} /> Reconfigurar
                  </button>
                </div>
              </div>

              {/* Tarjetas de Métricas Estadísticas del Negocio */}
              <div className="stat-cards-grid">
                {/* Métrica 1: Platos Totales */}
                <div
                  className="stat-card-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveModule('dishes')}
                  title="Ver catálogo de platos"
                >
                  <div className="stat-card-header">
                    <span className="stat-card-title">PLATOS EN CARTA</span>
                    <div className="stat-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <UtensilsCrossed size={18} />
                    </div>
                  </div>
                  <div className="stat-card-value" style={{ color: 'var(--primary)' }}>
                    {currentRestaurant.dishes.length}
                  </div>
                </div>

                {/* Métrica 2: Platos Destacados ⭐ */}
                <div
                  className="stat-card-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveModule('dishes')}
                  title="Ver platos destacados"
                >
                  <div className="stat-card-header">
                    <span className="stat-card-title">DESTACADOS DEL CHEF</span>
                    <div className="stat-card-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: 'var(--featured-gold)' }}>
                      <Star size={18} fill="currentColor" />
                    </div>
                  </div>
                  <div className="stat-card-value" style={{ color: 'var(--featured-gold)' }}>
                    {featuredDishes.length}
                  </div>
                </div>

                {/* Métrica 3: Más Vendidos 🔥 */}
                <div
                  className="stat-card-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveModule('dishes')}
                  title="Ver más vendidos"
                >
                  <div className="stat-card-header">
                    <span className="stat-card-title">MÁS VENDIDOS</span>
                    <div className="stat-card-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      <Flame size={18} />
                    </div>
                  </div>
                  <div className="stat-card-value" style={{ color: '#ef4444' }}>
                    {bestSellerDishes.length}
                  </div>
                </div>

                {/* Métrica 4: Disponibles vs Agotados */}
                <div
                  className="stat-card-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveModule('dishes')}
                  title="Ver disponibilidad"
                >
                  <div className="stat-card-header">
                    <span className="stat-card-title">DISPONIBILIDAD</span>
                    <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                    {availableDishes.length}
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      /{currentRestaurant.dishes.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid de Secciones Rápidas del Resumen */}
              <div className="overview-sections-grid">
                {/* Columna Izquierda: Platos Destacados y Accesos Rápidos */}
                <div>
                  <div className="dashboard-card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={18} color="var(--featured-gold)" fill="currentColor" />
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Platos Destacados del Chef ({featuredDishes.length})</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveModule('dishes')}
                        className="btn btn-secondary btn-sm"
                      >
                        Gestionar Platos
                      </button>
                    </div>

                    {featuredDishes.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                        <p>No tienes platos marcados como destacados actualmente.</p>
                        <button
                          type="button"
                          onClick={() => setActiveModule('dishes')}
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: '0.75rem' }}
                        >
                          Destacar Platos
                        </button>
                      </div>
                    ) : (
                      <div className="overview-featured-grid">
                        {featuredDishes.slice(0, 4).map((dish) => (
                          <div
                            key={dish.id}
                            style={{
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-md)',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            <div style={{ height: '110px', position: 'relative' }}>
                              {dish.imageUrl ? (
                                <img
                                  src={dish.imageUrl}
                                  alt={dish.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{ width: '100%', height: '100%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                  <Utensils size={24} />
                                </div>
                              )}
                              <span
                                className="badge badge-featured"
                                style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Star size={10} fill="var(--featured-gold)" /> Destacado
                              </span>
                            </div>

                            <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                <h4 style={{ fontSize: '0.92rem', marginBottom: '0.2rem' }}>{dish.name}</h4>
                                <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary)' }}>
                                  {currentRestaurant.currencySymbol} {dish.price.toLocaleString('es-CO')}
                                </div>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                                <button
                                  type="button"
                                  onClick={() => toggleDishAvailability(dish.id)}
                                  className={`badge ${dish.isAvailable ? 'badge-available' : 'badge-soldout'}`}
                                  style={{ cursor: 'pointer', border: 'none' }}
                                  title="Alternar disponibilidad"
                                >
                                  {dish.isAvailable ? 'Disponible' : 'Agotado'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setEditingDish(dish)}
                                  style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline' }}
                                >
                                  Editar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna Derecha: Tarjeta QR Rápida y Canales */}
                <div>
                  <QRCodeCard
                    restaurant={currentRestaurant}
                    onOpenClientMenu={() => onNavigateToClient(currentRestaurant.slug)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO 2: PLATOS & MENÚ */}
          {activeModule === 'dishes' && (
            <div>
              {/* Filtro de categorías horizontal para navegar platos cómodamente */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className={`btn btn-sm ${selectedCategoryId === null ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Layers size={14} /> Todos los platos ({currentRestaurant.dishes.length})
                </button>
                {currentRestaurant.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`btn btn-sm ${selectedCategoryId === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <CategoryIcon iconName={cat.icon} size={14} /> {cat.name} ({currentRestaurant.dishes.filter((d) => d.categoryId === cat.id).length})
                  </button>
                ))}
              </div>

              {/* Gestor Completo de Platos */}
              <DishManager
                dishes={currentRestaurant.dishes}
                categories={currentRestaurant.categories}
                selectedCategoryId={selectedCategoryId}
                currencySymbol={currentRestaurant.currencySymbol}
                onEditDish={(dish) => setEditingDish(dish)}
                onNewDish={() => setEditingDish(null)}
                onDeleteDish={(id) => deleteDish(id)}
                onToggleAvailability={(id) => toggleDishAvailability(id)}
              />
            </div>
          )}

          {/* MÓDULO 3: CATEGORÍAS */}
          {activeModule === 'categories' && (
            <div style={{ maxWidth: '850px' }}>
              <CategoryManager
                categories={currentRestaurant.categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                onAddCategory={(cat) => saveCategory(cat)}
                onDeleteCategory={(id) => deleteCategory(id)}
              />
            </div>
          )}

          {/* MÓDULO 4: CÓDIGOS QR & MESAS */}
          {activeModule === 'qr' && (
            <div style={{ maxWidth: '650px', margin: '0 auto' }}>
              <QRCodeCard
                restaurant={currentRestaurant}
                onOpenClientMenu={() => onNavigateToClient(currentRestaurant.slug)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modal para Crear / Editar Platos */}
      {editingDish !== undefined && (
        <DishEditorModal
          dish={editingDish}
          categories={currentRestaurant.categories}
          currencySymbol={currentRestaurant.currencySymbol}
          restaurantSlug={currentRestaurant.slug}
          onSave={async (savedDish) => {
            await saveDish(savedDish);
            setEditingDish(undefined);
          }}
          onClose={() => setEditingDish(undefined)}
        />
      )}

      {/* Modal de Ajustes Rápidos del Negocio */}
      {isSettingsOpen && (
        <RestaurantSettingsModal
          restaurant={currentRestaurant}
          initialTab={settingsInitialTab}
          onSave={async (updated) => {
            await saveRestaurant(updated);
            setIsSettingsOpen(false);
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Modal del Simulador de Pantalla Móvil */}
      {isMobilePreviewOpen && (
        <MobilePreviewModal
          restaurant={currentRestaurant}
          onClose={() => setIsMobilePreviewOpen(false)}
          onOpenExternal={() => {
            setIsMobilePreviewOpen(false);
            onNavigateToClient(currentRestaurant.slug);
          }}
        />
      )}

      {/* Modal de confirmación para reabrir el Asistente de Configuración */}
      <ConfirmModal
        isOpen={isReconfigureConfirmOpen}
        title="¿Reabrir Asistente de Configuración?"
        message="Volverás a abrir el asistente interactivo de 5 pasos para ajustar los datos de tu restaurante. Toda tu información y platos actuales se mantendrán intactos."
        confirmText="Sí, reconfigurar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={() => {
          saveRestaurant({ ...currentRestaurant, onboardingCompleted: false });
          setIsReconfigureConfirmOpen(false);
        }}
        onClose={() => setIsReconfigureConfirmOpen(false)}
      />
    </div>
  );
};
