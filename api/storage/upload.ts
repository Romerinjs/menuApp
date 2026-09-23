import crypto from 'crypto';

function hmac(key: any, str: string | Buffer): Buffer {
  return crypto.createHmac('sha256', key).update(str).digest();
}

function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
  const kDate = hmac('AWS4' + key, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  const kSigning = hmac(kService, 'aws4_request');
  return kSigning;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const { fileBase64, tenantSlug, folder, fileName, contentType } = req.body || {};

  if (!fileBase64) {
    return res.status(400).json({ error: 'fileBase64 es requerido.' });
  }

  const accountId = process.env.R2_ACCOUNT_ID || process.env.VITE_R2_ACCOUNT_ID || 'ff25a9d134cc376992ccf2df546fde87';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.VITE_R2_ACCESS_KEY_ID || '04399e364f2042b5340b7f9a5f81dffa';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.VITE_R2_SECRET_ACCESS_KEY || 'de8051a1e4547096c58e14efa7d32e556103e80aeaeb53ecd4338679f3f04892';
  const bucketName = process.env.R2_BUCKET_NAME || process.env.VITE_R2_BUCKET_NAME || 'menuapp';
  const publicUrlBase = process.env.R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL || 'https://pub-cb1a418f73b9409581db1329f8f1a090.r2.dev';

  if (!accessKeyId || !secretAccessKey || !accountId) {
    console.error('[Cloudflare R2 API] Faltan credenciales de Cloudflare R2 en las variables de entorno.');
    return res.status(500).json({ error: 'Faltan credenciales de Cloudflare R2 en el entorno del servidor.' });
  }

  try {
    const rawData = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
    const fileBuffer = Buffer.from(rawData, 'base64');

    const safeSlug = (tenantSlug || 'general').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const safeFolder = (folder || 'dishes').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const timestamp = Date.now();
    const cleanFileName = (fileName || 'asset.png').toLowerCase().replace(/[^a-z0-9._-]/g, '-');
    const isolatedPath = `tenants/${safeSlug}/${safeFolder}/${timestamp}-${cleanFileName}`;
    const s3Path = `/${bucketName}/${isolatedPath}`;

    const host = `${accountId}.r2.cloudflarestorage.com`;
    const region = 'auto';
    const service = 's3';
    const mimeType = contentType || 'application/octet-stream';

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const canonicalHeaders = `content-length:${fileBuffer.length}\ncontent-type:${mimeType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-length;content-type;host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `PUT\n${s3Path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    console.log(`[Cloudflare R2] Subiendo archivo a R2: ${isolatedPath} (${fileBuffer.length} bytes)...`);

    const r2Response = await fetch(`https://${host}${s3Path}`, {
      method: 'PUT',
      headers: {
        'host': host,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        'Authorization': authorizationHeader,
        'Content-Type': mimeType,
        'Content-Length': String(fileBuffer.length)
      },
      body: fileBuffer
    });

    if (!r2Response.ok) {
      const errText = await r2Response.text();
      console.error(`[Cloudflare R2] ❌ Error en subida R2 (${r2Response.status}):`, errText);
      return res.status(502).json({
        error: `Cloudflare R2 devolvió status ${r2Response.status}`,
        details: errText
      });
    }

    const finalPublicUrl = `${publicUrlBase.replace(/\/$/, '')}/${isolatedPath}`;
    console.log(`[Cloudflare R2] ✅ Subida exitosa a Cloudflare R2: ${finalPublicUrl}`);

    return res.status(200).json({
      success: true,
      url: finalPublicUrl,
      path: isolatedPath,
      storageType: 'r2'
    });
  } catch (error: any) {
    console.error('[Cloudflare R2] Error inesperado en el servidor al subir archivo:', error);
    return res.status(500).json({
      error: error?.message || 'Error interno al procesar y subir archivo a Cloudflare R2.'
    });
  }
}
