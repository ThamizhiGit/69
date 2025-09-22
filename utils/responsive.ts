import React from 'react';
import { Dimensions, PixelRatio } from 'react-native';
import { PlatformService } from '../services/platformService';

// Responsive design utilities
export class ResponsiveUtils {
  private static baseWidth = 375; // iPhone 6/7/8 width as base
  private static baseHeight = 667; // iPhone 6/7/8 height as base

  // Get current screen dimensions
  static getScreenDimensions() {
    return Dimensions.get('window');
  }

  // Get screen scale factor
  static getScale() {
    return PixelRatio.get();
  }

  // Convert design pixels to responsive pixels
  static wp(percentage: number): number {
    const { width } = this.getScreenDimensions();
    return (percentage * width) / 100;
  }

  static hp(percentage: number): number {
    const { height } = this.getScreenDimensions();
    return (percentage * height) / 100;
  }

  // Scale based on screen width (responsive width)
  static rw(size: number): number {
    const { width } = this.getScreenDimensions();
    return (size * width) / this.baseWidth;
  }

  // Scale based on screen height (responsive height)
  static rh(size: number): number {
    const { height } = this.getScreenDimensions();
    return (size * height) / this.baseHeight;
  }

  // Responsive font size
  static rf(size: number): number {
    const { width } = this.getScreenDimensions();
    const scale = width / this.baseWidth;
    const newSize = size * scale;
    
    // Limit font scaling to prevent too large or too small fonts
    return Math.max(12, Math.min(newSize, size * 1.3));
  }

  // Responsive spacing (margins, padding)
  static rs(size: number): number {
    const screenInfo = PlatformService.getScreenInfo();
    
    switch (screenInfo.size) {
      case 'small':
        return size * 0.8;
      case 'medium':
        return size;
      case 'large':
        return size * 1.2;
      case 'xlarge':
        return size * 1.4;
      default:
        return size;
    }
  }

  // Responsive border radius
  static rbr(radius: number): number {
    const screenInfo = PlatformService.getScreenInfo();
    
    switch (screenInfo.size) {
      case 'small':
        return Math.max(4, radius * 0.8);
      case 'medium':
        return radius;
      case 'large':
        return radius * 1.1;
      case 'xlarge':
        return radius * 1.2;
      default:
        return radius;
    }
  }

  // Get responsive value based on breakpoints
  static getResponsiveValue<T>(values: {
    xs?: T; // < 375px
    sm?: T; // 375px - 414px
    md?: T; // 414px - 768px
    lg?: T; // 768px - 1024px
    xl?: T; // > 1024px
    default: T;
  }): T {
    const { width } = this.getScreenDimensions();
    
    if (width < 375 && values.xs !== undefined) return values.xs;
    if (width < 414 && values.sm !== undefined) return values.sm;
    if (width < 768 && values.md !== undefined) return values.md;
    if (width < 1024 && values.lg !== undefined) return values.lg;
    if (width >= 1024 && values.xl !== undefined) return values.xl;
    
    return values.default;
  }

  // Check if screen is in landscape mode
  static isLandscape(): boolean {
    const { width, height } = this.getScreenDimensions();
    return width > height;
  }

  // Check if screen is in portrait mode
  static isPortrait(): boolean {
    return !this.isLandscape();
  }

  // Get safe area insets (mock implementation)
  static getSafeAreaInsets() {
    return PlatformService.getUIConfig().safeAreaInsets;
  }

  // Calculate grid columns based on screen size
  static getGridColumns(minItemWidth: number = 150): number {
    const { width } = this.getScreenDimensions();
    const availableWidth = width - 32; // Account for padding
    return Math.floor(availableWidth / minItemWidth);
  }

  // Get optimal image size for screen
  static getOptimalImageSize(aspectRatio: number = 1): { width: number; height: number } {
    const { width } = this.getScreenDimensions();
    const screenInfo = PlatformService.getScreenInfo();
    
    let imageWidth: number;
    
    switch (screenInfo.size) {
      case 'small':
        imageWidth = width * 0.8;
        break;
      case 'medium':
        imageWidth = width * 0.85;
        break;
      case 'large':
        imageWidth = width * 0.9;
        break;
      case 'xlarge':
        imageWidth = Math.min(width * 0.7, 600);
        break;
      default:
        imageWidth = width * 0.85;
    }
    
    return {
      width: imageWidth,
      height: imageWidth / aspectRatio,
    };
  }

  // Get responsive card dimensions
  static getCardDimensions(): { width: number; height: number; margin: number } {
    const screenInfo = PlatformService.getScreenInfo();
    const { width } = this.getScreenDimensions();
    
    if (screenInfo.deviceType === 'tablet') {
      const columns = this.getGridColumns(200);
      const cardWidth = (width - 48 - (columns - 1) * 16) / columns;
      
      return {
        width: cardWidth,
        height: cardWidth * 1.2,
        margin: 8,
      };
    }
    
    // Phone layout
    return {
      width: width - 32,
      height: (width - 32) * 0.6,
      margin: 16,
    };
  }

  // Get responsive button dimensions
  static getButtonDimensions(size: 'small' | 'medium' | 'large' = 'medium'): {
    height: number;
    paddingHorizontal: number;
    fontSize: number;
  } {
    const screenInfo = PlatformService.getScreenInfo();
    
    const baseSizes = {
      small: { height: 36, paddingHorizontal: 16, fontSize: 14 },
      medium: { height: 44, paddingHorizontal: 20, fontSize: 16 },
      large: { height: 52, paddingHorizontal: 24, fontSize: 18 },
    };
    
    const baseSize = baseSizes[size];
    
    switch (screenInfo.size) {
      case 'small':
        return {
          height: baseSize.height * 0.9,
          paddingHorizontal: baseSize.paddingHorizontal * 0.8,
          fontSize: baseSize.fontSize * 0.9,
        };
      case 'large':
        return {
          height: baseSize.height * 1.1,
          paddingHorizontal: baseSize.paddingHorizontal * 1.2,
          fontSize: baseSize.fontSize * 1.1,
        };
      case 'xlarge':
        return {
          height: baseSize.height * 1.2,
          paddingHorizontal: baseSize.paddingHorizontal * 1.4,
          fontSize: baseSize.fontSize * 1.2,
        };
      default:
        return baseSize;
    }
  }

  // Get responsive modal dimensions
  static getModalDimensions(): { width: number; height: number; maxWidth: number; maxHeight: number } {
    const { width, height } = this.getScreenDimensions();
    const screenInfo = PlatformService.getScreenInfo();
    
    if (screenInfo.deviceType === 'tablet') {
      return {
        width: Math.min(width * 0.7, 600),
        height: Math.min(height * 0.8, 800),
        maxWidth: 600,
        maxHeight: 800,
      };
    }
    
    // Phone - use most of the screen
    return {
      width: width * 0.9,
      height: height * 0.85,
      maxWidth: width,
      maxHeight: height,
    };
  }

  // Get responsive navigation dimensions
  static getNavigationDimensions(): {
    tabBarHeight: number;
    headerHeight: number;
    iconSize: number;
  } {
    const screenInfo = PlatformService.getScreenInfo();
    
    switch (screenInfo.size) {
      case 'small':
        return {
          tabBarHeight: 60,
          headerHeight: 44,
          iconSize: 20,
        };
      case 'large':
        return {
          tabBarHeight: 70,
          headerHeight: 56,
          iconSize: 26,
        };
      case 'xlarge':
        return {
          tabBarHeight: 80,
          headerHeight: 64,
          iconSize: 28,
        };
      default:
        return {
          tabBarHeight: 65,
          headerHeight: 50,
          iconSize: 24,
        };
    }
  }
}

// React hooks for responsive design
export const useResponsiveDimensions = () => {
  const [dimensions, setDimensions] = React.useState(() => Dimensions.get('window'));
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  return dimensions;
};

export const useResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}) => {
  const dimensions = useResponsiveDimensions();
  
  return React.useMemo(() => {
    return ResponsiveUtils.getResponsiveValue(values);
  }, [dimensions, values]);
};

export const useScreenInfo = () => {
  const dimensions = useResponsiveDimensions();
  
  return React.useMemo(() => {
    return PlatformService.getScreenInfo();
  }, [dimensions]);
};

export const useIsLandscape = () => {
  const dimensions = useResponsiveDimensions();
  
  return React.useMemo(() => {
    return ResponsiveUtils.isLandscape();
  }, [dimensions]);
};

export const useGridColumns = (minItemWidth: number = 150) => {
  const dimensions = useResponsiveDimensions();
  
  return React.useMemo(() => {
    return ResponsiveUtils.getGridColumns(minItemWidth);
  }, [dimensions, minItemWidth]);
};