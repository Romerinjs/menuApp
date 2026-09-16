// Servicio de integración asíncrona con Google Maps Places API

const GOOGLE_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyCRHp-_NcheZ_EAd6ZQ92dnminKf2gMJZQ';

let mapsPromise: Promise<void> | null = null;

export function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  // Si ya está cargado en el objeto global
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve();
  }

  if (mapsPromise) {
    return mapsPromise;
  }

  mapsPromise = new Promise((resolve, reject) => {
    // Si ya existe el tag de script
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&language=es`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = (err) => {
      console.error('Error al cargar Google Maps API:', err);
      reject(err);
    };

    document.head.appendChild(script);
  });

  return mapsPromise;
}

export function generateGoogleMapsUrl(lat?: number, lng?: number, addressQuery?: string): string {
  if (typeof lat === 'number' && typeof lng === 'number') {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  if (addressQuery) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`;
  }
  return '';
}
