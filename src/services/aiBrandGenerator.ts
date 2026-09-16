export interface AIBrandResult {
  tagline: string;
  story: string;
  highlights: string[];
}

/**
 * Motor de Razonamiento para la Generación de Marca y Filosofía.
 * Toma el nombre de la empresa, tipo de cocina e ideas/palabras clave
 * y genera una propuesta de valor coherente, vendedora y elegante.
 */
export function generateBrandPhilosophy(
  restaurantName: string,
  cuisineType: string,
  userKeywords?: string
): AIBrandResult {
  const name = restaurantName.trim() || 'Nuestro Restaurante';
  const cuisine = cuisineType.trim() || 'Gastronomía Artesanal';
  const rawInput = userKeywords?.trim().toLowerCase() || '';

  // Generación de Eslogan según categoría y palabras clave
  let tagline = `Máxima Frescura & Pasión por la ${cuisine}`;
  if (rawInput.includes('medellin') || rawInput.includes('bogota') || rawInput.includes('local')) {
    tagline = `Sabor 100% Local & Recetas de Autor`;
  } else if (rawInput.includes('saludable') || rawInput.includes('fresco') || rawInput.includes('fit')) {
    tagline = `Ingredientes 100% Frescos & Estilo de Vida Saludable`;
  } else if (rawInput.includes('parrilla') || rawInput.includes('angus') || rawInput.includes('carne')) {
    tagline = `Cortes Seleccionados & Ahumado Tradicional a la Leña`;
  } else if (rawInput.includes('pizza') || rawInput.includes('italiana') || rawInput.includes('pasta')) {
    tagline = `Trattoria Tradicional con Salsa de la Casa & Hornada Diaria`;
  } else if (rawInput.includes('postre') || rawInput.includes('dulce') || rawInput.includes('cafe')) {
    tagline = `Momentos Dulces & Cafetería de Especialidad`;
  }

  // Generación de Historia y Filosofía de Marca
  let story = `En ${name} nos dedicamos a elevar la experiencia de la ${cuisine.toLowerCase()}. Creemos en el valor de los ingredientes de origen seleccionado, la cocina hecha con paciencia y el servicio cercano. Cada plato que sale de nuestra cocina cuenta una historia de dedicación, sabor auténtico y pasión por la excelencia.`;

  if (rawInput.length > 5) {
    story = `Nacimos en ${name} con una visión clara: ${userKeywords}. Nos apasiona ofrecer una propuesta auténtica de ${cuisine.toLowerCase()}, combinando insumos frescos de alta calidad con técnicas preparadas al instante para llevar a tu mesa la máxima frescura y un sabor memorable.`;
  }

  const highlights = [
    'Ingredientes 100% Seleccionados',
    'Preparación Artesanal al Instante',
    'Pasión y Calidad Garantizada'
  ];

  return {
    tagline,
    story,
    highlights
  };
}

/**
 * Genera una descripción breve (120-160 caracteres) optimizada para el feed del cliente,
 * tarjetas de vista previa y cabecera del menú, potenciada por IA.
 */
export function generateShortFeedDescription(
  restaurantName: string,
  cuisineType: string,
  userKeywords?: string
): string {
  const name = restaurantName.trim() || 'Nuestro local';
  const cuisine = cuisineType.trim() || 'platos artesanales';
  const raw = userKeywords?.trim().toLowerCase() || '';

  if (raw.includes('hamburguesa') || raw.includes('burger')) {
    return `🍔 ${name}: Las mejores hamburguesas artesanales, panes recién horneados y combinaciones que te harán volver.`;
  }
  if (raw.includes('pizza') || raw.includes('italiana')) {
    return `🍕 ${name}: Masa madre crujiente, mozzarella fundida y recetas italianas que deleitan tu paladar en cada bocado.`;
  }
  if (raw.includes('parrilla') || raw.includes('carne') || raw.includes('asado')) {
    return `🥩 ${name}: Cortes jugosos asados al punto perfecto con el auténtico sabor y sazón a la brasa.`;
  }
  if (raw.includes('sushi') || raw.includes('mar') || raw.includes('ceviche')) {
    return `🍣 ${name}: Pesca fresca del día, técnica impecable y rollos de autor con sabor inigualable.`;
  }
  if (raw.includes('postre') || raw.includes('dulce') || raw.includes('cafe')) {
    return `☕ ${name}: Café de especialidad y repostería artesanal para endulzar cada uno de tus momentos especiales.`;
  }
  if (raw.includes('saludable') || raw.includes('fit') || raw.includes('bowl')) {
    return `🥗 ${name}: Bowls coloridos y recetas saludables preparadas con ingredientes 100% frescos y naturales.`;
  }

  const result = `✨ ${name}: Especialistas en ${cuisine.toLowerCase()} con ingredientes frescos, recetas de autor y entrega directa a tu mesa.`;
  return result.slice(0, 180).trim();
}

