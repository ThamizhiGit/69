import { 
  mockRestaurants, 
  mockMenuItems, 
  mockUsers, 
  mockOrders,
  generateMockRestaurant,
  generateMockMenuItem,
  generateMockUser,
  generateMockOrder,
  resetMockData,
  getMockDataStats
} from '../../constants/mockData';
import { MockDataService } from '../../services/mockData';

describe('MockDataService', () => {
  beforeEach(() => {
    // Reset mock data before each test
    resetMockData();
  });

  describe('Restaurant Data', () => {
    it('should provide valid restaurant data', () => {
      const restaurants = MockDataService.getRestaurants();
      
      expect(Array.isArray(restaurants)).toBe(true);
      expect(restaurants.length).toBeGreaterThan(0);
      
      restaurants.forEach(restaurant => {
        expect(restaurant).toHaveProperty('id');
        expect(restaurant).toHaveProperty('name');
        expect(restaurant).toHaveProperty('description');
        expect(restaurant).toHaveProperty('image');
        expect(restaurant).toHaveProperty('rating');
        expect(restaurant).toHaveProperty('deliveryTime');
        expect(restaurant).toHaveProperty('deliveryFee');
        expect(restaurant).toHaveProperty('minimumOrder');
        expect(restaurant).toHaveProperty('cuisine');
        expect(restaurant).toHaveProperty('isOpen');
        expect(restaurant).toHaveProperty('location');
        expect(restaurant).toHaveProperty('menu');
        
        // Validate data types
        expect(typeof restaurant.id).toBe('string');
        expect(typeof restaurant.name).toBe('string');
        expect(typeof restaurant.rating).toBe('number');
        expect(typeof restaurant.deliveryFee).toBe('number');
        expect(typeof restaurant.isOpen).toBe('boolean');
        expect(Array.isArray(restaurant.cuisine)).toBe(true);
        expect(Array.isArray(restaurant.menu)).toBe(true);
        
        // Validate ranges
        expect(restaurant.rating).toBeGreaterThanOrEqual(1);
        expect(restaurant.rating).toBeLessThanOrEqual(5);
        expect(restaurant.deliveryFee).toBeGreaterThanOrEqual(0);
      });
    });

    it('should filter restaurants by cuisine', () => {
      const italianRestaurants = MockDataService.getRestaurantsByCuisine('italian');
      
      expect(Array.isArray(italianRestaurants)).toBe(true);
      italianRestaurants.forEach(restaurant => {
        expect(restaurant.cuisine).toContain('italian');
      });
    });

    it('should filter restaurants by rating', () => {
      const highRatedRestaurants = MockDataService.getRestaurantsByRating(4.0);
      
      expect(Array.isArray(highRatedRestaurants)).toBe(true);
      highRatedRestaurants.forEach(restaurant => {
        expect(restaurant.rating).toBeGreaterThanOrEqual(4.0);
      });
    });

    it('should get restaurant by id', () => {
      const restaurants = MockDataService.getRestaurants();
      const firstRestaurant = restaurants[0];
      
      const foundRestaurant = MockDataService.getRestaurantById(firstRestaurant.id);
      
      expect(foundRestaurant).toEqual(firstRestaurant);
    });

    it('should return null for non-existent restaurant id', () => {
      const foundRestaurant = MockDataService.getRestaurantById('non-existent-id');
      
      expect(foundRestaurant).toBeNull();
    });

    it('should search restaurants by name', () => {
      const searchResults = MockDataService.searchRestaurants('pizza');
      
      expect(Array.isArray(searchResults)).toBe(true);
      searchResults.forEach(restaurant => {
        const nameMatch = restaurant.name.toLowerCase().includes('pizza');
        const cuisineMatch = restaurant.cuisine.some(c => c.toLowerCase().includes('pizza'));
        const descriptionMatch = restaurant.description.toLowerCase().includes('pizza');
        
        expect(nameMatch || cuisineMatch || descriptionMatch).toBe(true);
      });
    });
  });

  describe('Menu Item Data', () => {
    it('should provide valid menu item data', () => {
      const menuItems = MockDataService.getMenuItems();
      
      expect(Array.isArray(menuItems)).toBe(true);
      expect(menuItems.length).toBeGreaterThan(0);
      
      menuItems.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('image');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('dietary');
        expect(item).toHaveProperty('customizations');
        expect(item).toHaveProperty('isAvailable');
        
        // Validate data types
        expect(typeof item.id).toBe('string');
        expect(typeof item.name).toBe('string');
        expect(typeof item.price).toBe('number');
        expect(typeof item.isAvailable).toBe('boolean');
        expect(Array.isArray(item.dietary)).toBe(true);
        expect(Array.isArray(item.customizations)).toBe(true);
        
        // Validate ranges
        expect(item.price).toBeGreaterThan(0);
      });
    });

    it('should get menu items by restaurant id', () => {
      const restaurants = MockDataService.getRestaurants();
      const firstRestaurant = restaurants[0];
      
      const menuItems = MockDataService.getMenuItemsByRestaurant(firstRestaurant.id);
      
      expect(Array.isArray(menuItems)).toBe(true);
      expect(menuItems).toEqual(firstRestaurant.menu);
    });

    it('should filter menu items by category', () => {
      const appetizers = MockDataService.getMenuItemsByCategory('appetizers');
      
      expect(Array.isArray(appetizers)).toBe(true);
      appetizers.forEach(item => {
        expect(item.category.toLowerCase()).toBe('appetizers');
      });
    });

    it('should filter menu items by dietary restrictions', () => {
      const vegetarianItems = MockDataService.getMenuItemsByDietary('vegetarian');
      
      expect(Array.isArray(vegetarianItems)).toBe(true);
      vegetarianItems.forEach(item => {
        expect(item.dietary).toContain('vegetarian');
      });
    });

    it('should get menu item by id', () => {
      const menuItems = MockDataService.getMenuItems();
      const firstItem = menuItems[0];
      
      const foundItem = MockDataService.getMenuItemById(firstItem.id);
      
      expect(foundItem).toEqual(firstItem);
    });
  });

  describe('User Data', () => {
    it('should provide valid user data', () => {
      const users = MockDataService.getUsers();
      
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      
      users.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('phone');
        expect(user).toHaveProperty('preferences');
        expect(user).toHaveProperty('addresses');
        expect(user).toHaveProperty('paymentMethods');
        
        // Validate data types
        expect(typeof user.id).toBe('string');
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(Array.isArray(user.addresses)).toBe(true);
        expect(Array.isArray(user.paymentMethods)).toBe(true);
        
        // Validate email format
        expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should get user by id', () => {
      const users = MockDataService.getUsers();
      const firstUser = users[0];
      
      const foundUser = MockDataService.getUserById(firstUser.id);
      
      expect(foundUser).toEqual(firstUser);
    });

    it('should create new user', () => {
      const newUserData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
      };
      
      const newUser = MockDataService.createUser(newUserData);
      
      expect(newUser).toHaveProperty('id');
      expect(newUser.name).toBe(newUserData.name);
      expect(newUser.email).toBe(newUserData.email);
      expect(newUser.phone).toBe(newUserData.phone);
      expect(Array.isArray(newUser.addresses)).toBe(true);
      expect(Array.isArray(newUser.paymentMethods)).toBe(true);
    });
  });

  describe('Order Data', () => {
    it('should provide valid order data', () => {
      const orders = MockDataService.getOrders();
      
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThan(0);
      
      orders.forEach(order => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('userId');
        expect(order).toHaveProperty('restaurantId');
        expect(order).toHaveProperty('items');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('totalAmount');
        expect(order).toHaveProperty('deliveryAddress');
        expect(order).toHaveProperty('estimatedDelivery');
        
        // Validate data types
        expect(typeof order.id).toBe('string');
        expect(typeof order.userId).toBe('string');
        expect(typeof order.restaurantId).toBe('string');
        expect(typeof order.totalAmount).toBe('number');
        expect(Array.isArray(order.items)).toBe(true);
        
        // Validate order status
        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
        expect(validStatuses).toContain(order.status);
        
        // Validate order total
        expect(order.totalAmount).toBeGreaterThan(0);
      });
    });

    it('should get orders by user id', () => {
      const users = MockDataService.getUsers();
      const firstUser = users[0];
      
      const userOrders = MockDataService.getOrdersByUserId(firstUser.id);
      
      expect(Array.isArray(userOrders)).toBe(true);
      userOrders.forEach(order => {
        expect(order.userId).toBe(firstUser.id);
      });
    });

    it('should create new order', () => {
      const users = MockDataService.getUsers();
      const restaurants = MockDataService.getRestaurants();
      const menuItems = MockDataService.getMenuItems();
      
      const orderData = {
        userId: users[0].id,
        restaurantId: restaurants[0].id,
        items: [{
          menuItem: menuItems[0],
          quantity: 2,
          customizations: {},
          totalPrice: menuItems[0].price * 2,
        }],
        deliveryAddress: users[0].addresses[0],
        paymentMethod: users[0].paymentMethods[0],
      };
      
      const newOrder = MockDataService.createOrder(orderData);
      
      expect(newOrder).toHaveProperty('id');
      expect(newOrder.userId).toBe(orderData.userId);
      expect(newOrder.restaurantId).toBe(orderData.restaurantId);
      expect(newOrder.status).toBe('pending');
      expect(newOrder.totalAmount).toBeGreaterThan(0);
    });

    it('should update order status', () => {
      const orders = MockDataService.getOrders();
      const firstOrder = orders[0];
      
      const updatedOrder = MockDataService.updateOrderStatus(firstOrder.id, 'confirmed');
      
      expect(updatedOrder?.status).toBe('confirmed');
    });
  });

  describe('Data Generation', () => {
    it('should generate valid restaurant data', () => {
      const restaurant = generateMockRestaurant();
      
      expect(restaurant).toHaveProperty('id');
      expect(restaurant).toHaveProperty('name');
      expect(restaurant).toHaveProperty('menu');
      expect(Array.isArray(restaurant.menu)).toBe(true);
      expect(restaurant.menu.length).toBeGreaterThan(0);
    });

    it('should generate valid menu item data', () => {
      const menuItem = generateMockMenuItem();
      
      expect(menuItem).toHaveProperty('id');
      expect(menuItem).toHaveProperty('name');
      expect(menuItem).toHaveProperty('price');
      expect(menuItem.price).toBeGreaterThan(0);
    });

    it('should generate valid user data', () => {
      const user = generateMockUser();
      
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should generate valid order data', () => {
      const order = generateMockOrder();
      
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('userId');
      expect(order).toHaveProperty('restaurantId');
      expect(order).toHaveProperty('items');
      expect(Array.isArray(order.items)).toBe(true);
    });
  });

  describe('Data Statistics', () => {
    it('should provide accurate data statistics', () => {
      const stats = getMockDataStats();
      
      expect(stats).toHaveProperty('restaurants');
      expect(stats).toHaveProperty('menuItems');
      expect(stats).toHaveProperty('users');
      expect(stats).toHaveProperty('orders');
      
      expect(typeof stats.restaurants).toBe('number');
      expect(typeof stats.menuItems).toBe('number');
      expect(typeof stats.users).toBe('number');
      expect(typeof stats.orders).toBe('number');
      
      expect(stats.restaurants).toBeGreaterThan(0);
      expect(stats.menuItems).toBeGreaterThan(0);
      expect(stats.users).toBeGreaterThan(0);
      expect(stats.orders).toBeGreaterThan(0);
    });
  });

  describe('Data Reset', () => {
    it('should reset data to initial state', () => {
      // Modify some data first
      MockDataService.createUser({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
      });
      
      const statsBeforeReset = getMockDataStats();
      
      // Reset data
      resetMockData();
      
      const statsAfterReset = getMockDataStats();
      
      // Stats should be back to original values
      expect(statsAfterReset.users).toBeLessThanOrEqual(statsBeforeReset.users);
    });
  });

  describe('Data Validation', () => {
    it('should validate restaurant data integrity', () => {
      const restaurants = MockDataService.getRestaurants();
      
      restaurants.forEach(restaurant => {
        // Check that all menu items have valid IDs
        restaurant.menu.forEach(item => {
          expect(typeof item.id).toBe('string');
          expect(item.id.length).toBeGreaterThan(0);
        });
        
        // Check location data
        expect(typeof restaurant.location.latitude).toBe('number');
        expect(typeof restaurant.location.longitude).toBe('number');
        expect(restaurant.location.latitude).toBeGreaterThanOrEqual(-90);
        expect(restaurant.location.latitude).toBeLessThanOrEqual(90);
        expect(restaurant.location.longitude).toBeGreaterThanOrEqual(-180);
        expect(restaurant.location.longitude).toBeLessThanOrEqual(180);
      });
    });

    it('should validate user data integrity', () => {
      const users = MockDataService.getUsers();
      
      users.forEach(user => {
        // Check addresses
        user.addresses.forEach(address => {
          expect(typeof address.latitude).toBe('number');
          expect(typeof address.longitude).toBe('number');
          expect(address.latitude).toBeGreaterThanOrEqual(-90);
          expect(address.latitude).toBeLessThanOrEqual(90);
        });
        
        // Check payment methods
        user.paymentMethods.forEach(payment => {
          expect(['credit', 'debit', 'paypal', 'apple_pay']).toContain(payment.type);
          if (payment.type === 'credit' || payment.type === 'debit') {
            expect(payment.last4).toMatch(/^\d{4}$/);
          }
        });
      });
    });

    it('should validate order data integrity', () => {
      const orders = MockDataService.getOrders();
      const restaurants = MockDataService.getRestaurants();
      const users = MockDataService.getUsers();
      
      orders.forEach(order => {
        // Check that referenced restaurant exists
        const restaurant = restaurants.find(r => r.id === order.restaurantId);
        expect(restaurant).toBeTruthy();
        
        // Check that referenced user exists
        const user = users.find(u => u.id === order.userId);
        expect(user).toBeTruthy();
        
        // Check order items
        order.items.forEach(item => {
          expect(item.quantity).toBeGreaterThan(0);
          expect(item.totalPrice).toBeGreaterThan(0);
          expect(item.totalPrice).toBe(item.menuItem.price * item.quantity);
        });
      });
    });
  });
});