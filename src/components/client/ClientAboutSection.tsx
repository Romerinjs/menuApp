import React from 'react';
import {
  Sparkles,
  Clock,
  MapPin,
  ShieldCheck,
  Heart,
  Award,
  Leaf,
  Zap,
  CheckCircle2,
  Bike
} from 'lucide-react';
import { Restaurant } from '../../types/restaurant';

interface ClientAboutSectionProps {
  restaurant: Restaurant;
}

export const ClientAboutSection: React.FC<ClientAboutSectionProps> = ({ restaurant }) => {
  if (!restaurant.story && !restaurant.tagline && !restaurant.shortDescription) return null;

  const totalDishes = restaurant.dishes?.length || 0;
  const mainImage =
    restaurant.coverUrl ||
    restaurant.dishes?.[0]?.imageUrl ||
    restaurant.logoUrl ||
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80';

  // Dividir historia en párrafos
  const storyParagraphs = restaurant.story
    ? restaurant.story.split('\n').filter((p) => p.trim() !== '')
    : [];

  const titleText = restaurant.tagline || 'El sabor de lo que somos';

  return (
    <section
      className="client-about-section reveal-on-scroll"
      style={{
        margin: '1.5rem auto',
        maxWidth: '1100px',
        padding: '0 1rem'
      }}
    >
      {/* ESTRUCTURA DE 2 COLUMNAS ESCALABLE (LADO A LADO EN MÓVIL Y DESKTOP SIN SALTO VERTICAL) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
          gap: 'clamp(0.75rem, 2.5vw, 2.25rem)',
          alignItems: 'center',
          background: 'transparent'
        }}
      >
        {/* COLUMNA IZQUIERDA: TEXTO, ESLOGAN & HISTORIA (SIN ETIQUETA / SIN TARJETAS PEQUEÑAS) */}
        <div style={{ textAlign: 'left', minWidth: 0 }}>
          {/* Título o Eslogan Principal */}
          <h2
            style={{
              fontSize: 'clamp(1.15rem, 3.2vw, 2.25rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              margin: '0 0 0.65rem 0',
              color: 'var(--text-primary)'
            }}
          >
            {titleText}
          </h2>

          {/* DESCRIPCIÓN COMERCIAL & FEED */}
          {restaurant.shortDescription && (
            <p
              style={{
                fontSize: 'clamp(0.8rem, 1.4vw, 1.02rem)',
                lineHeight: 1.55,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 0.75rem 0',
                opacity: 0.95
              }}
            >
              {restaurant.shortDescription}
            </p>
          )}

          {/* PÁRRAFOS DE HISTORIA / FILOSOFÍA */}
          {storyParagraphs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {storyParagraphs.map((p, idx) => (
                <p
                  key={idx}
                  style={{
                    fontSize: 'clamp(0.72rem, 1.25vw, 0.92rem)',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}
                >
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: IMAGEN CON BADGE FLOTANTE (ESCALABLE) */}
        <div style={{ minWidth: 0, position: 'relative' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 'clamp(170px, 32vw, 360px)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <img
              src={mainImage}
              alt={restaurant.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease'
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 45%, rgba(0, 0, 0, 0.65) 100%)'
              }}
            />

            {/* Badge flotante inferior esquina de la imagen */}
            <div
              style={{
                position: 'absolute',
                bottom: 'clamp(8px, 1.5vw, 16px)',
                left: 'clamp(8px, 1.5vw, 16px)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: 'clamp(0.25rem, 0.8vw, 0.45rem) clamp(0.6rem, 1.2vw, 1rem)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(0.35rem, 0.8vw, 0.65rem)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                color: '#1e293b',
                whiteSpace: 'nowrap',
                maxWidth: '90%'
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  lineHeight: 1
                }}
              >
                {totalDishes > 0 ? totalDishes : '10+'}
              </div>
              <div style={{ fontSize: 'clamp(0.62rem, 1.1vw, 0.78rem)', fontWeight: 700, lineHeight: 1.15 }}>
                Opciones Oficiales<br />
                <span style={{ fontSize: 'clamp(0.55rem, 0.95vw, 0.68rem)', fontWeight: 500, color: '#64748b' }}>con Precios al Día</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
