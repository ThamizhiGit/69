import { Restaurant, MenuItem, User, Order, CartItem, Location } from '../types';
import { 
  mockRestaurants, 
  mockMenuItems, 
  mockUser, 
  mockOrderHistory,
  promoCodes 
} from '../constants/mockData';
import { LocationService } from './locationService';

// Mock data service for managing temporary app data
class MockDataService {
  private restaurants: Restaurant[] = mockRestaurants;
  private user: User = mockUser;
  private orders: Order[] = [];
  private cart: CartItem[] = [];

  // Restaurant methods
  getRestaurants(): Restaurant[] {
    return this.restaurants;
  }

  getRestaurantById(id: string): Restaurant | undefined {
    return this.restaurants.find(restaurant => restaurant.id === id);
  }

  searchRestaurants(query: string): Restaurant[] {
    const lowercaseQuery = query.toLowerCase();
    return this.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(lowercaseQuery) ||
      restaurant.cuisine.some(cuisine => cuisine.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Menu methods
  getMenuItemsByRestaurant(restaurantId: string): MenuItem[] {
    // In a real app, this would filter by restaurant
    // For demo purposes, return all mock items
    return mockMenuItems;
  }

  getMenuItemById(id: string): MenuItem | undefined {
    return mockMenuItems.find(item => item.id === id);
  }

  // User methods
  getUser(): User {
    return this.user;
  }

  updateUser(userData: Partial<User>): User {
    this.user = { ...this.user, ...userData };
    return this.user;
  }

  // Cart methods
  getCart(): CartItem[] {
    return this.cart;
  }

  addToCart(item: CartItem): void {
    const existingItemIndex = this.cart.findIndex(
      cartItem => cartItem.menuItem.id === item.menuItem.id
    );

    if (existingItemIndex >= 0) {
      this.cart[existingItemIndex].quantity += item.quantity;
      this.cart[existingItemIndex].totalPrice += item.totalPrice;
    } else {
      this.cart.push(item);
    }
  }

  removeFromCart(itemId: string): void {
    this.cart = this.cart.filter(item => item.menuItem.id !== itemId);
  }

  updateCartItemQuantity(itemId: string, quantity: number): void {
    const itemIndex = this.cart.findIndex(item => item.menuItem.id === itemId);
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        this.cart[itemIndex].quantity = quantity;
        this.cart[itemIndex].totalPrice = this.cart[itemIndex].menuItem.price * quantity;
      }
    }
  }

  clearCart(): void {
    this.cart = [];
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + item.totalPrice, 0);
  }

  // Order methods
  getOrders(): Order[] {
    return this.orders;
  }

  createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Order {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.orders.push(newOrder);
    this.clearCart(); // Clear cart after order
    return newOrder;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find(order => order.id === id);
  }

  updateOrderStatus(orderId: string, status: Order['status']): Order | undefined {
    const orderIndex = this.orders.findIndex(order => order.id === orderId);
    if (orderIndex >= 0) {
      this.orders[orderIndex].status = status;
      return this.orders[orderIndex];
    }
    return undefined;
  }

  // Search and filter methods
  searchRestaurantsByCategory(category: string): Restaurant[] {
    if (category === 'all') return this.restaurants;
    return this.restaurants.filter(restaurant =>
      restaurant.cuisine.some(c => c.toLowerCase().includes(category.toLowerCase()))
    );
  }

  getRestaurantsByRating(minRating: number = 4.0): Restaurant[] {
    return this.restaurants.filter(restaurant => restaurant.rating >= minRating);
  }

  getOpenRestaurants(): Restaurant[] {
    return this.restaurants.filter(restaurant => restaurant.isOpen);
  }

  getFeaturedRestaurants(): Restaurant[] {
    return this.restaurants.slice(0, 3);
  }

  // Order tracking methods
  simulateOrderProgress(orderId: string): void {
    const order = this.getOrderById(orderId);
    if (!order) return;

    const statusProgression: Order['status'][] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = statusProgression.indexOf(order.status);
    
    if (currentIndex < statusProgression.length - 1) {
      setTimeout(() => {
        this.updateOrderStatus(orderId, statusProgression[currentIndex + 1]);
      }, 30000); // Progress every 30 seconds for demo
    }
  }

  // Recommendation methods
  getRecommendedRestaurants(userPreferences: string[]): Restaurant[] {
    return this.restaurants.filter(restaurant =>
      restaurant.cuisine.some(cuisine =>
        userPreferences.some(pref => 
          cuisine.toLowerCase().includes(pref.toLowerCase())
        )
      )
    ).slice(0, 5);
  }

  getPopularItems(): MenuItem[] {
    const allItems = this.restaurants.flatMap(restaurant => restaurant.menu);
    return allItems.slice(0, 6); // Return first 6 items as "popular"
  }

  // Promo code methods
  validatePromoCode(code: string, orderTotal: number): { valid: boolean; discount: number; message: string } {
    const promo = promoCodes.find(p => p.id === code && p.isActive);
    
    if (!promo) {
      return { valid: false, discount: 0, message: 'Invalid promo code' };
    }

    if (orderTotal < promo.minOrder) {
      return { 
        valid: false, 
        discount: 0, 
        message: `Minimum order of $${promo.minOrder.toFixed(2)} required` 
      };
    }

    const discount = promo.discount * orderTotal;
    return { 
      valid: true, 
      discount, 
      message: `${promo.title} applied! You saved $${discount.toFixed(2)}` 
    };
  }

  // Demo reset functionality
  resetData(): void {
    this.restaurants = [...mockRestaurants];
    this.user = { ...mockUser };
    this.orders = [...mockOrderHistory.slice(0, 2)]; // Keep delivered orders
    this.cart = [];
  }

  // Location-based methods
  getRestaurantsByLocation(userLocation: Location, maxRadius: number = 10): Restaurant[] {
    return LocationService.filterRestaurantsByLocation(
      this.restaurants,
      userLocation,
      maxRadius
    );
  }

  getNearbyRestaurants(userLocation: Location): Restaurant[] {
    return this.getRestaurantsByLocation(userLocation, 5); // 5km radius for "nearby"
  }

  getRestaurantsWithDeliveryInfo(userLocation: Location): Array<Restaurant & { deliveryInfo: any }> {
    return this.restaurants.map(restaurant => ({
      ...restaurant,
      deliveryInfo: LocationService.validateDeliveryRadius(
        userLocation,
        restaurant.location,
        10 // Default 10km radius
      )
    }));
  }

  // Demo data population
  populateDemoData(): void {
    this.restaurants = [...mockRestaurants];
    this.user = { ...mockUser };
    this.orders = [...mockOrderHistory];
    this.cart = [];
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();