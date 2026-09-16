import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CountryCodeDef {
  code: string;
  flag: string;
  name: string;
}

export const COUNTRY_CODES_DEF: CountryCodeDef[] = [
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+1', flag: '🇺🇸', name: 'EE.UU. / Canadá' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' }
];

interface CountryCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCountry =
    COUNTRY_CODES_DEF.find((c) => c.code === value) || COUNTRY_CODES_DEF[0];

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: '110px' }}>
      {/* BOTÓN TRIGGER CERRADO: SOLO BANDERA + CÓDIGO */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="form-select"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 0.6rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer',
          background: 'var(--bg-surface-elevated)',
          border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          gap: '0.35rem'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>{selectedCountry.flag}</span>
          <span>{selectedCountry.code}</span>
        </span>
        <ChevronDown size={14} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {/* MENÚ DESPLEGABLE ABIERTO: BANDERA + NOMBRE DEL PAÍS + CÓDIGO */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '210px',
            maxHeight: '220px',
            overflowY: 'auto',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            padding: '0.35rem',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {COUNTRY_CODES_DEF.map((item) => {
            const isSelected = item.code === value;
            return (
              <div
                key={item.code}
                onClick={() => {
                  onChange(item.code);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'background 0.15s ease'
                }}
              >
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{item.flag}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </span>
                <span style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 700 }}>
                  ({item.code})
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
