import { Restaurant, MenuItem, User, Order, CartItem } from '../types';
import { mockDataService } from './mockData';

// Enhanced demo data service with comprehensive demo scenarios
class DemoDataService {
  private isInDemoMode: boolean = false;
  private demoScenarios: { [key: string]: any } = {};

  constructor() {
    this.initializeDemoScenarios();
  }

  // Initialize different demo scenarios
  private initializeDemoScenarios() {
    this.demoScenarios = {
      // New user scenario
      newUser: {
        user: {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          phone: '+1 (555) 000-0000',
          preferences: {
            dietary: [],
            cuisines: [],
            spiceLevel: 'medium'
          },
          addresses: [],
          paymentMethods: []
        },
        orders: [],
        cart: []
      },

      // Experienced user scenario
      experiencedUser: {
        user: {
          id: '1',
          name: 'Sarah Chen',
          email: 'sarah.chen@example.com',
          phone: '+1 (555) 123-4567',
          preferences: {
            dietary: ['Vegetarian', 'Gluten-Free'],
            cuisines: ['Italian', 'Japanese', 'Healthy', 'Mediterranean'],
            spiceLevel: 'mild'
          },
          addresses: [
            {
              id: '1',
              label: 'Home',
              street: '123 Market Street',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94102',
              latitude: 37.7749,
              longitude: -122.4194,
              isDefault: true
            },
            {
              id: '2',
              label: 'Work',
              street: '456 Business Ave',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94105',
              latitude: 37.7849,
              longitude: -122.4094,
              isDefault: false
            },
            {
              id: '3',
              label: 'Mom\'s House',
              street: '789 Family Lane',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94110',
              latitude: 37.7549,
              longitude: -122.4394,
              isDefault: false
            }
          ],
          paymentMethods: [
            {
              id: '1',
              type: 'credit',
              last4: '4242',
              expiryMonth: 12,
              expiryYear: 2025,
              cardholderName: 'Sarah Chen',
              isDefault: true
            },
            {
              id: '2',
              type: 'debit',
              last4: '1234',
              expiryMonth: 8,
              expiryYear: 2026,
              cardholderName: 'Sarah Chen',
              isDefault: false
            }
          ]
        },
        orders: this.generateComprehensiveOrderHistory(),
        cart: []
      },

      // Active order scenario
      activeOrder: {
        user: {
          id: '1',
          name: 'Mike Rodriguez',
          email: 'mike.rodriguez@example.com',
          phone: '+1 (555) 987-6543',
          preferences: {
            dietary: [],
            cuisines: ['Mexican', 'Italian', 'American'],
            spiceLevel: 'hot'
          },
          addresses: [
            {
              id: '1',
              label: 'Home',
              street: '321 Demo Street',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94103',
              latitude: 37.7649,
              longitude: -122.4294,
              isDefault: true
            }
          ],
          paymentMethods: [
            {
              id: '1',
              type: 'credit',
              last4: '5555',
              expiryMonth: 10,
              expiryYear: 2027,
              cardholderName: 'Mike Rodriguez',
              isDefault: true
            }
          ]
        },
        orders: this.generateActiveOrderScenario(),
        cart: []
      },

      // Cart with items scenario
      cartWithItems: {
        user: {
          id: '1',
          name: 'Emma Wilson',
          email: 'emma.wilson@example.com',
          phone: '+1 (555) 456-7890',
          preferences: {
            dietary: ['Vegan'],
            cuisines: ['Healthy', 'Mediterranean', 'Asian'],
            spiceLevel: 'medium'
          },
          addresses: [
            {
              id: '1',
              label: 'Apartment',
              street: '654 Green Avenue',
              city: 'San Francisco',
              state: 'CA',
              zipCode: '94107',
              latitude: 37.7449,
              longitude: -122.4494,
              isDefault: true
            }
          ],
          paymentMethods: [
            {
              id: '1',
              type: 'credit',
              last4: '9999',
              expiryMonth: 6,
              expiryYear: 2028,
              cardholderName: 'Emma Wilson',
              isDefault: true
            }
          ]
        },
        orders: [],
        cart: this.generateSampleCart()
      }
    };
  }

  // Generate comprehensive order history
  private generateComprehensiveOrderHistory(): Order[] {
    const now = new Date();
    const restaurants = mockDataService.getRestaurants();
    
    return [
      // Recent delivered order
      {
        id: 'demo-order-1',
        userId: '1',
        restaurantId: '1',
        items: [
          {
            menuItem: restaurants[0].menu[0], // Margherita Pizza
            quantity: 1,
            customizations: { size: 'large' },
            totalPrice: 24.99
          },
          {
            menuItem: restaurants[0].menu[2], // Tiramisu
            quantity: 1,
            customizations: {},
            totalPrice: 8.99
          }
        ],
        status: 'delivered',
        totalAmount: 36.97,
        deliveryAddress: {
          id: '1',
          label: 'Home',
          street: '123 Market Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          latitude: 37.7749,
          longitude: -122.4194,
          isDefault: true
        },
        estimatedDelivery: new Date(now.getTime() - 86400000), // Yesterday
        createdAt: new Date(now.getTime() - 90000000),
      },
      
      // Order from 3 days ago
      {
        id: 'demo-order-2',
        userId: '1',
        restaurantId: '2',
        items: [
          {
            menuItem: restaurants[1].menu[0], // Salmon Nigiri
            quantity: 3,
            customizations: {},
            totalPrice: 38.97
          },
          {
            menuItem: restaurants[1].menu[1], // Dragon Roll
            quantity: 1,
            customizations: {},
            totalPrice: 15.99
          },
          {
            menuItem: restaurants[1].menu[2], // Miso Soup
            quantity: 2,
            customizations: {},
            totalPrice: 9.98
          }
        ],
        status: 'delivered',
        totalAmount: 68.93,
        deliveryAddress: {
          id: '2',
          label: 'Work',
          street: '456 Business Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          latitude: 37.7849,
          longitude: -122.4094,
          isDefault: false
        },
        estimatedDelivery: new Date(now.getTime() - 259200000), // 3 days ago
        createdAt: new Date(now.getTime() - 262800000),
      },

      // Order from last week
      {
        id: 'demo-order-3',
        userId: '1',
        restaurantId: '3',
        items: [
          {
            menuItem: restaurants[2].menu[0], // Classic Cheeseburger
            quantity: 2,
            customizations: { doneness: 'medium', extras: 'bacon,avocado' },
            totalPrice: 33.98
          },
          {
            menuItem: restaurants[2].menu[1], // Truffle Fries
            quantity: 1,
            customizations: {},
            totalPrice: 9.99
          },
          {
            menuItem: restaurants[2].menu[2], // Chocolate Milkshake
            quantity: 2,
            customizations: {},
            totalPrice: 13.98
          }
        ],
        status: 'delivered',
        totalAmount: 59.94,
        deliveryAddress: {
          id: '1',
          label: 'Home',
          street: '123 Market Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          latitude: 37.7749,
          longitude: -122.4194,
          isDefault: true
        },
        estimatedDelivery: new Date(now.getTime() - 604800000), // 1 week ago
        createdAt: new Date(now.getTime() - 608400000),
      },

      // Older order
      {
        id: 'demo-order-4',
        userId: '1',
        restaurantId: '4',
        items: [
          {
            menuItem: restaurants[3].menu[0], // Mediterranean Bowl
            quantity: 1,
            customizations: {},
            totalPrice: 13.99
          }
        ],
        status: 'delivered',
        totalAmount: 16.48,
        deliveryAddress: {
          id: '3',
          label: 'Mom\'s House',
          street: '789 Family Lane',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94110',
          latitude: 37.7549,
          longitude: -122.4394,
          isDefault: false
        },
        estimatedDelivery: new Date(now.getTime() - 1209600000), // 2 weeks ago
        createdAt: new Date(now.getTime() - 1213200000),
      }
    ];
  }

  // Generate active order scenario
  private generateActiveOrderScenario(): Order[] {
    const now = new Date();
    const restaurants = mockDataService.getRestaurants();
    
    return [
      {
        id: 'demo-active-order',
        userId: '1',
        restaurantId: '1',
        items: [
          {
            menuItem: restaurants[0].menu[0], // Margherita Pizza
            quantity: 1,
            customizations: { size: 'medium' },
            totalPrice: 21.99
          },
          {
            menuItem: restaurants[0].menu[1], // Spaghetti Carbonara
            quantity: 1,
            customizations: {},
            totalPrice: 16.99
          }
        ],
        status: 'out_for_delivery',
        totalAmount: 41.97,
        deliveryAddress: {
          id: '1',
          label: 'Home',
          street: '321 Demo Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          latitude: 37.7649,
          longitude: -122.4294,
          isDefault: true
        },
        estimatedDelivery: new Date(now.getTime() + 900000), // 15 minutes from now
        createdAt: new Date(now.getTime() - 2700000), // 45 minutes ago
        driver: {
          id: 'demo-driver-1',
          name: 'Carlos Martinez',
          phone: '+1 (555) 111-2222',
          rating: 4.8,
          vehicle: {
            type: 'Toyota Prius',
            licensePlate: 'DEMO-123'
          },
          location: {
            latitude: 37.7679,
            longitude: -122.4264
          }
        }
      }
    ];
  }

  // Generate sample cart
  private generateSampleCart(): CartItem[] {
    const restaurants = mockDataService.getRestaurants();
    
    return [
      {
        menuItem: restaurants[3].menu[0], // Mediterranean Bowl
        quantity: 2,
        customizations: {},
        totalPrice: 27.98
      }
    ];
  }

  // Set demo mode
  setDemoMode(enabled: boolean) {
    this.isInDemoMode = enabled;
  }

  // Check if in demo mode
  isDemoMode(): boolean {
    return this.isInDemoMode;
  }

  // Load demo scenario
  loadDemoScenario(scenarioName: 'newUser' | 'experiencedUser' | 'activeOrder' | 'cartWithItems') {
    const scenario = this.demoScenarios[scenarioName];
    if (!scenario) {
      console.warn(`Demo scenario '${scenarioName}' not found`);
      return;
    }

    // Reset mock data service with scenario data
    mockDataService.resetData();
    
    // Apply scenario-specific data
    if (scenario.user) {
      mockDataService.updateUser(scenario.user);
    }
    
    if (scenario.orders) {
      scenario.orders.forEach((order: Order) => {
        mockDataService.createOrder(order);
      });
    }
    
    if (scenario.cart) {
      mockDataService.clearCart();
      scenario.cart.forEach((item: CartItem) => {
        mockDataService.addToCart(item);
      });
    }

    this.setDemoMode(true);
    console.log(`Demo scenario '${scenarioName}' loaded successfully`);
  }

  // Get available demo scenarios
  getAvailableScenarios() {
    return [
      {
        id: 'newUser',
        name: 'New User',
        description: 'Fresh user with no order history or saved addresses',
        icon: '👋'
      },
      {
        id: 'experiencedUser',
        name: 'Experienced User',
        description: 'User with extensive order history and preferences',
        icon: '⭐'
      },
      {
        id: 'activeOrder',
        name: 'Active Order',
        description: 'User with an order currently being delivered',
        icon: '🚚'
      },
      {
        id: 'cartWithItems',
        name: 'Cart with Items',
        description: 'User with items already in their cart',
        icon: '🛒'
      }
    ];
  }

  // Reset to default demo state
  resetToDefault() {
    mockDataService.resetData();
    this.setDemoMode(false);
    console.log('Demo data reset to default state');
  }

  // Get demo statistics
  getDemoStats() {
    const user = mockDataService.getUser();
    const orders = mockDataService.getOrders();
    const cart = mockDataService.getCart();
    const restaurants = mockDataService.getRestaurants();

    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      favoriteRestaurants: user.preferences.cuisines.length,
      cartItems: cart.length,
      cartValue: mockDataService.getCartTotal(),
      availableRestaurants: restaurants.filter(r => r.isOpen).length,
      savedAddresses: user.addresses.length,
      paymentMethods: user.paymentMethods.length,
      isDemoMode: this.isInDemoMode
    };
  }

  // Generate demo tooltips
  getDemoTooltips() {
    return {
      onboarding: "👋 Welcome to the Glass Food Delivery App! This is a demo showcasing modern UI design with glass morphism effects.",
      restaurants: "🍽️ Browse restaurants with beautiful glass cards and smooth animations. Try tapping on different restaurants!",
      menu: "📱 Menu items feature customization options and add-to-cart animations. Notice the glass effects throughout!",
      cart: "🛒 The cart uses a glass bottom sheet with smooth slide animations. Try adding and removing items!",
      checkout: "💳 The checkout process features step-by-step glass forms with elegant transitions.",
      tracking: "📍 Order tracking includes a live map with glass overlays and animated delivery progress.",
      chat: "🤖 The AI chatbot provides food recommendations with glass-styled chat bubbles.",
      profile: "👤 Your profile shows order history and preferences with animated glass components.",
      reset: "🔄 Use the reset button to start fresh or try different demo scenarios!"
    };
  }

  // Auto-populate demo data based on time of day
  autoPopulateDemoData() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      // Morning: Light breakfast options
      this.loadDemoScenario('newUser');
    } else if (hour >= 12 && hour < 17) {
      // Afternoon: Lunch with active order
      this.loadDemoScenario('activeOrder');
    } else if (hour >= 17 && hour < 22) {
      // Evening: Dinner with cart items
      this.loadDemoScenario('cartWithItems');
    } else {
      // Late night: Experienced user
      this.loadDemoScenario('experiencedUser');
    }
  }
}

// Export singleton instance
export const demoDataService = new DemoDataService();