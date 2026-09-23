import React, { useState, useRef, useEffect } from 'react';
import {
  Store,
  MessageCircle,
  MapPin,
  UtensilsCrossed,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  Smartphone,
  Signal,
  Wifi,
  Battery,
  Edit3,
  Star,
  Flame,
  Tag,
  Bike,
  ShoppingBag,
  CheckCircle2,
  Zap,
  Palette,
  Upload,
  Globe,
  Share2,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Category, Dish, Restaurant, ContactPhone, SocialLinks, ColorPalette } from '../../types/restaurant';
import { GoogleMapsPicker } from '../maps/GoogleMapsPicker';
import { CartProvider } from '../../context/CartContext';
import { ClientMenuView } from '../client/ClientMenuView';
import { CategoryIcon } from '../common/CategoryIcon';
import { generateInlineFeedDescription, generateInlinePhilosophy } from '../../services/geminiAiService';
import { extractBrandingFromUrl } from '../../services/brandingExtractor';
import { PRESET_PALETTES } from '../../services/colorPalettes';
import { uploadTenantAsset } from '../../services/storage/r2Storage';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { OpeningHoursPicker } from '../common/OpeningHoursPicker';
import { CompactSocialLinksPicker } from './CompactSocialLinksPicker';
import { CountryCodeSelect } from '../common/CountryCodeSelect';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currency';

interface OnboardingWizardProps {
  initialRestaurant: Restaurant;
  onComplete: (completedRestaurant: Restaurant) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialRestaurant,
  onComplete
}) => {
  useScrollReveal();
  const [step, setStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [showStickyStepper, setShowStickyStepper] = useState<boolean>(false);

  const topStepperRef = useRef<HTMLDivElement>(null);
  const rightFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = topStepperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyStepper(!entry.isIntersecting);
      },
      {
        threshold: 0.1
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goToStep = (targetStep: number) => {
    if (targetStep < 1 || targetStep > 5) return;
    if (targetStep === step) return;
    setSlideDirection(targetStep > step ? 'next' : 'prev');
    setStep(targetStep);
  };

  const [formData, setFormData] = useState<Restaurant>({
    ...initialRestaurant,
    name: initialRestaurant.name || '',
    slug: initialRestaurant.slug || 'mi-restaurante',
    cuisineType: initialRestaurant.cuisineType || 'Hamburguesas Artesanales',
    themeColor: initialRestaurant.themeColor || '#ff5722',
    palette: initialRestaurant.palette || PRESET_PALETTES[0],
    logoUrl: initialRestaurant.logoUrl || '',
    coverUrl: initialRestaurant.coverUrl || '',
    promotionalImageUrl: initialRestaurant.promotionalImageUrl || '',
    tagline: initialRestaurant.tagline || 'Sabores Auténticos & Ingredientes 100% Seleccionados',
    shortDescription: initialRestaurant.shortDescription || '',
    story: initialRestaurant.story || '',
    openingHours: initialRestaurant.openingHours || 'Lun a Dom: 11:30 AM - 10:30 PM',
    whatsappCountryCode: initialRestaurant.whatsappCountryCode || '+57',
    whatsappNumber: initialRestaurant.whatsappNumber || '',
    contactPhones: initialRestaurant.contactPhones || [],
    socialLinks: initialRestaurant.socialLinks || { instagram: '', facebook: '', tiktok: '', website: '' },
    currencySymbol: initialRestaurant.currencySymbol || '$',
    modalities: initialRestaurant.modalities || { delivery: true, pickup: true },
    categories: initialRestaurant.categories.length > 0 ? initialRestaurant.categories : [
      { id: 'cat-init-1', name: 'Platos Principales', icon: 'utensils', order: 1 }
    ],
    dishes: initialRestaurant.dishes.length > 0 ? initialRestaurant.dishes : []
  });

  // Estado para el extractor de branding por URL
  const [extractUrl, setExtractUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractMsg, setExtractMsg] = useState('');

  // Estados para generador de IA inline con blur y rate limit
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [lastAiRequestTime, setLastAiRequestTime] = useState(0);

  // Estados para nuevo plato y categoría
  const [newCatName, setNewCatName] = useState('');
  const [newDishName, setNewDishName] = useState('');
  const [newDishSlug, setNewDishSlug] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishCatId, setNewDishCatId] = useState(formData.categories[0]?.id || 'cat-init-1');
  const [newDishIsFeatured, setNewDishIsFeatured] = useState(true);
  const [newDishIsBestSeller, setNewDishIsBestSeller] = useState(false);
  const [newDishImageUrl, setNewDishImageUrl] = useState('');
  const [isUploadingDishImage, setIsUploadingDishImage] = useState(false);

  // Estado para Paleta Personalizada de 5 Colores
  const [isCustomPalette, setIsCustomPalette] = useState(formData.palette?.id?.startsWith('custom') || false);
  const [customColors, setCustomColors] = useState({
    primary: formData.palette?.primary || '#ff5722',
    secondary: formData.palette?.secondary || '#ff9800',
    accent: formData.palette?.accent || '#f59e0b',
    backgroundDark: formData.palette?.backgroundDark || '#0b0f19',
    surfaceDark: formData.palette?.surfaceDark || '#131b2e'
  });

  // Estado para selector interactivo de redes sociales adicionales
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
    setFormData((prev) => ({
      ...prev,
      palette: customPal,
      themeColor: updated.primary
    }));
  };

  // Extractor de branding
  const handleExtractBranding = async () => {
    if (!extractUrl.trim()) return;
    setIsExtracting(true);
    setExtractMsg('');
    try {
      const extracted = await extractBrandingFromUrl(extractUrl);
      const safeSlug = extracted.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      setFormData((prev) => ({
        ...prev,
        name: extracted.name || prev.name,
        slug: safeSlug || prev.slug,
        logoUrl: extracted.logoUrl || prev.logoUrl,
        coverUrl: extracted.coverUrl || prev.coverUrl,
        palette: extracted.palette || prev.palette,
        themeColor: extracted.palette?.primary || prev.themeColor,
        tagline: extracted.tagline || prev.tagline,
        shortDescription: extracted.description ? extracted.description.slice(0, 160) : prev.shortDescription,
        socialLinks: {
          ...prev.socialLinks,
          ...(extracted.socialLinks || {})
        }
      }));
      setExtractMsg(`✨ ¡Branding de "${extracted.name}" extraído con éxito!`);
    } catch {
      setExtractMsg('No se pudo extraer la información automáticamente. Puedes completarla manualmente.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Generación Inline con IA: Descripción corta para el feed (<= 180 caracteres)
  const handleGenerateInlineDesc = async () => {
    const now = Date.now();
    if (now - lastAiRequestTime < 2000) return;
    setLastAiRequestTime(now);
    setIsGeneratingDesc(true);

    try {
      const textPrompt = formData.shortDescription || `${formData.name} ${formData.cuisineType}`;
      const result = await generateInlineFeedDescription(textPrompt, {
        name: formData.name,
        cuisine: formData.cuisineType
      });
      setFormData((prev) => ({
        ...prev,
        shortDescription: result
      }));
    } catch (err) {
      console.error('Error al generar descripción inline:', err);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // Generación Inline con IA: Filosofía, propósito y eslogan
  const handleGenerateInlineStory = async () => {
    const now = Date.now();
    if (now - lastAiRequestTime < 2000) return;
    setLastAiRequestTime(now);
    setIsGeneratingStory(true);

    try {
      const textPrompt = formData.story || `${formData.name} ${formData.cuisineType} ${formData.tagline || ''}`;
      const result = await generateInlinePhilosophy(textPrompt, {
        name: formData.name,
        cuisine: formData.cuisineType
      });
      setFormData((prev) => ({
        ...prev,
        story: result.story,
        tagline: result.tagline || prev.tagline
      }));
    } catch (err) {
      console.error('Error al generar historia inline:', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleNameChange = (name: string) => {
    const generatedSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: generatedSlug || prev.slug
    }));
  };

  const handleDishNameChange = (name: string) => {
    const generatedSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setNewDishName(name);
    setNewDishSlug(generatedSlug);
  };

  // Subida de imagen para logo, portada, plato o promo usando R2
  const handleUploadFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: 'logos' | 'covers' | 'dishes' | 'promo',
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadTenantAsset(file, formData.slug, folder);
      setter(res.url);
    } catch {
      console.error('Error al subir archivo');
    }
  };

  // Teléfonos adicionales
  const handleAddContactPhone = () => {
    const newP: ContactPhone = {
      id: `phone-${Date.now()}`,
      countryCode: formData.whatsappCountryCode,
      number: '',
      label: 'Atención al Cliente',
      isPrimaryWhatsApp: false
    };
    setFormData((prev) => ({
      ...prev,
      contactPhones: [...(prev.contactPhones || []), newP]
    }));
  };

  const handleRemoveContactPhone = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      contactPhones: (prev.contactPhones || []).filter((p) => p.id !== id)
    }));
  };

  const handleUpdateContactPhone = (id: string, field: keyof ContactPhone, val: any) => {
    setFormData((prev) => ({
      ...prev,
      contactPhones: (prev.contactPhones || []).map((p) => (p.id === id ? { ...p, [field]: val } : p))
    }));
  };

  // Categorías
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      icon: 'utensils',
      order: formData.categories.length + 1
    };
    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));
    setNewCatName('');
    if (!newDishCatId) {
      setNewDishCatId(newCat.id);
    }
  };

  const handleRemoveCategory = (catId: string) => {
    if (formData.categories.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== catId),
      dishes: prev.dishes.filter((d) => d.categoryId !== catId)
    }));
  };

  // Platos
  const handleAddDish = () => {
    if (!newDishName.trim() || !newDishPrice) return;
    const priceNum = parseCurrencyInput(newDishPrice);
    if (priceNum <= 0) return;

    const newDish: Dish = {
      id: `dish-${Date.now()}`,
      slug: newDishSlug || newDishName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      categoryId: newDishCatId,
      name: newDishName.trim(),
      description: newDishDesc.trim() || 'Plato preparado con ingredientes frescos y seleccionados.',
      price: priceNum,
      imageUrl: newDishImageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      isFeatured: newDishIsFeatured,
      isBestSeller: newDishIsBestSeller,
      isAvailable: true,
      order: formData.dishes.length + 1
    };

    setFormData((prev) => ({
      ...prev,
      dishes: [...prev.dishes, newDish]
    }));

    setNewDishName('');
    setNewDishSlug('');
    setNewDishPrice('');
    setNewDishDesc('');
    setNewDishImageUrl('');
    setNewDishIsFeatured(true);
    setNewDishIsBestSeller(false);
  };

  const handleRemoveDish = (dishId: string) => {
    setFormData((prev) => ({
      ...prev,
      dishes: prev.dishes.filter((d) => d.id !== dishId)
    }));
  };

  const handleFinish = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    const completed: Restaurant = {
      ...formData,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString()
    };
    onComplete(completed);
  };

  const canProceedStep1 = formData.name.trim() !== '' && formData.slug.trim() !== '';
  const canProceedStep2 = formData.whatsappNumber.trim().length >= 7;

  return (
    <div className="onboarding-wrapper">
      {/* Botones de alternancia para dispositivos móviles */}
      <div className="onboarding-tab-switcher">
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`btn ${activeTab === 'form' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <Edit3 size={15} /> Formulario
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`btn ${activeTab === 'preview' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <Eye size={15} /> Vista Previa en Vivo
        </button>
      </div>

      <div className={`onboarding-split-container tab-${activeTab}`}>
        {/* COLUMNA IZQUIERDA: VISTA PREVIA EN TIEMPO REAL */}
        <div className="onboarding-left-preview">
          <div className="onboarding-preview-scroll">
            <CartProvider restaurantSlug={formData.slug}>
              <ClientMenuView restaurant={formData} isPreview={true} />
            </CartProvider>
          </div>
        </div>

        {/* COLUMNA DERECHA: ASISTENTE PASO A PASO */}
        <div className="onboarding-right-form" ref={rightFormRef}>
          <div className="onboarding-header">
            <div style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', background: 'rgba(255, 87, 34, 0.12)', borderRadius: '999px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem', gap: '0.4rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <Sparkles size={15} /> Asistente de Configuración
            </div>
            <h1>Configura tu Menú Virtual</h1>
            <p>Completa estos pasos iniciales. A la izquierda verás cómo se va construyendo tu carta en tiempo real.</p>
          </div>

          {/* Stepper Visual */}
          <div className="stepper" ref={topStepperRef}>
            <div className="stepper-line-track">
              <div
                className="stepper-line-progress"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
            {[
              { num: 1, label: 'Identidad', icon: Store },
              { num: 2, label: 'Contacto & Redes', icon: MessageCircle },
              { num: 3, label: 'Ubicación', icon: MapPin },
              { num: 4, label: 'Menú', icon: UtensilsCrossed },
              { num: 5, label: 'Activar', icon: Check }
            ].map((item) => {
              const isActive = step === item.num;
              const isDone = step > item.num;
              const Icon = item.icon;
              const isDisabled =
                (item.num > 1 && !canProceedStep1) ||
                (item.num > 2 && !canProceedStep2);
              return (
                <div
                  key={item.num}
                  onClick={() => !isDisabled && goToStep(item.num)}
                  style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                  className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                >
                  <div className="step-circle">
                    {isDone ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <span className="step-label">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="step-card">
            <div key={step} className={`step-content-anim slide-from-${slideDirection}`}>
              {/* PASO 1: IDENTIDAD & BRANDING */}
            {step === 1 && (
              <div>
                <h2 className="step-title">Paso 1: Identidad & Branding de Marca</h2>
                <p className="step-desc">Define el nombre de tu negocio, extrae tu branding desde tu web o red social y elige tu paleta de colores.</p>

                {/* EXTRACTOR DE BRANDING POR ENLACE */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                    <Zap size={16} /> Extraer Branding desde Enlace (Web o Red Social)
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.6rem 0' }}>
                    Pega el enlace de tu Instagram, TikTok, Facebook o sitio web para autocompletar nombre, logo y paleta:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="url"
                      value={extractUrl}
                      onChange={(e) => setExtractUrl(e.target.value)}
                      placeholder="https://instagram.com/tu_negocio o https://tuweb.com"
                      className="form-input"
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleExtractBranding}
                      disabled={isExtracting || !extractUrl.trim()}
                      className="btn btn-primary btn-sm"
                      style={{ whiteSpace: 'nowrap', gap: '0.35rem' }}
                    >
                      <Sparkles size={14} /> {isExtracting ? 'Extrayendo...' : 'Extraer'}
                    </button>
                  </div>
                  {extractMsg && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>
                      {extractMsg}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre del Restaurante *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej. Burger House, Pizzería Bella..."
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Enlace URL del Menú (Slug)</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '0 0.8rem', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/m/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="form-input"
                      style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Tipo de Cocina</label>
                    <input
                      type="text"
                      value={formData.cuisineType}
                      onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                      placeholder="Ej. Hamburguesas & Parrilla"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Logotipo (URL o Subir)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={formData.logoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://..."
                        className="form-input"
                        style={{ flex: 1, fontSize: '0.8rem' }}
                      />
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                        <Upload size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleUploadFile(e, 'logos', (url) => setFormData({ ...formData, logoUrl: url }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Portada / Fondo Header</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={formData.coverUrl || ''}
                        onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                        placeholder="https://..."
                        className="form-input"
                        style={{ flex: 1, fontSize: '0.8rem' }}
                      />
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                        <Upload size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleUploadFile(e, 'covers', (url) => setFormData({ ...formData, coverUrl: url }))}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Imagen Promocional (Slide)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={formData.promotionalImageUrl || ''}
                        onChange={(e) => setFormData({ ...formData, promotionalImageUrl: e.target.value })}
                        placeholder="https://..."
                        className="form-input"
                        style={{ flex: 1, fontSize: '0.8rem' }}
                      />
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }} title="Subir a Cloudflare">
                        <Upload size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleUploadFile(e, 'promo', (url) => setFormData({ ...formData, promotionalImageUrl: url }))}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* SELECTOR DE PALETA DE COLORES (PRESETS + CREADOR DE 5 COLORES) */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Palette size={15} color="var(--primary)" /> Paleta de Colores del Menú
                    </span>
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
                  </label>

                  {!isCustomPalette ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                      {PRESET_PALETTES.map((pal) => {
                        const isSelected = (formData.palette?.id || 'citrus-flame') === pal.id;
                        return (
                          <div
                            key={pal.id}
                            onClick={() => {
                              setIsCustomPalette(false);
                              setFormData({ ...formData, palette: pal, themeColor: pal.primary });
                            }}
                            style={{
                              padding: '0.55rem',
                              borderRadius: 'var(--radius-md)',
                              background: isSelected ? 'rgba(255, 87, 34, 0.12)' : 'var(--bg-surface-elevated)',
                              border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ height: '14px', borderRadius: '4px', background: pal.gradient || pal.primary, marginBottom: '0.35rem' }} />
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
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <label className="form-label" style={{ margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                      <Sparkles size={14} color="var(--primary)" /> Descripción Comercial & Feed (IA)
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
                      value={formData.shortDescription || ''}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Escribe palabras clave o deja que la IA redacte el gancho comercial para tus clientes..."
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
                      Texto persuasivo y conciso para la cabecera y el feed
                    </span>
                    <span style={{ fontSize: '0.72rem', color: (formData.shortDescription || '').length > 170 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {(formData.shortDescription || '').length}/180 caracteres
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Eslogan de Marca</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Ej. El sabor de lo que somos / Máxima Frescura 100% Artesanal"
                    className="form-input"
                  />
                </div>

                {/* HISTORIA & FILOSOFÍA DE MARCA (IA INLINE CON BLUR) */}
                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={14} color="var(--primary)" /> Historia & Filosofía (IA)
                    </span>
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
                      value={formData.story || ''}
                      onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                      placeholder="La visión, propósito y valores de tu restaurante..."
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
                        <span>Redactando propósito y filosofía de marca...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* HORARIO DE ATENCIÓN ESTRUCTURADO */}
                <div style={{ marginBottom: '1rem' }}>
                  <OpeningHoursPicker
                    value={formData.openingHours}
                    onChange={(hours) => setFormData((prev) => ({ ...prev, openingHours: hours }))}
                  />
                </div>
              </div>
            )}

            {/* PASO 2: CONTACTO & REDES SOCIALES */}
            {step === 2 && (
              <div>
                <h2 className="step-title">Paso 2: Contacto, WhatsApp & Redes</h2>
                <p className="step-desc">Configura tu canal principal de recepción de pedidos, teléfonos de atención y tus redes sociales.</p>

                {/* WhatsApp Principal */}
                <div style={{ background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ color: 'var(--whatsapp-green)', fontWeight: 700 }}>
                    📱 Teléfono Principal para Pedidos (WhatsApp) *
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <CountryCodeSelect
                      value={formData.whatsappCountryCode}
                      onChange={(code) => setFormData({ ...formData, whatsappCountryCode: code })}
                    />

                    <input
                      type="tel"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/[^\d]/g, '') })}
                      placeholder="Ej. 3001234567"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Teléfonos Adicionales */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Teléfonos Adicionales con Etiqueta</label>
                    <button
                      type="button"
                      onClick={handleAddContactPhone}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', gap: '0.3rem' }}
                    >
                      <Plus size={13} /> Añadir Número
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(formData.contactPhones || []).map((phone) => (
                      <div
                        key={phone.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '140px 1fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          background: 'var(--bg-surface-elevated)',
                          padding: '0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <input
                          type="text"
                          value={phone.label}
                          onChange={(e) => handleUpdateContactPhone(phone.id, 'label', e.target.value)}
                          placeholder="Etiqueta (ej. Domicilios)"
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.35rem' }}
                        />
                        <input
                          type="tel"
                          value={phone.number}
                          onChange={(e) => handleUpdateContactPhone(phone.id, 'number', e.target.value)}
                          placeholder="Número telefónico"
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '0.35rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveContactPhone(phone.id)}
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
                  socialLinks={formData.socialLinks || {}}
                  onChange={(updated) => setFormData({ ...formData, socialLinks: updated })}
                />
              </div>
            )}

            {/* PASO 3: MODALIDADES Y UBICACIÓN GOOGLE MAPS */}
            {step === 3 && (
              <div>
                <h2 className="step-title">Paso 3: Modalidades y Ubicación</h2>
                <p className="step-desc">Indica cómo entregas tus pedidos y fija la ubicación física de tu restaurante con Google Maps.</p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Modalidades de Entrega Activas</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div
                      onClick={() => setFormData({ ...formData, modalities: { ...formData.modalities, delivery: !formData.modalities.delivery } })}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${formData.modalities.delivery ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        background: formData.modalities.delivery ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Bike size={18} /> Domicilio
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Envío a la puerta</div>
                      </div>
                      <input type="checkbox" checked={formData.modalities.delivery} readOnly style={{ accentColor: 'var(--primary)' }} />
                    </div>

                    <div
                      onClick={() => setFormData({ ...formData, modalities: { ...formData.modalities, pickup: !formData.modalities.pickup } })}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${formData.modalities.pickup ? 'var(--primary)' : 'var(--border-subtle)'}`,
                        background: formData.modalities.pickup ? 'var(--primary-light)' : 'var(--bg-surface-elevated)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <ShoppingBag size={18} /> Retiro en Local
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Pasan a recoger al local</div>
                      </div>
                      <input type="checkbox" checked={formData.modalities.pickup} readOnly style={{ accentColor: 'var(--primary)' }} />
                    </div>
                  </div>

                  {formData.modalities.delivery && (
                    <div
                      style={{
                        marginTop: '0.85rem',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem'
                      }}
                    >
                      <div
                        onClick={() =>
                          setFormData({
                            ...formData,
                            modalities: {
                              ...formData.modalities,
                              deliveryFeeEnabled: !formData.modalities.deliveryFeeEnabled
                            }
                          })
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Bike size={15} color="var(--primary)" /> Tarifa estándar para domicilios
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            Suma un valor fijo cuando el pedido sea con entrega a domicilio.
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={Boolean(formData.modalities.deliveryFeeEnabled)}
                          onChange={() => {}}
                          style={{ accentColor: 'var(--primary)', transform: 'scale(1.15)', cursor: 'pointer' }}
                        />
                      </div>

                      {formData.modalities.deliveryFeeEnabled && (
                        <div style={{ paddingTop: '0.4rem', borderTop: '1px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>$</span>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={formData.modalities.deliveryFee ?? ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setFormData({
                                ...formData,
                                modalities: {
                                  ...formData.modalities,
                                  deliveryFee: isNaN(val) ? 0 : Math.max(0, val)
                                }
                              });
                            }}
                            placeholder="Costo (ej. 5000)"
                            className="form-input"
                            style={{ maxWidth: '180px' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Dirección del Restaurante (Google Maps)</label>
                  <GoogleMapsPicker
                    initialAddress={formData.address}
                    initialCoords={formData.locationCoords}
                    placeholder="Busca la dirección o nombre de tu local..."
                    onLocationSelected={({ address, coords, mapsUrl }) => {
                      setFormData((prev) => ({
                        ...prev,
                        address,
                        locationCoords: coords,
                        googleMapsUrl: mapsUrl
                      }));
                    }}
                  />
                </div>
              </div>
            )}

            {/* PASO 4: CATEGORÍAS Y PLATOS */}
            {step === 4 && (
              <div>
                <h2 className="step-title">Paso 4: Categorías y Primeros Platos</h2>
                <p className="step-desc">Agrega tus categorías y configura tus primeros platos para iniciar tu carta.</p>

                {/* Categorías */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Categorías del Menú</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Ej. Hamburguesas, Bebidas, Postres..."
                      className="form-input"
                      style={{ flex: 1 }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                    />
                    <button type="button" onClick={handleAddCategory} className="btn btn-secondary">
                      <Plus size={16} /> Añadir Categoría
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {formData.categories.map((c) => (
                      <span
                        key={c.id}
                        style={{
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <CategoryIcon iconName={c.icon} size={14} /> {c.name}
                        {formData.categories.length > 1 && (
                          <Trash2
                            size={13}
                            onClick={() => handleRemoveCategory(c.id)}
                            style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                          />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Formulario de Nuevo Plato */}
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} color="var(--primary)" /> Agregar Plato al Menú
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Nombre del Plato *</label>
                      <input
                        type="text"
                        value={newDishName}
                        onChange={(e) => handleDishNameChange(e.target.value)}
                        placeholder="Ej. Hamburguesa Doble Queso"
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Precio ({formData.currencySymbol}) *</label>
                      <input
                        type="text"
                        value={newDishPrice}
                        onChange={(e) => setNewDishPrice(formatCurrencyInput(e.target.value))}
                        placeholder="Ej. 24.000"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Categoría</label>
                      <select
                        value={newDishCatId}
                        onChange={(e) => setNewDishCatId(e.target.value)}
                        className="form-select"
                      >
                        {formData.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Foto del Plato</label>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input
                          type="text"
                          value={newDishImageUrl}
                          onChange={(e) => setNewDishImageUrl(e.target.value)}
                          placeholder="URL o subir foto..."
                          className="form-input"
                          style={{ flex: 1, fontSize: '0.8rem' }}
                        />
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <Upload size={13} />
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleUploadFile(e, 'dishes', setNewDishImageUrl)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={handleAddDish} className="btn btn-primary btn-full">
                    <Plus size={16} /> Agregar Plato
                  </button>
                </div>

                {/* Lista de Platos Configurados */}
                {formData.dishes.length > 0 && (
                  <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                      Platos Agregados ({formData.dishes.length}):
                    </div>
                    {formData.dishes.map((dish) => {
                      const cat = formData.categories.find((c) => c.id === dish.categoryId);
                      return (
                        <div
                          key={dish.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.85rem',
                            background: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-surface-elevated)' }}>
                              <img src={dish.imageUrl} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{dish.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {cat?.name} • <strong style={{ color: 'var(--primary)' }}>{formData.currencySymbol} {dish.price.toLocaleString('es-CO')}</strong>
                              </div>
                            </div>
                          </div>

                          <Trash2 size={15} onClick={() => handleRemoveDish(dish.id)} style={{ cursor: 'pointer', color: 'var(--danger)' }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PASO 5: RESUMEN Y ACTIVACIÓN */}
            {step === 5 && (
              <div>
                <h2 className="step-title">Paso 5: Resumen y Activación</h2>
                <p className="step-desc">Tu menú está listo para activarse. Toda la configuración de pagos y QRs podrás finalizarla desde el panel de control.</p>

                <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: formData.palette?.gradient || formData.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <UtensilsCrossed size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>{formData.name || 'Mi Restaurante'}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>/m/{formData.slug}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div><strong>WhatsApp:</strong> {formData.whatsappCountryCode} {formData.whatsappNumber}</div>
                    <div><strong>Moneda:</strong> {formData.currencySymbol} ({formData.currencyCode})</div>
                    <div><strong>Paleta:</strong> {formData.palette?.name || 'Personalizada'}</div>
                    <div><strong>Categorías:</strong> {formData.categories.length}</div>
                    <div><strong>Platos creados:</strong> {formData.dishes.length}</div>
                    <div><strong>Ubicación:</strong> {formData.address || 'Configurada'}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', margin: 0 }}>
                    <CheckCircle2 size={18} />
                    <span>¡Todo listo! Al completar desbloquearás el checklist interactivo para activar tus métodos de pago (Bre-B/QR) y generar tus códigos QR.</span>
                  </p>
                </div>
              </div>
            )}

            {/* BOTONES DE NAVEGACIÓN */}
            <div className="step-actions">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => goToStep(step - 1)}
                  className="btn btn-secondary"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
              ) : <div />}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => goToStep(step + 1)}
                  disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                  className="btn btn-primary"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="btn btn-primary btn-lg"
                  style={{ minWidth: '160px', fontWeight: 700 }}
                >
                  Completar
                </button>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guía visual del step sticky on scroll (solo íconos) */}
      {showStickyStepper && (
        <div className="sticky-bottom-stepper-bar">
          <div className="sticky-stepper-track-container">
            <div className="sticky-stepper-line-track">
              <div
                className="sticky-stepper-line-progress"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
            {[
              { num: 1, label: 'Identidad', icon: Store },
              { num: 2, label: 'Contacto & Redes', icon: MessageCircle },
              { num: 3, label: 'Ubicación', icon: MapPin },
              { num: 4, label: 'Menú', icon: UtensilsCrossed },
              { num: 5, label: 'Activar', icon: Check }
            ].map((item) => {
              const isActive = step === item.num;
              const isDone = step > item.num;
              const Icon = item.icon;
              const isDisabled =
                (item.num > 1 && !canProceedStep1) ||
                (item.num > 2 && !canProceedStep2);
              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => !isDisabled && goToStep(item.num)}
                  disabled={isDisabled}
                  title={item.label}
                  className={`sticky-step-icon-btn ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                >
                  {isDone ? <Check size={16} /> : <Icon size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
