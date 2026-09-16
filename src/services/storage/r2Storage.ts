/**
 * Servicio de Almacenamiento Cloudflare R2 / S3 con aislamiento Multi-Tenant.
 * Estructura de carpetas por tenant para evitar fugas de datos entre restaurantes:
 * tenants/{tenantSlug}/{folder}/{timestamp}-{cleanFileName}
 */

export type StorageFolder = 'logos' | 'covers' | 'dishes' | 'qrs' | 'receipts';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
  endpoint: string;
}

const getR2Config = (): R2Config => ({
  accountId: import.meta.env.VITE_R2_ACCOUNT_ID || '',
  accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID || '',
  secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY || '',
  bucketName: import.meta.env.VITE_R2_BUCKET_NAME || 'menuapp',
  publicUrl: import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-cb1a418f73b9409581db1329f8f1a090.r2.dev',
  endpoint: import.meta.env.VITE_S3_API_ENDPOINT || ''
});

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
 * Si no hay conectividad directa o hay restricción CORS en S3 en el navegador,
 * realiza fallback automático a DataURL Base64 de alta disponibilidad.
 */
export async function uploadTenantAsset(
  file: File | Blob,
  tenantSlug: string,
  folder: StorageFolder,
  customFileName?: string
): Promise<{ url: string; storageType: 'r2' | 'base64'; path: string }> {
  const config = getR2Config();
  const safeSlug = (tenantSlug || 'general').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  const timestamp = Date.now();
  const rawName = customFileName || (file instanceof File ? file.name : 'asset.png');
  const cleanName = rawName.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  const isolatedPath = `tenants/${safeSlug}/${folder}/${timestamp}-${cleanName}`;

  // Intentar subida directa si hay endpoint público o presigned configurado
  if (config.publicUrl && config.endpoint) {
    try {
      // Si el bucket o worker proxy tiene endpoint habilitado
      const targetUrl = `${config.endpoint}/${isolatedPath}`;
      const response = await fetch(targetUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });

      if (response.ok) {
        const publicFileUrl = `${config.publicUrl.replace(/\/$/, '')}/${isolatedPath}`;
        return {
          url: publicFileUrl,
          storageType: 'r2',
          path: isolatedPath
        };
      }
    } catch {
      // Fallback a Base64 si fetch directo es bloqueado por CORS sin proxy
      console.info('[R2 Storage] Fallback a almacenamiento local seguro.');
    }
  }

  // Fallback seguro a Base64
  const base64Url = await fileToBase64(file);
  return {
    url: base64Url,
    storageType: 'base64',
    path: isolatedPath
  };
}
