import React from 'react';
import { render, act, renderHook } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppContextProvider, useApp } from '../AppContext';
import { CartContextProvider, useCart } from '../CartContext';
import { UserContextProvider, useUser } from '../UserContext';
import { OrderContextProvider, useOrder } from '../OrderContext';
import { mockRestaurants, mockMenuItems, mockUsers } from '../../constants/mockData';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock Location services
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() => 
    Promise.resolve({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      }
    })
  ),
}));

describe('AppContext', () => {
  const TestComponent = () => {
    const { state, setTheme, setLocation, resetApp } = useApp();
    return (
      <>
        <Text testID="theme">{state.theme}</Text>
        <Text testID="loading">{state.isLoading.toString()}</Text>
        <Text testID="location">{state.currentLocation?.address || 'No location'}</Text>
      </>
    );
  };

  it('should provide initial state correctly', () => {
    const { getByTestId } = render(
      <AppContextProvider>
        <TestComponent />
      </AppContextProvider>
    );

    expect(getByTestId('theme').children[0]).toBe('light');
    expect(getByTestId('loading').children[0]).toBe('false');
    expect(getByTestId('location').children[0]).toBe('No location');
  });

  it('should update theme correctly', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppContextProvider,
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.state.theme).toBe('dark');
  });

  it('should update location correctly', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppContextProvider,
    });

    const mockLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'San Francisco, CA',
    };

    act(() => {
      result.current.setLocation(mockLocation);
    });

    expect(result.current.state.currentLocation).toEqual(mockLocation);
  });

  it('should reset app state correctly', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppContextProvider,
    });

    // First modify some state
    act(() => {
      result.current.setTheme('dark');
    });

    // Then reset
    act(() => {
      result.current.resetApp();
    });

    expect(result.current.state.theme).toBe('light');
    expect(result.current.state.currentLocation).toBeNull();
  });
});

describe('CartContext', () => {
  const TestComponent = () => {
    const { state, addItem, removeItem, updateQuantity, clearCart } = useCart();
    return (
      <>
        <Text testID="item-count">{state.items.length}</Text>
        <Text testID="subtotal">{state.subtotal}</Text>
        <Text testID="total">{state.total}</Text>
        <Text testID="restaurant">{state.restaurant?.name || 'No restaurant'}</Text>
      </>
    );
  };

  it('should provide initial cart state correctly', () => {
    const { getByTestId } = render(
      <CartContextProvider>
        <TestComponent />
      </CartContextProvider>
    );

    expect(getByTestId('item-count').children[0]).toBe('0');
    expect(getByTestId('subtotal').children[0]).toBe('0');
    expect(getByTestId('total').children[0]).toBe('0');
    expect(getByTestId('restaurant').children[0]).toBe('No restaurant');
  });

  it('should add items to cart correctly', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartContextProvider,
    });

    const mockMenuItem = mockMenuItems[0];
    const mockRestaurant = mockRestaurants[0];

    act(() => {
      result.current.addItem(mockMenuItem, mockRestaurant, 2, {});
    });

    expect(result.current.state.items).toHaveLength(1);
    expect(result.current.state.items[0].quantity).toBe(2);
    expect(result.current.state.restaurant).toEqual(mockRestaurant);
    expect(result.current.state.subtotal).toBe(mockMenuItem.price * 2);
  });

  it('should remove items from cart correctly', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartContextProvider,
    });

    const mockMenuItem = mockMenuItems[0];
    const mockRestaurant = mockRestaurants[0];

    // Add item first
    act(() => {
      result.current.addItem(mockMenuItem, mockRestaurant, 1, {});
    });

    // Then remove it
    act(() => {
      result.current.removeItem(mockMenuItem.id);
    });

    expect(result.current.state.items).toHaveLength(0);
    expect(result.current.state.subtotal).toBe(0);
  });

  it('should update item quantity correctly', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartContextProvider,
    });

    const mockMenuItem = mockMenuItems[0];
    const mockRestaurant = mockRestaurants[0];

    // Add item first
    act(() => {
      result.current.addItem(mockMenuItem, mockRestaurant, 1, {});
    });

    // Update quantity
    act(() => {
      result.current.updateQuantity(mockMenuItem.id, 3);
    });

    expect(result.current.state.items[0].quantity).toBe(3);
    expect(result.current.state.subtotal).toBe(mockMenuItem.price * 3);
  });

  it('should clear cart correctly', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartContextProvider,
    });

    const mockMenuItem = mockMenuItems[0];
    const mockRestaurant = mockRestaurants[0];

    // Add item first
    act(() => {
      result.current.addItem(mockMenuItem, mockRestaurant, 1, {});
    });

    // Clear cart
    act(() => {
      result.current.clearCart();
    });

    expect(result.current.state.items).toHaveLength(0);
    expect(result.current.state.restaurant).toBeNull();
    expect(result.current.state.subtotal).toBe(0);
  });

  it('should calculate delivery fee and total correctly', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartContextProvider,
    });

    const mockMenuItem = mockMenuItems[0];
    const mockRestaurant = mockRestaurants[0];

    act(() => {
      result.current.addItem(mockMenuItem, mockRestaurant, 1, {});
    });

    expect(result.current.state.deliveryFee).toBe(mockRestaurant.deliveryFee);
    expect(result.current.state.total).toBe(
      result.current.state.subtotal + result.current.state.deliveryFee
    );
  });
});

describe('UserContext', () => {
  const TestComponent = () => {
    const { user, updateProfile, updatePreferences, addAddress } = useUser();
    return (
      <>
        <Text testID="user-name">{user?.name || 'No user'}</Text>
        <Text testID="user-email">{user?.email || 'No email'}</Text>
        <Text testID="address-count">{user?.addresses?.length || 0}</Text>
      </>
    );
  };

  it('should provide initial user state correctly', () => {
    const { getByTestId } = render(
      <UserContextProvider>
        <TestComponent />
      </UserContextProvider>
    );

    expect(getByTestId('user-name').children[0]).toBe('No user');
    expect(getByTestId('user-email').children[0]).toBe('No email');
    expect(getByTestId('address-count').children[0]).toBe('0');
  });

  it('should update user profile correctly', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserContextProvider,
    });

    const profileUpdate = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
    };

    act(() => {
      result.current.updateProfile(profileUpdate);
    });

    expect(result.current.user?.name).toBe('John Doe');
    expect(result.current.user?.email).toBe('john@example.com');
    expect(result.current.user?.phone).toBe('+1234567890');
  });

  it('should update user preferences correctly', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserContextProvider,
    });

    const preferences = {
      dietary: ['vegetarian'],
      cuisines: ['italian', 'mexican'],
      spiceLevel: 'medium' as const,
    };

    act(() => {
      result.current.updatePreferences(preferences);
    });

    expect(result.current.user?.preferences).toEqual(preferences);
  });

  it('should add address correctly', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserContextProvider,
    });

    const newAddress = {
      id: 'addr-1',
      label: 'Home',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      latitude: 37.7749,
      longitude: -122.4194,
      isDefault: true,
    };

    act(() => {
      result.current.addAddress(newAddress);
    });

    expect(result.current.user?.addresses).toHaveLength(1);
    expect(result.current.user?.addresses[0]).toEqual(newAddress);
  });

  it('should set default address correctly', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserContextProvider,
    });

    const address1 = {
      id: 'addr-1',
      label: 'Home',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      latitude: 37.7749,
      longitude: -122.4194,
      isDefault: false,
    };

    const address2 = {
      id: 'addr-2',
      label: 'Work',
      street: '456 Work Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      latitude: 37.7849,
      longitude: -122.4094,
      isDefault: false,
    };

    // Add both addresses
    act(() => {
      result.current.addAddress(address1);
      result.current.addAddress(address2);
    });

    // Set address2 as default
    act(() => {
      result.current.setDefaultAddress('addr-2');
    });

    const addresses = result.current.user?.addresses || [];
    expect(addresses.find(a => a.id === 'addr-1')?.isDefault).toBe(false);
    expect(addresses.find(a => a.id === 'addr-2')?.isDefault).toBe(true);
  });
});

describe('OrderContext', () => {
  const TestComponent = () => {
    const { state, createOrder, updateOrderStatus } = useOrder();
    return (
      <>
        <Text testID="current-order">{state.currentOrder?.id || 'No order'}</Text>
        <Text testID="order-status">{state.currentOrder?.status || 'No status'}</Text>
        <Text testID="history-count">{state.orderHistory.length}</Text>
      </>
    );
  };

  it('should provide initial order state correctly', () => {
    const { getByTestId } = render(
      <OrderContextProvider>
        <TestComponent />
      </OrderContextProvider>
    );

    expect(getByTestId('current-order').children[0]).toBe('No order');
    expect(getByTestId('order-status').children[0]).toBe('No status');
    expect(getByTestId('history-count').children[0]).toBe('0');
  });

  it('should create order correctly', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderContextProvider,
    });

    const mockOrder = {
      restaurantId: mockRestaurants[0].id,
      items: [{
        menuItem: mockMenuItems[0],
        quantity: 2,
        customizations: {},
        totalPrice: mockMenuItems[0].price * 2,
      }],
      deliveryAddress: {
        id: 'addr-1',
        label: 'Home',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        latitude: 37.7749,
        longitude: -122.4194,
        isDefault: true,
      },
      paymentMethod: {
        id: 'card-1',
        type: 'credit' as const,
        last4: '1234',
        brand: 'visa',
        isDefault: true,
      },
    };

    act(() => {
      result.current.createOrder(mockOrder);
    });

    expect(result.current.state.currentOrder).toBeTruthy();
    expect(result.current.state.currentOrder?.status).toBe('pending');
    expect(result.current.state.orderHistory).toHaveLength(1);
  });

  it('should update order status correctly', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderContextProvider,
    });

    const mockOrder = {
      restaurantId: mockRestaurants[0].id,
      items: [{
        menuItem: mockMenuItems[0],
        quantity: 1,
        customizations: {},
        totalPrice: mockMenuItems[0].price,
      }],
      deliveryAddress: {
        id: 'addr-1',
        label: 'Home',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        latitude: 37.7749,
        longitude: -122.4194,
        isDefault: true,
      },
      paymentMethod: {
        id: 'card-1',
        type: 'credit' as const,
        last4: '1234',
        brand: 'visa',
        isDefault: true,
      },
    };

    // Create order first
    act(() => {
      result.current.createOrder(mockOrder);
    });

    const orderId = result.current.state.currentOrder?.id;

    // Update status
    act(() => {
      result.current.updateOrderStatus(orderId!, 'confirmed');
    });

    expect(result.current.state.currentOrder?.status).toBe('confirmed');
  });

  it('should handle order completion correctly', () => {
    const { result } = renderHook(() => useOrder(), {
      wrapper: OrderContextProvider,
    });

    const mockOrder = {
      restaurantId: mockRestaurants[0].id,
      items: [{
        menuItem: mockMenuItems[0],
        quantity: 1,
        customizations: {},
        totalPrice: mockMenuItems[0].price,
      }],
      deliveryAddress: {
        id: 'addr-1',
        label: 'Home',
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        latitude: 37.7749,
        longitude: -122.4194,
        isDefault: true,
      },
      paymentMethod: {
        id: 'card-1',
        type: 'credit' as const,
        last4: '1234',
        brand: 'visa',
        isDefault: true,
      },
    };

    // Create and complete order
    act(() => {
      result.current.createOrder(mockOrder);
    });

    const orderId = result.current.state.currentOrder?.id;

    act(() => {
      result.current.updateOrderStatus(orderId!, 'delivered');
    });

    expect(result.current.state.currentOrder?.status).toBe('delivered');
    expect(result.current.state.orderHistory).toHaveLength(1);
  });
});