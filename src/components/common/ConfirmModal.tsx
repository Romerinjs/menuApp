import React, { useEffect } from 'react';
import { X, AlertTriangle, Trash2, Info, HelpCircle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  icon,
  isLoading = false,
  onConfirm,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderDefaultIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case 'danger':
        return <Trash2 size={24} />;
      case 'warning':
        return <AlertTriangle size={24} />;
      case 'info':
      default:
        return <Info size={24} />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'rgba(239, 68, 68, 0.15)',
          iconColor: '#ef4444',
          iconBorder: 'rgba(239, 68, 68, 0.3)',
          confirmBtnBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
          confirmBtnHoverBg: '#dc2626',
          confirmBtnShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
        };
      case 'warning':
        return {
          iconBg: 'rgba(245, 158, 11, 0.15)',
          iconColor: '#f59e0b',
          iconBorder: 'rgba(245, 158, 11, 0.3)',
          confirmBtnBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
          confirmBtnHoverBg: '#d97706',
          confirmBtnShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
        };
      case 'info':
      default:
        return {
          iconBg: 'var(--primary-light)',
          iconColor: 'var(--primary)',
          iconBorder: 'var(--border-subtle)',
          confirmBtnBg: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
          confirmBtnHoverBg: 'var(--primary-hover)',
          confirmBtnShadow: '0 4px 14px var(--primary-glow)'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          width: '90%',
          padding: '0',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border-glass)',
          background: 'var(--bg-surface)',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header con botón cerrar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem 0.5rem 1.25rem'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: styles.iconBg,
              color: styles.iconColor,
              border: `1px solid ${styles.iconBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {renderDefaultIcon()}
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
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del Mensaje */}
        <div style={{ padding: '0.75rem 1.25rem 1.25rem 1.25rem' }}>
          <h3
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--text-primary)'
            }}
          >
            {title}
          </h3>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}
          >
            {message}
          </div>
        </div>

        {/* Acciones */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{
              padding: '0.55rem 1.1rem',
              fontSize: '0.88rem',
              fontWeight: 600
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '0.55rem 1.2rem',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#ffffff',
              background: styles.confirmBtnBg,
              border: 'none',
              borderRadius: 'var(--radius-md)',
              boxShadow: styles.confirmBtnShadow,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all var(--transition-fast)',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
