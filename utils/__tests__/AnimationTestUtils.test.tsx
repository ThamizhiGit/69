import React from 'react';
import { render, act } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { 
  AnimationTestUtils,
  MockAnimatedValue,
  MockAnimationConfig,
  createMockAnimation,
  waitForAnimation,
  expectAnimationToComplete,
  expectAnimationValues
} from '../AnimationTestUtils';

// Mock react-native-reanimated for testing
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    useSharedValue: (initial: any) => new MockAnimatedValue(initial),
    useAnimatedStyle: (fn: any) => ({}),
    withSpring: (value: any, config?: any) => createMockAnimation('spring', value, config),
    withTiming: (value: any, config?: any) => createMockAnimation('timing', value, config),
    withDelay: (delay: number, animation: any) => createMockAnimation('delay', animation, { delay }),
    withRepeat: (animation: any, count?: number) => createMockAnimation('repeat', animation, { count }),
    interpolate: (value: number, input: number[], output: number[]) => {
      // Simple linear interpolation for testing
      if (input.length !== output.length) return output[0];
      
      for (let i = 0; i < input.length - 1; i++) {
        if (value >= input[i] && value <= input[i + 1]) {
          const ratio = (value - input[i]) / (input[i + 1] - input[i]);
          return output[i] + ratio * (output[i + 1] - output[i]);
        }
      }
      
      return value <= input[0] ? output[0] : output[output.length - 1];
    },
    Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    runOnJS: (fn: any) => fn,
    default: {
      View,
    },
  };
});

describe('AnimationTestUtils', () => {
  describe('MockAnimatedValue', () => {
    it('should initialize with correct value', () => {
      const animatedValue = new MockAnimatedValue(0);
      expect(animatedValue.value).toBe(0);
    });

    it('should update value correctly', () => {
      const animatedValue = new MockAnimatedValue(0);
      animatedValue.value = 1;
      expect(animatedValue.value).toBe(1);
    });

    it('should track value changes', () => {
      const animatedValue = new MockAnimatedValue(0);
      const listener = jest.fn();
      
      animatedValue.addListener(listener);
      animatedValue.value = 0.5;
      animatedValue.value = 1;
      
      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenCalledWith(0.5);
      expect(listener).toHaveBeenCalledWith(1);
    });

    it('should remove listeners correctly', () => {
      const animatedValue = new MockAnimatedValue(0);
      const listener = jest.fn();
      
      animatedValue.addListener(listener);
      animatedValue.removeListener(listener);
      animatedValue.value = 1;
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('MockAnimationConfig', () => {
    it('should create spring animation config', () => {
      const config = new MockAnimationConfig('spring', 1, {
        damping: 15,
        stiffness: 200,
      });
      
      expect(config.type).toBe('spring');
      expect(config.toValue).toBe(1);
      expect(config.config.damping).toBe(15);
      expect(config.config.stiffness).toBe(200);
    });

    it('should create timing animation config', () => {
      const config = new MockAnimationConfig('timing', 1, {
        duration: 300,
      });
      
      expect(config.type).toBe('timing');
      expect(config.toValue).toBe(1);
      expect(config.config.duration).toBe(300);
    });

    it('should simulate animation progress', async () => {
      const animatedValue = new MockAnimatedValue(0);
      const config = new MockAnimationConfig('timing', 1, {
        duration: 100,
      });
      
      const progressCallback = jest.fn();
      config.onProgress = progressCallback;
      
      config.start(animatedValue);
      
      await waitForAnimation(config);
      
      expect(animatedValue.value).toBe(1);
      expect(progressCallback).toHaveBeenCalled();
    });
  });

  describe('Animation Creation Helpers', () => {
    it('should create mock spring animation', () => {
      const animation = createMockAnimation('spring', 1, {
        damping: 15,
        stiffness: 200,
      });
      
      expect(animation).toBeInstanceOf(MockAnimationConfig);
      expect(animation.type).toBe('spring');
      expect(animation.toValue).toBe(1);
    });

    it('should create mock timing animation', () => {
      const animation = createMockAnimation('timing', 1, {
        duration: 300,
      });
      
      expect(animation).toBeInstanceOf(MockAnimationConfig);
      expect(animation.type).toBe('timing');
      expect(animation.toValue).toBe(1);
    });

    it('should create mock delay animation', () => {
      const baseAnimation = createMockAnimation('timing', 1, { duration: 300 });
      const delayAnimation = createMockAnimation('delay', baseAnimation, { delay: 100 });
      
      expect(delayAnimation.type).toBe('delay');
      expect(delayAnimation.config.delay).toBe(100);
    });

    it('should create mock repeat animation', () => {
      const baseAnimation = createMockAnimation('timing', 1, { duration: 300 });
      const repeatAnimation = createMockAnimation('repeat', baseAnimation, { count: 3 });
      
      expect(repeatAnimation.type).toBe('repeat');
      expect(repeatAnimation.config.count).toBe(3);
    });
  });

  describe('Animation Testing Utilities', () => {
    it('should wait for animation completion', async () => {
      const animatedValue = new MockAnimatedValue(0);
      const animation = createMockAnimation('timing', 1, { duration: 50 });
      
      animation.start(animatedValue);
      
      await waitForAnimation(animation);
      
      expect(animatedValue.value).toBe(1);
    });

    it('should expect animation to complete', async () => {
      const animatedValue = new MockAnimatedValue(0);
      const animation = createMockAnimation('timing', 1, { duration: 50 });
      
      animation.start(animatedValue);
      
      await expectAnimationToComplete(animation, animatedValue, 1);
      
      expect(animatedValue.value).toBe(1);
    });

    it('should validate animation values at different points', async () => {
      const animatedValue = new MockAnimatedValue(0);
      const animation = createMockAnimation('timing', 1, { duration: 100 });
      
      animation.start(animatedValue);
      
      // Check values at different progress points
      await expectAnimationValues(animation, animatedValue, [
        { progress: 0, expectedValue: 0 },
        { progress: 0.5, expectedValue: 0.5 },
        { progress: 1, expectedValue: 1 },
      ]);
    });
  });

  describe('Animation Performance Testing', () => {
    it('should measure animation performance', async () => {
      const animatedValue = new MockAnimatedValue(0);
      const animation = createMockAnimation('timing', 1, { duration: 100 });
      
      const startTime = performance.now();
      animation.start(animatedValue);
      await waitForAnimation(animation);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThanOrEqual(90); // Allow some tolerance
      expect(duration).toBeLessThanOrEqual(150);
    });

    it('should track frame rate during animation', async () => {
      const animatedValue = new MockAnimatedValue(0);
      const animation = createMockAnimation('timing', 1, { duration: 100 });
      
      const frameCallbacks: number[] = [];
      animation.onProgress = () => {
        frameCallbacks.push(performance.now());
      };
      
      animation.start(animatedValue);
      await waitForAnimation(animation);
      
      // Should have multiple frame callbacks
      expect(frameCallbacks.length).toBeGreaterThan(1);
      
      // Calculate approximate frame rate
      if (frameCallbacks.length > 1) {
        const totalTime = frameCallbacks[frameCallbacks.length - 1] - frameCallbacks[0];
        const averageFrameTime = totalTime / (frameCallbacks.length - 1);
        const fps = 1000 / averageFrameTime;
        
        // Should maintain reasonable frame rate
        expect(fps).toBeGreaterThan(30);
      }
    });
  });

  describe('Complex Animation Scenarios', () => {
    it('should handle chained animations', async () => {
      const animatedValue = new MockAnimatedValue(0);
      
      const animation1 = createMockAnimation('timing', 0.5, { duration: 50 });
      const animation2 = createMockAnimation('timing', 1, { duration: 50 });
      
      animation1.start(animatedValue);
      await waitForAnimation(animation1);
      
      expect(animatedValue.value).toBe(0.5);
      
      animation2.start(animatedValue);
      await waitForAnimation(animation2);
      
      expect(animatedValue.value).toBe(1);
    });

    it('should handle parallel animations', async () => {
      const animatedValue1 = new MockAnimatedValue(0);
      const animatedValue2 = new MockAnimatedValue(0);
      
      const animation1 = createMockAnimation('timing', 1, { duration: 100 });
      const animation2 = createMockAnimation('spring', 1, { damping: 15 });
      
      animation1.start(animatedValue1);
      animation2.start(animatedValue2);
      
      await Promise.all([
        waitForAnimation(animation1),
        waitForAnimation(animation2),
      ]);
      
      expect(animatedValue1.value).toBe(1);
      expect(animatedValue2.value).toBe(1);
    });

    it('should handle animation interruption', async () => {
      const animatedValue = new MockAnimatedValue(0);
      const animation = createMockAnimation('timing', 1, { duration: 200 });
      
      animation.start(animatedValue);
      
      // Interrupt animation after 50ms
      setTimeout(() => {
        animation.stop();
      }, 50);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Value should be between 0 and 1 (interrupted)
      expect(animatedValue.value).toBeGreaterThan(0);
      expect(animatedValue.value).toBeLessThan(1);
    });
  });

  describe('Animation State Management', () => {
    it('should track animation state correctly', () => {
      const animation = createMockAnimation('timing', 1, { duration: 100 });
      
      expect(animation.isRunning).toBe(false);
      
      const animatedValue = new MockAnimatedValue(0);
      animation.start(animatedValue);
      
      expect(animation.isRunning).toBe(true);
    });

    it('should handle animation completion callbacks', async () => {
      const animatedValue = new MockAnimatedValue(0);
      const animation = createMockAnimation('timing', 1, { duration: 50 });
      
      const completionCallback = jest.fn();
      animation.onComplete = completionCallback;
      
      animation.start(animatedValue);
      await waitForAnimation(animation);
      
      expect(completionCallback).toHaveBeenCalledWith(true); // finished = true
    });

    it('should handle animation cancellation callbacks', async () => {
      const animatedValue = new MockAnimatedValue(0);
      const animation = createMockAnimation('timing', 1, { duration: 200 });
      
      const completionCallback = jest.fn();
      animation.onComplete = completionCallback;
      
      animation.start(animatedValue);
      
      setTimeout(() => {
        animation.stop();
      }, 50);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(completionCallback).toHaveBeenCalledWith(false); // finished = false
    });
  });
});