import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', title?: string, duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Mantener máximo 5 toasts simultáneos

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast(message, 'success', title),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => showToast(message, 'info', title),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => showToast(message, 'warning', title),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => showToast(message, 'error', title),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, info, warning, error, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};

// Componente Visual de Toasts flotantes
const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100vw - 32px)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 size={20} color="#07bc0c" />,
          info: <Info size={20} color="#3B82F6" />,
          warning: <AlertTriangle size={20} color="#e7d33c" />,
          error: <XCircle size={20} color="#E74C3C" />
        };

        const borders = {
          success: '1px solid rgba(7, 188, 12, 0.45)',
          info: '1px solid rgba(59, 130, 246, 0.45)',
          warning: '1px solid rgba(231, 211, 60, 0.45)',
          error: '1px solid rgba(231, 76, 60, 0.45)'
        };

        const accents = {
          success: 'linear-gradient(135deg, rgba(7, 188, 12, 0.2), rgba(7, 188, 12, 0.05))',
          info: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
          warning: 'linear-gradient(135deg, rgba(231, 211, 60, 0.2), rgba(231, 211, 60, 0.05))',
          error: 'linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(231, 76, 60, 0.05))'
        };

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(18, 24, 38, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              backgroundImage: accents[toast.type],
              border: borders[toast.type],
              borderRadius: '12px',
              padding: '12px 14px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(255, 255, 255, 0.05)',
              color: '#F3F4F6',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>{icons[toast.type]}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#FFFFFF', marginBottom: '2px' }}>
                  {toast.title}
                </div>
              )}
              <div style={{ fontSize: '0.83rem', color: '#D1D5DB', lineHeight: 1.4, wordBreak: 'break-word' }}>
                {toast.message}
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'color 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
