import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  QrCode,
  Settings,
  Smartphone,
  ExternalLink,
  PlusCircle,
  X
} from 'lucide-react';
import { Restaurant } from '../../types/restaurant';
import { ThemeToggle } from '../common/ThemeToggle';

export type AdminModuleType = 'overview' | 'dishes' | 'categories' | 'qr' | 'settings';

interface AdminSidebarProps {
  currentRestaurant: Restaurant;
  restaurants: Restaurant[];
  activeModule: AdminModuleType;
  onSelectModule: (module: AdminModuleType) => void;
  onSelectRestaurant: (restaurantId: string) => void;
  onCreateNewRestaurant: () => void;
  onOpenMobileSimulator: () => void;
  onNavigateToClient: (slug: string) => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentRestaurant,
  restaurants,
  activeModule,
  onSelectModule,
  onSelectRestaurant,
  onCreateNewRestaurant,
  onOpenMobileSimulator,
  onNavigateToClient,
  isOpenOnMobile,
  onCloseMobile
}) => {
  const navItems = [
    {
      id: 'overview' as AdminModuleType,
      label: 'Resumen General',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'dishes' as AdminModuleType,
      label: 'Platos & Menú',
      icon: UtensilsCrossed,
      badge: currentRestaurant.dishes.length
    },
    {
      id: 'categories' as AdminModuleType,
      label: 'Categorías',
      icon: Tags,
      badge: currentRestaurant.categories.length
    },
    {
      id: 'qr' as AdminModuleType,
      label: 'Código QR de Mesas',
      icon: QrCode,
      badge: null
    },
    {
      id: 'settings' as AdminModuleType,
      label: 'Ajustes del Negocio',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <>
      {/* Overlay para móviles */}
      {isOpenOnMobile && (
        <div className="admin-sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`admin-sidebar ${isOpenOnMobile ? 'open' : ''}`}>
        {/* Encabezado del Negocio en Sidebar */}
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
            {currentRestaurant.logoUrl ? (
              <img
                src={currentRestaurant.logoUrl}
                alt={currentRestaurant.name}
                className="admin-sidebar-logo"
              />
            ) : (
              <div className="admin-sidebar-logo-fallback">
                <UtensilsCrossed size={22} color="#fff" />
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="admin-sidebar-title" title={currentRestaurant.name}>
                {currentRestaurant.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                <span className="sidebar-online-dot" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Menú Activo
                </span>
              </div>
            </div>

            {/* Botón cerrar en móvil */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="admin-sidebar-close-mobile"
            >
              <X size={18} />
            </button>
          </div>

          {/* Selector de Restaurantes */}
          <div style={{ marginTop: '0.85rem', width: '100%' }}>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <select
                value={currentRestaurant.id}
                onChange={(e) => onSelectRestaurant(e.target.value)}
                className="form-select admin-sidebar-select"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.slug}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onCreateNewRestaurant}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.45rem', flexShrink: 0 }}
                title="Crear nuevo restaurante"
              >
                <PlusCircle size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Módulos de Navegación */}
        <nav className="admin-sidebar-nav">
          <span className="sidebar-nav-heading">MÓDULOS DEL NEGOCIO</span>
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule(item.id);
                      onCloseMobile();
                    }}
                    className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Icon size={18} className="sidebar-nav-icon" />
                      <span className="sidebar-nav-label">{item.label}</span>
                    </div>

                    {item.badge !== null && (
                      <span className={`sidebar-nav-badge ${isActive ? 'active' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar con Acciones de Previsualización y Tema */}
        <div className="admin-sidebar-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <button
              type="button"
              onClick={() => {
                onOpenMobileSimulator();
                onCloseMobile();
              }}
              className="btn btn-secondary btn-sm btn-full sidebar-action-btn"
            >
              <Smartphone size={15} color="var(--primary)" />
              <span>Simulador Móvil</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToClient(currentRestaurant.slug)}
              className="btn btn-primary btn-sm btn-full sidebar-action-btn"
            >
              <ExternalLink size={15} />
              <span>Ver Menú Cliente</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tema visual</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
