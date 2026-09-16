import { Category, Dish, Restaurant } from '../../types/restaurant';

export interface ITenantRepository {
  getAllRestaurants(): Promise<Restaurant[]>;
  getRestaurantBySlug(slug: string): Promise<Restaurant | null>;
  getRestaurantById(id: string): Promise<Restaurant | null>;
  saveRestaurant(restaurant: Restaurant): Promise<Restaurant>;
  deleteRestaurant(id: string): Promise<void>;

  // Categorías
  saveCategory(restaurantId: string, category: Category): Promise<Category>;
  deleteCategory(restaurantId: string, categoryId: string): Promise<void>;

  // Platos
  saveDish(restaurantId: string, dish: Dish): Promise<Dish>;
  deleteDish(restaurantId: string, dishId: string): Promise<void>;
  toggleDishAvailability(restaurantId: string, dishId: string): Promise<boolean>;
}
