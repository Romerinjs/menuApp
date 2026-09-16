import React, { useState } from 'react';
import {
  X,
  Store,
  Phone,
  MapPin,
  Upload,
  Palette,
  DollarSign,
  Save,
  CheckCircle2,
  AlertCircle,
  UtensilsCrossed,
  Bike,
  ShoppingBag,
  CreditCard,
  QrCode,
  Share2,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Globe,
  Loader2
} from 'lucide-react';
import {
  Restaurant,
  DeliveryModalities,
  LocationCoordinates,
  PaymentPluginConfig,
  PaymentMethod,
  PaymentType,
  SocialLinks,
  ContactPhone,
  ColorPalette
} from '../../types/restaurant';
import { GoogleMapsPicker } from '../maps/GoogleMapsPicker';
import { uploadTenantAsset } from '../../services/storage/r2Storage';
import { generateInlineFeedDescription, generateInlinePhilosophy } from '../../services/geminiAiService';
import { PRESET_PALETTES, generateHarmoniousPalette } from '../../services/colorPalettes';
import { OpeningHoursPicker } from '../common/OpeningHoursPicker';
import { CompactSocialLinksPicker } from './CompactSocialLinksPicker';
import { CountryCodeSelect } from '../common/CountryCodeSelect';

export type SettingsTabType = 'general' | 'service' | 'location' | 'payments' | 'channels';

interface RestaurantSettingsModalProps {
  restaurant: Restaurant;
  initialTab?: SettingsTabType;
  onSave: (updated: Restaurant) => void;
  onClose: () => void;
}

const COUNTRY_CODES = [
  { code: '+57', country: 'Colombia (+57)' },
  { code: '+52', country: 'México (+52)' },
  { code: '+1', country: 'EE.UU. / Canadá (+1)' },
  { code: '+34', country: 'España (+34)' },
  { code: '+54', country: 'Argentina (+54)' },
  { code: '+56', country: 'Chile (+56)' },
  { code: '+51', country: 'Perú (+51)' },
  { code: '+58', country: 'Venezuela (+58)' },
  { code: '+593', country: 'Ecuador (+593)' }
];

const CURRENCIES = [
  { code: 'COP', symbol: '$', label: 'COP - Peso Colombiano ($)' },
  { code: 'MXN', symbol: '$', label: 'MXN - Peso Mexicano ($)' },
  { code: 'USD', symbol: '$', label: 'USD - Dólar Estadounidense ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR - Euro (€)' },
  { code: 'PEN', symbol: 'S/', label: 'PEN - Sol Peruano (S/)' },
  { code: 'ARS', symbol: '$', label: 'ARS - Peso Argentino ($)' },
  { code: 'CLP', symbol: '$', label: 'CLP - Peso Chileno ($)' }
];

export const RestaurantSettingsModal: React.FC<RestaurantSettingsModalProps> = ({
  restaurant,
  initialTab = 'general',
  onSave,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabType>(initialTab);

  // Form states - General
  const [name, setName] = useState(restaurant.name);
  const [cuisineType, setCuisineType] = useState(restaurant.cuisineType);
  const [slug, setSlug] = useState(restaurant.slug);
  const [themeColor, setThemeColor] = useState(restaurant.themeColor || '#FF5722');
  const [activePalette, setActivePalette] = useState<ColorPalette>(
    restaurant.palette || PRESET_PALETTES[0]
  );
  const [isCustomPalette, setIsCustomPalette] = useState(
    restaurant.palette?.id?.startsWith('custom') || false
  );
  const [customColors, setCustomColors] = useState({
    primary: restaurant.palette?.primary || restaurant.themeColor || '#ff5722',
    secondary: restaurant.palette?.secondary || '#ff9800',
    accent: restaurant.palette?.accent || '#f59e0b',
    backgroundDark: restaurant.palette?.backgroundDark || '#0b0f19',
    surfaceDark: restaurant.palette?.surfaceDark || '#131b2e'
  });

  const [showAddSocialDropdown, setShowAddSocialDropdown] = useState(false);

  const handleUpdateCustomColor = (key: keyof typeof customColors, hex: string) => {
    const updated = { ...customColors, [key]: hex };
    setCustomColors(updated);
    const customPal: ColorPalette = {
      id: 'custom-palette-5',
      name: 'Personalizada (5 Colores)',
      primary: updated.primary,
      secondary: updated.secondary,
      accent: updated.accent,
      backgroundDark: updated.backgroundDark,
      surfaceDark: updated.surfaceDark,
      gradient: `linear-gradient(135deg, ${updated.primary}, ${updated.secondary})`
    };
    setActivePalette(customPal);
    setThemeColor(updated.primary);
  };

  const [logoUrl, setLogoUrl] = useState(restaurant.logoUrl || '');
  const [coverUrl, setCoverUrl] = useState(restaurant.coverUrl || '');
  const [tagline, setTagline] = useState(restaurant.tagline || '');
  const [shortDescription, setShortDescription] = useState(restaurant.shortDescription || '');
  const [story, setStory] = useState(restaurant.story || '');

  // Contact & Service
  const [whatsappCountryCode, setWhatsappCountryCode] = useState(restaurant.whatsappCountryCode || '+57');
  const [whatsappNumber, setWhatsappNumber] = useState(restaurant.whatsappNumber || '');
  const [currencyCode, setCurrencyCode] = useState(restaurant.currencyCode || 'COP');
  const [currencySymbol, setCurrencySymbol] = useState(restaurant.currencySymbol || '$');
  const [openingHours, setOpeningHours] = useState(restaurant.openingHours || '');
  const [modalities, setModalities] = useState<DeliveryModalities>(
    restaurant.modalities || { delivery: true, pickup: true }
  );

  // Teléfonos múltiples con etiquetas
  const [contactPhones, setContactPhones] = useState<ContactPhone[]>(
    restaurant.contactPhones || []
  );

  // Redes Sociales
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(
    restaurant.socialLinks || {
      instagram: restaurant.instagramUrl || '',
      facebook: '',
      tiktok: '',
      whatsapp: '',
      twitter: '',
      website: ''
    }
  );

  // Métodos de Pago & Bre-B Plugin
  const [paymentConfig, setPaymentConfig] = useState<PaymentPluginConfig>(
    restaurant.paymentConfig || {
      enabled: false,
      methods: [
        {
          id: 'pay-bre-b',
          type: 'bre-b',
          name: 'Bre-B / QR Interoperable',
          accountDetails: '',
          qrImageUrl: '',
          instructions: 'Escanea el código QR desde cualquier app bancaria o billetera digital.',
          isActive: true
        },
        {
          id: 'pay-transfer',
          type: 'transfer',
          name: 'Transferencia Bancaria (Nequi / Bancolombia)',
          accountDetails: 'Nequi / Ahorros Bancolombia: 300 123 4567',
          qrImageUrl: '',
          instructions: 'Envía el comprobante de pago a nuestro WhatsApp.',
          isActive: true
        },
        {
          id: 'pay-cash',
          type: 'cash',
          name: 'Efectivo Contraentrega',
          accountDetails: 'Pago directo al repartidor o en el local',
          instructions: 'Indica en notas con cuánto vas a pagar para llevarte el cambio exacto.',
          isActive: true
        }
      ]
    }
  );

  // Location
  const [address, setAddress] = useState(restaurant.address || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(restaurant.googleMapsUrl || '');
  const [locationCoords, setLocationCoords] = useState<LocationCoordinates | undefined>(restaurant.locationCoords);

  const [errorMessage, setErrorMessage] = useState('');
  const [successSaved, setSuccessSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Estados de generación IA inline con blur y rate limit
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [lastAiRequestTime, setLastAiRequestTime] = useState(0);

  // Manejo de carga de imágenes a R2 / Local
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: 'logos' | 'covers' | 'qrs',
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadTenantAsset(file, slug || restaurant.slug, folder);
      setter(result.url);
    } catch {
      setErrorMessage('Error al subir imagen. Intenta con otro archivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCurrencyChange = (code: string) => {
    setCurrencyCode(code);
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrencySymbol(found.symbol);
    }
  };

  // Selector de paleta
  const handleSelectPalette = (pal: ColorPalette) => {
    setActivePalette(pal);
    setThemeColor(pal.primary);
  };

  // Generación Inline con IA: Feed Description (<= 180 caracteres)
  const handleGenerateInlineDesc = async () => {
    const now = Date.now();
    if (now - lastAiRequestTime < 2000) return;
    setLastAiRequestTime(now);
    setIsGeneratingDesc(true);

    try {
      const textPrompt = shortDescription || `${name} ${cuisineType} ${tagline}`;
      const result = await generateInlineFeedDescription(textPrompt, {
        name,
        cuisine: cuisineType
      });
      setShortDescription(result);
    } catch (err) {
      console.error('Error al generar descripción inline:', err);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Generación Inline con IA: Filosofía e Historia
  const handleGenerateInlineStory = async () => {
    const now = Date.now();
    if (now - lastAiRequestTime < 2000) return;
    setLastAiRequestTime(now);
    setIsGeneratingStory(true);

    try {
      const textPrompt = story || `${name} ${cuisineType} ${tagline}`;
      const result = await generateInlinePhilosophy(textPrompt, {
        name,
        cuisine: cuisineType
      });
      setStory(result.story);
      if (result.tagline && !tagline) {
        setTagline(result.tagline);
      }
    } catch (err) {
      console.error('Error al generar filosofía inline:', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Agregar teléfono adicional
  const handleAddPhone = () => {
    const newPhone: ContactPhone = {
      id: `phone-${Date.now()}`,
      countryCode: whatsappCountryCode,
      number: '',
      label: 'Atención al Cliente',
      isPrimaryWhatsApp: false
    };
    setContactPhones([...contactPhones, newPhone]);
  };

  const handleRemovePhone = (id: string) => {
    setContactPhones(contactPhones.filter((p) => p.id !== id));
  };

  const handleUpdatePhone = (id: string, field: keyof ContactPhone, val: any) => {
    setContactPhones(
      contactPhones.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  // Métodos de pago helpers
  const handleTogglePlugin = (enabled: boolean) => {
    setPaymentConfig((prev) => ({ ...prev, enabled }));
  };

  const handleAddPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: `pay-${Date.now()}`,
      type: 'transfer',
      name: 'Nueva Cuenta / Billetera',
      accountDetails: '',
      qrImageUrl: '',
      instructions: 'Envía el comprobante al WhatsApp.',
      isActive: true
    };
    setPaymentConfig((prev) => ({
      ...prev,
      methods: [...prev.methods, newMethod]
    }));
  };

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentConfig((prev) => ({
      ...prev,
      methods: prev.methods.filter((m) => m.id !== id)
    }));
  };

  const handleUpdatePaymentMethod = (id: string, field: keyof PaymentMethod, val: any) => {
    setPaymentConfig((prev) => ({
      ...prev,
      methods: prev.methods.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('El nombre del restaurante no puede estar vacío.');
      setActiveTab('general');
      return;
    }

    if (!slug.trim()) {
      setErrorMessage('El slug del enlace no puede estar vacío.');
      setActiveTab('general');
      return;
    }

    if (!whatsappNumber.trim()) {
      setErrorMessage('Debes indicar un número telefónico de WhatsApp para recibir pedidos.');
      setActiveTab('service');
      return;
    }

    if (!modalities.delivery && !modalities.pickup) {
      setErrorMessage('Debes habilitar al menos una modalidad de servicio (Domicilio o Retiro en local).');
      setActiveTab('service');
      return;
    }

    const updated: Restaurant = {
      ...restaurant,
      name: name.trim(),
      cuisineType: cuisineType.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      themeColor,
      palette: activePalette,
      logoUrl: logoUrl.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      tagline: tagline.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      story: story.trim() || undefined,
      openingHours: openingHours.trim() || undefined,
      whatsappCountryCode,
      whatsappNumber: whatsappNumber.replace(/[^\d]/g, ''),
      contactPhones,
      socialLinks,
      currencyCode,
      currencySymbol,
      modalities,
      paymentConfig,
      address: address.trim() || undefined,
      googleMapsUrl: googleMapsUrl || undefined,
      locationCoords,
      updatedAt: new Date().toISOString()
    };

    onSave(updated);
    setSuccessSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '92%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Store size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Ajustes del Negocio</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de Navegación del Modal */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            overflowX: 'auto'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            style={{
              flex: 1,
              minWidth: '110px',
              padding: '0.8rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: activeTab === 'general' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'general' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <Store size={14} /> Marca & Feed
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            style={{
              flex: 1,
              minWidth: '125px',
              padding: '0.8rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: activeTab === 'payments' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'payments' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <CreditCard size={14} /> Pagos & Bre-B
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '0.8rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: activeTab === 'channels' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'channels' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <Share2 size={14} /> Redes & Teléfonos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('service')}
            style={{
              flex: 1,
              minWidth: '100px',
              padding: '0.8rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: activeTab === 'service' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'service' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <Bike size={14} /> Entregas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('location')}
            style={{
              flex: 1,
              minWidth: '100px',
              padding: '0.8rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: activeTab === 'location' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'location' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <MapPin size={14} /> Maps
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
            {errorMessage && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: '#f87171',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}
              >
                <AlertCircle size={16} /> {errorMessage}
              </div>
            )}

            {/* TAB 1: GENERAL & PALETAS */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre del Negocio *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Burger Artisan Club"
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Especialidad / Tipo de Cocina</label>
                    <input
                      type="text"
                      value={cuisineType}
                      onChange={(e) => setCuisineType(e.target.value)}
                      placeholder="Ej. Hamburguesas & Papas"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Slug URL del Menú (/m/)</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* SELECTOR DE PALETA DE COLORES (PRESETS + CREADOR DE 5 COLORES) */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Palette size={15} color="var(--primary)" /> Paleta de Colores de Marca
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isCustomPalette;
                        setIsCustomPalette(nextState);
                        if (nextState) {
                          handleUpdateCustomColor('primary', customColors.primary);
                        }
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                    >
                      {isCustomPalette ? 'Ver Paletas Preestablecidas' : '🎨 Crear Paleta Personalizada (5 Colores)'}
                    </button>
                  </div>

                  {!isCustomPalette ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                      {PRESET_PALETTES.map((pal) => {
                        const isSelected = activePalette.id === pal.id;
                        return (
                          <div
                            key={pal.id}
                            onClick={() => {
                              setIsCustomPalette(false);
                              handleSelectPalette(pal);
                            }}
                            style={{
                              padding: '0.6rem',
                              borderRadius: 'var(--radius-md)',
                              background: isSelected ? 'rgba(255, 87, 34, 0.12)' : 'var(--bg-surface-elevated)',
                              border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ height: '14px', borderRadius: '4px', background: pal.gradient || pal.primary, marginBottom: '0.4rem' }} />
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                              {pal.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* PANEL INTERACTIVO DE 5 COLORES PERSONALIZADOS */
                    <div
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--primary)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        marginTop: '0.5rem'
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                        🎨 Diseña tu Paleta Personalizada de 5 Colores
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>1. Color Principal</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="color"
                              value={customColors.primary}
                              onChange={(e) => handleUpdateCustomColor('primary', e.target.value)}
                              style={{ width: '36px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <input
                              type="text"
                              value={customColors.primary}
                              onChange={(e) => handleUpdateCustomColor('primary', e.target.value)}
                              className="form-input"
                              style={{ fontSize: '0.78rem', padding: '0.3rem' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>2. Color Secundario</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="color"
                              value={customColors.secondary}
                              onChange={(e) => handleUpdateCustomColor('secondary', e.target.value)}
                              style={{ width: '36px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <input
                              type="text"
                              value={customColors.secondary}
                              onChange={(e) => handleUpdateCustomColor('secondary', e.target.value)}
                              className="form-input"
                              style={{ fontSize: '0.78rem', padding: '0.3rem' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>3. Color Destacado (Acento)</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="color"
                              value={customColors.accent}
                              onChange={(e) => handleUpdateCustomColor('accent', e.target.value)}
                              style={{ width: '36px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <input
                              type="text"
                              value={customColors.accent}
                              onChange={(e) => handleUpdateCustomColor('accent', e.target.value)}
                              className="form-input"
                              style={{ fontSize: '0.78rem', padding: '0.3rem' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>4. Fondo General</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="color"
                              value={customColors.backgroundDark}
                              onChange={(e) => handleUpdateCustomColor('backgroundDark', e.target.value)}
                              style={{ width: '36px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <input
                              type="text"
                              value={customColors.backgroundDark}
                              onChange={(e) => handleUpdateCustomColor('backgroundDark', e.target.value)}
                              className="form-input"
                              style={{ fontSize: '0.78rem', padding: '0.3rem' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.72rem' }}>5. Superficie / Tarjetas</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="color"
                              value={customColors.surfaceDark}
                              onChange={(e) => handleUpdateCustomColor('surfaceDark', e.target.value)}
                              style={{ width: '36px', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <input
                              type="text"
                              value={customColors.surfaceDark}
                              onChange={(e) => handleUpdateCustomColor('surfaceDark', e.target.value)}
                              className="form-input"
                              style={{ fontSize: '0.78rem', padding: '0.3rem' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* DESCRIPCIÓN COMERCIAL & FEED (IA INLINE CON BLUR) */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                      <Sparkles size={14} color="var(--primary)" /> Breve Descripción para el Feed (IA)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateInlineDesc}
                      disabled={isGeneratingDesc}
                      className="btn btn-primary btn-sm"
                      style={{
                        fontSize: '0.78rem',
                        padding: '0.3rem 0.8rem',
                        gap: '0.35rem',
                        boxShadow: '0 2px 10px var(--primary-glow)',
                        borderRadius: '999px',
                        fontWeight: 700
                      }}
                    >
                      {isGeneratingDesc ? (
                        <>
                          <Loader2 size={13} className="spin-animation" /> Redactando...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} /> Generar con IA
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                    <textarea
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Descripción corta y atractiva para la cabecera del menú y tarjetas sociales..."
                      rows={2}
                      className="form-input"
                      maxLength={180}
                      style={{
                        filter: isGeneratingDesc ? 'blur(4px)' : 'none',
                        transition: 'filter 0.25s ease, opacity 0.25s ease',
                        opacity: isGeneratingDesc ? 0.6 : 1,
                        pointerEvents: isGeneratingDesc ? 'none' : 'auto'
                      }}
                    />
                    {isGeneratingDesc && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0, 0, 0, 0.25)',
                          backdropFilter: 'blur(2px)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          gap: '0.45rem',
                          zIndex: 2
                        }}
                      >
                        <Loader2 size={15} className="spin-animation" />
                        <span>Optimizando feed (máx. 180 caracteres)...</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Texto persuasivo para el feed de clientes
                    </span>
                    <span style={{ fontSize: '0.72rem', color: shortDescription.length > 170 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {shortDescription.length}/180 caracteres
                    </span>
                  </div>
                </div>

                {/* HISTORIA Y FILOSOFÍA DE MARCA (IA INLINE CON BLUR) */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                      <Sparkles size={14} color="var(--primary)" /> Historia & Filosofía de Marca (IA)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateInlineStory}
                      disabled={isGeneratingStory}
                      className="btn btn-primary btn-sm"
                      style={{
                        fontSize: '0.78rem',
                        padding: '0.3rem 0.8rem',
                        gap: '0.35rem',
                        boxShadow: '0 2px 10px var(--primary-glow)',
                        borderRadius: '999px',
                        fontWeight: 700
                      }}
                    >
                      {isGeneratingStory ? (
                        <>
                          <Loader2 size={13} className="spin-animation" /> Redactando...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} /> Generar con IA
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                    <textarea
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      placeholder="Propósito de marca, historia y valores que diferencian a tu restaurante..."
                      rows={3}
                      className="form-input"
                      style={{
                        filter: isGeneratingStory ? 'blur(4px)' : 'none',
                        transition: 'filter 0.25s ease, opacity 0.25s ease',
                        opacity: isGeneratingStory ? 0.6 : 1,
                        pointerEvents: isGeneratingStory ? 'none' : 'auto'
                      }}
                    />
                    {isGeneratingStory && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0, 0, 0, 0.25)',
                          backdropFilter: 'blur(2px)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          gap: '0.45rem',
                          zIndex: 2
                        }}
                      >
                        <Loader2 size={15} className="spin-animation" />
                        <span>Redactando filosofía y valores de marca...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* LOGO & PORTADA */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Logotipo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {logoUrl && (
                        <img
                          src={logoUrl}
                          alt="Logo"
                          style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                        />
                      )}
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', flex: 1, textAlign: 'center' }}>
                        <Upload size={13} /> {isUploading ? 'Subiendo...' : 'Subir Logo'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(e, 'logos', setLogoUrl)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Foto de Portada</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {coverUrl && (
                        <img
                          src={coverUrl}
                          alt="Portada"
                          style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                        />
                      )}
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', flex: 1, textAlign: 'center' }}>
                        <Upload size={13} /> {isUploading ? 'Subiendo...' : 'Subir Portada'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload(e, 'covers', setCoverUrl)}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Eslogan / Frase de Impacto</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Ej. Máxima frescura 100% artesanal"
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: MÉTODOS DE PAGO & BRE-B PLUGIN */}
            {activeTab === 'payments' && (
              <div>
                {/* Switch Maestro del Plugin */}
                <div
                  style={{
                    background: paymentConfig.enabled ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-surface-elevated)',
                    border: paymentConfig.enabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: paymentConfig.enabled ? 'var(--success)' : 'var(--text-primary)' }}>
                      <CreditCard size={18} /> Plugin de Métodos de Pago
                    </div>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Permite a los clientes elegir método de pago (Bre-B, Nequi, Efectivo) y ver tus códigos QR en el checkout.
                    </p>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={paymentConfig.enabled}
                      onChange={(e) => handleTogglePlugin(e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {paymentConfig.enabled ? 'Activado' : 'Desactivado'}
                    </span>
                  </label>
                </div>

                {/* Lista de Métodos de Pago */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                    Métodos Configurados ({paymentConfig.methods.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddPaymentMethod}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.3rem' }}
                  >
                    <Plus size={14} /> Añadir Método
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {paymentConfig.methods.map((method) => (
                    <div
                      key={method.id}
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={method.isActive}
                            onChange={(e) => handleUpdatePaymentMethod(method.id, 'isActive', e.target.checked)}
                            style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                            title="Activo / Inactivo"
                          />
                          <input
                            type="text"
                            value={method.name}
                            onChange={(e) => handleUpdatePaymentMethod(method.id, 'name', e.target.value)}
                            placeholder="Nombre del método (ej. Bre-B, Nequi...)"
                            className="form-input"
                            style={{ fontWeight: 700, fontSize: '0.9rem', padding: '0.35rem 0.6rem' }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemovePaymentMethod(method.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            padding: '0.3rem'
                          }}
                          title="Eliminar método"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0.75rem', alignItems: 'start' }}>
                        {/* Tipo de Pago */}
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Tipo</label>
                          <select
                            value={method.type}
                            onChange={(e) => handleUpdatePaymentMethod(method.id, 'type', e.target.value as PaymentType)}
                            className="form-select"
                            style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                          >
                            <option value="bre-b">Bre-B (QR)</option>
                            <option value="transfer">Transferencia</option>
                            <option value="cash">Efectivo</option>
                            <option value="card">Tarjeta</option>
                            <option value="other">Otro</option>
                          </select>
                        </div>

                        {/* Datos de Cuenta / Clave */}
                        <div>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Datos de Cuenta / Llave</label>
                          <input
                            type="text"
                            value={method.accountDetails || ''}
                            onChange={(e) => handleUpdatePaymentMethod(method.id, 'accountDetails', e.target.value)}
                            placeholder="Ej. Nequi: 3001234567 / Ahorros 123-456"
                            className="form-input"
                            style={{ fontSize: '0.82rem', padding: '0.45rem 0.6rem' }}
                          />
                        </div>
                      </div>

                      {/* Subida de Imagen de Código QR */}
                      <div style={{ marginTop: '0.75rem' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <QrCode size={13} color="var(--primary)" /> Imagen de Código QR (Opcional)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {method.qrImageUrl ? (
                            <div style={{ position: 'relative' }}>
                              <img
                                src={method.qrImageUrl}
                                alt="QR de Pago"
                                style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdatePaymentMethod(method.id, 'qrImageUrl', '')}
                                style={{
                                  position: 'absolute',
                                  top: '-5px',
                                  right: '-5px',
                                  background: 'var(--danger)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '18px',
                                  height: '18px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', fontSize: '0.78rem' }}>
                              <Upload size={13} /> Subir Imagen QR
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e, 'qrs', (url) => handleUpdatePaymentMethod(method.id, 'qrImageUrl', url))}
                              />
                            </label>
                          )}
                          <input
                            type="text"
                            value={method.instructions || ''}
                            onChange={(e) => handleUpdatePaymentMethod(method.id, 'instructions', e.target.value)}
                            placeholder="Instrucciones para el cliente (ej. enviar comprobante al WhatsApp)"
                            className="form-input"
                            style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem 0.6rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: REDES & TELÉFONOS MÚLTIPLES */}
            {activeTab === 'channels' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Teléfono Principal WhatsApp */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: 'var(--whatsapp-green)' }}>
                    📱 Teléfono Principal para Pedidos (WhatsApp) *
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <CountryCodeSelect
                      value={whatsappCountryCode}
                      onChange={setWhatsappCountryCode}
                    />
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="300 123 4567"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Teléfonos Adicionales con Etiquetas */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Teléfonos Adicionales con Etiqueta ({contactPhones.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddPhone}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', gap: '0.3rem' }}
                    >
                      <Plus size={13} /> Añadir Número
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {contactPhones.map((phone) => (
                      <div
                        key={phone.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '140px 1fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          background: 'var(--bg-surface-elevated)',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <input
                          type="text"
                          value={phone.label}
                          onChange={(e) => handleUpdatePhone(phone.id, 'label', e.target.value)}
                          placeholder="Etiqueta (ej. Domicilios)"
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        />
                        <input
                          type="tel"
                          value={phone.number}
                          onChange={(e) => handleUpdatePhone(phone.id, 'number', e.target.value)}
                          placeholder="Número telefónico"
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhone(phone.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Redes Sociales Dinámicas (Matriz 3x3 Compacta Desplegable) */}
                <CompactSocialLinksPicker
                  socialLinks={socialLinks}
                  onChange={setSocialLinks}
                />
              </div>
            )}

            {/* TAB 4: ENTREGAS & HORARIOS */}
            {activeTab === 'service' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Moneda de Precios</label>
                  <select
                    value={currencyCode}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    className="form-select"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Modalidades de Pedido Habilitadas</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div
                      onClick={() => setModalities({ ...modalities, delivery: !modalities.delivery })}
                      style={{
                        background: modalities.delivery ? 'rgba(255, 87, 34, 0.12)' : 'var(--bg-surface-elevated)',
                        border: modalities.delivery ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Bike size={16} /> Domicilio
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Envío con repartidor</div>
                      </div>
                      <input type="checkbox" checked={modalities.delivery} readOnly style={{ accentColor: 'var(--primary)' }} />
                    </div>

                    <div
                      onClick={() => setModalities({ ...modalities, pickup: !modalities.pickup })}
                      style={{
                        background: modalities.pickup ? 'rgba(255, 87, 34, 0.12)' : 'var(--bg-surface-elevated)',
                        border: modalities.pickup ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <ShoppingBag size={16} /> Retiro en Local
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pasan a recoger</div>
                      </div>
                      <input type="checkbox" checked={modalities.pickup} readOnly style={{ accentColor: 'var(--primary)' }} />
                    </div>
                  </div>
                </div>

                {/* HORARIOS DE ATENCIÓN ESTRUCTURADOS */}
                <div className="form-group">
                  <OpeningHoursPicker
                    value={openingHours}
                    onChange={setOpeningHours}
                  />
                </div>
              </div>
            )}

            {/* TAB 5: UBICACIÓN GOOGLE MAPS */}
            {activeTab === 'location' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Dirección del Establecimiento (Google Maps)</label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Selecciona tu local para que tus clientes puedan abrir el GPS o ubicar su entrega fácilmente.
                  </p>
                  <GoogleMapsPicker
                    initialAddress={address}
                    initialCoords={locationCoords}
                    placeholder="Busca la dirección o nombre de tu restaurante..."
                    onLocationSelected={({ address: newAddr, coords, mapsUrl }) => {
                      setAddress(newAddr);
                      setLocationCoords(coords);
                      setGoogleMapsUrl(mapsUrl || '');
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {successSaved && (
                <span style={{ color: 'var(--success)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> ¡Ajustes guardados correctamente!
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Save size={16} /> Guardar Ajustes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
