import { Easing } from 'react-native-reanimated';

// Animation configuration constants
export const animationConfig = {
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
    extraSlow: 800,
  },
  easing: {
    easeInOut: Easing.bezier(0.4, 0, 0.2, 1),
    easeOut: Easing.bezier(0, 0, 0.2, 1),
    easeIn: Easing.bezier(0.4, 0, 1, 1),
    spring: Easing.elastic(1.2),
    bounce: Easing.bounce,
    linear: Easing.linear,
  },
  transforms: {
    scale: {
      pressed: 0.95,
      hover: 1.05,
      active: 1.02,
    },
    translate: {
      slideIn: 300,
      slideOut: -300,
      slideUp: 100,
      slideDown: -100,
    },
    rotate: {
      quarter: '90deg',
      half: '180deg',
      full: '360deg',
    }
  },
  spring: {
    gentle: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 200,
      mass: 0.8,
    },
    snappy: {
      damping: 20,
      stiffness: 300,
      mass: 0.5,
    }
  }
};

// Predefined animation presets
export const animationPresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: animationConfig.durations.normal,
    easing: animationConfig.easing.easeOut,
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: animationConfig.durations.normal,
    easing: animationConfig.easing.easeIn,
  },
  slideInUp: {
    from: { transform: [{ translateY: animationConfig.transforms.translate.slideIn }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
    duration: animationConfig.durations.normal,
    easing: animationConfig.easing.easeOut,
  },
  slideInDown: {
    from: { transform: [{ translateY: animationConfig.transforms.translate.slideOut }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
    duration: animationConfig.durations.normal,
    easing: animationConfig.easing.easeOut,
  },
  scaleIn: {
    from: { transform: [{ scale: 0.8 }], opacity: 0 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
    duration: animationConfig.durations.normal,
    easing: animationConfig.easing.spring,
  },
  buttonPress: {
    from: { transform: [{ scale: 1 }] },
    to: { transform: [{ scale: animationConfig.transforms.scale.pressed }] },
    duration: animationConfig.durations.fast,
    easing: animationConfig.easing.easeInOut,
  }
};