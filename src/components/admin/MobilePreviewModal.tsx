import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  ExternalLink,
  Wifi,
  Battery,
  Signal,
  RotateCcw
} from 'lucide-react';
import { Restaurant } from '../../types/restaurant';
import { CartProvider } from '../../context/CartContext';
import { ClientMenuView } from '../client/ClientMenuView';

interface MobilePreviewModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  onOpenExternal: () => void;
}

type DeviceType = 'iphone' | 'android';

export const MobilePreviewModal: React.FC<MobilePreviewModalProps> = ({
  restaurant,
  onClose,
  onOpenExternal
}) => {
  const [device, setDevice] = useState<DeviceType>('iphone');
  const [currentTime, setCurrentTime] = useState('9:41');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ padding: '0.5rem' }}>
      <div
        className="mobile-simulator-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de controles del simulador */}
        <header className="mobile-simulator-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Smartphone size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Simulador de Menú Móvil</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Experiencia en vivo para el comensal
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Selector de Dispositivo */}
            <div className="device-switcher">
              <button
                type="button"
                onClick={() => setDevice('iphone')}
                className={`device-btn ${device === 'iphone' ? 'active' : ''}`}
              >
                iPhone 15 Pro
              </button>
              <button
                type="button"
                onClick={() => setDevice('android')}
                className={`device-btn ${device === 'android' ? 'active' : ''}`}
              >
                Android Pixel
              </button>
            </div>

            {/* Recargar vista */}
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="btn btn-secondary btn-sm"
              title="Reiniciar simulador"
            >
              <RotateCcw size={14} />
            </button>

            {/* Abrir en pestaña real */}
            <button
              type="button"
              onClick={onOpenExternal}
              className="btn btn-primary btn-sm"
            >
              <ExternalLink size={14} /> Abrir Pestaña Real
            </button>

            {/* Cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="modal-close-btn"
              title="Cerrar simulador"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Chasis del Teléfono */}
        <div className="phone-wrapper">
          <div className={`phone-chassis ${device}`}>
            {/* Botones físicos decorativos en el marco exterior */}
            <div className="phone-btn-volume-up" />
            <div className="phone-btn-volume-down" />
            <div className="phone-btn-power" />

            {/* Pantalla interior */}
            <div className="phone-screen">
              {/* Barra de Estado superior (Status Bar) */}
              <div className="phone-status-bar">
                <span className="phone-clock">{currentTime}</span>

                {/* Cámara / Dynamic Island según dispositivo */}
                {device === 'iphone' ? (
                  <div className="dynamic-island" />
                ) : (
                  <div className="punch-hole-camera" />
                )}

                <div className="phone-status-icons">
                  <Signal size={12} />
                  <Wifi size={12} />
                  <Battery size={13} />
                </div>
              </div>

              {/* Contenido interactivo del menú cliente */}
              <div key={refreshKey} className="phone-content-scroll">
                <CartProvider restaurantSlug={restaurant.slug}>
                  <ClientMenuView restaurant={restaurant} />
                </CartProvider>
              </div>

              {/* Barra de inicio inferior (Home Indicator) */}
              <div className="phone-home-indicator-wrap">
                <div className="phone-home-bar" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
