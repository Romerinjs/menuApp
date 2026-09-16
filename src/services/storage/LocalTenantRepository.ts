import { Category, Dish, Restaurant } from '../../types/restaurant';
import { ITenantRepository } from './ITenantRepository';
import { PRESET_PALETTES } from '../colorPalettes';

const STORAGE_KEY = 'menuapp_tenants_db_v1';

// Restaurante de demostración preconfigurado para probar de inmediato
const DEFAULT_PRESET_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-burger-01',
    slug: 'burger-artisan',
    name: 'Burger Artisan Club',
    cuisineType: 'Hamburguesas & Papas Rústicas',
    themeColor: '#FF5722',
    palette: PRESET_PALETTES[0],
    shortDescription: '🍔 Las mejores hamburguesas artesanales de carne 100% angus, panes brioche recién horneados y papas rústicas.',
    logoUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    whatsappCountryCode: '+57',
    whatsappNumber: '3104567890',
    currencySymbol: '$',
    currencyCode: 'COP',
    modalities: {
      delivery: true,
      pickup: true
    },
    tagline: 'Sabores Auténticos & Ingredientes 100% Seleccionados',
    story: 'En La Parrilla Urbana preparamos hamburguesas artesanales y cortes seleccionados con carne 100% Angus. Nuestra pasión es combinar técnicas tradicionales de ahumado a la parrilla con insumos frescos de origen local para entregarte una experiencia gastronómica inolvidable en cada bocado.',
    openingHours: 'Lun a Dom: 11:30 AM - 10:30 PM',
    address: 'Calle 85 # 14-20, Zona Rosa, Bogotá',
    locationCoords: {
      lat: 4.6685,
      lng: -74.0565
    },
    googleMapsUrl: 'https://www.google.com/maps?q=4.6685,-74.0565',
    onboardingCompleted: true,
    categories: [
      { id: 'cat-1', name: 'Hamburguesas Artesanales', icon: 'sandwich', order: 1 },
      { id: 'cat-2', name: 'Acompañamientos & Papas', icon: 'cookie', order: 2 },
      { id: 'cat-3', name: 'Bebidas & Malteadas', icon: 'cupsoda', order: 3 }
    ],
    dishes: [
      {
        id: 'dish-1',
        categoryId: 'cat-1',
        name: 'Monster Smoked Bacon',
        description: 'Doble carne angus 180g, tocineta ahumada crujiente, queso cheddar fundido, cebolla caramelizada y salsa de la casa en pan brioche.',
        price: 28900,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        isFeatured: true,
        isBestSeller: true,
        isAvailable: true,
        order: 1
      },
      {
        id: 'dish-2',
        categoryId: 'cat-1',
        name: 'Truffle & Mushroom Burger',
        description: 'Carne madurada 180g, hongos salteados al tomillo, queso suizo emmental, mayonesa trufada y rúgula fresca.',
        price: 29900,
        imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
        isFeatured: true,
        isBestSeller: false,
        isAvailable: true,
        order: 2
      },
      {
        id: 'dish-3',
        categoryId: 'cat-1',
        name: 'Classic Smash Burger',
        description: 'Carne smash 120g con costra caramelizada, doble queso americano, pepinillos dulces y salsa especial smash.',
        price: 21900,
        imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80',
        isFeatured: false,
        isBestSeller: true,
        isAvailable: true,
        order: 3
      },
      {
        id: 'dish-4',
        categoryId: 'cat-2',
        name: 'Papas Rústicas Trufadas',
        description: 'Papas cortadas a mano con piel, aceite de trufa blanca, queso parmesano rallado fino y romero.',
        price: 13500,
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
        isFeatured: false,
        isBestSeller: true,
        isAvailable: true,
        order: 1
      },
      {
        id: 'dish-5',
        categoryId: 'cat-2',
        name: 'Aros de Cebolla Crispy',
        description: 'Aros de cebolla morada rebosados con cerveza artesanal acompañados de salsa BBQ ahumada.',
        price: 11900,
        imageUrl: 'https://images.unsplash.com/photo-1639024471287-032f6673528b?w=600&auto=format&fit=crop&q=80',
        isFeatured: false,
        isBestSeller: false,
        isAvailable: false, // Plató agotado de ejemplo para probar bloqueo
        order: 2
      },
      {
        id: 'dish-6',
        categoryId: 'cat-3',
        name: 'Malteada Salted Caramel',
        description: 'Helado artesanal de vainilla bourbon, salsa de caramelo salado, crema chantilly y trozos de brownie.',
        price: 14500,
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
        isFeatured: true,
        isBestSeller: true,
        isAvailable: true,
        order: 1
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class LocalTenantRepository implements ITenantRepository {
  private getStorage(): Restaurant[] {
    if (typeof window === 'undefined') return DEFAULT_PRESET_RESTAURANTS;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESET_RESTAURANTS));
        return DEFAULT_PRESET_RESTAURANTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error leyendo LocalStorage:', e);
      return DEFAULT_PRESET_RESTAURANTS;
    }
  }

  private setStorage(restaurants: Restaurant[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
    } catch (e) {
      console.error('Error guardando en LocalStorage:', e);
    }
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return this.getStorage();
  }

  async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    const list = this.getStorage();
    const cleanSlug = slug.toLowerCase().trim();
    return list.find((r) => r.slug.toLowerCase().trim() === cleanSlug) || null;
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const list = this.getStorage();
    return list.find((r) => r.id === id) || null;
  }

  async saveRestaurant(restaurant: Restaurant): Promise<Restaurant> {
    const list = this.getStorage();
    const existingIndex = list.findIndex((r) => r.id === restaurant.id);
    const updated = { ...restaurant, updatedAt: new Date().toISOString() };

    if (existingIndex >= 0) {
      list[existingIndex] = updated;
    } else {
      list.push(updated);
    }

    this.setStorage(list);
    return updated;
  }

  async deleteRestaurant(id: string): Promise<void> {
    const list = this.getStorage().filter((r) => r.id !== id);
    this.setStorage(list);
  }

  async saveCategory(restaurantId: string, category: Category): Promise<Category> {
    const list = this.getStorage();
    const restIndex = list.findIndex((r) => r.id === restaurantId);
    if (restIndex === -1) throw new Error('Restaurante no encontrado');

    const rest = list[restIndex];
    const catIndex = rest.categories.findIndex((c) => c.id === category.id);
    
    if (catIndex >= 0) {
      rest.categories[catIndex] = category;
    } else {
      rest.categories.push(category);
    }

    rest.updatedAt = new Date().toISOString();
    list[restIndex] = rest;
    this.setStorage(list);
    return category;
  }

  async deleteCategory(restaurantId: string, categoryId: string): Promise<void> {
    const list = this.getStorage();
    const restIndex = list.findIndex((r) => r.id === restaurantId);
    if (restIndex === -1) return;

    const rest = list[restIndex];
    rest.categories = rest.categories.filter((c) => c.id !== categoryId);
    rest.dishes = rest.dishes.filter((d) => d.categoryId !== categoryId);
    rest.updatedAt = new Date().toISOString();

    list[restIndex] = rest;
    this.setStorage(list);
  }

  async saveDish(restaurantId: string, dish: Dish): Promise<Dish> {
    const list = this.getStorage();
    const restIndex = list.findIndex((r) => r.id === restaurantId);
    if (restIndex === -1) throw new Error('Restaurante no encontrado');

    const rest = list[restIndex];
    const dishIndex = rest.dishes.findIndex((d) => d.id === dish.id);

    if (dishIndex >= 0) {
      rest.dishes[dishIndex] = dish;
    } else {
      rest.dishes.push(dish);
    }

    rest.updatedAt = new Date().toISOString();
    list[restIndex] = rest;
    this.setStorage(list);
    return dish;
  }

  async deleteDish(restaurantId: string, dishId: string): Promise<void> {
    const list = this.getStorage();
    const restIndex = list.findIndex((r) => r.id === restaurantId);
    if (restIndex === -1) return;

    const rest = list[restIndex];
    rest.dishes = rest.dishes.filter((d) => d.id !== dishId);
    rest.updatedAt = new Date().toISOString();

    list[restIndex] = rest;
    this.setStorage(list);
  }

  async toggleDishAvailability(restaurantId: string, dishId: string): Promise<boolean> {
    const list = this.getStorage();
    const restIndex = list.findIndex((r) => r.id === restaurantId);
    if (restIndex === -1) return false;

    const rest = list[restIndex];
    const dish = rest.dishes.find((d) => d.id === dishId);
    if (!dish) return false;

    dish.isAvailable = !dish.isAvailable;
    rest.updatedAt = new Date().toISOString();
    list[restIndex] = rest;
    this.setStorage(list);
    return dish.isAvailable;
  }
}
