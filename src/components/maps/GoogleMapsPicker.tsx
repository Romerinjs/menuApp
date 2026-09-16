import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import { loadGoogleMapsScript, generateGoogleMapsUrl } from '../../services/maps';
import { LocationCoordinates } from '../../types/restaurant';

interface GoogleMapsPickerProps {
  initialAddress?: string;
  initialCoords?: LocationCoordinates;
  placeholder?: string;
  onLocationSelected: (data: {
    address: string;
    coords?: LocationCoordinates;
    mapsUrl?: string;
  }) => void;
}

export const GoogleMapsPicker: React.FC<GoogleMapsPickerProps> = ({
  initialAddress = '',
  initialCoords,
  placeholder = 'Escribe tu dirección o busca un lugar...',
  onLocationSelected
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [address, setAddress] = useState(initialAddress);
  const [coords, setCoords] = useState<LocationCoordinates | undefined>(initialCoords);
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    setAddress(initialAddress);
  }, [initialAddress]);

  useEffect(() => {
    let autocompleteInstance: any = null;

    loadGoogleMapsScript()
      .then(() => {
        setIsMapsLoaded(true);
        if (inputRef.current && (window as any).google?.maps?.places?.Autocomplete) {
          autocompleteInstance = new (window as any).google.maps.places.Autocomplete(
            inputRef.current,
            {
              fields: ['formatted_address', 'geometry', 'name']
            }
          );

          autocompleteInstance.addListener('place_changed', () => {
            const place = autocompleteInstance.getPlace();
            if (!place || !place.geometry) {
              // Si no tiene geometría, usamos el texto escrito
              const customAddress = inputRef.current?.value || '';
              setAddress(customAddress);
              onLocationSelected({
                address: customAddress,
                mapsUrl: generateGoogleMapsUrl(undefined, undefined, customAddress)
              });
              return;
            }

            const selectedAddress = place.formatted_address || place.name || '';
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const newCoords = { lat, lng };
            const mapsUrl = generateGoogleMapsUrl(lat, lng);

            setAddress(selectedAddress);
            setCoords(newCoords);
            onLocationSelected({
              address: selectedAddress,
              coords: newCoords,
              mapsUrl
            });
          });
        }
      })
      .catch((err) => {
        console.warn('Google Maps no pudo cargarse, operando en modo fallback manual:', err);
      });

    return () => {
      if (autocompleteInstance && (window as any).google?.maps?.event?.clearInstanceListeners) {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, []);

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddress(val);
    onLocationSelected({
      address: val,
      coords,
      mapsUrl: coords ? generateGoogleMapsUrl(coords.lat, coords.lng) : generateGoogleMapsUrl(undefined, undefined, val)
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización');
      return;
    }

    setIsGeolocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newCoords = { lat, lng };
        const mapsUrl = generateGoogleMapsUrl(lat, lng);

        // Si Google Maps Geocoder está disponible, obtener dirección legible
        if ((window as any).google?.maps?.Geocoder) {
          const geocoder = new (window as any).google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            setIsGeolocating(false);
            if (status === 'OK' && results && results[0]) {
              const formatted = results[0].formatted_address;
              setAddress(formatted);
              setCoords(newCoords);
              onLocationSelected({ address: formatted, coords: newCoords, mapsUrl });
            } else {
              const fallbackText = `Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
              setAddress(fallbackText);
              setCoords(newCoords);
              onLocationSelected({ address: fallbackText, coords: newCoords, mapsUrl });
            }
          });
        } else {
          setIsGeolocating(false);
          const fallbackText = `Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          setAddress(fallbackText);
          setCoords(newCoords);
          onLocationSelected({ address: fallbackText, coords: newCoords, mapsUrl });
        }
      },
      (err) => {
        setIsGeolocating(false);
        setGeoError('No se pudo acceder a tu ubicación GPS');
        console.warn('Error obteniendo geolocalización:', err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <MapPin
          size={18}
          style={{
            position: 'absolute',
            left: '12px',
            color: coords ? 'var(--primary)' : 'var(--text-muted)'
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={handleManualChange}
          placeholder={placeholder}
          className="form-input"
          style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }}
        />
        {coords && (
          <span title="Ubicación geolocalizada con Google Maps" style={{ position: 'absolute', right: '12px', display: 'flex', alignItems: 'center' }}>
            <CheckCircle2
              size={18}
              style={{ color: 'var(--success)' }}
            />
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGeolocating}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.7rem' }}
        >
          <Navigation size={14} className={isGeolocating ? 'spin' : ''} />
          {isGeolocating ? 'Detectando GPS...' : 'Usar mi ubicación GPS actual'}
        </button>

        {coords && (
          <a
            href={generateGoogleMapsUrl(coords.lat, coords.lng)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.78rem', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Ver en Google Maps ↗
          </a>
        )}
      </div>

      {geoError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--warning)', fontSize: '0.78rem' }}>
          <AlertCircle size={14} />
          {geoError}
        </div>
      )}
    </div>
  );
};
