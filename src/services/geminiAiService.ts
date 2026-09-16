import { generateBrandPhilosophy, generateShortFeedDescription } from './aiBrandGenerator';

export interface BrandEnhanceResult {
  descripcion: string;
  filosofia: string;
  tagline?: string;
  source: 'gemini-api' | 'local-fallback';
  error?: string;
}

const SYSTEM_INSTRUCTION_TEXT = "Eres un director de branding y copywriter publicitario senior. Tu tarea es transformar la información o borrador del restaurante en contenido comercial de alto impacto. Debes responder OBLIGATORIAMENTE en un único objeto JSON válido con exactamente estos campos:\n1. 'descripcion': Descripción persuasiva y comercial para el feed y cabecera del menú. REGLA ESTRICTA: Debe tener como MÁXIMO 170 caracteres (para no sobrepasar el límite de 180 caracteres del feed).\n2. 'filosofia': Declaración de propósito, valores de marca y diferenciador clave (1-2 párrafos concisos, legibles y elegantes, sin saturar de texto).\n3. 'tagline': Título o eslogan llamativo y memorable (ejemplo: 'El sabor de lo que somos' o 'Pasión en cada bocado').\nNo incluyas bloques de código markdown (```json), responde texto JSON plano y directo.";

/**
 * Servicio de Inferencia de Marca y Descripciones con Google Gemini.
 * Llama al endpoint backend seguro `/api/generate/enhance-brand`.
 * Cuenta con fallback transparente al motor heurístico si no hay conexión o falta la clave.
 */
export async function enhanceBrandWithGemini(
  rawText: string,
  context?: { name?: string; cuisine?: string }
): Promise<BrandEnhanceResult> {
  const text = rawText.trim() || `${context?.name || 'Nuestro Restaurante'} - ${context?.cuisine || 'Cocina Artesanal'}`;

  // 1. Intentar llamar al endpoint backend /api/generate/enhance-brand
  try {
    const response = await fetch('/api/generate/enhance-brand', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw_text: text })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.descripcion || data.filosofia) {
        return {
          descripcion: (data.descripcion || '').slice(0, 180).trim(),
          filosofia: (data.filosofia || '').trim(),
          tagline: (data.tagline || '').trim(),
          source: 'gemini-api'
        };
      }
    }

    const errorJson = await response.json().catch(() => ({}));
    const backendError = errorJson.error || `HTTP ${response.status}`;
    console.warn(`[Gemini AI Backend]: ${backendError}. Usando fallback heurístico.`);
  } catch (backendFetchErr) {
    console.warn('[Gemini AI Backend Offline / Not Found]. Intentando fallback...');
  }

  // 2. Intentar llamada directa en cliente si existe VITE_GEMINI_API_KEY
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (clientKey && clientKey.trim() !== '') {
    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-flash-latest'
    ];

    for (const model of candidateModels) {
      try {
        const directResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': clientKey
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: SYSTEM_INSTRUCTION_TEXT }]
              },
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `Potencia el siguiente contenido para este producto o servicio:\n\n"${text}"`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.6,
                response_mime_type: 'application/json'
              }
            })
          }
        );

        if (directResponse.ok) {
          const data = await directResponse.json();
          const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textContent) {
            const clean = textContent.replace(/```json\s*|\s*```/g, '').trim();
            const parsed = JSON.parse(clean);
            return {
              descripcion: (parsed.descripcion || '').slice(0, 180).trim(),
              filosofia: (parsed.filosofia || '').trim(),
              tagline: (parsed.tagline || '').trim(),
              source: 'gemini-api'
            };
          }
        }
      } catch (clientDirectErr) {
        console.warn(`[Gemini Direct ${model} Error]:`, clientDirectErr);
      }
    }
  }

  // 3. Fallback Heurístico Local de Alta Calidad
  const name = context?.name || 'Nuestro Restaurante';
  const cuisine = context?.cuisine || 'Cocina Artesanal';

  const brandResult = generateBrandPhilosophy(name, cuisine, text);
  const shortDesc = generateShortFeedDescription(name, cuisine, text);

  return {
    descripcion: shortDesc.slice(0, 180).trim(),
    filosofia: brandResult.story.trim(),
    tagline: brandResult.tagline.trim(),
    source: 'local-fallback'
  };
}

/**
 * Genera únicamente la descripción corta para el feed (<= 180 caracteres garantizados)
 */
export async function generateInlineFeedDescription(
  currentText: string,
  context?: { name?: string; cuisine?: string }
): Promise<string> {
  const result = await enhanceBrandWithGemini(currentText, context);
  return result.descripcion.slice(0, 180).trim();
}

/**
 * Genera únicamente la historia y filosofía concisa
 */
export async function generateInlinePhilosophy(
  currentText: string,
  context?: { name?: string; cuisine?: string }
): Promise<{ story: string; tagline: string }> {
  const result = await enhanceBrandWithGemini(currentText, context);
  return {
    story: result.filosofia,
    tagline: result.tagline || `La Pasión detrás de ${context?.name || 'nuestro restaurante'}`
  };
}
