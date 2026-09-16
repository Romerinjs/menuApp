import React, { useState } from 'react';
import { Globe, Trash2, X } from 'lucide-react';
import { SocialLinks } from '../../types/restaurant';
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  LinkedInIcon,
  YouTubeIcon,
  WebsiteIcon,
  TwitterIcon
} from '../common/SocialIcons';

interface CompactSocialLinksPickerProps {
  socialLinks: SocialLinks;
  onChange: (updated: SocialLinks) => void;
}

interface SocialPlatformDef {
  key: keyof SocialLinks;
  name: string;
  placeholder: string;
  icon: React.ReactNode;
}

const SOCIAL_PLATFORMS: SocialPlatformDef[] = [
  { key: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/tu_marca', icon: <InstagramIcon size={15} /> },
  { key: 'tiktok', name: 'TikTok', placeholder: 'https://tiktok.com/@tu_marca', icon: <TikTokIcon size={15} /> },
  { key: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/tu_marca', icon: <FacebookIcon size={15} /> },
  { key: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/company/tu_marca', icon: <LinkedInIcon size={15} /> },
  { key: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@tu_canal', icon: <YouTubeIcon size={15} /> },
  { key: 'website', name: 'Sitio Web', placeholder: 'https://mitienda.com', icon: <WebsiteIcon size={15} /> },
  { key: 'twitter', name: 'Twitter / X', placeholder: 'https://x.com/tu_marca', icon: <TwitterIcon size={15} /> }
];

export const CompactSocialLinksPicker: React.FC<CompactSocialLinksPickerProps> = ({
  socialLinks,
  onChange
}) => {
  // Estado de la red activa cuyo input está desplegado
  const [activeKey, setActiveKey] = useState<keyof SocialLinks | null>('instagram');

  const handleTogglePlatform = (key: keyof SocialLinks) => {
    setActiveKey((prev) => (prev === key ? null : key));
  };

  const handleUpdateLink = (key: keyof SocialLinks, val: string) => {
    onChange({
      ...socialLinks,
      [key]: val
    });
  };

  const handleClearLink = (key: keyof SocialLinks) => {
    const next = { ...socialLinks };
    delete next[key];
    onChange(next);
  };

  const activeDef = SOCIAL_PLATFORMS.find((p) => p.key === activeKey);

  return (
    <div
      style={{
        background: 'var(--bg-surface-elevated)',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem'
      }}
    >
      {/* CABECERA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label
          className="form-label"
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Globe size={15} color="var(--primary)" /> Redes Sociales & Plataformas
        </label>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Haz clic en un ícono para editar su enlace
        </span>
      </div>

      {/* MATRIZ DE 3 COLUMNAS (3X3 COMPACTA) CON ÍCONOS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.35rem'
        }}
      >
        {SOCIAL_PLATFORMS.map((platform) => {
          const currentVal = socialLinks[platform.key] || '';
          const hasValue = currentVal.trim().length > 0;
          const isActive = activeKey === platform.key;

          return (
            <button
              key={platform.key}
              type="button"
              onClick={() => handleTogglePlatform(platform.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.38rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                background: isActive
                  ? 'var(--primary-light)'
                  : hasValue
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'var(--bg-surface)',
                border: isActive
                  ? '1.5px solid var(--primary)'
                  : hasValue
                  ? '1px solid rgba(16, 185, 129, 0.4)'
                  : '1px solid var(--border-subtle)',
                color: isActive ? 'var(--primary)' : hasValue ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.75rem',
                fontWeight: isActive || hasValue ? 700 : 500
              }}
              title={hasValue ? `${platform.name}: ${currentVal}` : `Añadir enlace de ${platform.name}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>{platform.icon}</span>
                <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {platform.name}
                </span>
              </div>

              {hasValue && (
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--success)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    flexShrink: 0
                  }}
                >
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* INPUT DESPLEGABLE COMPACTO AL HACER CLIC */}
      {activeDef && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--primary-glow)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 0.65rem',
            marginTop: '0.2rem',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {activeDef.icon} Enlace para {activeDef.name}:
            </span>
            <button
              type="button"
              onClick={() => setActiveKey(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.1rem'
              }}
              title="Cerrar"
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <input
              type="url"
              value={socialLinks[activeDef.key] || ''}
              onChange={(e) => handleUpdateLink(activeDef.key, e.target.value)}
              placeholder={activeDef.placeholder}
              className="form-input"
              style={{
                fontSize: '0.78rem',
                padding: '0.3rem 0.55rem',
                flex: 1
              }}
              autoFocus
            />

            {socialLinks[activeDef.key] && (
              <button
                type="button"
                onClick={() => handleClearLink(activeDef.key)}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.72rem',
                  color: 'var(--danger)',
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}
                title="Quitar enlace"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
