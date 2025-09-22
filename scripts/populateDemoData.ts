import { Restaurant, MenuItem, User, Order } from '../types';

// Comprehensive demo data population script
export const populateDemoData = () => {
  // Extended restaurant data with more variety
  const extendedRestaurants: Restaurant[] = [
    {
      id: '6',
      name: 'Dragon Palace',
      description: 'Authentic Chinese cuisine with traditional flavors and modern presentation',
      image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop',
      rating: 4.6,
      deliveryTime: '35-45 min',
      deliveryFee: 3.49,
      minimumOrder: 18.00,
      cuisine: ['Chinese', 'Asian', 'Spicy'],
      isOpen: true,
      location: {
        latitude: 37.7349,
        longitude: -122.4594,
        address: '987 Dragon Ave, San Francisco, CA'
      },
      menu: [
        {
          id: '12',
          name: 'Kung Pao Chicken',
          description: 'Diced chicken with peanuts, vegetables, and chili peppers in savory sauce',
          price: 15.99,
          image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop',
          category: 'Main Dishes',
          dietary: ['Gluten-Free'],
          customizations: [
            {
              id: 'spice',
              name: 'Spice Level',
              type: 'single',
              required: true,
              options: [
                { id: 'mild', name: 'Mild', price: 0 },
                { id: 'medium', name: 'Medium', price: 0 },
                { id: 'hot', name: 'Hot', price: 0 },
                { id: 'extra-hot', name: 'Extra Hot', price: 0 }
              ]
            }
          ],
          isAvailable: true
        },
        {
          id: '13',
          name: 'Vegetable Spring Rolls (4 pieces)',
          description: 'Crispy spring rolls filled with fresh vegetables and served with sweet & sour sauce',
          price: 8.99,
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
          category: 'Appetizers',
          dietary: ['Vegetarian', 'Vegan'],
          customizations: [],
          isAvailable: true
        }
      ]
    },
    {
      id: '7',
      name: 'Café Parisien',
      description: 'French bistro classics with fresh pastries and artisanal coffee',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      rating: 4.9,
      deliveryTime: '20-30 min',
      deliveryFee: 2.99,
      minimumOrder: 12.00,
      cuisine: ['French', 'Cafe', 'Pastries'],
      isOpen: true,
      location: {
        latitude: 37.7949,
        longitude: -122.3994,
        address: '456 Paris St, San Francisco, CA'
      },
      menu: [
        {
          id: '14',
          name: 'Croque Monsieur',
          description: 'Classic French grilled ham and cheese sandwich with béchamel sauce',
          price: 14.99,
          image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop',
          category: 'Sandwiches',
          dietary: [],
          customizations: [],
          isAvailable: true
        },
        {
          id: '15',
          name: 'Pain au Chocolat',
          description: 'Buttery, flaky pastry filled with rich dark chocolate',
          price: 4.99,
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
          category: 'Pastries',
          dietary: ['Vegetarian'],
          customizations: [],
          isAvailable: true
        }
      ]
    },
    {
      id: '8',
      name: 'Mumbai Spice',
      description: 'Authentic Indian cuisine with aromatic spices and traditional cooking methods',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop',
      rating: 4.7,
      deliveryTime: '40-50 min',
      deliveryFee: 3.99,
      minimumOrder: 20.00,
      cuisine: ['Indian', 'Spicy', 'Vegetarian'],
      isOpen: false, // Closed for variety
      location: {
        latitude: 37.7149,
        longitude: -122.4794,
        address: '321 Spice Road, San Francisco, CA'
      },
      menu: [
        {
          id: '16',
          name: 'Chicken Tikka Masala',
          description: 'Tender chicken in creamy tomato-based curry sauce with aromatic spices',
          price: 17.99,
          image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
          category: 'Curries',
          dietary: ['Gluten-Free'],
          customizations: [
            {
              id: 'spice',
              name: 'Spice Level',
              type: 'single',
              required: true,
              options: [
                { id: 'mild', name: 'Mild', price: 0 },
                { id: 'medium', name: 'Medium', price: 0 },
                { id: 'hot', name: 'Hot', price: 0 }
              ]
            }
          ],
          isAvailable: true
        }
      ]
    }
  ];

  // Extended user profiles for different scenarios
  const demoUserProfiles: User[] = [
    {
      id: 'user-foodie',
      name: 'Alex Foodie',
      email: 'alex.foodie@example.com',
      phone: '+1 (555) FOOD-123',
      preferences: {
        dietary: ['Vegetarian', 'Gluten-Free'],
        cuisines: ['Italian', 'Japanese', 'French', 'Healthy'],
        spiceLevel: 'mild'
      },
      addresses: [
        {
          id: 'addr-1',
          label: 'Home',
          street: '123 Foodie Lane',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          latitude: 37.7749,
          longitude: -122.4194,
          isDefault: true
        },
        {
          id: 'addr-2',
          label: 'Office',
          street: '456 Work Plaza',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          latitude: 37.7849,
          longitude: -122.4094,
          isDefault: false
        }
      ],
      paymentMethods: [
        {
          id: 'card-1',
          type: 'credit',
          last4: '1234',
          expiryMonth: 12,
          expiryYear: 2026,
          cardholderName: 'Alex Foodie',
          isDefault: true
        }
      ]
    },
    {
      id: 'user-busy',
      name: 'Sam Busy',
      email: 'sam.busy@example.com',
      phone: '+1 (555) BUSY-789',
      preferences: {
        dietary: [],
        cuisines: ['Fast Food', 'American', 'Pizza'],
        spiceLevel: 'medium'
      },
      addresses: [
        {
          id: 'addr-3',
          label: 'Home',
          street: '789 Rush Street',
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
          id: 'card-2',
          type: 'debit',
          last4: '5678',
          expiryMonth: 8,
          expiryYear: 2025,
          cardholderName: 'Sam Busy',
          isDefault: true
        }
      ]
    }
  ];

  // Extended order scenarios
  const generateExtendedOrderHistory = (userId: string): Order[] => {
    const now = new Date();
    
    return [
      {
        id: `order-${userId}-1`,
        userId,
        restaurantId: '1',
        items: [
          {
            menuItem: extendedRestaurants[0].menu[0],
            quantity: 1,
            customizations: { size: 'large' },
            totalPrice: 24.99
          }
        ],
        status: 'delivered',
        totalAmount: 27.98,
        deliveryAddress: demoUserProfiles[0].addresses[0],
        estimatedDelivery: new Date(now.getTime() - 86400000),
        createdAt: new Date(now.getTime() - 90000000),
      },
      {
        id: `order-${userId}-2`,
        userId,
        restaurantId: '6',
        items: [
          {
            menuItem: extendedRestaurants[0].menu[0],
            quantity: 1,
            customizations: { spice: 'medium' },
            totalPrice: 15.99
          },
          {
            menuItem: extendedRestaurants[0].menu[1],
            quantity: 2,
            customizations: {},
            totalPrice: 17.98
          }
        ],
        status: 'delivered',
        totalAmount: 37.46,
        deliveryAddress: demoUserProfiles[0].addresses[1],
        estimatedDelivery: new Date(now.getTime() - 259200000),
        createdAt: new Date(now.getTime() - 262800000),
      }
    ];
  };

  // Popular menu items across all restaurants
  const popularItems: MenuItem[] = [
    {
      id: 'popular-1',
      name: 'Truffle Mushroom Pizza',
      description: 'Gourmet pizza with truffle oil, wild mushrooms, and fresh arugula',
      price: 22.99,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      category: 'Pizza',
      dietary: ['Vegetarian'],
      customizations: [],
      isAvailable: true
    },
    {
      id: 'popular-2',
      name: 'Salmon Poke Bowl',
      description: 'Fresh salmon with avocado, cucumber, and sesame seeds over sushi rice',
      price: 16.99,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      category: 'Bowls',
      dietary: ['Gluten-Free'],
      customizations: [],
      isAvailable: true
    },
    {
      id: 'popular-3',
      name: 'Avocado Toast Deluxe',
      description: 'Sourdough toast with smashed avocado, poached egg, and everything seasoning',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
      category: 'Breakfast',
      dietary: ['Vegetarian'],
      customizations: [],
      isAvailable: true
    }
  ];

  // Seasonal menu items
  const seasonalItems: MenuItem[] = [
    {
      id: 'seasonal-1',
      name: 'Pumpkin Spice Latte',
      description: 'Seasonal favorite with pumpkin spice, steamed milk, and whipped cream',
      price: 5.99,
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
      category: 'Beverages',
      dietary: ['Vegetarian'],
      customizations: [],
      isAvailable: true
    },
    {
      id: 'seasonal-2',
      name: 'Winter Warming Soup',
      description: 'Hearty vegetable soup with seasonal root vegetables and herbs',
      price: 9.99,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
      category: 'Soups',
      dietary: ['Vegetarian', 'Vegan'],
      customizations: [],
      isAvailable: true
    }
  ];

  return {
    extendedRestaurants,
    demoUserProfiles,
    popularItems,
    seasonalItems,
    generateExtendedOrderHistory,
  };
};

// Demo data categories for easy access
export const demoDataCategories = {
  quickService: ['Burger Palace', 'Taco Fiesta'],
  fineDining: ['Bella Italia', 'Sushi Zen', 'Café Parisien'],
  healthy: ['Green Garden'],
  international: ['Dragon Palace', 'Mumbai Spice'],
  popular: ['Bella Italia', 'Sushi Zen', 'Burger Palace'],
};

// Demo scenarios with specific data sets
export const demoScenarios = {
  lunchRush: {
    timeOfDay: 'lunch',
    popularCategories: ['Fast Food', 'Healthy', 'Asian'],
    recommendedRestaurants: ['Burger Palace', 'Green Garden', 'Dragon Palace'],
  },
  dinnerTime: {
    timeOfDay: 'dinner',
    popularCategories: ['Italian', 'Japanese', 'French'],
    recommendedRestaurants: ['Bella Italia', 'Sushi Zen', 'Café Parisien'],
  },
  lateNight: {
    timeOfDay: 'late',
    popularCategories: ['Pizza', 'Burgers', 'Chinese'],
    recommendedRestaurants: ['Bella Italia', 'Burger Palace', 'Dragon Palace'],
  },
};