import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  Zap,
  Loader2,
  FileText,
  HeartHandshake,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { enhanceBrandWithGemini } from '../../services/geminiAiService';

interface BrandAiEnhancerModalProps {
  initialPrompt?: string;
  restaurantName?: string;
  cuisineType?: string;
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: { descripcion: string; filosofia: string }) => void;
}

const QUICK_PROMPTS = [
  '🍔 Hamburguesería artesanal con carne Angus, pan brioche horneado diario y salsas de la casa.',
  '🍕 Pizzería napolitana con masa madre madurada 48h, horno de piedra y queso mozzarella importado.',
  '🥩 Parrilla y asados al carbón con cortes premium y recetas de autor.',
  '🥗 Comida saludable, bowls nutritivos, ingredientes orgánicos y opciones veganas.',
  '☕ Café de especialidad de origen, repostería casera y ambiente acogedor.'
];

export const BrandAiEnhancerModal: React.FC<BrandAiEnhancerModalProps> = ({
  initialPrompt = '',
  restaurantName = '',
  cuisineType = '',
  isOpen,
  onClose,
  onApply
}) => {
  const [rawText, setRawText] = useState(
    initialPrompt ||
    (restaurantName ? `${restaurantName} - Especialistas en ${cuisineType || 'gastronomía artesanal'}` : '')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [generatedPhilosophy, setGeneratedPhilosophy] = useState('');
  const [copiedField, setCopiedField] = useState<'desc' | 'philosophy' | null>(null);
  const [sourceType, setSourceType] = useState<'gemini-api' | 'local-fallback' | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!rawText.trim()) {
      setErrorMessage('Por favor ingresa un borrador o palabras clave sobre tu restaurante.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await enhanceBrandWithGemini(rawText, {
        name: restaurantName,
        cuisine: cuisineType
      });

      setGeneratedDesc(result.descripcion);
      setGeneratedPhilosophy(result.filosofia);
      setSourceType(result.source);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al comunicarse con la IA. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, field: 'desc' | 'philosophy') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleApply = () => {
    onApply({
      descripcion: generatedDesc,
      filosofia: generatedPhilosophy
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          width: '94%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-glass)'
        }}
      >
        {/* Encabezado con degradado moderno */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.12) 0%, rgba(245, 158, 11, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                Potenciador de Marca con Gemini AI
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Genera textos persuasivos y la filosofía comercial de tu restaurante
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '50%'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Mensaje de Error */}
          {errorMessage && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: '#f87171',
                fontSize: '0.85rem'
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Sección de Entrada del Usuario */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={15} color="var(--primary)" /> Borrador, Especialidad o Palabras Clave
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Escribe detalles de tu restaurante, tipo de cocina, ingredientes estrella o tu visión..."
              rows={3}
              className="form-input"
              style={{ resize: 'vertical', fontSize: '0.88rem', lineHeight: '1.45' }}
            />

            {/* Ejemplos rápidos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sugerencias rápidas:</span>
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRawText(p)}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '999px',
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  {p.slice(0, 30)}...
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !rawText.trim()}
                className="btn btn-primary"
                style={{
                  gap: '0.45rem',
                  padding: '0.65rem 1.3rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px var(--primary-glow)'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="spin-animation" />
                    Optimizando con Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Potenciar con IA
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sección de Resultados Generados */}
          {(generatedDesc || generatedPhilosophy) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              {/* Badge de fuente */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ✨ Resultados Generados
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    background: sourceType === 'gemini-api' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: sourceType === 'gemini-api' ? '#60a5fa' : '#fbbf24',
                    border: `1px solid ${sourceType === 'gemini-api' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
                  }}
                >
                  {sourceType === 'gemini-api' ? '⚡ Gemini 1.5 Flash' : '💎 Motor de Branding'}
                </span>
              </div>

              {/* Tarjeta 1: Descripción Optimizada */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FileText size={15} color="var(--primary)" /> 1. Descripción Comercial Persuasiva (Menú & Feed)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedDesc, 'desc')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', gap: '0.3rem' }}
                  >
                    {copiedField === 'desc' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    {copiedField === 'desc' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <textarea
                  value={generatedDesc}
                  onChange={(e) => setGeneratedDesc(e.target.value)}
                  rows={4}
                  className="form-input"
                  style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
                />
              </div>

              {/* Tarjeta 2: Filosofía de Marca */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <HeartHandshake size={15} color="var(--primary)" /> 2. Filosofía, Propósito & Valores de Marca
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedPhilosophy, 'philosophy')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', gap: '0.3rem' }}
                  >
                    {copiedField === 'philosophy' ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    {copiedField === 'philosophy' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <textarea
                  value={generatedPhilosophy}
                  onChange={(e) => setGeneratedPhilosophy(e.target.value)}
                  rows={4}
                  className="form-input"
                  style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cerrar
          </button>

          {(generatedDesc || generatedPhilosophy) && (
            <button
              type="button"
              onClick={handleApply}
              className="btn btn-primary"
              style={{
                gap: '0.4rem',
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}
            >
              <Sparkles size={15} /> Aplicar a mi Menú
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
