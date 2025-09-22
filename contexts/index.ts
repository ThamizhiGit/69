// Context providers and hooks
export { AppProvider, useApp } from './AppContext';
export { CartProvider, useCart } from './CartContext';
export { UserProvider, useUser } from './UserContext';
export { OrderProvider, useOrder } from './OrderContext';

// Glass theme context for UI consistency
export { GlassThemeProvider, useGlassTheme, useGlassConfig, useThemeColors } from './GlassThemeContext';

// Combined provider component
import React from 'react';
import { AppProvider } from './AppContext';
import { CartProvider } from './CartContext';
import { UserProvider } from './UserContext';
import { OrderProvider } from './OrderContext';
import { GlassThemeProvider } from './GlassThemeContext';

interface AllProvidersProps {
  children: React.ReactNode;
}

export const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return React.createElement(
    GlassThemeProvider,
    null,
    React.createElement(
      AppProvider,
      null,
      React.createElement(
        UserProvider,
        null,
        React.createElement(
          CartProvider,
          null,
          React.createElement(
            OrderProvider,
            null,
            children
          )
        )
      )
    )
  );
};