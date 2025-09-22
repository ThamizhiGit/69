import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { router } from 'expo-router';
import RestaurantScreen from '../../app/(main)/restaurant/[id]';
import CartScreen from '../../app/(main)/cart';
import CheckoutScreen from '../../app/(main)/checkout';
import { AppContextProvider } from '../../contexts/AppContext';
import { CartContextProvider } from '../../contexts/CartContext';
import { UserContextProvider } from '../../contexts/UserContext';
import { OrderContextProvider } from '../../contexts/OrderContext';
import { mockRestaurants, mockMenuItems } from '../../constants/mockData';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({ id: mockRestaurants[0].id }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo modules
jest.mock('expo-blur', () => ({
  BlurView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="blur-view" {...props}>{children}</View>;
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="linear-gradient" {...props}>{children}</View>;
  },
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => <View testID="map-view" {...props}>{children}</View>,
    Marker: ({ children, ...props }: any) => <View testID="map-marker" {...props}>{children}</View>,
  };
});

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <AppContextProvider>
      <UserContextProvider>
        <CartContextProvider>
          <OrderContextProvider>
            {children}
          </OrderContextProvider>
        </CartContextProvider>
      </UserContextProvider>
    </AppContextProvider>
  </NavigationContainer>
);

describe('Cart and Checkout Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full cart to order flow', async () => {
    // Step 1: Add items to cart from restaurant screen
    const { getByText, getByTestId, rerender } = render(
      <AllProviders>
        <RestaurantScreen />
      </AllProviders>
    );

    // Find and add first menu item to cart
    const firstMenuItem = mockMenuItems[0];
    const addToCartButton = getByText('Add to Cart');
    fireEvent.press(addToCartButton);

    await waitFor(() => {
      // Cart bubble should appear with item count
      expect(getByTestId('cart-bubble')).toBeTruthy();
      expect(getByText('1')).toBeTruthy(); // Item count
    });

    // Step 2: Navigate to cart
    const cartBubble = getByTestId('cart-bubble');
    fireEvent.press(cartBubble);

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/cart');
    });

    // Step 3: Render cart screen
    rerender(
      <AllProviders>
        <CartScreen />
      </AllProviders>
    );

    await waitFor(() => {
      expect(getByText(firstMenuItem.name)).toBeTruthy();
      expect(getByText(`$${firstMenuItem.price.toFixed(2)}`)).toBeTruthy();
    });

    // Step 4: Proceed to checkout
    const checkoutButton = getByText('Proceed to Checkout');
    fireEvent.press(checkoutButton);

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/checkout');
    });

    // Step 5: Render checkout screen
    rerender(
      <AllProviders>
        <CheckoutScreen />
      </AllProviders>
    );

    // Step 6: Fill checkout form
    const addressInput = getByTestId('address-input');
    fireEvent.changeText(addressInput, '123 Test Street, San Francisco, CA');

    const paymentMethodSelect = getByTestId('payment-method-select');
    fireEvent.press(paymentMethodSelect);

    // Select credit card
    const creditCardOption = getByText('Credit Card');
    fireEvent.press(creditCardOption);

    // Step 7: Place order
    const placeOrderButton = getByText('Place Order');
    fireEvent.press(placeOrderButton);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/tracking');
    });
  });

  it('should handle cart item quantity updates', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <CartScreen />
      </AllProviders>
    );

    // Assuming cart has items from previous test context
    const increaseButton = getByTestId('increase-quantity');
    const decreaseButton = getByTestId('decrease-quantity');
    const quantityText = getByTestId('quantity-text');

    // Increase quantity
    fireEvent.press(increaseButton);

    await waitFor(() => {
      expect(quantityText.children[0]).toBe('2');
    });

    // Decrease quantity
    fireEvent.press(decreaseButton);

    await waitFor(() => {
      expect(quantityText.children[0]).toBe('1');
    });
  });

  it('should handle cart item removal', async () => {
    const { getByText, getByTestId, queryByText } = render(
      <AllProviders>
        <CartScreen />
      </AllProviders>
    );

    const firstMenuItem = mockMenuItems[0];
    
    // Initially item should be present
    expect(getByText(firstMenuItem.name)).toBeTruthy();

    // Remove item with swipe gesture
    const cartItem = getByTestId('cart-item');
    fireEvent(cartItem, 'swipeLeft');

    const removeButton = getByText('Remove');
    fireEvent.press(removeButton);

    await waitFor(() => {
      expect(queryByText(firstMenuItem.name)).toBeNull();
    });
  });

  it('should calculate totals correctly', async () => {
    const { getByTestId } = render(
      <AllProviders>
        <CartScreen />
      </AllProviders>
    );

    const subtotalText = getByTestId('subtotal');
    const deliveryFeeText = getByTestId('delivery-fee');
    const totalText = getByTestId('total');

    // Verify calculations
    const subtotal = parseFloat(subtotalText.children[0].toString().replace('$', ''));
    const deliveryFee = parseFloat(deliveryFeeText.children[0].toString().replace('$', ''));
    const total = parseFloat(totalText.children[0].toString().replace('$', ''));

    expect(total).toBe(subtotal + deliveryFee);
  });

  it('should handle empty cart state', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <CartScreen />
      </AllProviders>
    );

    // Clear cart first
    const clearCartButton = getByTestId('clear-cart');
    fireEvent.press(clearCartButton);

    await waitFor(() => {
      expect(getByText('Your cart is empty')).toBeTruthy();
      expect(getByText('Browse restaurants to add items')).toBeTruthy();
    });

    // Should show browse button
    const browseButton = getByText('Browse Restaurants');
    fireEvent.press(browseButton);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(main)/(tabs)');
    });
  });

  it('should validate checkout form', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <CheckoutScreen />
      </AllProviders>
    );

    // Try to place order without filling required fields
    const placeOrderButton = getByText('Place Order');
    fireEvent.press(placeOrderButton);

    await waitFor(() => {
      expect(getByText('Please select a delivery address')).toBeTruthy();
      expect(getByText('Please select a payment method')).toBeTruthy();
    });
  });

  it('should handle payment method selection', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <CheckoutScreen />
      </AllProviders>
    );

    const paymentMethodSelect = getByTestId('payment-method-select');
    fireEvent.press(paymentMethodSelect);

    // Should show payment options
    expect(getByText('Credit Card')).toBeTruthy();
    expect(getByText('PayPal')).toBeTruthy();
    expect(getByText('Apple Pay')).toBeTruthy();

    // Select PayPal
    const paypalOption = getByText('PayPal');
    fireEvent.press(paypalOption);

    await waitFor(() => {
      expect(getByTestId('selected-payment-method')).toBeTruthy();
    });
  });

  it('should handle address selection and validation', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <CheckoutScreen />
      </AllProviders>
    );

    const addressSelect = getByTestId('address-select');
    fireEvent.press(addressSelect);

    // Should show address options
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Work')).toBeTruthy();
    expect(getByText('Add New Address')).toBeTruthy();

    // Select home address
    const homeAddress = getByText('Home');
    fireEvent.press(homeAddress);

    await waitFor(() => {
      expect(getByTestId('selected-address')).toBeTruthy();
    });
  });

  it('should show order summary correctly', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <CheckoutScreen />
      </AllProviders>
    );

    // Order summary should show items
    const orderSummary = getByTestId('order-summary');
    expect(orderSummary).toBeTruthy();

    // Should show restaurant name
    expect(getByText(mockRestaurants[0].name)).toBeTruthy();

    // Should show estimated delivery time
    expect(getByText(/Estimated delivery:/)).toBeTruthy();
  });

  it('should handle order placement with confirmation', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <CheckoutScreen />
      </AllProviders>
    );

    // Fill required fields
    const addressSelect = getByTestId('address-select');
    fireEvent.press(addressSelect);
    fireEvent.press(getByText('Home'));

    const paymentSelect = getByTestId('payment-method-select');
    fireEvent.press(paymentSelect);
    fireEvent.press(getByText('Credit Card'));

    // Place order
    const placeOrderButton = getByText('Place Order');
    fireEvent.press(placeOrderButton);

    // Should show confirmation modal
    await waitFor(() => {
      expect(getByText('Confirm Order')).toBeTruthy();
      expect(getByText('Are you sure you want to place this order?')).toBeTruthy();
    });

    // Confirm order
    const confirmButton = getByText('Confirm');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/tracking');
    });
  });

  it('should handle checkout cancellation', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <CheckoutScreen />
      </AllProviders>
    );

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(router.back).toHaveBeenCalled();
    });
  });

  it('should persist cart state across navigation', async () => {
    // This test would verify that cart state is maintained
    // when navigating between screens
    const { rerender } = render(
      <AllProviders>
        <RestaurantScreen />
      </AllProviders>
    );

    // Add item to cart
    // Navigate away and back
    // Verify cart still contains items

    rerender(
      <AllProviders>
        <CartScreen />
      </AllProviders>
    );

    // Cart should still have items from previous interaction
    // This would be verified through the context state
  });
});