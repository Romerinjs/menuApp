export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const { raw_text } = req.body || {};
  const rawText = raw_text?.trim();

  if (!rawText) {
    return res.status(400).json({ error: 'El campo raw_text es requerido y no puede estar vacío.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(401).json({
      error: 'No se encontró la variable GEMINI_API_KEY en el entorno del servidor.'
    });
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
        role: 'user',
        parts: [
          {
            text: `Potencia el siguiente contenido para este producto o servicio:\n\n"${rawText}"`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.6,
      response_mime_type: 'application/json'
    }
  };

  const candidateModels = [
    'gemini-3.6-flash',
    'gemini-flash-latest'
  ];

  try {
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
        lastError = fetchErr?.message || 'Error de red';
      }
    }

    if (!response) {
      return res.status(502).json({
        error: `Error al invocar la API de Gemini: ${lastError}`
      });
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      return res.status(502).json({ error: 'Respuesta vacía de Gemini.' });
    }

    let parsedResult;
    try {
      const cleanText = textContent.replace(/```json\s*|\s*```/g, '').trim();
      parsedResult = JSON.parse(cleanText);
    } catch {
      parsedResult = {
        descripcion: textContent,
        filosofia: '',
        tagline: ''
      };
    }

    return res.status(200).json({
      descripcion: (parsedResult.descripcion || '').slice(0, 180).trim(),
      filosofia: (parsedResult.filosofia || '').trim(),
      tagline: (parsedResult.tagline || '').trim()
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || 'Error interno al procesar la solicitud con Gemini.'
    });
  }
}
