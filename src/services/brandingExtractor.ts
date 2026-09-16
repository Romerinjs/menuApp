import { ColorPalette, SocialLinks } from '../types/restaurant';
import { generateHarmoniousPalette, PRESET_PALETTES } from './colorPalettes';

export interface ExtractedBranding {
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  palette: ColorPalette;
  socialLinks?: SocialLinks;
  extractedFromUrl: string;
}

/**
 * Extrae metadatos de branding (nombre, logo, colores, redes y descripción)
 * desde una URL web o perfil de red social utilizando Microlink OpenGraph API.
 */
export async function extractBrandingFromUrl(rawUrl: string): Promise<ExtractedBranding> {
  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  // Detectar perfiles de redes sociales
  const socialLinks: SocialLinks = {};
  let detectedNameFromSocial = '';

  const lower = url.toLowerCase();
  if (lower.includes('instagram.com/')) {
    const handle = url.split('instagram.com/')[1]?.split(/[/?#]/)[0];
    if (handle) {
      socialLinks.instagram = `https://instagram.com/${handle}`;
      detectedNameFromSocial = cleanHandleToName(handle);
    }
  } else if (lower.includes('tiktok.com/@')) {
    const handle = url.split('tiktok.com/@')[1]?.split(/[/?#]/)[0];
    if (handle) {
      socialLinks.tiktok = `https://tiktok.com/@${handle}`;
      detectedNameFromSocial = cleanHandleToName(handle);
    }
  } else if (lower.includes('facebook.com/')) {
    const handle = url.split('facebook.com/')[1]?.split(/[/?#]/)[0];
    if (handle) {
      socialLinks.facebook = `https://facebook.com/${handle}`;
      detectedNameFromSocial = cleanHandleToName(handle);
    }
  } else if (lower.includes('twitter.com/') || lower.includes('x.com/')) {
    const handle = (url.split('twitter.com/')[1] || url.split('x.com/')[1])?.split(/[/?#]/)[0];
    if (handle) {
      socialLinks.twitter = `https://x.com/${handle}`;
      detectedNameFromSocial = cleanHandleToName(handle);
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s timeout

    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true`;
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      const data = json.data || {};

      const rawTitle = data.title || detectedNameFromSocial || extractDomainName(url);
      const cleanName = sanitizeBrandTitle(rawTitle);
      const description = data.description || '';
      const logoUrl = data.logo?.url || data.icon?.url || '';
      const coverUrl = data.image?.url || '';

      // Extracción de color dominante o paleta
      let dominantHex = data.color;
      if (!dominantHex && data.palette && Array.isArray(data.palette) && data.palette.length > 0) {
        dominantHex = data.palette[0];
      }

      let palette: ColorPalette;
      if (dominantHex && dominantHex.startsWith('#')) {
        palette = generateHarmoniousPalette(dominantHex, `Branding ${cleanName}`);
      } else {
        // Asignar una de las paletas modernas según hash del nombre
        const index = Math.abs(hashCode(cleanName)) % PRESET_PALETTES.length;
        palette = PRESET_PALETTES[index];
      }

      return {
        name: cleanName,
        tagline: description ? description.slice(0, 90) : undefined,
        description,
        logoUrl,
        coverUrl,
        palette,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        extractedFromUrl: url
      };
    }
  } catch {
    console.info('[Branding Extractor] Fallback heurístico local por timeout o conectividad.');
  }

  // Fallback Heurístico si la API externa no responde
  const fallbackName = detectedNameFromSocial || extractDomainName(url);
  const paletteIndex = Math.abs(hashCode(fallbackName)) % PRESET_PALETTES.length;
  const fallbackPalette = PRESET_PALETTES[paletteIndex];

  return {
    name: fallbackName,
    tagline: `Gastronomía & Experiencia 100% de Calidad`,
    description: `Bienvenidos a ${fallbackName}. Disfruta de nuestra carta y haz tu pedido en minutos.`,
    logoUrl: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`,
    palette: fallbackPalette,
    socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
    extractedFromUrl: url
  };
}

function cleanHandleToName(handle: string): string {
  return handle
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function extractDomainName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const main = host.split('.')[0] || 'Mi Negocio';
    return main.charAt(0).toUpperCase() + main.slice(1);
  } catch {
    return 'Mi Restaurante';
  }
}

function sanitizeBrandTitle(title: string): string {
  // Limpiar sufijos comunes como "| Instagram", "- Home", etc.
  return title
    .split(/[|•–—\-:]/)[0]
    .trim()
    .slice(0, 45);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
