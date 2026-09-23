/**
 * Formatea un valor numérico o string borrando ceros a la izquierda y aplicando separador de millares (ej. 325400 -> "325.400")
 */
export function formatCurrencyInput(rawInput: string | number): string {
  if (rawInput === undefined || rawInput === null || rawInput === '') return '';
  
  // Extraer únicamente dígitos
  const digitsOnly = String(rawInput).replace(/[^\d]/g, '');
  if (!digitsOnly) return '';

  // Quitar ceros a la izquierda (evita que empiece en 0 salvo que sea solo "0")
  const cleanDigits = digitsOnly.replace(/^0+/, '');
  if (!cleanDigits) return '';

  const num = parseInt(cleanDigits, 10);
  if (isNaN(num)) return '';

  return num.toLocaleString('es-CO');
}

/**
 * Convierte un string formateado (ej. "325.400") a número puro (ej. 325400)
 */
export function parseCurrencyInput(formattedInput: string): number {
  if (!formattedInput) return 0;
  const digitsOnly = String(formattedInput).replace(/[^\d]/g, '');
  if (!digitsOnly) return 0;
  return parseInt(digitsOnly, 10) || 0;
}
