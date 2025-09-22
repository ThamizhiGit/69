import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Standardized haptic feedback patterns for consistent UX
export class HapticFeedback {
  // Light feedback for subtle interactions
  static light() {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Android fallback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  // Medium feedback for standard interactions
  static medium() {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Heavy feedback for important interactions
  static heavy() {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  // Success feedback
  static success() {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Android fallback to medium impact
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Warning feedback
  static warning() {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      // Android fallback to heavy impact
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  // Error feedback
  static error() {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      // Android fallback to heavy impact
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  // Selection feedback for UI interactions
  static selection() {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    } else {
      // Android fallback to light impact
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }
}

// Convenience functions for common UI interactions
export const hapticFeedback = {
  // Button press feedback
  buttonPress: () => HapticFeedback.light(),
  
  // Card tap feedback
  cardTap: () => HapticFeedback.light(),
  
  // Toggle switch feedback
  toggle: () => HapticFeedback.selection(),
  
  // Add to cart feedback
  addToCart: () => HapticFeedback.medium(),
  
  // Remove from cart feedback
  removeFromCart: () => HapticFeedback.warning(),
  
  // Order confirmation feedback
  orderConfirmed: () => HapticFeedback.success(),
  
  // Error occurred feedback
  errorOccurred: () => HapticFeedback.error(),
  
  // Navigation feedback
  navigate: () => HapticFeedback.light(),
  
  // Swipe action feedback
  swipeAction: () => HapticFeedback.medium(),
  
  // Pull to refresh feedback
  pullToRefresh: () => HapticFeedback.light(),
  
  // Long press feedback
  longPress: () => HapticFeedback.heavy(),
};