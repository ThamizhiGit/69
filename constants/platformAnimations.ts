import { Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { PlatformService } from '../services/platformService';

// Platform-specific animation configurations
export const platformAnimationConfig = {
  // iOS-specific animations (smooth and fluid)
  ios: {
    durations: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      default: Easing.bezier(0.4, 0, 0.2, 1), // iOS standard easing
      spring: Easing.elastic(1.1),
      bounce: Easing.bounce,
    },
    spring: {
      gentle: {
        damping: 12,
        stiffness: 180,
        mass: 0.8,
      },
      bouncy: {
        damping: 8,
        stiffness: 220,
        mass: 0.6,
      },
      snappy: {
        damping: 18,
        stiffness: 350,
        mass: 0.4,
      },
    },
    transforms: {
      scale: {
        pressed: 0.96,
        hover: 1.04,
      },
      translate: {
        slideDistance: 25,
      },
    },
  },

  // Android-specific animations (material design)
  android: {
    durations: {
      fast: 150,
      normal: 250,
      slow: 400,
    },
    easing: {
      default: Easing.bezier(0.4, 0, 0.6, 1), // Material design standard
      spring: Easing.elastic(1.0),
      bounce: Easing.bounce,
    },
    spring: {
      gentle: {
        damping: 15,
        stiffness: 200,
        mass: 1.0,
      },
      bouncy: {
        damping: 10,
        stiffness: 250,
        mass: 0.8,
      },
      snappy: {
        damping: 20,
        stiffness: 400,
        mass: 0.5,
      },
    },
    transforms: {
      scale: {
        pressed: 0.94,
        hover: 1.06,
      },
      translate: {
        slideDistance: 30,
      },
    },
  },

  // Web-specific animations (reduced for performance)
  web: {
    durations: {
      fast: 100,
      normal: 200,
      slow: 300,
    },
    easing: {
      default: Easing.bezier(0.25, 0.1, 0.25, 1), // CSS ease-out equivalent
      spring: Easing.out(Easing.quad),
      bounce: Easing.bounce,
    },
    spring: {
      gentle: {
        damping: 20,
        stiffness: 150,
        mass: 1.2,
      },
      bouncy: {
        damping: 15,
        stiffness: 200,
        mass: 1.0,
      },
      snappy: {
        damping: 25,
        stiffness: 300,
        mass: 0.8,
      },
    },
    transforms: {
      scale: {
        pressed: 0.98,
        hover: 1.02,
      },
      translate: {
        slideDistance: 20,
      },
    },
  },
};

// Get platform-specific animation configuration
export const getPlatformAnimationConfig = () => {
  const platform = Platform.OS as keyof typeof platformAnimationConfig;
  return platformAnimationConfig[platform] || platformAnimationConfig.android;
};

// Responsive animation configurations based on screen size
export const responsiveAnimationConfig = {
  small: {
    durationMultiplier: 0.8,
    scaleMultiplier: 0.9,
    translateMultiplier: 0.8,
  },
  medium: {
    durationMultiplier: 1.0,
    scaleMultiplier: 1.0,
    translateMultiplier: 1.0,
  },
  large: {
    durationMultiplier: 1.1,
    scaleMultiplier: 1.1,
    translateMultiplier: 1.2,
  },
  xlarge: {
    durationMultiplier: 1.2,
    scaleMultiplier: 1.2,
    translateMultiplier: 1.4,
  },
};

// Get responsive animation configuration
export const getResponsiveAnimationConfig = () => {
  const screenInfo = PlatformService.getScreenInfo();
  return responsiveAnimationConfig[screenInfo.size] || responsiveAnimationConfig.medium;
};

// Device-specific optimizations
export const deviceOptimizations = {
  phone: {
    maxConcurrentAnimations: 3,
    preferNativeDriver: true,
    reduceComplexAnimations: false,
  },
  tablet: {
    maxConcurrentAnimations: 6,
    preferNativeDriver: true,
    reduceComplexAnimations: false,
  },
  desktop: {
    maxConcurrentAnimations: 8,
    preferNativeDriver: false, // Web doesn't support native driver
    reduceComplexAnimations: true, // Reduce for web performance
  },
};

// Get device-specific optimizations
export const getDeviceOptimizations = () => {
  const screenInfo = PlatformService.getScreenInfo();
  return deviceOptimizations[screenInfo.deviceType] || deviceOptimizations.phone;
};

// Combined configuration factory
export const createOptimizedAnimationConfig = (baseConfig: any = {}) => {
  const platformConfig = getPlatformAnimationConfig();
  const responsiveConfig = getResponsiveAnimationConfig();
  const deviceConfig = getDeviceOptimizations();
  const performanceConfig = PlatformService.getPerformanceConfig();

  // Apply platform-specific defaults
  let config = {
    ...platformConfig.spring.gentle,
    ...baseConfig,
  };

  // Apply responsive multipliers
  if (config.duration) {
    config.duration = Math.round(config.duration * responsiveConfig.durationMultiplier);
  }

  // Apply performance optimizations
  if (performanceConfig.frameRate === 30) {
    // Reduce animation complexity for 30fps devices
    config.damping = Math.max(config.damping * 1.5, 20);
    config.stiffness = Math.min(config.stiffness * 0.8, 200);
  }

  // Apply device-specific optimizations
  config.useNativeDriver = deviceConfig.preferNativeDriver && baseConfig.useNativeDriver !== false;

  return config;
};

// Predefined optimized animation presets
export const optimizedAnimationPresets = {
  // Button press animation
  buttonPress: () => createOptimizedAnimationConfig({
    damping: 20,
    stiffness: 400,
    mass: 0.5,
  }),

  // Modal entrance animation
  modalEntrance: () => createOptimizedAnimationConfig({
    damping: 15,
    stiffness: 250,
    mass: 0.8,
  }),

  // Card hover animation
  cardHover: () => createOptimizedAnimationConfig({
    damping: 25,
    stiffness: 300,
    mass: 0.6,
  }),

  // List item animation
  listItem: () => createOptimizedAnimationConfig({
    duration: 200,
    useNativeDriver: true,
  }),

  // Loading animation
  loading: () => createOptimizedAnimationConfig({
    duration: 1000,
    useNativeDriver: true,
  }),

  // Page transition
  pageTransition: () => createOptimizedAnimationConfig({
    damping: 18,
    stiffness: 200,
    mass: 1.0,
  }),
};

// Platform-specific glass effect configurations
export const platformGlassConfig = {
  ios: {
    blurIntensity: 25,
    borderRadius: 16,
    borderWidth: 0.5,
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  android: {
    blurIntensity: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  web: {
    blurIntensity: 0, // No blur on web
    borderRadius: 8,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fallback for web
  },
};

// Get platform-specific glass configuration
export const getPlatformGlassConfig = () => {
  const platform = Platform.OS as keyof typeof platformGlassConfig;
  const baseConfig = platformGlassConfig[platform] || platformGlassConfig.android;
  
  // Apply responsive adjustments
  const responsiveConfig = getResponsiveAnimationConfig();
  
  return {
    ...baseConfig,
    borderRadius: Math.round(baseConfig.borderRadius * responsiveConfig.scaleMultiplier),
  };
};

// Performance-aware animation factory
export const createPerformanceAwareAnimation = (
  animationType: 'spring' | 'timing',
  config: any = {},
  priority: 'low' | 'medium' | 'high' = 'medium'
) => {
  const optimizedConfig = createOptimizedAnimationConfig(config);
  const deviceConfig = getDeviceOptimizations();
  
  // Skip low priority animations if we're at capacity
  if (priority === 'low' && deviceConfig.reduceComplexAnimations) {
    return null;
  }
  
  return optimizedConfig;
};