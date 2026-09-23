import { CartItem, OrderCheckoutData } from '../types/cart';
import { Restaurant } from '../types/restaurant';

/**
 * Formatea un valor monetario según la moneda del restaurante
 */
export function formatCurrency(amount: number, symbol: string = '$'): string {
  return `${symbol} ${amount.toLocaleString('es-CO')}`;
}

/**
 * Limpia el número de teléfono para que contenga solo dígitos (con prefijo de país si aplica)
 */
export function cleanPhoneNumber(countryCode: string, phone: string): string {
  const combined = `${countryCode}${phone}`;
  return combined.replace(/[^\d]/g, '');
}

/**
 * Construye el mensaje estructurado de WhatsApp garantizando codificación UTF-8 limpia
 * (evitando caracteres de reemplazo unicode) y calculando únicamente el SUBTOTAL.
 */
export function buildWhatsAppMessage(
  restaurant: Restaurant,
  items: CartItem[],
  checkout: OrderCheckoutData
): string {
  const subtotal = items.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const modalityLabel = checkout.modality === 'delivery' ? 'Domicilio' : 'Retiro en Local';
  const currency = restaurant.currencySymbol || '$';

  // Encabezado
  let message = `*NUEVO PEDIDO - ${restaurant.name.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Cliente:* ${checkout.customerName.trim()}\n`;
  message += `*Modalidad:* ${modalityLabel}\n`;

  // Ubicación si es a domicilio
  if (checkout.modality === 'delivery') {
    if (checkout.deliveryAddress) {
      message += `*Dirección:* ${checkout.deliveryAddress.trim()}\n`;
    }
    if (checkout.deliveryMapsUrl) {
      message += `*Ubicación Maps:* ${checkout.deliveryMapsUrl}\n`;
    }
  }

  // Notas del cliente
  if (checkout.generalNotes && checkout.generalNotes.trim() !== '') {
    message += `*Notas:* ${checkout.generalNotes.trim()}\n`;
  }

  // Método de pago
  if (checkout.selectedPaymentMethod) {
    message += `*Método de Pago:* ${checkout.selectedPaymentMethod}\n`;
    if (checkout.paymentVoucherUrl) {
      // Si es una URL pública válida (por ej. Cloudflare R2), imprimir el enlace directo
      if (checkout.paymentVoucherUrl.startsWith('http://') || checkout.paymentVoucherUrl.startsWith('https://')) {
        message += `*Comprobante de Pago:* ${checkout.paymentVoucherUrl}\n`;
      } else {
        message += `*Comprobante de Pago:* Adjuntado / Cargado\n`;
      }
    }
  }

  // Desglose de productos
  message += `\n*PRODUCTOS:*\n`;
  items.forEach((item) => {
    const itemTotal = item.dish.price * item.quantity;
    message += `• ${item.quantity}x *${item.dish.name}* (${formatCurrency(itemTotal, currency)})\n`;
    if (item.notes && item.notes.trim() !== '') {
      message += `   ↳ _Nota: ${item.notes.trim()}_\n`;
    }
  });

  // Cálculo de valores y domicilio
  const deliveryFee = checkout.deliveryFee || 0;
  const isDeliveryWithFee = checkout.modality === 'delivery' && deliveryFee > 0;
  const finalTotal = checkout.total !== undefined ? checkout.total : (subtotal + (checkout.modality === 'delivery' ? deliveryFee : 0));

  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  if (isDeliveryWithFee) {
    message += `*Subtotal Productos:* ${formatCurrency(subtotal, currency)}\n`;
    message += `*Costo de Domicilio:* ${formatCurrency(deliveryFee, currency)}\n`;
    message += `*TOTAL A PAGAR:* ${formatCurrency(finalTotal, currency)}\n`;
  } else {
    message += `*TOTAL A PAGAR:* ${formatCurrency(finalTotal, currency)}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `_(Cobro en físico / contra entrega)_\n`;
  message += `_Pedido realizado desde el Menú Virtual_`;

  return message;
}

/**
 * Genera el enlace universal de WhatsApp compatible con móviles y WhatsApp Web
 * con codificación URI UTF-8 completa.
 */
export function generateWhatsAppLink(
  restaurant: Restaurant,
  items: CartItem[],
  checkout: OrderCheckoutData
): string {
  const message = buildWhatsAppMessage(restaurant, items, checkout);
  const phone = cleanPhoneNumber(restaurant.whatsappCountryCode, restaurant.whatsappNumber);
  
  // encodeURIComponent codifica secuencias UTF-8 en formato %XX estándar RFC 3986
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedText}`;
}
