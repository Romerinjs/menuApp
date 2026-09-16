import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Plus, ArrowRight, Sparkles } from 'lucide-react';
import { Dish } from '../../types/restaurant';
import { formatCurrency } from '../../services/whatsapp';

interface FeaturedDishesProps {
  dishes: Dish[];
  currencySymbol: string;
  onSelectDish: (dish: Dish) => void;
  onQuickAdd: (dish: Dish) => void;
}

export const FeaturedDishes: React.FC<FeaturedDishesProps> = ({
  dishes,
  currencySymbol,
  onSelectDish,
  onQuickAdd
}) => {
  const featured = dishes.filter((d) => d.isFeatured && d.isAvailable);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Soporte para gestos táctiles (Swipe Left/Right)
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Avance automático cada 5 segundos
  useEffect(() => {
    if (featured.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [featured.length, isPaused]);

  if (featured.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe hacia la izquierda (Siguiente slide)
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swipe hacia la derecha (Anterior slide)
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section className="hero-slider-section reveal-on-scroll">
      <div
        className="hero-slider-card"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Contenedor del Track Deslizable (Motion Slide to Left) */}
        <div className="hero-slider-track-container">
          <div
            className="hero-slider-track"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {featured.map((dish, idx) => {
              const isActive = idx === currentIndex;

              return (
                <div
                  key={dish.id || idx}
                  className={`hero-slider-slide-item ${isActive ? 'active-slide' : ''}`}
                >
                  <div className="hero-slider-content">
                    {/* Columna Izquierda: Información de Texto y CTA */}
                    <div className="hero-slider-left">
                      <span className="hero-slider-badge">
                        <Star size={13} fill="var(--featured-gold)" color="var(--featured-gold)" />
                        RECOMENDADO DEL CHEF
                      </span>

                      <h2 className="hero-slider-title">
                        {dish.name.split(' ')[0]}{' '}
                        <span className="accent-text">
                          {dish.name.split(' ').slice(1).join(' ') || 'Especial'}
                        </span>
                      </h2>

                      <p className="hero-slider-desc">
                        {dish.description || 'Una creación artesanal preparada con los ingredientes más frescos para deleitar tu paladar.'}
                      </p>

                      <div className="hero-slider-cta-row">
                        <button
                          type="button"
                          onClick={() => onQuickAdd(dish)}
                          className="btn btn-primary hero-cta-btn"
                        >
                          <Plus size={16} /> Pedir Ahora • {formatCurrency(dish.price, currencySymbol)}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectDish(dish)}
                          className="btn btn-secondary hero-cta-btn-outline"
                        >
                          Ver Detalle <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Columna Derecha: Tarjeta Visual Destacada con Imagen */}
                    <div className="hero-slider-right">
                      <div className="hero-dish-image-wrapper" onClick={() => onSelectDish(dish)}>
                        <img
                          src={dish.imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'}
                          alt={dish.name}
                          className="hero-dish-img"
                        />

                        <div className="hero-dish-badge-pill">
                          <Sparkles size={13} color="var(--primary)" />
                          <span>100% Frescura & Sabor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barra de Controles Inferior (Flecha Izq - Puntos Indicadores - Flecha Der) */}
        {featured.length > 1 && (
          <div className="hero-slider-controls">
            <button
              type="button"
              onClick={handlePrev}
              className="hero-control-btn"
              aria-label="Anterior plato"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="hero-slider-dots">
              {featured.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`hero-slider-dot ${idx === currentIndex ? 'active' : ''}`}
                  aria-label={`Ir al slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="hero-control-btn"
              aria-label="Siguiente plato"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
