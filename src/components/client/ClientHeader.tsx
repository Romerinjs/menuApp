import React from 'react';
import { Phone, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { Restaurant } from '../../types/restaurant';
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  LinkedInIcon,
  YouTubeIcon,
  WebsiteIcon,
  TwitterIcon
} from '../common/SocialIcons';

interface ClientHeaderProps {
  restaurant: Restaurant;
  onBackToAdmin?: () => void;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({ restaurant }) => {
  const defaultCover = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80';
  const whatsappUrl = `https://wa.me/${restaurant.whatsappCountryCode.replace('+', '')}${restaurant.whatsappNumber}`;

  const socialList = [
    { key: 'instagram', url: restaurant.socialLinks?.instagram, label: 'Instagram', icon: <InstagramIcon size={15} /> },
    { key: 'tiktok', url: restaurant.socialLinks?.tiktok, label: 'TikTok', icon: <TikTokIcon size={15} /> },
    { key: 'facebook', url: restaurant.socialLinks?.facebook, label: 'Facebook', icon: <FacebookIcon size={15} /> },
    { key: 'linkedin', url: restaurant.socialLinks?.linkedin, label: 'LinkedIn', icon: <LinkedInIcon size={15} /> },
    { key: 'youtube', url: restaurant.socialLinks?.youtube, label: 'YouTube', icon: <YouTubeIcon size={15} /> },
    { key: 'website', url: restaurant.socialLinks?.website, label: 'Sitio Web', icon: <WebsiteIcon size={15} /> },
    { key: 'twitter', url: restaurant.socialLinks?.twitter, label: 'Twitter / X', icon: <TwitterIcon size={15} /> }
  ].filter((s) => s.url && s.url.trim() !== '');

  return (
    <>
      {/* Portada Hero Background */}
      <div className="client-hero-cover-container">
        <img
          src={restaurant.coverUrl || defaultCover}
          alt={restaurant.name}
          className="client-hero-cover-img"
        />
        <div className="client-hero-gradient-overlay" />
      </div>

      {/* HEADER FLOTANTE ULTRA LIMPIO Y PEGAJOSO (STICKY) */}
      <div className="floating-navbar-container reveal-on-scroll">
        <div className="floating-navbar-inner">
          {/* LADO IZQUIERDO: Logo + Nombre del Restaurante */}
          <div className="floating-brand-wrap">
            {restaurant.logoUrl ? (
              <img src={restaurant.logoUrl} alt={restaurant.name} className="floating-logo" />
            ) : (
              <div className="floating-logo-fallback">
                <UtensilsCrossed size={18} color="#fff" />
              </div>
            )}

            <div className="floating-brand-info">
              <h1 className="floating-brand-title" title={restaurant.name}>
                {restaurant.name}
              </h1>
              <p className="floating-brand-subtitle">
                {restaurant.tagline || restaurant.cuisineType}
              </p>
            </div>
          </div>

          {/* LADO DERECHO: Redes y CTA Pedir Ya */}
          <div className="floating-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'nowrap' }}>
            {socialList.map((item) => (
              <a
                key={item.key}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.35rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-surface-elevated)',
                  transition: 'all 0.2s ease'
                }}
                title={item.label}
              >
                {item.icon}
              </a>
            ))}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp-cta"
            >
              <Phone size={13} />
              <span>Pedir Ya!</span>
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
