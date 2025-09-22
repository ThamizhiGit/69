import React from 'react';
import { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  runOnJS,
  SharedValue,
  interpolate,
  Extrapolate,
  withSequence,
  withDelay,
  withRepeat
} from 'react-native-reanimated';
import { animationConfig } from '../constants/animations';

// Animation utility service
export class AnimationService {
  // Create optimized spring animation
  static createSpringAnimation(
    value: number, 
    config = animationConfig.spring.gentle
  ) {
    return withSpring(value, config);
  }

  // Create timing animation
  static createTimingAnimation(
    value: number, 
    duration = animationConfig.durations.normal,
    easing = animationConfig.easing.easeInOut
  ) {
    return withTiming(value, { duration, easing });
  }

  // Create sequence animation
  static createSequenceAnimation(animations: any[]) {
    return withSequence(...animations);
  }

  // Create delayed animation
  static createDelayedAnimation(animation: any, delay: number) {
    return withDelay(delay, animation);
  }

  // Create repeat animation
  static createRepeatAnimation(animation: any, numberOfReps = -1) {
    return withRepeat(animation, numberOfReps);
  }

  // Shared element transition worklet
  static sharedElementTransition = (progress: SharedValue<number>) => {
    'worklet';
    return {
      transform: [
        {
          scale: interpolate(progress.value, [0, 1], [0.8, 1], Extrapolate.CLAMP)
        },
        {
          translateY: interpolate(progress.value, [0, 1], [50, 0], Extrapolate.CLAMP)
        }
      ],
      opacity: progress.value,
    };
  };

  // Parallax scroll worklet
  static parallaxWorklet = (scrollY: SharedValue<number>, factor: number = 0.5) => {
    'worklet';
    return {
      transform: [
        {
          translateY: scrollY.value * factor
        }
      ]
    };
  };

  // Scale button animation with ripple effect
  static scaleButtonAnimation = (pressed: SharedValue<boolean>) => {
    'worklet';
    return {
      transform: [
        {
          scale: pressed.value 
            ? animationConfig.transforms.scale.pressed 
            : 1
        }
      ]
    };
  };

  // Fade animation
  static fadeAnimation = (visible: SharedValue<boolean>) => {
    'worklet';
    return {
      opacity: visible.value ? 1 : 0,
    };
  };

  // Slide animation with direction support
  static slideAnimation = (
    visible: SharedValue<boolean>, 
    direction: 'up' | 'down' | 'left' | 'right' = 'up'
  ) => {
    'worklet';
    const translateValue = visible.value ? 0 : animationConfig.transforms.translate.slideIn;
    
    switch (direction) {
      case 'up':
        return { transform: [{ translateY: translateValue }] };
      case 'down':
        return { transform: [{ translateY: -translateValue }] };
      case 'left':
        return { transform: [{ translateX: translateValue }] };
      case 'right':
        return { transform: [{ translateX: -translateValue }] };
      default:
        return { transform: [{ translateY: translateValue }] };
    }
  };

  // Card hover animation with lift effect
  static cardHoverAnimation = (hovered: SharedValue<boolean>) => {
    'worklet';
    return {
      transform: [
        {
          scale: hovered.value ? animationConfig.transforms.scale.hover : 1
        },
        {
          translateY: hovered.value ? -4 : 0
        }
      ],
      shadowOpacity: hovered.value ? 0.15 : 0.1,
      shadowRadius: hovered.value ? 16 : 8,
    };
  };

  // Loading shimmer animation
  static shimmerAnimation = (progress: SharedValue<number>) => {
    'worklet';
    return {
      transform: [
        {
          translateX: interpolate(
            progress.value,
            [0, 1],
            [-100, 100],
            Extrapolate.CLAMP
          )
        }
      ]
    };
  };

  // Bounce animation for notifications
  static bounceAnimation = (trigger: SharedValue<boolean>) => {
    'worklet';
    return {
      transform: [
        {
          scale: trigger.value ? 1.1 : 1
        }
      ]
    };
  };

  // Rotation animation
  static rotationAnimation = (progress: SharedValue<number>, degrees: number = 360) => {
    'worklet';
    return {
      transform: [
        {
          rotate: `${interpolate(progress.value, [0, 1], [0, degrees])}deg`
        }
      ]
    };
  };

  // Pulse animation for availability indicators
  static pulseAnimation = (progress: SharedValue<number>) => {
    'worklet';
    return {
      transform: [
        {
          scale: interpolate(progress.value, [0, 1], [1, 1.2], Extrapolate.CLAMP)
        }
      ],
      opacity: interpolate(progress.value, [0, 1], [1, 0.6], Extrapolate.CLAMP)
    };
  };
}

// Custom hooks for common animations
export const useScaleAnimation = (initialValue = 1) => {
  const scale = useSharedValue(initialValue);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const scaleIn = () => {
    scale.value = AnimationService.createSpringAnimation(1);
  };

  const scaleOut = () => {
    scale.value = AnimationService.createSpringAnimation(0.8);
  };

  const scalePress = () => {
    scale.value = AnimationService.createSpringAnimation(
      animationConfig.transforms.scale.pressed
    );
  };

  const scaleBounce = () => {
    scale.value = AnimationService.createSequenceAnimation([
      withTiming(1.1, { duration: 150 }),
      withSpring(1, animationConfig.spring.bouncy)
    ]);
  };

  return { animatedStyle, scaleIn, scaleOut, scalePress, scaleBounce, scale };
};

export const useFadeAnimation = (initialValue = 0) => {
  const opacity = useSharedValue(initialValue);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  const fadeIn = (duration?: number) => {
    opacity.value = AnimationService.createTimingAnimation(1, duration);
  };

  const fadeOut = (duration?: number) => {
    opacity.value = AnimationService.createTimingAnimation(0, duration);
  };

  const fadeToggle = () => {
    opacity.value = opacity.value === 0 
      ? AnimationService.createTimingAnimation(1)
      : AnimationService.createTimingAnimation(0);
  };

  return { animatedStyle, fadeIn, fadeOut, fadeToggle, opacity };
};

export const useSlideAnimation = (initialValue = 0, direction: 'x' | 'y' = 'y') => {
  const translate = useSharedValue(initialValue);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: direction === 'x' 
      ? [{ translateX: translate.value }]
      : [{ translateY: translate.value }]
  }));

  const slideIn = (duration?: number) => {
    translate.value = AnimationService.createTimingAnimation(0, duration);
  };

  const slideOut = (distance = 100, duration?: number) => {
    translate.value = AnimationService.createTimingAnimation(distance, duration);
  };

  const slideToggle = (distance = 100) => {
    translate.value = translate.value === 0
      ? AnimationService.createSpringAnimation(distance)
      : AnimationService.createSpringAnimation(0);
  };

  return { animatedStyle, slideIn, slideOut, slideToggle, translate };
};

export const useRotationAnimation = (initialValue = 0) => {
  const rotation = useSharedValue(initialValue);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }));

  const rotate = (degrees: number, duration?: number) => {
    rotation.value = AnimationService.createTimingAnimation(degrees, duration);
  };

  const rotateSpring = (degrees: number) => {
    rotation.value = AnimationService.createSpringAnimation(degrees);
  };

  const spin = () => {
    rotation.value = AnimationService.createRepeatAnimation(
      withTiming(360, { duration: 1000 })
    );
  };

  return { animatedStyle, rotate, rotateSpring, spin, rotation };
};

export const useShimmerAnimation = () => {
  const progress = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => 
    AnimationService.shimmerAnimation(progress)
  );

  const startShimmer = () => {
    progress.value = AnimationService.createRepeatAnimation(
      withTiming(1, { duration: 1500 })
    );
  };

  const stopShimmer = () => {
    progress.value = 0;
  };

  return { animatedStyle, startShimmer, stopShimmer, progress };
};

export const usePulseAnimation = () => {
  const progress = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => 
    AnimationService.pulseAnimation(progress)
  );

  const startPulse = () => {
    progress.value = AnimationService.createRepeatAnimation(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 800 })
      )
    );
  };

  const stopPulse = () => {
    progress.value = 0;
  };

  return { animatedStyle, startPulse, stopPulse, progress };
};
// Enhanced animation cleanup utilities for memory management
export const useAnimationCleanup = () => {
  const animationsRef = React.useRef<Map<string, any>>(new Map());
  const timeoutsRef = React.useRef<Set<NodeJS.Timeout>>(new Set());
  
  const registerAnimation = React.useCallback((id: string, animation: any) => {
    // Cancel existing animation with same ID
    const existing = animationsRef.current.get(id);
    if (existing?.cancel) {
      existing.cancel();
    }
    
    animationsRef.current.set(id, animation);
    
    // Auto-cleanup after 30 seconds
    const timeout = setTimeout(() => {
      cleanupAnimation(id);
    }, 30000);
    
    timeoutsRef.current.add(timeout);
  }, []);
  
  const cleanupAnimation = React.useCallback((id: string) => {
    const animation = animationsRef.current.get(id);
    if (animation?.cancel) {
      animation.cancel();
    }
    animationsRef.current.delete(id);
  }, []);
  
  const cleanupAll = React.useCallback(() => {
    // Cancel all animations
    animationsRef.current.forEach((animation, id) => {
      if (animation?.cancel) {
        animation.cancel();
      }
    });
    animationsRef.current.clear();
    
    // Clear all timeouts
    timeoutsRef.current.forEach(timeout => {
      clearTimeout(timeout);
    });
    timeoutsRef.current.clear();
  }, []);
  
  const getActiveCount = React.useCallback(() => {
    return animationsRef.current.size;
  }, []);
  
  React.useEffect(() => {
    return cleanupAll;
  }, [cleanupAll]);
  
  return { 
    registerAnimation, 
    cleanupAnimation, 
    cleanupAll, 
    getActiveCount 
  };
};

// Enhanced performance monitoring for animations with device-aware optimizations
export const useAnimationPerformance = () => {
  const frameCount = React.useRef(0);
  const lastTime = React.useRef(performance.now());
  const fpsHistory = React.useRef<number[]>([]);
  const animationFrameId = React.useRef<number | null>(null);
  const isMonitoring = React.useRef(false);
  
  const trackFPS = React.useCallback(() => {
    if (!isMonitoring.current) return;
    
    frameCount.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime.current >= 1000) {
      const fps = frameCount.current;
      fpsHistory.current.push(fps);
      
      // Keep only last 30 measurements for better averaging
      if (fpsHistory.current.length > 30) {
        fpsHistory.current.shift();
      }
      
      // Performance warnings with different thresholds
      if (fps < 30) {
        console.error(`Critical performance issue: FPS ${fps}`);
      } else if (fps < 45) {
        console.warn(`Performance warning: FPS ${fps}`);
      }
      
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
    
    animationFrameId.current = requestAnimationFrame(trackFPS);
  }, []);
  
  const startMonitoring = React.useCallback(() => {
    if (isMonitoring.current) return;
    
    isMonitoring.current = true;
    frameCount.current = 0;
    lastTime.current = performance.now();
    trackFPS();
  }, [trackFPS]);
  
  const stopMonitoring = React.useCallback(() => {
    isMonitoring.current = false;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);
  
  const getAverageFPS = React.useCallback(() => {
    if (fpsHistory.current.length === 0) return 0;
    const sum = fpsHistory.current.reduce((a, b) => a + b, 0);
    return Math.round(sum / fpsHistory.current.length);
  }, []);
  
  const getCurrentFPS = React.useCallback(() => {
    return fpsHistory.current[fpsHistory.current.length - 1] || 0;
  }, []);
  
  const getPerformanceReport = React.useCallback(() => {
    const avgFPS = getAverageFPS();
    const currentFPS = getCurrentFPS();
    const frameDrops = fpsHistory.current.filter(fps => fps < 55).length;
    
    return {
      averageFPS: avgFPS,
      currentFPS: currentFPS,
      frameDrops: frameDrops,
      totalMeasurements: fpsHistory.current.length,
      performanceGrade: avgFPS >= 55 ? 'A' : avgFPS >= 45 ? 'B' : avgFPS >= 30 ? 'C' : 'D'
    };
  }, [getAverageFPS, getCurrentFPS]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return stopMonitoring;
  }, [stopMonitoring]);
  
  return { 
    startMonitoring, 
    stopMonitoring, 
    getAverageFPS, 
    getCurrentFPS, 
    getPerformanceReport 
  };
};

// Optimized animation hook for performance with device capability detection
export const useOptimizedAnimation = (config: any) => {
  const animatedValue = useSharedValue(0);
  const cleanup = useAnimationCleanup();
  const animationId = React.useRef(`anim_${Date.now()}_${Math.random()}`);
  
  const startAnimation = React.useCallback(() => {
    // Import performance service dynamically to avoid circular dependencies
    const { PerformanceOptimizer, AnimationRegistry } = require('./performanceService');
    
    // Check if we should skip animation due to performance constraints
    if (PerformanceOptimizer.shouldSkipAnimation()) {
      console.warn('Skipping animation due to performance constraints');
      animatedValue.value = 1;
      return;
    }
    
    // Get optimized config based on device capabilities
    const optimizedConfig = PerformanceOptimizer.getOptimizedAnimationConfig({
      damping: 15,
      stiffness: 150,
      mass: 1,
      ...config,
    });
    
    const animation = withSpring(1, optimizedConfig);
    
    // Register animation for tracking
    AnimationRegistry.register(
      animationId.current,
      'spring',
      animatedValue,
      () => {
        if (animation.cancel) {
          animation.cancel();
        }
      }
    );
    
    cleanup.registerAnimation(animationId.current, animation);
    animatedValue.value = animation;
  }, [config, cleanup, animatedValue]);
  
  const resetAnimation = React.useCallback(() => {
    const { PerformanceOptimizer, AnimationRegistry } = require('./performanceService');
    
    const optimizedConfig = PerformanceOptimizer.getOptimizedAnimationConfig({
      duration: 200,
    });
    
    const animation = withTiming(0, optimizedConfig);
    
    AnimationRegistry.register(
      `${animationId.current}_reset`,
      'timing',
      animatedValue,
      () => {
        if (animation.cancel) {
          animation.cancel();
        }
      }
    );
    
    cleanup.registerAnimation(`${animationId.current}_reset`, animation);
    animatedValue.value = animation;
  }, [cleanup, animatedValue]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      const { AnimationRegistry } = require('./performanceService');
      AnimationRegistry.unregister(animationId.current);
      AnimationRegistry.unregister(`${animationId.current}_reset`);
    };
  }, []);
  
  return { animatedValue, startAnimation, resetAnimation };
};
// Performance-aware animation hook with automatic quality adjustment
export const usePerformanceAwareAnimation = (
  animationType: 'spring' | 'timing' | 'sequence',
  config: any = {},
  options: {
    skipOnLowEnd?: boolean;
    fallbackValue?: number;
    priority?: 'low' | 'medium' | 'high';
  } = {}
) => {
  const animatedValue = useSharedValue(0);
  const animationId = React.useRef(`perf_anim_${Date.now()}_${Math.random()}`);
  const cleanup = useAnimationCleanup();
  
  const {
    skipOnLowEnd = false,
    fallbackValue = 1,
    priority = 'medium'
  } = options;

  const startAnimation = React.useCallback((targetValue: number = 1) => {
    // Import performance service to avoid circular dependencies
    const { PerformanceOptimizer, DeviceCapabilityDetector, AnimationRegistry } = require('./performanceService');
    
    const capabilities = DeviceCapabilityDetector.getCapabilities();
    
    // Skip animation on low-end devices if requested
    if (skipOnLowEnd && capabilities.isLowEnd) {
      animatedValue.value = fallbackValue;
      return;
    }
    
    // Check if we should skip due to performance constraints
    if (PerformanceOptimizer.shouldSkipAnimation() && priority === 'low') {
      animatedValue.value = fallbackValue;
      return;
    }
    
    // Get optimized configuration
    const optimizedConfig = PerformanceOptimizer.getOptimizedAnimationConfig(config);
    
    let animation;
    
    switch (animationType) {
      case 'spring':
        animation = withSpring(targetValue, optimizedConfig);
        break;
      case 'timing':
        animation = withTiming(targetValue, optimizedConfig);
        break;
      case 'sequence':
        // For sequence animations, apply optimization to each step
        const optimizedSequence = config.sequence?.map((step: any) => 
          PerformanceOptimizer.getOptimizedAnimationConfig(step)
        ) || [];
        animation = withSequence(...optimizedSequence);
        break;
      default:
        animation = withTiming(targetValue, optimizedConfig);
    }
    
    // Register animation for tracking
    AnimationRegistry.register(
      animationId.current,
      animationType,
      animatedValue,
      () => {
        if (animation.cancel) {
          animation.cancel();
        }
      }
    );
    
    cleanup.registerAnimation(animationId.current, animation);
    animatedValue.value = animation;
  }, [animationType, config, skipOnLowEnd, fallbackValue, priority, cleanup]);
  
  const resetAnimation = React.useCallback(() => {
    const { PerformanceOptimizer, AnimationRegistry } = require('./performanceService');
    
    const resetConfig = PerformanceOptimizer.getOptimizedAnimationConfig({
      duration: 200,
    });
    
    const animation = withTiming(0, resetConfig);
    
    AnimationRegistry.register(
      `${animationId.current}_reset`,
      'timing',
      animatedValue
    );
    
    cleanup.registerAnimation(`${animationId.current}_reset`, animation);
    animatedValue.value = animation;
  }, [cleanup]);
  
  const cancelAnimation = React.useCallback(() => {
    const { AnimationRegistry } = require('./performanceService');
    AnimationRegistry.unregister(animationId.current);
    cleanup.cleanupAnimation(animationId.current);
  }, [cleanup]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      const { AnimationRegistry } = require('./performanceService');
      AnimationRegistry.unregister(animationId.current);
      AnimationRegistry.unregister(`${animationId.current}_reset`);
    };
  }, []);
  
  return { 
    animatedValue, 
    startAnimation, 
    resetAnimation, 
    cancelAnimation 
  };
};

// Hook for managing multiple animations with performance constraints
export const useAnimationQueue = (maxConcurrent: number = 3) => {
  const queueRef = React.useRef<Array<() => void>>([]);
  const activeRef = React.useRef<Set<string>>(new Set());
  
  const enqueueAnimation = React.useCallback((
    id: string, 
    animationFn: () => void,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    // If we're at capacity and this is low priority, skip
    if (activeRef.current.size >= maxConcurrent && priority === 'low') {
      console.log(`Skipping low priority animation ${id} due to queue capacity`);
      return;
    }
    
    // If we're at capacity, queue the animation
    if (activeRef.current.size >= maxConcurrent) {
      queueRef.current.push(() => {
        activeRef.current.add(id);
        animationFn();
      });
      return;
    }
    
    // Execute immediately
    activeRef.current.add(id);
    animationFn();
  }, [maxConcurrent]);
  
  const completeAnimation = React.useCallback((id: string) => {
    activeRef.current.delete(id);
    
    // Process next animation in queue
    if (queueRef.current.length > 0 && activeRef.current.size < maxConcurrent) {
      const nextAnimation = queueRef.current.shift();
      nextAnimation?.();
    }
  }, [maxConcurrent]);
  
  const clearQueue = React.useCallback(() => {
    queueRef.current = [];
    activeRef.current.clear();
  }, []);
  
  const getQueueStatus = React.useCallback(() => ({
    active: activeRef.current.size,
    queued: queueRef.current.length,
    capacity: maxConcurrent,
  }), [maxConcurrent]);
  
  return {
    enqueueAnimation,
    completeAnimation,
    clearQueue,
    getQueueStatus,
  };
};

// Memory-efficient animation presets for common use cases
export const AnimationPresets = {
  // Lightweight fade for lists
  listItemFade: {
    type: 'timing' as const,
    config: { duration: 200 },
    options: { skipOnLowEnd: true, priority: 'low' as const }
  },
  
  // Button press with fallback
  buttonPress: {
    type: 'spring' as const,
    config: { damping: 20, stiffness: 300 },
    options: { skipOnLowEnd: false, priority: 'high' as const }
  },
  
  // Modal entrance
  modalEntrance: {
    type: 'spring' as const,
    config: { damping: 15, stiffness: 200 },
    options: { skipOnLowEnd: false, priority: 'medium' as const }
  },
  
  // Card hover effect
  cardHover: {
    type: 'spring' as const,
    config: { damping: 25, stiffness: 400 },
    options: { skipOnLowEnd: true, priority: 'low' as const }
  },
  
  // Loading spinner (essential)
  loadingSpinner: {
    type: 'timing' as const,
    config: { duration: 1000 },
    options: { skipOnLowEnd: false, priority: 'high' as const }
  }
};