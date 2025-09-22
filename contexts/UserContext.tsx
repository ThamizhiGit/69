import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Address, PaymentMethod } from '../types';

// Action types
type UserAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'ADD_ADDRESS'; payload: Address }
  | { type: 'UPDATE_ADDRESS'; payload: Address }
  | { type: 'REMOVE_ADDRESS'; payload: string } // address id
  | { type: 'SET_DEFAULT_ADDRESS'; payload: string } // address id
  | { type: 'ADD_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'UPDATE_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'REMOVE_PAYMENT_METHOD'; payload: string } // payment method id
  | { type: 'SET_DEFAULT_PAYMENT_METHOD'; payload: string } // payment method id
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<User['preferences']> }
  | { type: 'CLEAR_USER' };

// Initial state
const initialState: { user: User | null } = {
  user: null,
};

// Reducer
const userReducer = (state: { user: User | null }, action: UserAction): { user: User | null } => {
  switch (action.type) {
    case 'SET_USER':
      return { user: action.payload };

    case 'UPDATE_PROFILE':
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case 'ADD_ADDRESS':
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          addresses: [...state.user.addresses, action.payload],
        },
      };

    case 'UPDATE_ADDRESS':
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          addresses: state.user.addresses.map(address =>
            address.id === action.payload.id ? action.payload : address
          ),
        },
      };

    case 'REMOVE_ADDRESS':
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          addresses: state.user.addresses.filter(address => address.id !== action.payload),
        },
      };

    case 'SET_DEFAULT_ADDRESS':
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          addresses: state.user.addresses.map(address => ({
            ...address,
            isDefault: address.id === action.payload,
          })),
        },
      };

    case 'ADD_PAYMENT_METHOD':
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          paymentMethods: [...state.user.paymentMethods, action.payload],
        },
      };

    case 'UPDATE_PAYMENT_METHOD':
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          paymentMethods: state.user.paymentMethods.map(method =>
            method.id === action.payload.id ? action.payload : method
          ),
        },
      };

    case 'REMOVE_PAYMENT_METHOD':
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          paymentMethods: state.user.paymentMethods.filter(method => method.id !== action.payload),
        },
      };

    case 'SET_DEFAULT_PAYMENT_METHOD':
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          paymentMethods: state.user.paymentMethods.map(method => ({
            ...method,
            isDefault: method.id === action.payload,
          })),
        },
      };

    case 'UPDATE_PREFERENCES':
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            ...action.payload,
          },
        },
      };

    case 'CLEAR_USER':
      return { user: null };

    default:
      return state;
  }
};

// Context
interface UserContextType {
  user: User | null;
  dispatch: React.Dispatch<UserAction>;
  // Helper functions
  setUser: (user: User) => void;
  updateProfile: (updates: Partial<User>) => void;
  addAddress: (address: Address) => void;
  updateAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  addPaymentMethod: (paymentMethod: PaymentMethod) => void;
  updatePaymentMethod: (paymentMethod: PaymentMethod) => void;
  removePaymentMethod: (paymentMethodId: string) => void;
  setDefaultPaymentMethod: (paymentMethodId: string) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  clearUser: () => void;
  getDefaultAddress: () => Address | undefined;
  getDefaultPaymentMethod: () => PaymentMethod | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Helper functions
  const setUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const updateProfile = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  };

  const addAddress = (address: Address) => {
    dispatch({ type: 'ADD_ADDRESS', payload: address });
  };

  const updateAddress = (address: Address) => {
    dispatch({ type: 'UPDATE_ADDRESS', payload: address });
  };

  const removeAddress = (addressId: string) => {
    dispatch({ type: 'REMOVE_ADDRESS', payload: addressId });
  };

  const setDefaultAddress = (addressId: string) => {
    dispatch({ type: 'SET_DEFAULT_ADDRESS', payload: addressId });
  };

  const addPaymentMethod = (paymentMethod: PaymentMethod) => {
    dispatch({ type: 'ADD_PAYMENT_METHOD', payload: paymentMethod });
  };

  const updatePaymentMethod = (paymentMethod: PaymentMethod) => {
    dispatch({ type: 'UPDATE_PAYMENT_METHOD', payload: paymentMethod });
  };

  const removePaymentMethod = (paymentMethodId: string) => {
    dispatch({ type: 'REMOVE_PAYMENT_METHOD', payload: paymentMethodId });
  };

  const setDefaultPaymentMethod = (paymentMethodId: string) => {
    dispatch({ type: 'SET_DEFAULT_PAYMENT_METHOD', payload: paymentMethodId });
  };

  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  const clearUser = () => {
    dispatch({ type: 'CLEAR_USER' });
  };

  const getDefaultAddress = (): Address | undefined => {
    return state.user?.addresses.find(address => address.isDefault);
  };

  const getDefaultPaymentMethod = (): PaymentMethod | undefined => {
    return state.user?.paymentMethods.find(method => method.isDefault);
  };

  const value: UserContextType = {
    user: state.user,
    dispatch,
    setUser,
    updateProfile,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    addPaymentMethod,
    updatePaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    updatePreferences,
    clearUser,
    getDefaultAddress,
    getDefaultPaymentMethod,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Hook to use the context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};