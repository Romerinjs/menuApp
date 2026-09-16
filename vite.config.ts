import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

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
  plugins: [react(), geminiApiPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
