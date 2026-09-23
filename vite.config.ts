import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import crypto from 'crypto';

function cloudflareR2Plugin(): Plugin {
  return {
    name: 'cloudflare-r2-upload-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/storage/upload') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');

            try {
              const parsedBody = JSON.parse(body || '{}');
              const { fileBase64, tenantSlug, folder, fileName, contentType } = parsedBody;

              if (!fileBase64) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'fileBase64 es requerido.' }));
                return;
              }

              const env = loadEnv('development', process.cwd(), '');
              const accountId = env.VITE_R2_ACCOUNT_ID || process.env.VITE_R2_ACCOUNT_ID || 'ff25a9d134cc376992ccf2df546fde87';
              const accessKeyId = env.VITE_R2_ACCESS_KEY_ID || process.env.VITE_R2_ACCESS_KEY_ID || '04399e364f2042b5340b7f9a5f81dffa';
              const secretAccessKey = env.VITE_R2_SECRET_ACCESS_KEY || process.env.VITE_R2_SECRET_ACCESS_KEY || 'de8051a1e4547096c58e14efa7d32e556103e80aeaeb53ecd4338679f3f04892';
              const bucketName = env.VITE_R2_BUCKET_NAME || process.env.VITE_R2_BUCKET_NAME || 'menuapp';
              const publicUrlBase = env.VITE_R2_PUBLIC_URL || process.env.VITE_R2_PUBLIC_URL || 'https://pub-cb1a418f73b9409581db1329f8f1a090.r2.dev';

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

              const hmac = (k: any, str: string | Buffer) => crypto.createHmac('sha256', k).update(str).digest();
              const kDate = hmac('AWS4' + secretAccessKey, dateStamp);
              const kRegion = hmac(kDate, region);
              const kService = hmac(kRegion, service);
              const signingKey = hmac(kService, 'aws4_request');
              const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

              const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

              console.log(`[Cloudflare R2 Dev] Subiendo archivo: ${isolatedPath} (${fileBuffer.length} bytes)...`);

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
                console.error(`[Cloudflare R2 Dev] ❌ Error de Cloudflare R2 (${r2Response.status}):`, errText);
                res.statusCode = 502;
                res.end(JSON.stringify({ error: `Cloudflare R2 devolvió status ${r2Response.status}`, details: errText }));
                return;
              }

              const finalPublicUrl = `${publicUrlBase.replace(/\/$/, '')}/${isolatedPath}`;
              console.log(`[Cloudflare R2 Dev] ✅ Subida exitosa a Cloudflare R2: ${finalPublicUrl}`);

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                url: finalPublicUrl,
                path: isolatedPath,
                storageType: 'r2'
              }));
            } catch (err: any) {
              console.error('[Cloudflare R2 Dev] ❌ Excepción al subir:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Error al procesar la subida a Cloudflare R2.' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/generate/enhance-brand') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');

            try {
              const parsedBody = JSON.parse(body || '{}');
              const rawText = parsedBody.raw_text?.trim();

              if (!rawText) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'El campo raw_text es requerido y no puede estar vacío.' }));
                return;
              }

              const env = loadEnv('development', process.cwd(), '');
              const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

              if (!apiKey) {
                res.statusCode = 401;
                res.end(JSON.stringify({
                  error: 'No se encontró la variable GEMINI_API_KEY en el entorno (.env).'
                }));
                return;
              }

              const geminiPayload = {
                system_instruction: {
                  parts: [
                    {
                      text: "Eres un director de branding y copywriter publicitario senior. Tu tarea es transformar la información o borrador del restaurante en contenido comercial de alto impacto. Debes responder OBLIGATORIAMENTE en un único objeto JSON válido con exactamente estos campos:\n1. 'descripcion': Descripción persuasiva y comercial para el feed y cabecera del menú. REGLA ESTRICTA: Debe tener como MÁXIMO 170 caracteres (para no sobrepasar el límite de 180 caracteres del feed).\n2. 'filosofia': Declaración de propósito, valores de marca y diferenciador clave (1-2 párrafos concisos, legibles y elegantes, sin saturar de texto).\n3. 'tagline': Título o eslogan llamativo y memorable (ejemplo: 'El sabor de lo que somos' o 'Pasión en cada bocado').\nNo incluyas bloques de código markdown (```json), responde texto JSON plano y directo."
                    }
                  ]
                },
                contents: [
                  {
                    "role": "user",
                    "parts": [
                      {
                        "text": `Potencia el siguiente contenido para este producto o servicio:\n\n"${rawText}"`
                      }
                    ]
                  }
                ],
                generationConfig: {
                  temperature: 0.6,
                  response_mime_type: "application/json"
                }
              };

              const candidateModels = [
                'gemini-3.6-flash',
                'gemini-flash-latest'
              ];

              let response: any = null;
              let lastError = '';

              for (const model of candidateModels) {
                try {
                  const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey
                      },
                      body: JSON.stringify(geminiPayload)
                    }
                  );

                  if (res.ok) {
                    response = res;
                    break;
                  } else {
                    const errData = await res.json().catch(() => ({}));
                    lastError = errData?.error?.message || `HTTP ${res.status}`;
                  }
                } catch (fetchErr: any) {
                  lastError = fetchErr?.message || 'Error de conexión';
                }
              }

              if (!response) {
                res.statusCode = 502;
                res.end(JSON.stringify({
                  error: `No se pudo obtener respuesta de los modelos Gemini: ${lastError}`
                }));
                return;
              }

              const data = await response.json();
              const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

              if (!textContent) {
                res.statusCode = 502;
                res.end(JSON.stringify({ error: 'Respuesta vacía o formato desconocido de Gemini.' }));
                return;
              }

              // Parsear JSON limpio devuelto por Gemini
              let parsedResult;
              try {
                // Eliminar posibles bloques de markdown si el modelo los incluyó
                const cleanText = textContent.replace(/```json\s*|\s*```/g, '').trim();
                parsedResult = JSON.parse(cleanText);
              } catch {
                parsedResult = {
                  descripcion: textContent,
                  filosofia: ''
                };
              }

              res.statusCode = 200;
              res.end(JSON.stringify({
                descripcion: (parsedResult.descripcion || '').slice(0, 180).trim(),
                filosofia: (parsedResult.filosofia || '').trim(),
                tagline: (parsedResult.tagline || '').trim()
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({
                error: err?.message || 'Error interno del servidor al procesar la solicitud de IA.'
              }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cloudflareR2Plugin(), geminiApiPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
