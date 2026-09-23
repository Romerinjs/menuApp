import React, { useState } from 'react';
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Clock,
  Bike,
  ShoppingBag,
  ShieldCheck,
  ArrowUp,
  Globe,
  Share2,
  MessageCircle,
  FileText,
  Cookie,
  ShoppingBasket
} from 'lucide-react';
import { Restaurant } from '../../types/restaurant';
import { ThemeToggle } from '../common/ThemeToggle';
import { InstagramIcon, TikTokIcon, FacebookIcon, LinkedInIcon, YouTubeIcon, WebsiteIcon, TwitterIcon } from '../common/SocialIcons';

interface ClientFooterProps {
  restaurant: Restaurant;
  onSelectCategory?: (categoryId: string) => void;
  onOpenCart?: () => void;
}

export const ClientFooter: React.FC<ClientFooterProps> = ({
  restaurant,
  onSelectCategory,
  onOpenCart
}) => {
  const [activeModalNotice, setActiveModalNotice] = useState<'privacy' | 'cookies' | null>(null);

  const cityName = restaurant.address ? restaurant.address.split(',')[1] || restaurant.address.split(',')[0] : 'Nuestra Sede';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else {
      const element = document.getElementById(`cat-section-${catId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="client-footer reveal-on-scroll">
      <div className="client-footer-inner">
        {/* Columna 1: Marca, Eslogan & Redes Sociales */}
        <div className="footer-col brand-col">
          <div className="footer-brand-header">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt={restaurant.name} className="footer-logo" />
            ) : (
              <div className="footer-logo-fallback">
                <UtensilsCrossed size={22} color="#fff" />
              </div>
            )}
            <h3 className="footer-brand-name">{restaurant.name}</h3>
          </div>

          <p className="footer-brand-desc">
            {restaurant.tagline
              ? restaurant.tagline
              : restaurant.story
                ? restaurant.story.substring(0, 160) + '...'
                : `${restaurant.name}: Preparaciones artesanales elaboradas con la máxima frescura y calidad.`}
          </p>

          <div className="footer-social-row">
            {(restaurant.socialLinks?.instagram || restaurant.instagramUrl) && (
              <a
                href={restaurant.socialLinks?.instagram || restaurant.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Instagram"
                title="Instagram"
              >
                <InstagramIcon size={17} />
              </a>
            )}
            {restaurant.socialLinks?.tiktok && (
              <a
                href={restaurant.socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="TikTok"
                title="TikTok"
              >
                <TikTokIcon size={17} />
              </a>
            )}
            {restaurant.socialLinks?.facebook && (
              <a
                href={restaurant.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Facebook"
                title="Facebook"
              >
                <FacebookIcon size={17} />
              </a>
            )}
            {restaurant.socialLinks?.linkedin && (
              <a
                href={restaurant.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <LinkedInIcon size={17} />
              </a>
            )}
            {restaurant.socialLinks?.youtube && (
              <a
                href={restaurant.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="YouTube"
                title="YouTube"
              >
                <YouTubeIcon size={17} />
              </a>
            )}
            {restaurant.socialLinks?.twitter && (
              <a
                href={restaurant.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Twitter / X"
                title="Twitter / X"
              >
                <TwitterIcon size={17} />
              </a>
            )}
            {restaurant.socialLinks?.website && (
              <a
                href={restaurant.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Sitio Web"
                title="Sitio Web"
              >
                <WebsiteIcon size={17} />
              </a>
            )}
            <a
              href={`https://wa.me/${restaurant.whatsappCountryCode.replace('+', '')}${restaurant.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn whatsapp"
              aria-label="WhatsApp"
              title="WhatsApp"
            >
              <MessageCircle size={17} />
            </a>
          </div>
        </div>

        {/* Columna 2: Nuestras Líneas (Categorías) */}
        <div className="footer-col">
          <h4 className="footer-col-title">
            Nuestras Líneas <span className="title-accent-line" />
          </h4>
          <ul className="footer-links-list">
            {restaurant.categories.length > 0 ? (
              restaurant.categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    className="footer-link-btn"
                  >
                    {cat.name}
                  </button>
                </li>
              ))
            ) : (
              <li><span className="footer-link-text">Menú General</span></li>
            )}
          </ul>
        </div>

        {/* Columna 3: Información Local / Links */}
        <div className="footer-col">
          <h4 className="footer-col-title">
            Información {cityName.trim()} <span className="title-accent-line" />
          </h4>
          <ul className="footer-links-list">
            <li>
              <button type="button" onClick={scrollToTop} className="footer-link-btn">
                Inicio
              </button>
            </li>
            {restaurant.openingHours && (
              <li>
                <span className="footer-link-text">Horarios: {restaurant.openingHours}</span>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => setActiveModalNotice('privacy')}
                className="footer-link-btn flex-link"
              >
                <FileText size={13} /> Tratamiento de Datos (Ley 1581)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveModalNotice('cookies')}
                className="footer-link-btn flex-link"
              >
                <Cookie size={13} /> Configurar Cookies
              </button>
            </li>
          </ul>
        </div>

        {/* Columna 4: Atención & Contacto Directo */}
        <div className="footer-col">
          <h4 className="footer-col-title">
            Atención {cityName.trim()} <span className="title-accent-line" />
          </h4>
          <ul className="footer-contact-list">
            {restaurant.address && (
              <li>
                <MapPin size={16} color="var(--primary)" className="contact-icon" />
                <div>
                  {restaurant.googleMapsUrl ? (
                    <a
                      href={restaurant.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="client-maps-link"
                    >
                      {restaurant.address}
                    </a>
                  ) : (
                    <span>{restaurant.address}</span>
                  )}
                </div>
              </li>
            )}

            <li>
              <Phone size={16} color="var(--whatsapp-green)" className="contact-icon" />
              <div>
                <strong>WhatsApp Oficial:</strong>
                <span>{restaurant.whatsappCountryCode} {restaurant.whatsappNumber}</span>
              </div>
            </li>

            {restaurant.contactPhones && restaurant.contactPhones.map((p) => (
              <li key={p.id}>
                <Phone size={16} color="var(--primary)" className="contact-icon" />
                <div>
                  <strong>{p.label}:</strong>
                  <span>{p.countryCode} {p.number}</span>
                </div>
              </li>
            ))}

            {restaurant.openingHours && (
              <li>
                <Clock size={16} color="#f59e0b" className="contact-icon" />
                <div>
                  <strong>Atención:</strong>
                  <span>{restaurant.openingHours}</span>
                </div>
              </li>
            )}

            {restaurant.modalities?.delivery && (
              <li>
                <Bike size={16} color="var(--primary)" className="contact-icon" />
                <div>
                  <strong>Domicilio Activo</strong>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Modal / Aviso emergente de Ley 1581 o Cookies */}
      {activeModalNotice && (
        <div className="modal-overlay" onClick={() => setActiveModalNotice(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{activeModalNotice === 'privacy' ? 'Tratamiento de Datos (Ley 1581)' : 'Configuración de Cookies'}</h3>
              <button type="button" onClick={() => setActiveModalNotice(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
              {activeModalNotice === 'privacy' ? (
                <p>
                  En cumplimiento de la Ley 1581 de Protección de Datos Personales, la información ingresada en este menú virtual (nombre, dirección y número de teléfono) se utiliza exclusivamente para procesar y entregar su pedido actual vía WhatsApp directo. No vendemos ni compartimos sus datos con terceros.
                </p>
              ) : (
                <p>
                  Utilizamos almacenamiento local exclusivamente para guardar su selección temporal del carrito y preferencias del tema (modo claro/oscuro) para garantizar una experiencia óptima de navegación.
                </p>
              )}
            </div>
            <div className="modal-footer" style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button type="button" onClick={() => setActiveModalNotice(null)} className="btn btn-primary btn-sm">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra Inferior del Footer */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-left">
          <span>© {new Date().getFullYear()} <strong>{restaurant.name}</strong>. Todos los derechos reservados. Menú Virtual impulsado por MenuApp.</span>
        </div>

        <div className="footer-bottom-right">
          <ThemeToggle />
          <button
            type="button"
            onClick={scrollToTop}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 0.8rem', fontSize: '0.78rem', gap: '0.3rem' }}
          >
            Subir <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
};
