export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export interface Dish {
  id: string;
  slug?: string;         // Slug exclusivo del plato (ej: "burger-especial")
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isFeatured?: boolean;   // ⭐ Destacado del chef / portada / Recomendado
  isBestSeller?: boolean; // 🔥 Más vendido
  isAvailable: boolean;   // Activo o Agotado
  order?: number;
}

export interface DeliveryModalities {
  delivery: boolean; // 🛵 Domicilio
  pickup: boolean;   // 🥡 Retiro en local
}

// Métodos de Pago
export type PaymentType = 'cash' | 'transfer' | 'bre-b' | 'card' | 'other';

export interface PaymentMethod {
  id: string;
  type: PaymentType;
  name: string;             // ej: "Nequi", "Bancolombia", "Efectivo", "Bre-B"
  accountDetails?: string;  // ej: "Ahorros 123-456789-00 a nombre de..."
  qrImageUrl?: string;      // Base64 o URL del QR
  instructions?: string;    // ej: "Enviar comprobante al WhatsApp al finalizar"
  isActive: boolean;
}

export interface PaymentPluginConfig {
  enabled: boolean;         // Activar / desactivar plugin de pagos
  methods: PaymentMethod[];
}

// Redes Sociales
export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
  twitter?: string;
  website?: string;
  linkedin?: string;
  youtube?: string;
}

// Números de Teléfono con Etiqueta
export interface ContactPhone {
  id: string;
  countryCode: string;      // ej: "+57"
  number: string;           // ej: "3001234567"
  label: string;            // ej: "Pedidos WhatsApp", "Atención al Cliente", "Domicilios", "Reservas"
  isPrimaryWhatsApp: boolean;
}

// Paleta de Colores de 5 Colores
export interface ColorPalette {
  id: string;
  name: string;
  primary: string;          // 1. Color principal (botones/acentos primarios)
  secondary: string;        // 2. Color secundario (chips/subtítulos)
  accent: string;           // 3. Color destacado (badges/estrellas)
  backgroundDark?: string;  // 4. Color de Fondo General del Menú
  surfaceDark?: string;     // 5. Color de Superficie (tarjetas y contenedores)
  gradient?: string;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  cuisineType: string;
  themeColor: string;
  logoUrl?: string;
  coverUrl?: string;
  
  // WhatsApp & Contacto principal
  whatsappCountryCode: string; // ej: "+57", "+52"
  whatsappNumber: string;      // ej: "3001234567"
  
  // Múltiples teléfonos con etiquetas
  contactPhones?: ContactPhone[];

  // Redes Sociales
  socialLinks?: SocialLinks;

  // Moneda
  currencySymbol: string;      // ej: "$", "€"
  currencyCode: string;        // ej: "COP", "MXN", "USD"

  // Modalidades de entrega
  modalities: DeliveryModalities;

  // Eslogan, Historia, Filosofía & Descripción Corta
  tagline?: string;            // ej: "Máxima Frescura 100% Artesanal"
  shortDescription?: string;   // Descripción breve para feed (IA)
  story?: string;              // Filosofía y propuesta de valor del restaurante
  openingHours?: string;       // ej: "Lun - Dom: 11:30 AM - 10:00 PM"
  instagramUrl?: string;       // Enlace opcional a Instagram / Redes

  // Paleta de Colores
  palette?: ColorPalette;

  // Métodos de Pago (Plugin)
  paymentConfig?: PaymentPluginConfig;

  // Ubicación física Google Maps
  address?: string;
  locationCoords?: LocationCoordinates;
  googleMapsUrl?: string;

  // Regla clave: Si el onboarding no está completado, el panel está restringido
  onboardingCompleted: boolean;

  // Catálogo
  categories: Category[];
  dishes: Dish[];

  createdAt: string;
  updatedAt: string;
}
