import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Bike,
  ShoppingBag,
  CreditCard,
  QrCode,
  Upload,
  Eye,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrderCheckoutData, OrderModality } from '../../types/cart';
import { Restaurant, PaymentMethod } from '../../types/restaurant';
import { useCart } from '../../context/CartContext';
import { formatCurrency, generateWhatsAppLink } from '../../services/whatsapp';
import { GoogleMapsPicker } from '../maps/GoogleMapsPicker';
import { uploadTenantAsset } from '../../services/storage/r2Storage';

interface CheckoutModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ restaurant, onClose }) => {
  const { items, subtotal, clearCart } = useCart();
  const defaultModality: OrderModality = restaurant.modalities?.delivery !== false ? 'delivery' : 'pickup';

  // Persistencia de draft en localStorage para salir a pagar a app bancaria y volver
  const draftKey = `menuapp_checkout_draft_${restaurant.slug}`;
  const savedDraft = (() => {
    try {
      const raw = localStorage.getItem(draftKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [modality, setModality] = useState<OrderModality>(savedDraft?.modality || defaultModality);
  const [customerName, setCustomerName] = useState(savedDraft?.customerName || '');
  const [deliveryAddress, setDeliveryAddress] = useState(savedDraft?.deliveryAddress || '');
  const [deliveryMapsUrl, setDeliveryMapsUrl] = useState<string | undefined>(savedDraft?.deliveryMapsUrl || undefined);
  const [generalNotes, setGeneralNotes] = useState(savedDraft?.generalNotes || '');

  // Métodos de pago
  const activeMethods = (restaurant.paymentConfig?.methods || []).filter((m) => m.isActive);
  const isPaymentEnabled = Boolean(restaurant.paymentConfig?.enabled && activeMethods.length > 0);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    savedDraft?.selectedMethodId || (activeMethods[0]?.id || '')
  );
  const [voucherUrl, setVoucherUrl] = useState<string>(savedDraft?.voucherUrl || '');
  const [isUploadingVoucher, setIsUploadingVoucher] = useState(false);
  const [zoomedQrUrl, setZoomedQrUrl] = useState<string | null>(null);

  const [isSent, setIsSent] = useState(false);
  const [lastWhatsappUrl, setLastWhatsappUrl] = useState('');

  // Guardar draft automáticamente
  useEffect(() => {
    if (isSent) {
      localStorage.removeItem(draftKey);
      return;
    }
    const draft = {
      customerName,
      modality,
      deliveryAddress,
      deliveryMapsUrl,
      generalNotes,
      selectedMethodId,
      voucherUrl
    };
    try {
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {}
  }, [customerName, modality, deliveryAddress, deliveryMapsUrl, generalNotes, selectedMethodId, voucherUrl, isSent, draftKey]);

  const selectedMethod: PaymentMethod | undefined = activeMethods.find((m) => m.id === selectedMethodId);

  const canSubmit = customerName.trim() !== '' && (modality === 'pickup' || deliveryAddress.trim() !== '');

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVoucher(true);
    try {
      const res = await uploadTenantAsset(file, restaurant.slug, 'receipts');
      setVoucherUrl(res.url);
    } catch {
      console.error('Error al subir comprobante');
    } finally {
      setIsUploadingVoucher(false);
    }
  };

  const handleSendOrder = () => {
    if (!canSubmit) return;

    const checkoutData: OrderCheckoutData = {
      customerName: customerName.trim(),
      modality,
      deliveryAddress: modality === 'delivery' ? deliveryAddress.trim() : undefined,
      deliveryMapsUrl: modality === 'delivery' ? deliveryMapsUrl : undefined,
      generalNotes: generalNotes.trim(),
      selectedPaymentMethod: isPaymentEnabled && selectedMethod ? selectedMethod.name : undefined,
      paymentVoucherUrl: voucherUrl || undefined
    };

    const whatsappUrl = generateWhatsAppLink(restaurant, items, checkoutData);
    setLastWhatsappUrl(whatsappUrl);

    window.open(whatsappUrl, '_blank');
    triggerCelebration();
    setIsSent(true);
    clearCart();
    localStorage.removeItem(draftKey);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', width: '92%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MessageCircle size={20} color="var(--whatsapp-green)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Confirmar Pedido</h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {isSent ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(37, 211, 102, 0.15)',
                boxShadow: '0 0 25px rgba(37, 211, 102, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: 'var(--whatsapp-green)'
              }}
            >
              <CheckCircle2 size={42} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--featured-gold)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <Sparkles size={16} /> ¡Pedido Enviado con Éxito!
            </div>

            <h3 style={{ fontSize: '1.45rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              ¡Listo, {customerName}!
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Tu pedido ha sido estructurado y enviado a <strong>{restaurant.name}</strong> por WhatsApp.
              El establecimiento te confirmará los detalles a la brevedad.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {lastWhatsappUrl && (
                <a
                  href={lastWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-full"
                >
                  <MessageCircle size={18} /> Abrir WhatsApp Nuevamente
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-full"
              >
                Cerrar y Volver al Menú
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendOrder();
            }}
          >
            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Modalidad de entrega */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>¿Cómo deseas recibir tu pedido?</label>
                <div style={{ display: 'grid', gridTemplateColumns: restaurant.modalities?.delivery !== false && restaurant.modalities?.pickup !== false ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
                  {restaurant.modalities?.delivery !== false && (
                    <button
                      type="button"
                      onClick={() => setModality('delivery')}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${modality === 'delivery' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        background: modality === 'delivery' ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                        color: modality === 'delivery' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Bike size={18} /> Domicilio
                    </button>
                  )}

                  {restaurant.modalities?.pickup !== false && (
                    <button
                      type="button"
                      onClick={() => setModality('pickup')}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${modality === 'pickup' ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        background: modality === 'pickup' ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                        color: modality === 'pickup' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <ShoppingBag size={18} /> Retiro en Local
                    </button>
                  )}
                </div>
              </div>

              {/* Nombre del Cliente */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={15} /> Tu Nombre Completo *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="form-input"
                  required
                />
              </div>

              {/* Dirección con Google Maps si es Domicilio */}
              {modality === 'delivery' && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="var(--primary)" /> Dirección de Entrega (Google Maps) *
                  </label>
                  <GoogleMapsPicker
                    initialAddress={deliveryAddress}
                    placeholder="Escribe tu dirección, calle o edificio..."
                    onLocationSelected={({ address, mapsUrl }) => {
                      setDeliveryAddress(address);
                      setDeliveryMapsUrl(mapsUrl);
                    }}
                  />
                </div>
              )}

              {/* PLUGIN DE MÉTODOS DE PAGO */}
              {isPaymentEnabled && (
                <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-subtle)' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                    <CreditCard size={16} color="var(--primary)" /> Método de Pago
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {activeMethods.map((m) => {
                      const isSelected = m.id === selectedMethodId;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMethodId(m.id)}
                          style={{
                            padding: '0.6rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            background: isSelected ? 'rgba(255, 87, 34, 0.12)' : 'var(--bg-surface)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>{m.name}</span>
                          {isSelected && <Check size={14} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detalles del método seleccionado */}
                  {selectedMethod && (
                    <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      {selectedMethod.accountDetails && (
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                          {selectedMethod.accountDetails}
                        </div>
                      )}

                      {selectedMethod.instructions && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                          {selectedMethod.instructions}
                        </div>
                      )}

                      {/* Imagen de Código QR si existe */}
                      {selectedMethod.qrImageUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                          <img
                            src={selectedMethod.qrImageUrl}
                            alt="Código QR"
                            onClick={() => setZoomedQrUrl(selectedMethod.qrImageUrl || null)}
                            style={{ width: '64px', height: '64px', borderRadius: '6px', objectFit: 'contain', background: '#fff', padding: '3px', cursor: 'zoom-in', border: '1px solid var(--border-subtle)' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                              Escanea el Código QR
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Toca la imagen para ampliarla o escanéala desde tu app bancaria.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Slot para adjuntar comprobante de pago */}
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Upload size={13} color="var(--primary)" /> Comprobante de Pago (Opcional)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {voucherUrl ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <img
                                src={voucherUrl}
                                alt="Comprobante"
                                style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                              />
                              <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>
                                ¡Comprobante listo!
                              </span>
                              <button
                                type="button"
                                onClick={() => setVoucherUrl('')}
                                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                Quitar
                              </button>
                            </div>
                          ) : (
                            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', fontSize: '0.78rem' }}>
                              <Upload size={13} /> {isUploadingVoucher ? 'Subiendo...' : 'Adjuntar Comprobante'}
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notas del pedido */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={15} /> Notas o Peticiones Especiales
                </label>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Ej. Timbre 401, pagaré con billete de $50.000, salsa extra..."
                  className="form-textarea"
                  style={{ minHeight: '60px' }}
                />
              </div>

              {/* Resumen del Subtotal */}
              <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '0.9rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Productos ({items.length}):</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatCurrency(subtotal, restaurant.currencySymbol)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Subtotal a pagar:</span>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>{formatCurrency(subtotal, restaurant.currencySymbol)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="btn btn-whatsapp"
                style={{ opacity: canSubmit ? 1 : 0.6, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
              >
                <MessageCircle size={18} /> Enviar Pedido a WhatsApp
              </button>
            </div>
          </form>
        )}

        {/* Modal para ampliar imagen QR */}
        {zoomedQrUrl && (
          <div
            className="modal-overlay"
            onClick={() => setZoomedQrUrl(null)}
            style={{ zIndex: 1100, background: 'rgba(0,0,0,0.85)' }}
          >
            <div style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <img
                src={zoomedQrUrl}
                alt="Código QR Ampliado"
                style={{ maxWidth: '320px', width: '85vw', borderRadius: '12px', background: '#fff', padding: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              />
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setZoomedQrUrl(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cerrar QR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
