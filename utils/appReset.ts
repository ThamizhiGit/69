import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockDataService } from '../services/mockData';
import { demoDataService } from '../services/demoDataService';
import { hapticFeedback } from './hapticFeedback';

// Comprehensive app reset utility for demo purposes
export class AppReset {
  // Storage keys used by the app
  private static readonly STORAGE_KEYS = [
    'user_data',
    'cart_data',
    'order_history',
    'user_preferences',
    'saved_addresses',
    'payment_methods',
    'app_settings',
    'onboarding_completed',
    'demo_mode',
    'last_location',
    'search_history',
    'favorite_restaurants',
    'notification_settings',
  ];

  // Reset all app data to initial state
  static async resetAllData(): Promise<void> {
    try {
      // Clear AsyncStorage
      await this.clearAsyncStorage();
      
      // Reset mock data service
      mockDataService.resetData();
      
      // Reset demo data service
      demoDataService.resetToDefault();
      
      // Provide haptic feedback
      hapticFeedback.orderConfirmed();
      
      console.log('App data reset completed successfully');
    } catch (error) {
      console.error('Error resetting app data:', error);
      hapticFeedback.errorOccurred();
      throw error;
    }
  }

  // Clear AsyncStorage
  static async clearAsyncStorage(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(this.STORAGE_KEYS);
      console.log('AsyncStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw error;
    }
  }

  // Reset only user data (keep app settings)
  static async resetUserData(): Promise<void> {
    try {
      const userDataKeys = [
        'user_data',
        'cart_data',
        'order_history',
        'saved_addresses',
        'payment_methods',
        'search_history',
        'favorite_restaurants',
      ];
      
      await AsyncStorage.multiRemove(userDataKeys);
      mockDataService.resetData();
      
      hapticFeedback.buttonPress();
      console.log('User data reset completed');
    } catch (error) {
      console.error('Error resetting user data:', error);
      hapticFeedback.errorOccurred();
      throw error;
    }
  }

  // Reset only cart data
  static async resetCart(): Promise<void> {
    try {
      await AsyncStorage.removeItem('cart_data');
      mockDataService.clearCart();
      
      hapticFeedback.removeFromCart();
      console.log('Cart reset completed');
    } catch (error) {
      console.error('Error resetting cart:', error);
      hapticFeedback.errorOccurred();
      throw error;
    }
  }

  // Reset app to onboarding state
  static async resetToOnboarding(): Promise<void> {
    try {
      await this.resetAllData();
      await AsyncStorage.removeItem('onboarding_completed');
      
      hapticFeedback.orderConfirmed();
      console.log('App reset to onboarding state');
    } catch (error) {
      console.error('Error resetting to onboarding:', error);
      hapticFeedback.errorOccurred();
      throw error;
    }
  }

  // Get current storage usage
  static async getStorageInfo(): Promise<{
    keys: string[];
    totalSize: number;
    itemCount: number;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(key => 
        this.STORAGE_KEYS.some(storageKey => key.includes(storageKey))
      );
      
      let totalSize = 0;
      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return {
        keys: appKeys,
        totalSize,
        itemCount: appKeys.length,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        keys: [],
        totalSize: 0,
        itemCount: 0,
      };
    }
  }

  // Export app data for backup
  static async exportAppData(): Promise<string> {
    try {
      const user = mockDataService.getUser();
      const orders = mockDataService.getOrders();
      const cart = mockDataService.getCart();
      const restaurants = mockDataService.getRestaurants();
      
      const exportData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          user,
          orders,
          cart,
          restaurants: restaurants.slice(0, 3), // Export only first 3 for demo
        },
        demoMode: demoDataService.isDemoMode(),
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting app data:', error);
      throw error;
    }
  }

  // Import app data from backup
  static async importAppData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.data) {
        throw new Error('Invalid import data format');
      }
      
      // Reset current data
      await this.resetAllData();
      
      // Import user data
      if (importData.data.user) {
        mockDataService.updateUser(importData.data.user);
      }
      
      // Import orders
      if (importData.data.orders) {
        importData.data.orders.forEach((order: any) => {
          mockDataService.createOrder(order);
        });
      }
      
      // Import cart
      if (importData.data.cart) {
        importData.data.cart.forEach((item: any) => {
          mockDataService.addToCart(item);
        });
      }
      
      // Set demo mode
      if (importData.demoMode) {
        demoDataService.setDemoMode(true);
      }
      
      hapticFeedback.orderConfirmed();
      console.log('App data imported successfully');
    } catch (error) {
      console.error('Error importing app data:', error);
      hapticFeedback.errorOccurred();
      throw error;
    }
  }

  // Quick reset options for demo
  static getDemoResetOptions() {
    return [
      {
        id: 'full',
        title: 'Full Reset',
        description: 'Reset everything including onboarding',
        icon: '🔄',
        action: () => this.resetToOnboarding(),
      },
      {
        id: 'user',
        title: 'User Data Only',
        description: 'Reset user data but keep app settings',
        icon: '👤',
        action: () => this.resetUserData(),
      },
      {
        id: 'cart',
        title: 'Cart Only',
        description: 'Clear shopping cart',
        icon: '🛒',
        action: () => this.resetCart(),
      },
      {
        id: 'demo',
        title: 'Demo Mode Off',
        description: 'Exit demo mode and use default data',
        icon: '🎮',
        action: () => demoDataService.resetToDefault(),
      },
    ];
  }

  // Validate app state
  static async validateAppState(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    try {
      // Check user data
      const user = mockDataService.getUser();
      if (!user.id) {
        issues.push('User ID is missing');
        recommendations.push('Reset user data');
      }
      
      // Check cart consistency
      const cart = mockDataService.getCart();
      const cartTotal = mockDataService.getCartTotal();
      const calculatedTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
      
      if (Math.abs(cartTotal - calculatedTotal) > 0.01) {
        issues.push('Cart total calculation mismatch');
        recommendations.push('Reset cart data');
      }
      
      // Check storage
      const storageInfo = await this.getStorageInfo();
      if (storageInfo.totalSize > 1024 * 1024) { // 1MB
        issues.push('Storage usage is high');
        recommendations.push('Clear old data');
      }
      
      return {
        isValid: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error) {
      return {
        isValid: false,
        issues: ['Error validating app state'],
        recommendations: ['Perform full reset'],
      };
    }
  }
}

// Convenience functions
export const resetApp = AppReset.resetAllData;
export const resetUserData = AppReset.resetUserData;
export const resetCart = AppReset.resetCart;
export const resetToOnboarding = AppReset.resetToOnboarding;