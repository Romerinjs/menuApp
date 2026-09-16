import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, ExternalLink, Check } from 'lucide-react';
import { Restaurant } from '../../types/restaurant';

interface QRCodeCardProps {
  restaurant: Restaurant;
  onOpenClientMenu: () => void;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ restaurant, onOpenClientMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  // URL del menú de clientes
  const clientMenuUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/m/${restaurant.slug}`
    : `https://menuapp.com/m/${restaurant.slug}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        clientMenuUrl,
        {
          width: 200,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('Error generando QR code:', error);
        }
      );
    }
  }, [clientMenuUrl]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR-${restaurant.slug}.png`;
    link.href = url;
    link.click();
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(clientMenuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header">
        <h3 className="dashboard-card-title">
          <QrCode size={18} color="var(--primary)" /> Código QR de Mesas
        </h3>
      </div>

      <div className="qr-card-content">
        <div className="qr-canvas-wrap">
          <canvas ref={canvasRef} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.2rem' }}>
            Escanea para ver el Menú
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Descárgalo en alta resolución para imprimir en acrílicos de mesa o volantes.
          </p>
        </div>

        <div className="qr-url-text">
          {clientMenuUrl}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <button type="button" onClick={handleDownload} className="btn btn-primary btn-sm btn-full">
            <Download size={15} /> Descargar QR en PNG
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button type="button" onClick={handleCopyUrl} className="btn btn-secondary btn-sm">
              {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              {copied ? '¡Copiado!' : 'Copiar Link'}
            </button>

            <button type="button" onClick={onOpenClientMenu} className="btn btn-secondary btn-sm">
              <ExternalLink size={14} /> Ver Menú
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
