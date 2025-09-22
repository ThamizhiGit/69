// Performance optimization exports
export {
  PerformanceOptimizer,
  DeviceCapabilityDetector,
  AnimationRegistry,
  FPSMonitor,
  performanceMonitor,
  deviceCapabilities,
  usePerformanceMonitoring,
} from '../../services/performanceService';

export {
  PlatformService,
  usePlatformConfig,
  useScreenInfo,
  useResponsiveValue,
  useDeviceSpecificValue,
  usePlatformSpecificValue,
  useResponsiveDimensions,
  usePlatformAnimation,
} from '../../services/platformService';

export {
  ResponsiveUtils,
  useResponsiveDimensions as useResponsiveDimensionsUtil,
  useResponsiveValue as useResponsiveValueUtil,
  useScreenInfo as useScreenInfoUtil,
  useIsLandscape,
  useGridColumns,
} from '../../utils/responsive';

export {
  platformAnimationConfig,
  getPlatformAnimationConfig,
  responsiveAnimationConfig,
  getResponsiveAnimationConfig,
  deviceOptimizations,
  getDeviceOptimizations,
  createOptimizedAnimationConfig,
  optimizedAnimationPresets,
  platformGlassConfig,
  getPlatformGlassConfig,
  createPerformanceAwareAnimation,
} from '../../constants/platformAnimations';

// Optimized components
export {
  OptimizedGlassContainer,
  OptimizedGlassCard,
  LightweightGlassContainer,
} from '../glass/OptimizedGlassContainer';

export {
  OptimizedFadeInView,
  OptimizedScaleButton,
  ConditionalAnimation,
  OptimizedStaggeredView,
  OptimizedLoadingSkeleton,
} from '../animations/OptimizedAnimations';

export {
  PlatformGlassContainer,
  PlatformButton,
  PlatformCard,
  ResponsiveGrid,
  PlatformModal,
  PlatformText,
} from '../platform/PlatformOptimizedComponents';

export {
  PerformanceMonitor,
  usePerformanceMetrics,
  PerformanceWarning,
} from '../debug/PerformanceMonitor';