import React from 'react';
import {
  CheckCircle2,
  Circle,
  CreditCard,
  QrCode,
  Share2,
  MapPin,
  Utensils,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { Restaurant } from '../../types/restaurant';

interface MenuSetupChecklistProps {
  restaurant: Restaurant;
  onOpenSettings: (tab: 'general' | 'service' | 'location' | 'payments' | 'channels') => void;
  onNavigateToDishes: () => void;
}

export const MenuSetupChecklist: React.FC<MenuSetupChecklistProps> = ({
  restaurant,
  onOpenSettings,
  onNavigateToDishes
}) => {
  // Verificación de ítems de configuración
  const hasLogo = Boolean(restaurant.logoUrl && restaurant.logoUrl.trim() !== '');
  const hasDishes = restaurant.dishes && restaurant.dishes.length >= 2;
  const hasLocation = Boolean(restaurant.address && restaurant.address.trim() !== '');
  const hasSocials = Boolean(
    restaurant.socialLinks &&
    Object.values(restaurant.socialLinks).some((val) => val && val.trim() !== '')
  );
  const hasMultiplePhones = Boolean(restaurant.contactPhones && restaurant.contactPhones.length > 0);
  const isPaymentPluginEnabled = Boolean(restaurant.paymentConfig?.enabled);
  const hasPaymentMethods = Boolean(
    restaurant.paymentConfig?.methods &&
    restaurant.paymentConfig.methods.filter((m) => m.isActive).length > 0
  );

  const checklistItems = [
    {
      id: 'dishes',
      title: 'Agregar al menos 2 platos al menú',
      subtitle: `${restaurant.dishes.length} platos cargados actualmente`,
      done: hasDishes,
      icon: Utensils,
      action: onNavigateToDishes,
      actionLabel: 'Ver Platos'
    },
    {
      id: 'payments',
      title: 'Activar Métodos de Pago & Bre-B / QR',
      subtitle: hasPaymentMethods
        ? `${restaurant.paymentConfig?.methods.length} métodos configurados`
        : 'Sube tus QRs de Nequi, Bancolombia, Bre-B o efectivo',
      done: isPaymentPluginEnabled && hasPaymentMethods,
      highlight: !isPaymentPluginEnabled || !hasPaymentMethods,
      icon: CreditCard,
      action: () => onOpenSettings('payments'),
      actionLabel: 'Configurar Pagos'
    },
    {
      id: 'channels',
      title: 'Redes sociales y teléfonos de atención',
      subtitle: hasSocials || hasMultiplePhones ? 'Configurados correctamente' : 'Enlaza tu Instagram, TikTok o teléfonos adicionales',
      done: hasSocials || hasMultiplePhones,
      icon: Share2,
      action: () => onOpenSettings('channels'),
      actionLabel: 'Gestionar'
    },
    {
      id: 'location',
      title: 'Ubicación física en Google Maps',
      subtitle: hasLocation ? restaurant.address : 'Agrega tu dirección o link de Maps',
      done: hasLocation,
      icon: MapPin,
      action: () => onOpenSettings('location'),
      actionLabel: 'Añadir Ubicación'
    },
    {
      id: 'logo',
      title: 'Logotipo & Portada de Marca',
      subtitle: hasLogo ? 'Identidad gráfica lista' : 'Sube tu logo para mayor reconocimiento',
      done: hasLogo,
      icon: Sparkles,
      action: () => onOpenSettings('general'),
      actionLabel: 'Subir Logo'
    }
  ];

  const completedCount = checklistItems.filter((item) => item.done).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  if (progressPercent === 100) {
    return null; // Si todo está 100% completo, no satura la pantalla
  }

  return (
    <div
      className="dashboard-card"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.06) 0%, rgba(245, 158, 11, 0.03) 100%), var(--bg-surface)',
        border: '1px solid var(--border-glass)',
        marginBottom: '1.75rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Resplandor decorativo de fondo */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'var(--primary-glow)',
          opacity: 0.15,
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px var(--primary-glow)'
            }}
          >
            <Zap size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
              Termina de Configurar tu Menú
            </h3>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {completedCount} de {checklistItems.length} tareas listas para maximizar tus ventas
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '180px' }}>
          <div style={{ flex: 1, height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary), var(--featured-gold))',
                borderRadius: '999px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', minWidth: '35px' }}>
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Lista de ítems del checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {checklistItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={item.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: item.highlight
                  ? 'rgba(255, 87, 34, 0.08)'
                  : 'var(--bg-surface-elevated)',
                border: item.highlight
                  ? '1px solid rgba(255, 87, 34, 0.3)'
                  : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ color: item.done ? 'var(--success)' : item.highlight ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {item.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: item.done ? 'var(--text-primary)' : 'var(--text-primary)', textDecoration: item.done ? 'none' : 'none' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)' }}>
                <span>{item.actionLabel}</span>
                <ChevronRight size={13} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
