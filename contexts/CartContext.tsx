import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartState, CartItem, Restaurant, MenuItem } from '../types';

// Action types
type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: CartItem; restaurant: Restaurant } }
  | { type: 'REMOVE_ITEM'; payload: string } // item id
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_RESTAURANT'; payload: Restaurant | null }
  | { type: 'CALCULATE_TOTALS' };

// Initial state
const initialState: CartState = {
  items: [],
  restaurant: null,
  subtotal: 0,
  deliveryFee: 0,
  total: 0,
};

// Helper function to calculate totals
const calculateTotals = (items: CartItem[], restaurant: Restaurant | null): Partial<CartState> => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = restaurant?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  return { subtotal, deliveryFee, total };
};

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, restaurant } = action.payload;
      
      // If adding from a different restaurant, clear cart first
      if (state.restaurant && state.restaurant.id !== restaurant.id) {
        const newState = {
          items: [item],
          restaurant,
          ...calculateTotals([item], restaurant),
        };
        return newState;
      }

      // Check if item already exists
      const existingItemIndex = state.items.findIndex(
        cartItem => cartItem.menuItem.id === item.menuItem.id &&
        JSON.stringify(cartItem.customizations) === JSON.stringify(item.customizations)
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((cartItem, index) =>
          index === existingItemIndex
            ? {
                ...cartItem,
                quantity: cartItem.quantity + item.quantity,
                totalPrice: cartItem.totalPrice + item.totalPrice,
              }
            : cartItem
        );
      } else {
        // Add new item
        newItems = [...state.items, item];
      }

      return {
        ...state,
        items: newItems,
        restaurant: restaurant,
        ...calculateTotals(newItems, restaurant),
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.menuItem.id !== action.payload);
      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems, state.restaurant),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.items.filter(item => item.menuItem.id !== itemId);
        return {
          ...state,
          items: newItems,
          ...calculateTotals(newItems, state.restaurant),
        };
      }

      const newItems = state.items.map(item =>
        item.menuItem.id === itemId
          ? {
              ...item,
              quantity,
              totalPrice: item.menuItem.price * quantity,
            }
          : item
      );

      return {
        ...state,
        items: newItems,
        ...calculateTotals(newItems, state.restaurant),
      };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'SET_RESTAURANT':
      return {
        ...state,
        restaurant: action.payload,
      };

    case 'CALCULATE_TOTALS':
      return {
        ...state,
        ...calculateTotals(state.items, state.restaurant),
      };

    default:
      return state;
  }
};

// Context
interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  // Helper functions
  addItem: (menuItem: MenuItem, restaurant: Restaurant, quantity?: number, customizations?: { [key: string]: string }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  isRestaurantInCart: (restaurantId: string) => boolean;
  getItemInCart: (menuItemId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Helper functions
  const addItem = (
    menuItem: MenuItem,
    restaurant: Restaurant,
    quantity: number = 1,
    customizations: { [key: string]: string } = {}
  ) => {
    const totalPrice = menuItem.price * quantity;
    const cartItem: CartItem = {
      menuItem,
      quantity,
      customizations,
      totalPrice,
    };

    dispatch({ type: 'ADD_ITEM', payload: { item: cartItem, restaurant } });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemCount = (): number => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const isRestaurantInCart = (restaurantId: string): boolean => {
    return state.restaurant?.id === restaurantId;
  };

  const getItemInCart = (menuItemId: string): CartItem | undefined => {
    return state.items.find(item => item.menuItem.id === menuItemId);
  };

  const value: CartContextType = {
    state,
    dispatch,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    isRestaurantInCart,
    getItemInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook to use the context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};