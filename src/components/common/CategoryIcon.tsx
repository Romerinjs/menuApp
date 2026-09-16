import React from 'react';
import {
  Utensils,
  Sandwich,
  Pizza,
  Salad,
  Beef,
  Fish,
  Soup,
  Coffee,
  CupSoda,
  Beer,
  Wine,
  Cake,
  IceCream,
  Cookie,
  Apple,
  Sparkles,
  Tag,
  Package,
  Layers
} from 'lucide-react';

export const CATEGORY_ICON_OPTIONS = [
  { id: 'utensils', label: 'Platos & Cubiertos', icon: Utensils },
  { id: 'sandwich', label: 'Hamburguesas / Sandwiches', icon: Sandwich },
  { id: 'pizza', label: 'Pizzas & Pastas', icon: Pizza },
  { id: 'beef', label: 'Carnes & Parrilla', icon: Beef },
  { id: 'salad', label: 'Ensaladas & Bowls', icon: Salad },
  { id: 'fish', label: 'Pescados & Mariscos', icon: Fish },
  { id: 'soup', label: 'Sopas & Cremas', icon: Soup },
  { id: 'cupsoda', label: 'Bebidas & Refrescos', icon: CupSoda },
  { id: 'coffee', label: 'Cafetería & Desayunos', icon: Coffee },
  { id: 'beer', label: 'Cervezas & Licores', icon: Beer },
  { id: 'wine', label: 'Vinos & Cocteles', icon: Wine },
  { id: 'cake', label: 'Postres & Dulces', icon: Cake },
  { id: 'icecream', label: 'Helados & Malteadas', icon: IceCream },
  { id: 'cookie', label: 'Snacks & Acompañamientos', icon: Cookie },
  { id: 'apple', label: 'Frutas & Saludable', icon: Apple },
  { id: 'sparkles', label: 'Especiales / Chef', icon: Sparkles },
  { id: 'tag', label: 'General / Otro', icon: Tag }
] as const;

export type CategoryIconId = typeof CATEGORY_ICON_OPTIONS[number]['id'];

// Mapa de retrocompatibilidad para datos existentes que contengan emojis
const EMOJI_TO_ICON_MAP: Record<string, CategoryIconId> = {
  '🍔': 'sandwich',
  '🍟': 'cookie',
  '🥤': 'cupsoda',
  '🍕': 'pizza',
  '🌮': 'sandwich',
  '🥗': 'salad',
  '🥩': 'beef',
  '🍣': 'fish',
  '🍰': 'cake',
  '🍺': 'beer',
  '☕': 'coffee',
  '✨': 'sparkles',
  '🍽️': 'utensils',
  '🍽': 'utensils',
  '📁': 'tag',
  '🏷️': 'tag',
  '🏷': 'tag'
};

const ICON_COMPONENTS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  utensils: Utensils,
  sandwich: Sandwich,
  pizza: Pizza,
  beef: Beef,
  salad: Salad,
  fish: Fish,
  soup: Soup,
  cupsoda: CupSoda,
  coffee: Coffee,
  beer: Beer,
  wine: Wine,
  cake: Cake,
  icecream: IceCream,
  cookie: Cookie,
  apple: Apple,
  sparkles: Sparkles,
  tag: Tag,
  package: Package,
  layers: Layers
};

interface CategoryIconProps {
  iconName?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  size = 16,
  className,
  style
}) => {
  if (!iconName) {
    return <Tag size={size} className={className} style={style} />;
  }

  // Si es un emoji antiguo almacenado en base de datos/localstorage, normalizar a id de icono
  const normalizedKey = EMOJI_TO_ICON_MAP[iconName] || iconName.toLowerCase();
  const IconComponent = ICON_COMPONENTS[normalizedKey] || Tag;

  return <IconComponent size={size} className={className} style={style} />;
};
