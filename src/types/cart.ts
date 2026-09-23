import { Dish, LocationCoordinates } from './restaurant';

export interface CartItem {
  id: string; // único por ítem en carrito (para distinguir variaciones o notas)
  dish: Dish;
  quantity: number;
  notes?: string;
}

export type OrderModality = 'delivery' | 'pickup';

export interface OrderCheckoutData {
  customerName: string;
  modality: OrderModality;
  deliveryAddress?: string;
  deliveryCoords?: LocationCoordinates;
  deliveryMapsUrl?: string;
  generalNotes?: string;
  selectedPaymentMethod?: string;
  paymentVoucherUrl?: string;
  deliveryFee?: number;
  total?: number;
}

export interface CartTotals {
  subtotal: number;
  itemsCount: number;
}
