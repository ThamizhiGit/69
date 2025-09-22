import React from 'react';
import { Platform, Dimensions, PixelRatio } from 'react-native';

// Platform-specific configuration interface
export interface PlatformConfig {
  animations: {
    useNativeDriver: boolean;
    reducedMotion: boolean;
    springConfig: any;
    timingConfig: any;
  };
  glass: {
    blurIntensity: number;
    borderRadius: number;
    shadowConfig: any;
  };
  performance: {
    maxConcurrentAnimations: number;
    frameRate: number;
    memoryThreshold: number;
  };
  ui: {
    statusBarHeight: number;
    navigationBarHeight: number;
    safeAreaInsets: any;
  };
}

// Screen size categories
export type ScreenSize = 'small' | 'medium' | 'large' | 'xlarge';
export type DeviceType = 'phone' | 'tablet' | 'desktop';

// Platform detection and configuration
export class PlatformService {
  private static config: PlatformConfig | null = null;
  private static screenInfo: {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
    size: ScreenSize;
    deviceType: DeviceType;
  } | null = null;

  static getConfig(): PlatformConfig {
    if (this.config) {
      return this.config;
    }

    const screenInfo = this.getScreenInfo();
    const isLowEnd = this.isLowEndDevice();

    this.config = {
      animations: {
        useNativeDriver: Platform.OS !== 'web',
        reducedMotion: isLowEnd || this.shouldReduceMotion(),
        springConfig: this.getOptimizedSpringConfig(),
        timingConfig: this.getOptimizedTimingConfig(),
      },
      glass: {
        blurIntensity: this.getOptimalBlurIntensity(),
        borderRadius: this.getOptimalBorderRadius(),
        shadowConfig: this.getOptimalShadowConfig(),
      },
      performance: {
        maxConcurrentAnimations: this.getMaxAnimations(),
        frameRate: isLowEnd ? 30 : 60,
        memoryThreshold: screenInfo.deviceType === 'tablet' ? 300 : 200,
      },
      ui: {
        statusBarHeight: this.getStatusBarHeight(),
        navigationBarHeight: this.getNavigationBarHeight(),
        safeAreaInsets: this.getSafeAreaInsets(),
      },
    };

    return this.config;
  }

  static getScreenInfo() {
    if (this.screenInfo) {
      return this.screenInfo;
    }

    const { width, height } = Dimensions.get('window');
    const scale = PixelRatio.get();
    const fontScale = PixelRatio.getFontScale();

    // Determine screen size category
    const screenSize = this.categorizeScreenSize(width, height);
    const deviceType = this.determineDeviceType(width, height);

    this.screenInfo = {
      width,
      height,
      scale,
      fontScale,
      size: screenSize,
      deviceType,
    };

    return this.screenInfo;
  }

  private static categorizeScreenSize(width: number, height: number): ScreenSize {
    const minDimension = Math.min(width, height);
    
    if (minDimension < 375) return 'small';
    if (minDimension < 414) return 'medium';
    if (minDimension < 768) return 'large';
    return 'xlarge';
  }

  private static determineDeviceType(width: number, height: number): DeviceType {
    const minDimension = Math.min(width, height);
    
    if (Platform.OS === 'web') return 'desktop';
    if (minDimension >= 768) return 'tablet';
    return 'phone';
  }

  private static isLowEndDevice(): boolean {
    if (Platform.OS === 'android') {
      const androidVersion = Platform.Version as number;
      if (androidVersion < 23) return true; // Android 6.0 and below
    }

    const { width, height, scale } = Dimensions.get('window');
    const totalPixels = width * height * scale * scale;
    
    // Consider devices with less than 2M total pixels as low-end
    return totalPixels < 2000000;
  }

  private static shouldReduceMotion(): boolean {
    // This would integrate with system accessibility settings
    // For now, we'll use device performance as a proxy
    return this.isLowEndDevice();
  }

  private static getOptimizedSpringConfig() {
    const isLowEnd = this.isLowEndDevice();
    
    return {
      damping: isLowEnd ? 25 : 15,
      stiffness: isLowEnd ? 200 : 300,
      mass: isLowEnd ? 1.2 : 1,
      overshootClamping: isLowEnd,
      restDisplacementThreshold: isLowEnd ? 0.1 : 0.01,
      restSpeedThreshold: isLowEnd ? 2 : 0.2,
    };
  }

  private static getOptimizedTimingConfig() {
    const isLowEnd = this.isLowEndDevice();
    
    return {
      duration: isLowEnd ? 200 : 300,
      useNativeDriver: Platform.OS !== 'web',
    };
  }

  private static getOptimalBlurIntensity(): number {
    if (Platform.OS === 'web') return 0; // No blur on web
    if (this.isLowEndDevice()) return 10;
    if (Platform.OS === 'ios') return 25;
    return 20; // Android
  }

  private static getOptimalBorderRadius(): number {
    const screenInfo = this.getScreenInfo();
    
    switch (screenInfo.size) {
      case 'small': return 12;
      case 'medium': return 16;
      case 'large': return 20;
      case 'xlarge': return 24;
      default: return 16;
    }
  }

  private static getOptimalShadowConfig() {
    const isLowEnd = this.isLowEndDevice();
    
    if (Platform.OS === 'web' || isLowEnd) {
      return {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      };
    }

    if (Platform.OS === 'ios') {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      };
    }

    // Android
    return {
      elevation: 8,
      shadowColor: '#000',
    };
  }

  private static getMaxAnimations(): number {
    const screenInfo = this.getScreenInfo();
    const isLowEnd = this.isLowEndDevice();
    
    if (isLowEnd) return 2;
    if (screenInfo.deviceType === 'tablet') return 8;
    return 5;
  }

  private static getStatusBarHeight(): number {
    if (Platform.OS === 'ios') {
      const { height } = Dimensions.get('window');
      // iPhone X and newer have taller status bars
      return height >= 812 ? 44 : 20;
    }
    
    if (Platform.OS === 'android') {
      return 24; // Standard Android status bar
    }
    
    return 0; // Web
  }

  private static getNavigationBarHeight(): number {
    const screenInfo = this.getScreenInfo();
    
    if (screenInfo.deviceType === 'tablet') return 60;
    return 50;
  }

  private static getSafeAreaInsets() {
    // This would typically come from react-native-safe-area-context
    // For now, we'll provide defaults based on platform
    if (Platform.OS === 'ios') {
      const { height } = Dimensions.get('window');
      const hasNotch = height >= 812;
      
      return {
        top: hasNotch ? 44 : 20,
        bottom: hasNotch ? 34 : 0,
        left: 0,
        right: 0,
      };
    }
    
    return {
      top: 24,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }

  // Responsive design utilities
  static getResponsiveValue<T>(values: {
    small?: T;
    medium?: T;
    large?: T;
    xlarge?: T;
    default: T;
  }): T {
    const screenInfo = this.getScreenInfo();
    return values[screenInfo.size] || values.default;
  }

  static getDeviceSpecificValue<T>(values: {
    phone?: T;
    tablet?: T;
    desktop?: T;
    default: T;
  }): T {
    const screenInfo = this.getScreenInfo();
    return values[screenInfo.deviceType] || values.default;
  }

  static getPlatformSpecificValue<T>(values: {
    ios?: T;
    android?: T;
    web?: T;
    default: T;
  }): T {
    return values[Platform.OS as keyof typeof values] || values.default;
  }

  // Animation configuration helpers
  static getAnimationConfig(baseConfig: any) {
    const config = this.getConfig();
    
    if (config.animations.reducedMotion) {
      return {
        ...baseConfig,
        duration: Math.min(baseConfig.duration * 0.5, 150),
        useNativeDriver: config.animations.useNativeDriver,
      };
    }
    
    return {
      ...baseConfig,
      useNativeDriver: config.animations.useNativeDriver,
    };
  }

  static getSpringConfig(baseConfig: any = {}) {
    const config = this.getConfig();
    
    return {
      ...config.animations.springConfig,
      ...baseConfig,
    };
  }

  static getTimingConfig(baseConfig: any = {}) {
    const config = this.getConfig();
    
    return {
      ...config.animations.timingConfig,
      ...baseConfig,
    };
  }

  // Glass effect configuration
  static getGlassConfig() {
    return this.getConfig().glass;
  }

  // Performance configuration
  static getPerformanceConfig() {
    return this.getConfig().performance;
  }

  // UI configuration
  static getUIConfig() {
    return this.getConfig().ui;
  }

  // Utility methods
  static isTablet(): boolean {
    return this.getScreenInfo().deviceType === 'tablet';
  }

  static isPhone(): boolean {
    return this.getScreenInfo().deviceType === 'phone';
  }

  static isWeb(): boolean {
    return Platform.OS === 'web';
  }

  static isIOS(): boolean {
    return Platform.OS === 'ios';
  }

  static isAndroid(): boolean {
    return Platform.OS === 'android';
  }

  static shouldUseReducedMotion(): boolean {
    return this.getConfig().animations.reducedMotion;
  }

  static shouldUseBlur(): boolean {
    return this.getConfig().glass.blurIntensity > 0;
  }

  // Reset configuration (useful for testing or when screen orientation changes)
  static resetConfig() {
    this.config = null;
    this.screenInfo = null;
  }
}

// React hooks for platform-aware components
export const usePlatformConfig = () => {
  return PlatformService.getConfig();
};

export const useScreenInfo = () => {
  return PlatformService.getScreenInfo();
};

export const useResponsiveValue = <T>(values: {
  small?: T;
  medium?: T;
  large?: T;
  xlarge?: T;
  default: T;
}) => {
  return PlatformService.getResponsiveValue(values);
};

export const useDeviceSpecificValue = <T>(values: {
  phone?: T;
  tablet?: T;
  desktop?: T;
  default: T;
}) => {
  return PlatformService.getDeviceSpecificValue(values);
};

export const usePlatformSpecificValue = <T>(values: {
  ios?: T;
  android?: T;
  web?: T;
  default: T;
}) => {
  return PlatformService.getPlatformSpecificValue(values);
};

// Responsive dimensions hook
export const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = React.useState(() => Dimensions.get('window'));
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      // Reset platform config when dimensions change (orientation change)
      PlatformService.resetConfig();
    });
    
    return () => subscription?.remove();
  }, []);
  
  return dimensions;
};

// Platform-aware animation hook
export const usePlatformAnimation = (baseConfig: any) => {
  return React.useMemo(() => {
    return PlatformService.getAnimationConfig(baseConfig);
  }, [baseConfig]);
};