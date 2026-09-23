/**
 * Servicio de Almacenamiento Cloudflare R2 con aislamiento Multi-Tenant.
 * Estructura de carpetas por tenant para evitar fugas de datos entre restaurantes:
 * tenants/{tenantSlug}/{folder}/{timestamp}-{cleanFileName}
 */

export type StorageFolder = 'logos' | 'covers' | 'dishes' | 'qrs' | 'receipts' | 'promo';

/**
 * Convierte un archivo local File en Base64 (DataURL) garantizado
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('No se pudo convertir el archivo a Base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Sube un archivo a Cloudflare R2 manteniendo aislamiento por Tenant Slug.
 * Envía la petición al endpoint de almacenamiento `/api/storage/upload`
 * que autentica con AWS SigV4 de forma segura y provee logs exhaustivos.
 */
export async function uploadTenantAsset(
  file: File | Blob,
  tenantSlug: string,
  folder: StorageFolder,
  customFileName?: string
): Promise<{ url: string; storageType: 'r2'; path: string }> {
  const safeSlug = (tenantSlug || 'general').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  const rawName = customFileName || (file instanceof File ? file.name : 'asset.png');
  const cleanName = rawName.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  const contentType = file.type || 'image/jpeg';

  console.group(`[Cloudflare R2] ⬆️ Subida de Asset: ${cleanName}`);
  console.log('Parámetros de subida:', {
    tenant: safeSlug,
    carpeta: folder,
    archivo: cleanName,
    tamañoBytes: file.size,
    tipoMime: contentType
  });

  try {
    const fileBase64 = await fileToBase64(file);

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileBase64,
        tenantSlug: safeSlug,
        folder,
        fileName: cleanName,
        contentType
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || `HTTP ${response.status}: Error al subir a Cloudflare R2`;
      console.error('[Cloudflare R2] ❌ Error del servidor:', errorData);
      console.groupEnd();
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('[Cloudflare R2] ✅ Subida exitosa a Cloudflare R2:', {
      url: result.url,
      path: result.path
    });
    console.groupEnd();

    return {
      url: result.url,
      storageType: 'r2',
      path: result.path
    };
  } catch (error: any) {
    console.error('[Cloudflare R2] ❌ Fallo al procesar la subida:', error?.message || error);
    console.groupEnd();
    throw error;
  }
}
