import React, { useEffect, useState } from 'react';
import { useTenant } from './context/TenantContext';
import { CartProvider } from './context/CartContext';
import { Dashboard } from './components/admin/Dashboard';
import { ClientMenuView } from './components/client/ClientMenuView';
import { Utensils, Shield, Store, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const { restaurants, activeRestaurant, setActiveRestaurant, loadRestaurantBySlug, isLoading } = useTenant();

  // Enrutamiento SPA básico soportado por vercel.json
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/admin';
  });

  // Sincronizar popstate (botones atrás/adelante del navegador)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Determinar ruta
  const isClientMenuRoute = currentPath.startsWith('/m/');
  const clientSlug = isClientMenuRoute ? currentPath.replace('/m/', '').split('/')[0] : null;

  // Cargar restaurante si estamos en la ruta de cliente
  useEffect(() => {
    if (clientSlug) {
      loadRestaurantBySlug(clientSlug);
    }
  }, [clientSlug]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,87,34,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: 600 }}>Cargando Menú Virtual...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // VISTA CLIENTE (/m/:slug)
  if (isClientMenuRoute && clientSlug) {
    const targetRestaurant = activeRestaurant?.slug === clientSlug
      ? activeRestaurant
      : restaurants.find((r) => r.slug === clientSlug);

    if (!targetRestaurant) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: 'var(--bg-main)' }}>
          <Store size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Restaurante no encontrado</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px' }}>
            El enlace "/m/{clientSlug}" no corresponde a un restaurante activo o aún no ha completado su configuración.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => navigateTo('/admin')} className="btn btn-primary">
              Ir al Panel Administrativo
            </button>
            {restaurants[0] && (
              <button onClick={() => navigateTo(`/m/${restaurants[0].slug}`)} className="btn btn-secondary">
                Ver Menú Demo ({restaurants[0].name})
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <CartProvider restaurantSlug={targetRestaurant.slug}>
        <ClientMenuView
          restaurant={targetRestaurant}
          onBackToAdmin={() => {
            setActiveRestaurant(targetRestaurant);
            navigateTo('/admin');
          }}
        />
      </CartProvider>
    );
  }

  // VISTA PANEL ADMINISTRATIVO (/admin o raíz)
  return (
    <Dashboard
      onNavigateToClient={(slug) => navigateTo(`/m/${slug}`)}
    />
  );
};
