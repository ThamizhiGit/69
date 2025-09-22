// Animation components
export { ScaleButton } from './ScaleButton';
export { FadeInView, StaggeredFadeInView } from './FadeInView';
export { ParallaxScrollView, MultiLayerParallaxScrollView } from './ParallaxScrollView';
export { FloatingElements, FloatingFoodItems, ParticleEffect } from './FloatingElements';
export { LoadingSkeleton, RestaurantCardSkeleton, CategoryCardSkeleton } from './LoadingSkeleton';
export { ParticleSystem, BackgroundOrbs } from './ParticleSystem';

// Re-export animation service hooks
export {
  useScaleAnimation,
  useFadeAnimation,
  useSlideAnimation,
  useRotationAnimation,
  useShimmerAnimation,
  usePulseAnimation,
  useAnimationCleanup,
  useAnimationPerformance,
  useOptimizedAnimation,
  usePerformanceAwareAnimation,
  useAnimationQueue,
  AnimationPresets,
} from '../../services/animationService';

// Re-export optimized components
export {
  OptimizedFadeInView,
  OptimizedScaleButton,
  ConditionalAnimation,
  OptimizedStaggeredView,
  OptimizedLoadingSkeleton,
} from './OptimizedAnimations';