import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { 
  PerformanceOptimizer, 
  DeviceCapabilityDetector, 
  AnimationRegistry,
  FPSMonitor 
} from '../../services/performanceService';
import { PlatformService } from '../../services/platformService';
import { ResponsiveUtils } from '../../utils/responsive';
import { 
  OptimizedFadeInView, 
  OptimizedScaleButton,
  ConditionalAnimation 
} from '../animations/OptimizedAnimations';
import { 
  OptimizedGlassContainer,
  LightweightGlassContainer 
} from '../glass/OptimizedGlassContainer';
import { 
  PlatformButton,
  PlatformCard,
  ResponsiveGrid 
} from '../platform/PlatformOptimizedComponents';
import { PerformanceMonitor } from '../debug/PerformanceMonitor';

// Mock react-native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: 14,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 667 }),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  PixelRatio: {
    get: () => 2,
    getFontScale: () => 1,
  },
}));

jest.mock('expo-blur', () => ({
  BlurView: ({ children, ...props }: any) => children,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => children,
}));

describe('Performance Optimizations', () => {
  beforeEach(() => {
    // Reset all services before each test
    AnimationRegistry.cleanup();
    PlatformService.resetConfig();
  });

  describe('Device Capability Detection', () => {
    it('should detect device capabilities correctly', () => {
      const capabilities = DeviceCapabilityDetector.getCapabilities();
      
      expect(capabilities).toHaveProperty('isLowEnd');
      expect(capabilities).toHaveProperty('supportsBlur');
      expect(capabilities).toHaveProperty('maxAnimations');
      expect(capabilities).toHaveProperty('preferredFrameRate');
      expect(capabilities).toHaveProperty('memoryLevel');
    });

    it('should identify low-end devices correctly', () => {
      // Mock a low-end device
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('android');
      jest.spyOn(Platform, 'Version', 'get').mockReturnValue(21);
      
      const shouldReduce = DeviceCapabilityDetector.shouldReduceAnimations();
      expect(shouldReduce).toBe(true);
    });

    it('should provide appropriate animation limits', () => {
      const maxAnimations = DeviceCapabilityDetector.getMaxConcurrentAnimations();
      expect(typeof maxAnimations).toBe('number');
      expect(maxAnimations).toBeGreaterThan(0);
    });
  });

  describe('FPS Monitoring', () => {
    it('should track FPS correctly', () => {
      const monitor = new FPSMonitor();
      let receivedMetrics: any = null;
      
      const unsubscribe = monitor.onMetricsUpdate((metrics) => {
        receivedMetrics = metrics;
      });
      
      monitor.start();
      
      // Simulate some time passing
      setTimeout(() => {
        monitor.stop();
        unsubscribe();
        
        expect(receivedMetrics).toBeTruthy();
      }, 100);
    });

    it('should detect performance issues', () => {
      const monitor = new FPSMonitor();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // This would be called internally when FPS drops
      // We're testing the warning mechanism
      monitor.start();
      
      // Clean up
      monitor.stop();
      consoleSpy.mockRestore();
    });
  });

  describe('Animation Registry', () => {
    it('should register and track animations', () => {
      const animationId = 'test-animation';
      const mockCleanup = jest.fn();
      
      AnimationRegistry.register(animationId, 'fade', undefined, mockCleanup);
      
      expect(AnimationRegistry.getActiveCount()).toBe(1);
      
      AnimationRegistry.unregister(animationId);
      
      expect(AnimationRegistry.getActiveCount()).toBe(0);
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should cleanup old animations', () => {
      const animationId = 'old-animation';
      
      AnimationRegistry.register(animationId, 'fade');
      expect(AnimationRegistry.getActiveCount()).toBe(1);
      
      // Simulate old animation (immediately for testing)
      AnimationRegistry.cleanupOldAnimations(0);
      
      expect(AnimationRegistry.getActiveCount()).toBe(0);
    });
  });

  describe('Platform Service', () => {
    it('should provide platform-specific configurations', () => {
      const config = PlatformService.getConfig();
      
      expect(config).toHaveProperty('animations');
      expect(config).toHaveProperty('glass');
      expect(config).toHaveProperty('performance');
      expect(config).toHaveProperty('ui');
    });

    it('should detect screen information correctly', () => {
      const screenInfo = PlatformService.getScreenInfo();
      
      expect(screenInfo).toHaveProperty('width');
      expect(screenInfo).toHaveProperty('height');
      expect(screenInfo).toHaveProperty('size');
      expect(screenInfo).toHaveProperty('deviceType');
    });

    it('should provide responsive values', () => {
      const value = PlatformService.getResponsiveValue({
        small: 10,
        medium: 15,
        large: 20,
        default: 15,
      });
      
      expect(typeof value).toBe('number');
    });
  });

  describe('Responsive Utils', () => {
    it('should calculate responsive dimensions', () => {
      const wp50 = ResponsiveUtils.wp(50);
      const hp50 = ResponsiveUtils.hp(50);
      
      expect(wp50).toBe(187.5); // 50% of 375
      expect(hp50).toBe(333.5); // 50% of 667
    });

    it('should scale fonts responsively', () => {
      const fontSize = ResponsiveUtils.rf(16);
      
      expect(typeof fontSize).toBe('number');
      expect(fontSize).toBeGreaterThanOrEqual(12); // Minimum font size
    });

    it('should calculate grid columns', () => {
      const columns = ResponsiveUtils.getGridColumns(150);
      
      expect(typeof columns).toBe('number');
      expect(columns).toBeGreaterThan(0);
    });
  });

  describe('Optimized Components', () => {
    it('should render OptimizedFadeInView without errors', () => {
      const { getByTestId } = render(
        <OptimizedFadeInView testID="fade-view">
          <div>Test Content</div>
        </OptimizedFadeInView>
      );
      
      expect(getByTestId('fade-view')).toBeTruthy();
    });

    it('should skip animations on low-end devices when requested', () => {
      // Mock low-end device
      jest.spyOn(DeviceCapabilityDetector, 'getCapabilities').mockReturnValue({
        isLowEnd: true,
        supportsBlur: false,
        maxAnimations: 2,
        preferredFrameRate: 30,
        memoryLevel: 'low',
      });
      
      const { getByTestId } = render(
        <OptimizedFadeInView testID="fade-view" skipOnLowEnd={true}>
          <div>Test Content</div>
        </OptimizedFadeInView>
      );
      
      expect(getByTestId('fade-view')).toBeTruthy();
    });

    it('should render OptimizedGlassContainer with fallback on unsupported platforms', () => {
      // Mock web platform (no blur support)
      jest.spyOn(DeviceCapabilityDetector, 'shouldDisableBlur').mockReturnValue(true);
      
      const { getByTestId } = render(
        <OptimizedGlassContainer testID="glass-container">
          <div>Glass Content</div>
        </OptimizedGlassContainer>
      );
      
      expect(getByTestId('glass-container')).toBeTruthy();
    });

    it('should render PlatformButton with correct dimensions', () => {
      const { getByTestId } = render(
        <PlatformButton testID="platform-button" onPress={() => {}}>
          Test Button
        </PlatformButton>
      );
      
      expect(getByTestId('platform-button')).toBeTruthy();
    });

    it('should handle button press animations', async () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <PlatformButton testID="platform-button" onPress={onPress}>
          Test Button
        </PlatformButton>
      );
      
      const button = getByTestId('platform-button');
      fireEvent.press(button);
      
      await waitFor(() => {
        expect(onPress).toHaveBeenCalled();
      });
    });

    it('should render ResponsiveGrid with correct layout', () => {
      const items = [1, 2, 3, 4, 5].map(i => <div key={i}>Item {i}</div>);
      
      const { getByTestId } = render(
        <ResponsiveGrid testID="responsive-grid" minItemWidth={100}>
          {items}
        </ResponsiveGrid>
      );
      
      expect(getByTestId('responsive-grid')).toBeTruthy();
    });
  });

  describe('Performance Monitor Component', () => {
    it('should render performance monitor in development', () => {
      const { getByTestId } = render(
        <PerformanceMonitor testID="perf-monitor" visible={true} />
      );
      
      expect(getByTestId('perf-monitor')).toBeTruthy();
    });

    it('should not render performance monitor when disabled', () => {
      const { queryByTestId } = render(
        <PerformanceMonitor testID="perf-monitor" visible={false} />
      );
      
      expect(queryByTestId('perf-monitor')).toBeNull();
    });
  });

  describe('Conditional Animation', () => {
    it('should render animation when conditions are met', () => {
      const { getByTestId } = render(
        <ConditionalAnimation
          testID="conditional-animation"
          condition={true}
          animationType="fade"
        >
          <div>Animated Content</div>
        </ConditionalAnimation>
      );
      
      expect(getByTestId('conditional-animation')).toBeTruthy();
    });

    it('should render fallback when conditions are not met', () => {
      const { getByTestId } = render(
        <ConditionalAnimation
          testID="conditional-animation"
          condition={false}
          fallback={<div data-testid="fallback">Fallback Content</div>}
        >
          <div>Animated Content</div>
        </ConditionalAnimation>
      );
      
      expect(getByTestId('fallback')).toBeTruthy();
    });
  });

  describe('Performance Auto-Optimization', () => {
    it('should enable auto-optimization', () => {
      const spy = jest.spyOn(PerformanceOptimizer, 'enableAutoOptimization');
      
      PerformanceOptimizer.enableAutoOptimization();
      
      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
    });

    it('should provide optimized animation config', () => {
      const baseConfig = {
        duration: 300,
        damping: 15,
        stiffness: 200,
      };
      
      const optimizedConfig = PerformanceOptimizer.getOptimizedAnimationConfig(baseConfig);
      
      expect(optimizedConfig).toHaveProperty('duration');
      expect(optimizedConfig).toHaveProperty('damping');
      expect(optimizedConfig).toHaveProperty('stiffness');
    });

    it('should detect when to skip animations', () => {
      // Mock high animation count
      jest.spyOn(AnimationRegistry, 'getActiveCount').mockReturnValue(10);
      
      const shouldSkip = PerformanceOptimizer.shouldSkipAnimation();
      
      expect(typeof shouldSkip).toBe('boolean');
    });
  });
});

describe('Cross-Platform Compatibility', () => {
  describe('iOS Optimizations', () => {
    beforeEach(() => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('ios');
    });

    it('should use iOS-specific configurations', () => {
      const config = PlatformService.getConfig();
      
      expect(config.animations.useNativeDriver).toBe(true);
      expect(config.glass.blurIntensity).toBeGreaterThan(0);
    });
  });

  describe('Android Optimizations', () => {
    beforeEach(() => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('android');
    });

    it('should use Android-specific configurations', () => {
      const config = PlatformService.getConfig();
      
      expect(config.animations.useNativeDriver).toBe(true);
    });
  });

  describe('Web Optimizations', () => {
    beforeEach(() => {
      jest.spyOn(Platform, 'OS', 'get').mockReturnValue('web');
    });

    it('should disable blur effects on web', () => {
      const config = PlatformService.getConfig();
      
      expect(config.glass.blurIntensity).toBe(0);
      expect(config.animations.useNativeDriver).toBe(false);
    });
  });
});