import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { OrderState, Order, TrackingData } from '../types';

// Action types
type OrderAction =
  | { type: 'SET_CURRENT_ORDER'; payload: Order | null }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'SET_ORDER_HISTORY'; payload: Order[] }
  | { type: 'SET_TRACKING_DATA'; payload: TrackingData | null }
  | { type: 'UPDATE_TRACKING_DATA'; payload: Partial<TrackingData> }
  | { type: 'CLEAR_CURRENT_ORDER' }
  | { type: 'CLEAR_TRACKING_DATA' };

// Initial state
const initialState: OrderState = {
  currentOrder: null,
  orderHistory: [],
  trackingData: null,
};

// Reducer
const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'SET_CURRENT_ORDER':
      return {
        ...state,
        currentOrder: action.payload,
      };

    case 'ADD_ORDER':
      return {
        ...state,
        currentOrder: action.payload,
        orderHistory: [action.payload, ...state.orderHistory],
      };

    case 'UPDATE_ORDER_STATUS': {
      const { orderId, status } = action.payload;
      
      // Update current order if it matches
      const updatedCurrentOrder = state.currentOrder?.id === orderId
        ? { ...state.currentOrder, status }
        : state.currentOrder;

      // Update order history
      const updatedOrderHistory = state.orderHistory.map(order =>
        order.id === orderId ? { ...order, status } : order
      );

      return {
        ...state,
        currentOrder: updatedCurrentOrder,
        orderHistory: updatedOrderHistory,
      };
    }

    case 'SET_ORDER_HISTORY':
      return {
        ...state,
        orderHistory: action.payload,
      };

    case 'SET_TRACKING_DATA':
      return {
        ...state,
        trackingData: action.payload,
      };

    case 'UPDATE_TRACKING_DATA':
      return {
        ...state,
        trackingData: state.trackingData
          ? { ...state.trackingData, ...action.payload }
          : null,
      };

    case 'CLEAR_CURRENT_ORDER':
      return {
        ...state,
        currentOrder: null,
      };

    case 'CLEAR_TRACKING_DATA':
      return {
        ...state,
        trackingData: null,
      };

    default:
      return state;
  }
};

// Context
interface OrderContextType {
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
  // Helper functions
  setCurrentOrder: (order: Order | null) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setOrderHistory: (orders: Order[]) => void;
  setTrackingData: (trackingData: TrackingData | null) => void;
  updateTrackingData: (updates: Partial<TrackingData>) => void;
  clearCurrentOrder: () => void;
  clearTrackingData: () => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: Order['status']) => Order[];
  hasActiveOrder: () => boolean;
  getActiveOrderStatuses: () => Order['status'][];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Provider component
export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Helper functions
  const setCurrentOrder = (order: Order | null) => {
    dispatch({ type: 'SET_CURRENT_ORDER', payload: order });
  };

  const addOrder = (order: Order) => {
    dispatch({ type: 'ADD_ORDER', payload: order });
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
  };

  const setOrderHistory = (orders: Order[]) => {
    dispatch({ type: 'SET_ORDER_HISTORY', payload: orders });
  };

  const setTrackingData = (trackingData: TrackingData | null) => {
    dispatch({ type: 'SET_TRACKING_DATA', payload: trackingData });
  };

  const updateTrackingData = (updates: Partial<TrackingData>) => {
    dispatch({ type: 'UPDATE_TRACKING_DATA', payload: updates });
  };

  const clearCurrentOrder = () => {
    dispatch({ type: 'CLEAR_CURRENT_ORDER' });
  };

  const clearTrackingData = () => {
    dispatch({ type: 'CLEAR_TRACKING_DATA' });
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return state.orderHistory.find(order => order.id === orderId);
  };

  const getOrdersByStatus = (status: Order['status']): Order[] => {
    return state.orderHistory.filter(order => order.status === status);
  };

  const hasActiveOrder = (): boolean => {
    const activeStatuses: Order['status'][] = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];
    return state.orderHistory.some(order => activeStatuses.includes(order.status));
  };

  const getActiveOrderStatuses = (): Order['status'][] => {
    return ['pending', 'confirmed', 'preparing', 'out_for_delivery'];
  };

  const value: OrderContextType = {
    state,
    dispatch,
    setCurrentOrder,
    addOrder,
    updateOrderStatus,
    setOrderHistory,
    setTrackingData,
    updateTrackingData,
    clearCurrentOrder,
    clearTrackingData,
    getOrderById,
    getOrdersByStatus,
    hasActiveOrder,
    getActiveOrderStatuses,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// Hook to use the context
export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};