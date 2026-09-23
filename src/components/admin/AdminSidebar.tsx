import React, { useState } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  QrCode,
  Settings,
  ExternalLink,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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

      <aside className={`admin-sidebar ${isOpenOnMobile ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Botón de Colapso del Sidebar */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="sidebar-toggle-btn"
          title={isCollapsed ? "Expandir barra lateral" : "Plegar barra lateral"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

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

            {!isCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }} className="sidebar-brand-info">
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
            )}

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
          {!isCollapsed && (
            <div style={{ marginTop: '0.85rem', width: '100%' }} className="sidebar-restaurant-selector">
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
          )}
        </div>

        {/* Lista de Módulos de Navegación */}
        <nav className="admin-sidebar-nav">
          {!isCollapsed && <span className="sidebar-nav-heading">MÓDULOS DEL NEGOCIO</span>}
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <li key={item.id} className="sidebar-nav-item-wrapper">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectModule(item.id);
                      onCloseMobile();
                    }}
                    className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="sidebar-nav-btn-content">
                      {/* SOLO mostrar el icono cuando la barra está CERRADA (isCollapsed = true) */}
                      {isCollapsed && <Icon size={20} className="sidebar-nav-icon" />}
                      {!isCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== null && (
                      <span className={`sidebar-nav-badge ${isActive ? 'active' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Tooltip redondeado que rompe el borde del sidebar al estar colapsado */}
                  {isCollapsed && (
                    <div className="sidebar-collapsed-tooltip">
                      <Icon size={14} className="tooltip-icon" />
                      <span>{item.label}</span>
                    </div>
                  )}
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
              onClick={() => onNavigateToClient(currentRestaurant.slug)}
              className="btn btn-primary btn-sm btn-full sidebar-action-btn"
              title={isCollapsed ? "Ver Menú Cliente" : undefined}
            >
              <ExternalLink size={15} />
              {!isCollapsed && <span>Ver Menú Cliente</span>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              {!isCollapsed && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tema visual</span>}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
