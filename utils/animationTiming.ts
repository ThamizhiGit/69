import { withTiming, withSpring, withSequence, Easing } from 'react-native-reanimated';
import { animationConfig } from '../constants/animations';

// Standardized animation timing functions for UI consistency
export class AnimationTiming {
  // Standard fade animations
  static fadeIn(duration = animationConfig.durations.normal) {
    return withTiming(1, {
      duration,
      easing: animationConfig.easing.easeOut,
    });
  }

  static fadeOut(duration = animationConfig.durations.normal) {
    return withTiming(0, {
      duration,
      easing: animationConfig.easing.easeIn,
    });
  }

  // Standard scale animations
  static scaleIn(duration = animationConfig.durations.normal) {
    return withSpring(1, {
      ...animationConfig.spring.gentle,
      duration,
    });
  }

  static scaleOut(duration = animationConfig.durations.normal) {
    return withTiming(0.8, {
      duration,
      easing: animationConfig.easing.easeIn,
    });
  }

  // Button press animation
  static buttonPress() {
    return withSequence(
      withTiming(animationConfig.transforms.scale.pressed, {
        duration: animationConfig.durations.fast,
        easing: animationConfig.easing.easeInOut,
      }),
      withSpring(1, animationConfig.spring.snappy)
    );
  }

  // Card hover animation
  static cardHover() {
    return withSpring(animationConfig.transforms.scale.hover, {
      ...animationConfig.spring.gentle,
      duration: animationConfig.durations.normal,
    });
  }

  // Slide animations
  static slideInUp(duration = animationConfig.durations.normal) {
    return withTiming(0, {
      duration,
      easing: animationConfig.easing.easeOut,
    });
  }

  static slideInDown(duration = animationConfig.durations.normal) {
    return withTiming(0, {
      duration,
      easing: animationConfig.easing.easeOut,
    });
  }

  static slideInLeft(duration = animationConfig.durations.normal) {
    return withTiming(0, {
      duration,
      easing: animationConfig.easing.easeOut,
    });
  }

  static slideInRight(duration = animationConfig.durations.normal) {
    return withTiming(0, {
      duration,
      easing: animationConfig.easing.easeOut,
    });
  }

  // Bounce animation
  static bounce() {
    return withSequence(
      withTiming(1.1, {
        duration: animationConfig.durations.fast,
        easing: animationConfig.easing.easeOut,
      }),
      withSpring(1, animationConfig.spring.bouncy)
    );
  }

  // Pulse animation
  static pulse() {
    return withSequence(
      withTiming(1.05, {
        duration: animationConfig.durations.fast,
        easing: animationConfig.easing.easeInOut,
      }),
      withTiming(1, {
        duration: animationConfig.durations.fast,
        easing: animationConfig.easing.easeInOut,
      })
    );
  }

  // Shake animation for errors
  static shake() {
    return withSequence(
      withTiming(10, { duration: 50, easing: Easing.linear }),
      withTiming(-10, { duration: 50, easing: Easing.linear }),
      withTiming(10, { duration: 50, easing: Easing.linear }),
      withTiming(-10, { duration: 50, easing: Easing.linear }),
      withTiming(0, { duration: 50, easing: Easing.linear })
    );
  }

  // Loading spinner rotation
  static rotate() {
    return withTiming(360, {
      duration: 1000,
      easing: Easing.linear,
    });
  }

  // Custom spring with consistent config
  static spring(toValue: number, config = animationConfig.spring.gentle) {
    return withSpring(toValue, config);
  }

  // Custom timing with consistent easing
  static timing(toValue: number, duration = animationConfig.durations.normal, easing = animationConfig.easing.easeInOut) {
    return withTiming(toValue, { duration, easing });
  }
}

// Convenience functions for common UI animations
export const standardAnimations = {
  // Entry animations
  fadeInUp: (delay = 0) => ({
    opacity: AnimationTiming.fadeIn(animationConfig.durations.normal + delay),
    translateY: AnimationTiming.slideInUp(animationConfig.durations.normal + delay),
  }),

  fadeInDown: (delay = 0) => ({
    opacity: AnimationTiming.fadeIn(animationConfig.durations.normal + delay),
    translateY: AnimationTiming.slideInDown(animationConfig.durations.normal + delay),
  }),

  scaleInFade: (delay = 0) => ({
    opacity: AnimationTiming.fadeIn(animationConfig.durations.normal + delay),
    scale: AnimationTiming.scaleIn(animationConfig.durations.normal + delay),
  }),

  // Exit animations
  fadeOutUp: () => ({
    opacity: AnimationTiming.fadeOut(),
    translateY: withTiming(-animationConfig.transforms.translate.slideUp, {
      duration: animationConfig.durations.normal,
      easing: animationConfig.easing.easeIn,
    }),
  }),

  fadeOutDown: () => ({
    opacity: AnimationTiming.fadeOut(),
    translateY: withTiming(animationConfig.transforms.translate.slideDown, {
      duration: animationConfig.durations.normal,
      easing: animationConfig.easing.easeIn,
    }),
  }),

  scaleOutFade: () => ({
    opacity: AnimationTiming.fadeOut(),
    scale: AnimationTiming.scaleOut(),
  }),
};