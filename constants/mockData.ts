import { Restaurant, MenuItem, User, Order } from '../types';

// Mock restaurants data with comprehensive menus
export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Bella Italia',
    description: 'Authentic Italian cuisine with fresh ingredients and traditional recipes passed down through generations',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    rating: 4.8,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minimumOrder: 15.00,
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    isOpen: true,
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '123 Italian St, San Francisco, CA'
    },
    menu: [
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, San Marzano tomatoes, fresh basil, and extra virgin olive oil',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
        category: 'Pizza',
        dietary: ['Vegetarian'],
        customizations: [
          {
            id: 'size',
            name: 'Size',
            type: 'single',
            required: true,
            options: [
              { id: 'small', name: 'Small (10")', price: 0 },
              { id: 'medium', name: 'Medium (12")', price: 3 },
              { id: 'large', name: 'Large (14")', price: 6 }
            ]
          }
        ],
        isAvailable: true
      },
      {
        id: '2',
        name: 'Spaghetti Carbonara',
        description: 'Traditional Roman pasta with eggs, pecorino cheese, pancetta, and black pepper',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
        category: 'Pasta',
        dietary: [],
        customizations: [],
        isAvailable: true
      },
      {
        id: '3',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
        category: 'Desserts',
        dietary: ['Vegetarian'],
        customizations: [],
        isAvailable: true
      }
    ]
  },
  {
    id: '2',
    name: 'Sushi Zen',
    description: 'Fresh sushi and Japanese delicacies prepared by master chefs with the finest ingredients',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    rating: 4.9,
    deliveryTime: '30-40 min',
    deliveryFee: 3.99,
    minimumOrder: 20.00,
    cuisine: ['Japanese', 'Sushi', 'Asian'],
    isOpen: true,
    location: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: '456 Sushi Ave, San Francisco, CA'
    },
    menu: [
      {
        id: '4',
        name: 'Salmon Nigiri (2 pieces)',
        description: 'Fresh Atlantic salmon over seasoned sushi rice',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        category: 'Nigiri',
        dietary: ['Gluten-Free'],
        customizations: [],
        isAvailable: true
      },
      {
        id: '5',
        name: 'Dragon Roll',
        description: 'Eel and cucumber inside, avocado and eel sauce on top',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop',
        category: 'Specialty Rolls',
        dietary: [],
        customizations: [],
        isAvailable: true
      },
      {
        id: '6',
        name: 'Miso Soup',
        description: 'Traditional Japanese soup with tofu, seaweed, and green onions',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
        category: 'Soups',
        dietary: ['Vegetarian', 'Vegan'],
        customizations: [],
        isAvailable: true
      }
    ]
  },
  {
    id: '3',
    name: 'Burger Palace',
    description: 'Gourmet burgers made with premium beef and fresh toppings, served with crispy fries',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    rating: 4.6,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minimumOrder: 12.00,
    cuisine: ['American', 'Burgers', 'Fast Food'],
    isOpen: true,
    location: {
      latitude: 37.7649,
      longitude: -122.4294,
      address: '789 Burger Blvd, San Francisco, CA'
    },
    menu: [
      {
        id: '7',
        name: 'Classic Cheeseburger',
        description: 'Angus beef patty with aged cheddar, lettuce, tomato, onion, and special sauce',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        category: 'Burgers',
        dietary: [],
        customizations: [
          {
            id: 'doneness',
            name: 'How would you like it cooked?',
            type: 'single',
            required: true,
            options: [
              { id: 'rare', name: 'Rare', price: 0 },
              { id: 'medium-rare', name: 'Medium Rare', price: 0 },
              { id: 'medium', name: 'Medium', price: 0 },
              { id: 'well-done', name: 'Well Done', price: 0 }
            ]
          },
          {
            id: 'extras',
            name: 'Add Extras',
            type: 'multiple',
            required: false,
            options: [
              { id: 'bacon', name: 'Bacon', price: 2.50 },
              { id: 'avocado', name: 'Avocado', price: 1.50 },
              { id: 'mushrooms', name: 'Mushrooms', price: 1.00 }
            ]
          }
        ],
        isAvailable: true
      },
      {
        id: '8',
        name: 'Truffle Fries',
        description: 'Crispy fries with truffle oil, parmesan cheese, and fresh herbs',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
        category: 'Sides',
        dietary: ['Vegetarian'],
        customizations: [],
        isAvailable: true
      },
      {
        id: '9',
        name: 'Chocolate Milkshake',
        description: 'Rich chocolate milkshake topped with whipped cream and chocolate shavings',
        price: 6.99,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
        category: 'Beverages',
        dietary: ['Vegetarian'],
        customizations: [],
        isAvailable: true
      }
    ]
  },
  {
    id: '4',
    name: 'Green Garden',
    description: 'Fresh, healthy, and organic salads and bowls made with locally sourced ingredients',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    rating: 4.7,
    deliveryTime: '15-25 min',
    deliveryFee: 2.49,
    minimumOrder: 10.00,
    cuisine: ['Healthy', 'Salads', 'Vegan'],
    isOpen: true,
    location: {
      latitude: 37.7549,
      longitude: -122.4394,
      address: '321 Green St, San Francisco, CA'
    },
    menu: [
      {
        id: '10',
        name: 'Mediterranean Bowl',
        description: 'Quinoa, chickpeas, cucumber, tomatoes, olives, feta cheese, and tahini dressing',
        price: 13.99,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
        category: 'Bowls',
        dietary: ['Vegetarian', 'Gluten-Free'],
        customizations: [],
        isAvailable: true
      }
    ]
  },
  {
    id: '5',
    name: 'Taco Fiesta',
    description: 'Authentic Mexican street food with bold flavors and fresh ingredients',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    rating: 4.5,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    minimumOrder: 12.00,
    cuisine: ['Mexican', 'Tacos', 'Spicy'],
    isOpen: false,
    location: {
      latitude: 37.7449,
      longitude: -122.4494,
      address: '654 Fiesta Ave, San Francisco, CA'
    },
    menu: [
      {
        id: '11',
        name: 'Carnitas Tacos (3)',
        description: 'Slow-cooked pork with onions, cilantro, and salsa verde on corn tortillas',
        price: 11.99,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        category: 'Tacos',
        dietary: ['Gluten-Free'],
        customizations: [],
        isAvailable: true
      }
    ]
  }
];

// Mock menu items
export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
    category: 'Pizza',
    dietary: ['Vegetarian'],
    customizations: [],
    isAvailable: true
  },
  {
    id: '2',
    name: 'Salmon Nigiri',
    description: 'Fresh Atlantic salmon over seasoned rice',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    category: 'Sushi',
    dietary: ['Gluten-Free'],
    customizations: [],
    isAvailable: true
  },
  {
    id: '3',
    name: 'Classic Cheeseburger',
    description: 'Beef patty with cheese, lettuce, tomato, and special sauce',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    category: 'Burgers',
    dietary: [],
    customizations: [],
    isAvailable: true
  }
];

// Mock user data
export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 (555) 123-4567',
  preferences: {
    dietary: ['Vegetarian'],
    cuisines: ['Italian', 'Japanese', 'Healthy'],
    spiceLevel: 'medium'
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
    }
  ],
  paymentMethods: [
    {
      id: '1',
      type: 'credit',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      cardholderName: 'Alex Johnson',
      isDefault: true
    },
    {
      id: '2',
      type: 'debit',
      last4: '1234',
      expiryMonth: 8,
      expiryYear: 2026,
      cardholderName: 'Alex Johnson',
      isDefault: false
    }
  ]
};

// Mock order history
export const mockOrderHistory: Order[] = [
  {
    id: 'order-1',
    userId: '1',
    restaurantId: '1',
    items: [
      {
        menuItem: mockMenuItems[0],
        quantity: 1,
        customizations: { size: 'medium' },
        totalPrice: 21.99
      }
    ],
    status: 'delivered',
    totalAmount: 24.98,
    deliveryAddress: mockUser.addresses[0],
    estimatedDelivery: new Date(Date.now() - 86400000), // Yesterday
    createdAt: new Date(Date.now() - 90000000), // 25 hours ago
  },
  {
    id: 'order-2',
    userId: '1',
    restaurantId: '2',
    items: [
      {
        menuItem: mockMenuItems[1],
        quantity: 2,
        customizations: {},
        totalPrice: 25.98
      }
    ],
    status: 'delivered',
    totalAmount: 29.97,
    deliveryAddress: mockUser.addresses[1],
    estimatedDelivery: new Date(Date.now() - 172800000), // 2 days ago
    createdAt: new Date(Date.now() - 176400000),
  },
  {
    id: 'order-3',
    userId: '1',
    restaurantId: '3',
    items: [
      {
        menuItem: mockMenuItems[2],
        quantity: 1,
        customizations: { doneness: 'medium', extras: 'bacon,avocado' },
        totalPrice: 18.99
      }
    ],
    status: 'out_for_delivery',
    totalAmount: 20.98,
    deliveryAddress: mockUser.addresses[0],
    estimatedDelivery: new Date(Date.now() + 1800000), // 30 minutes from now
    createdAt: new Date(Date.now() - 2700000), // 45 minutes ago
    driver: {
      id: 'driver-1',
      name: 'Mike Rodriguez',
      phone: '+1 (555) 987-6543',
      rating: 4.9,
      vehicle: {
        type: 'Honda Civic',
        licensePlate: 'ABC-123'
      },
      location: {
        latitude: 37.7649,
        longitude: -122.4294
      }
    }
  }
];

// Food categories
export const foodCategories = [
  { id: '1', name: 'Pizza', icon: '🍕', color: '#FF6B35' },
  { id: '2', name: 'Sushi', icon: '🍣', color: '#48BB78' },
  { id: '3', name: 'Burgers', icon: '🍔', color: '#F6AD55' },
  { id: '4', name: 'Pasta', icon: '🍝', color: '#9F7AEA' },
  { id: '5', name: 'Salads', icon: '🥗', color: '#38B2AC' },
  { id: '6', name: 'Desserts', icon: '🍰', color: '#ED64A6' }
];

// Dietary filters
export const dietaryFilters = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Low-Carb',
  'Halal',
  'Kosher'
];// Mock tracking data
export const mockTrackingData: TrackingData = {
  orderId: 'order-3',
  driverLocation: {
    latitude: 37.7649,
    longitude: -122.4294
  },
  estimatedArrival: new Date(Date.now() + 1800000), // 30 minutes from now
  route: [
    { latitude: 37.7649, longitude: -122.4294 }, // Restaurant
    { latitude: 37.7679, longitude: -122.4264 },
    { latitude: 37.7709, longitude: -122.4234 },
    { latitude: 37.7739, longitude: -122.4204 },
    { latitude: 37.7749, longitude: -122.4194 }, // User location
  ]
};

// Popular search terms
export const popularSearches = [
  'Pizza',
  'Sushi',
  'Burgers',
  'Healthy',
  'Italian',
  'Fast Food',
  'Vegetarian',
  'Desserts'
];

// Featured restaurants (for home screen)
export const featuredRestaurants = mockRestaurants.slice(0, 3);

// Nearby restaurants (based on location)
export const nearbyRestaurants = mockRestaurants.filter(r => r.isOpen);

// Restaurant categories with icons
export const restaurantCategories = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'sushi', name: 'Sushi', icon: '🍣' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
  { id: 'mexican', name: 'Mexican', icon: '🌮' },
  { id: 'italian', name: 'Italian', icon: '🍝' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' }
];

// Delivery time slots
export const deliveryTimeSlots = [
  'ASAP (25-35 min)',
  '12:00 PM - 12:30 PM',
  '12:30 PM - 1:00 PM',
  '1:00 PM - 1:30 PM',
  '1:30 PM - 2:00 PM',
  '2:00 PM - 2:30 PM',
  '2:30 PM - 3:00 PM'
];

// Promo codes
export const promoCodes = [
  {
    id: 'WELCOME10',
    title: 'Welcome Offer',
    description: '10% off your first order',
    discount: 0.10,
    minOrder: 15.00,
    isActive: true
  },
  {
    id: 'FREESHIP',
    title: 'Free Delivery',
    description: 'Free delivery on orders over $25',
    discount: 0,
    minOrder: 25.00,
    isActive: true
  }
];

// AI chat suggestions
export const aiChatSuggestions = [
  "What's popular today?",
  "Show me vegetarian options",
  "I want something spicy",
  "Quick delivery options",
  "Recommend something new",
  "What's good for dinner?",
  "Healthy meal options",
  "Best rated restaurants"
];

// Order status messages
export const orderStatusMessages = {
  pending: "We're confirming your order with the restaurant",
  confirmed: "Your order has been confirmed and is being prepared",
  preparing: "The kitchen is preparing your delicious meal",
  out_for_delivery: "Your order is on its way!",
  delivered: "Your order has been delivered. Enjoy your meal!"
};

// Demo reset data
export const demoResetData = {
  user: mockUser,
  restaurants: mockRestaurants,
  orderHistory: mockOrderHistory.slice(0, 2), // Keep only delivered orders
  cart: [],
  currentOrder: null,
  trackingData: null
};