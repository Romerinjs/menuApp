import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Category, Dish, Restaurant } from '../types/restaurant';
import { tenantRepository } from '../services/storage';

interface TenantContextType {
  restaurants: Restaurant[];
  activeRestaurant: Restaurant | null;
  isLoading: boolean;
  refreshRestaurants: () => Promise<void>;
  setActiveRestaurant: (restaurant: Restaurant | null) => void;
  loadRestaurantBySlug: (slug: string) => Promise<Restaurant | null>;
  saveRestaurant: (restaurant: Restaurant) => Promise<Restaurant>;
  deleteRestaurant: (id: string) => Promise<void>;
  completeOnboarding: (restaurantId: string) => Promise<Restaurant | null>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  saveDish: (dish: Dish) => Promise<void>;
  deleteDish: (dishId: string) => Promise<void>;
  toggleDishAvailability: (dishId: string) => Promise<void>;
  createBlankRestaurant: () => Restaurant;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshRestaurants = async () => {
    try {
      const list = await tenantRepository.getAllRestaurants();
      setRestaurants(list);
      // Si hay un restaurante activo, refrescar sus datos
      if (activeRestaurant) {
        const fresh = list.find((r) => r.id === activeRestaurant.id);
        if (fresh) setActiveRestaurant(fresh);
      }
    } catch (e) {
      console.error('Error cargando restaurantes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshRestaurants();
  }, []);

  const loadRestaurantBySlug = async (slug: string): Promise<Restaurant | null> => {
    setIsLoading(true);
    try {
      const found = await tenantRepository.getRestaurantBySlug(slug);
      if (found) {
        setActiveRestaurant(found);
      }
      return found;
    } finally {
      setIsLoading(false);
    }
  };

  const saveRestaurant = async (restaurant: Restaurant): Promise<Restaurant> => {
    const updated = await tenantRepository.saveRestaurant(restaurant);
    await refreshRestaurants();
    setActiveRestaurant(updated);
    return updated;
  };

  const deleteRestaurant = async (id: string) => {
    await tenantRepository.deleteRestaurant(id);
    if (activeRestaurant?.id === id) {
      setActiveRestaurant(null);
    }
    await refreshRestaurants();
  };

  const completeOnboarding = async (restaurantId: string): Promise<Restaurant | null> => {
    const rest = restaurants.find((r) => r.id === restaurantId) || activeRestaurant;
    if (!rest) return null;

    const updated: Restaurant = {
      ...rest,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString()
    };

    const saved = await saveRestaurant(updated);
    return saved;
  };

  const saveCategory = async (category: Category) => {
    if (!activeRestaurant) return;
    await tenantRepository.saveCategory(activeRestaurant.id, category);
    await refreshRestaurants();
  };

  const deleteCategory = async (categoryId: string) => {
    if (!activeRestaurant) return;
    await tenantRepository.deleteCategory(activeRestaurant.id, categoryId);
    await refreshRestaurants();
  };

  const saveDish = async (dish: Dish) => {
    if (!activeRestaurant) return;
    await tenantRepository.saveDish(activeRestaurant.id, dish);
    await refreshRestaurants();
  };

  const deleteDish = async (dishId: string) => {
    if (!activeRestaurant) return;
    await tenantRepository.deleteDish(activeRestaurant.id, dishId);
    await refreshRestaurants();
  };

  const toggleDishAvailability = async (dishId: string) => {
    if (!activeRestaurant) return;
    await tenantRepository.toggleDishAvailability(activeRestaurant.id, dishId);
    await refreshRestaurants();
  };

  const createBlankRestaurant = (): Restaurant => {
    const randomId = 'rest-' + Math.random().toString(36).substring(2, 9);
    return {
      id: randomId,
      slug: `mi-restaurante-${Math.floor(Math.random() * 900 + 100)}`,
      name: '',
      cuisineType: 'Comida Rápida',
      themeColor: '#FF5722',
      whatsappCountryCode: '+57',
      whatsappNumber: '',
      currencySymbol: '$',
      currencyCode: 'COP',
      modalities: {
        delivery: true,
        pickup: true,
        deliveryFeeEnabled: false,
        deliveryFee: 0
      },
      onboardingCompleted: false, // Inicia bloqueado hasta completar onboarding
      categories: [],
      dishes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  return (
    <TenantContext.Provider
      value={{
        restaurants,
        activeRestaurant,
        isLoading,
        refreshRestaurants,
        setActiveRestaurant,
        loadRestaurantBySlug,
        saveRestaurant,
        deleteRestaurant,
        completeOnboarding,
        saveCategory,
        deleteCategory,
        saveDish,
        deleteDish,
        toggleDishAvailability,
        createBlankRestaurant
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant debe usarse dentro de un TenantProvider');
  }
  return context;
}
