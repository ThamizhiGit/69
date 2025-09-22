// Core data models for the glass food delivery app

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferences: {
    dietary: string[];
    cuisines: string[];
    spiceLevel: 'mild' | 'medium' | 'hot';
  };
  addresses: Address[];
  paymentMethods: PaymentMethod[];
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'paypal' | 'apple_pay' | 'google_pay';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  cuisine: string[];
  isOpen: boolean;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  menu: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  dietary: string[];
  customizations: Customization[];
  isAvailable: boolean;
}

export interface Customization {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations: { [key: string]: string };
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  totalAmount: number;
  deliveryAddress: Address;
  estimatedDelivery: Date;
  driver?: Driver;
  createdAt: Date;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicle: {
    type: string;
    licensePlate: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface TrackingData {
  orderId: string;
  driverLocation: Location;
  estimatedArrival: Date;
  route: Location[];
}

// Context state interfaces
export interface AppState {
  user: User | null;
  currentLocation: Location | null;
  theme: 'light' | 'dark';
  isLoading: boolean;
}

export interface CartState {
  items: CartItem[];
  restaurant: Restaurant | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface OrderState {
  currentOrder: Order | null;
  orderHistory: Order[];
  trackingData: TrackingData | null;
}

// Component prop interfaces
export interface GlassContainerProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default' | 'primary';
  borderRadius?: number;
  borderWidth?: number;
  style?: any;
}

export interface AnimationConfig {
  duration: number;
  easing: any;
  useNativeDriver?: boolean;
}

// AI Chat interfaces
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: FoodRecommendation[];
}

export interface FoodRecommendation {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  restaurantId: string;
  restaurantName: string;
}