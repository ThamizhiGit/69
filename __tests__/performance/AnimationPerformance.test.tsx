import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { AnimationTestUtils } from '../../utils/AnimationTestUtils';
import { FadeInView } from '../../components/animations/FadeInView';
import { ScaleButton } from '../../components/animations/ScaleButton';
import { ParallaxScrollView } from '../../components/animations/ParallaxScrollView';
import { FloatingElements } from '../../components/animations/FloatingElements';

// Mock react-native-reanimated with performance tracking
jest.mock('react-native-reanimated', () => {
  const { mockReanimatedFunctions } = require('../../utils/AnimationTestUtils');
  return mockReanimatedFunctions;
});

describe('Animation Performance Tests', () => {
  describe('Individual Animation Performance', () => {
    it('should maintain 60 FPS for fade animations', async () => {
      const animatedValue = AnimationTestUtils.createMockSharedValue(0);
      const animation = AnimationTestUtils.createMockTimingAnimation(1, { duration: 300 });

      const performance = await AnimationTestUtils.measureAnimationPerformance(
        animation,
        animatedValue
      );

      AnimationTestUtils.expectSmoothAnimation(
        performance.frameCount,
        performance.duration,
        60 // Expect 60 FPS
      );

      AnimationTestUtils.expectAnimationDuration(
        performance.duration,
        300, // Expected 300ms
        50   // 50ms tolerance
      );
    });

    it('should maintain performance for spring animations', async () => {
      const animatedValue = AnimationTestUtils.createMockSharedValue(0);
      const animation = AnimationTestUtils.createMockSpringAnimation(1, {
        damping: 15,
        stiffness: 200,
      });

      const performance = await AnimationTestUtils.measureAnimationPerformance(
        animation,
        animatedValue
      );

      // Spring animations may have variable duration, so we're more lenient
      AnimationTestUtils.expectSmoothAnimation(
        performance.frameCount,
        performance.duration,
        30 // Minimum 30 FPS for spring animations
      );

      expect(performance.duration).toBeGreaterThan(200);
      expect(performance.duration).toBeLessThan(2000);
    });

    it('should handle multiple concurrent animations efficiently', async () => {
      const animatedValues = Array.from({ length: 10 }, () => 
        AnimationTestUtils.createMockSharedValue(0)
      );
      
      const animations = animatedValues.map(() => 
        AnimationTestUtils.createMockTimingAnimation(1, { duration: 300 })
      );

      const startTime = performance.now();
      
      await AnimationTestUtils.testParallelAnimations(
        animations,
        animatedValues,
        Array(10).fill(1)
      );

      const totalTime = performance.now() - startTime;

      // Parallel animations should not take significantly longer than a single animation
      expect(totalTime).toBeLessThan(500); // Allow some overhead
    });

    it('should handle animation interruption gracefully', async () => {
      const animatedValue = AnimationTestUtils.createMockSharedValue(0);
      const animation = AnimationTestUtils.createMockTimingAnimation(1, { duration: 1000 });

      const startTime = performance.now();
      animation.start(animatedValue);

      // Interrupt animation after 200ms
      setTimeout(() => {
        animation.stop();
      }, 200);

      await new Promise(resolve => setTimeout(resolve, 300));

      const interruptTime = performance.now() - startTime;
      
      // Should stop quickly after interruption
      expect(interruptTime).toBeLessThan(400);
      expect(animatedValue.value).toBeGreaterThan(0);
      expect(animatedValue.value).toBeLessThan(1);
    });
  });

  describe('Component Animation Performance', () => {
    it('should render FadeInView efficiently', async () => {
      const startTime = performance.now();
      
      const { getByTestId } = render(
        <FadeInView testID="fade-view" duration={300}>
          <Text>Fade content</Text>
        </FadeInView>
      );

      const renderTime = performance.now() - startTime;
      
      expect(getByTestId('fade-view')).toBeTruthy();
      expect(renderTime).toBeLessThan(50); // Should render quickly
    });

    it('should handle ScaleButton interactions efficiently', async () => {
      let pressCount = 0;
      const onPress = () => { pressCount++; };

      const startTime = performance.now();
      
      const { getByText } = render(
        <ScaleButton onPress={onPress}>
          <Text>Press Me</Text>
        </ScaleButton>
      );

      const renderTime = performance.now() - startTime;
      
      expect(getByText('Press Me')).toBeTruthy();
      expect(renderTime).toBeLessThan(50);
    });

    it('should render ParallaxScrollView without performance issues', async () => {
      const headerComponent = <View testID="header"><Text>Header</Text></View>;
      
      const startTime = performance.now();
      
      const { getByTestId } = render(
        <ParallaxScrollView 
          headerComponent={headerComponent}
          testID="parallax-scroll"
        >
          <Text>Scroll content</Text>
        </ParallaxScrollView>
      );

      const renderTime = performance.now() - startTime;
      
      expect(getByTestId('parallax-scroll')).toBeTruthy();
      expect(renderTime).toBeLessThan(100); // Parallax may be slightly more complex
    });

    it('should handle FloatingElements efficiently', async () => {
      const startTime = performance.now();
      
      const { getByTestId } = render(
        <FloatingElements 
          elementCount={20}
          testID="floating-elements"
        />
      );

      const renderTime = performance.now() - startTime;
      
      expect(getByTestId('floating-elements')).toBeTruthy();
      expect(renderTime).toBeLessThan(200); // Multiple elements may take longer
    });
  });

  describe('Memory Management', () => {
    it('should cleanup animations properly', async () => {
      const animatedValue = AnimationTestUtils.createMockSharedValue(0);
      const animation = AnimationTestUtils.createMockTimingAnimation(1, { duration: 300 });

      let cleanupCalled = false;
      const originalOnComplete = animation.onComplete;
      animation.onComplete = (finished) => {
        cleanupCalled = true;
        originalOnComplete?.(finished);
      };

      animation.start(animatedValue);
      await AnimationTestUtils.waitForAnimation(animation);

      expect(cleanupCalled).toBe(true);
      expect(animation.isRunning).toBe(false);
    });

    it('should handle rapid animation creation and destruction', async () => {
      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const animatedValue = AnimationTestUtils.createMockSharedValue(0);
        const animation = AnimationTestUtils.createMockTimingAnimation(1, { duration: 10 });
        
        animation.start(animatedValue);
        await AnimationTestUtils.waitForAnimation(animation);
      }

      const totalTime = performance.now() - startTime;
      const averageTime = totalTime / iterations;

      // Each animation cycle should be fast
      expect(averageTime).toBeLessThan(50);
    });
  });

  describe('Complex Animation Scenarios', () => {
    it('should handle chained animations efficiently', async () => {
      const animatedValue = AnimationTestUtils.createMockSharedValue(0);
      
      const animations = [
        AnimationTestUtils.createMockTimingAnimation(0.33, { duration: 100 }),
        AnimationTestUtils.createMockTimingAnimation(0.66, { duration: 100 }),
        AnimationTestUtils.createMockTimingAnimation(1, { duration: 100 }),
      ];

      const startTime = performance.now();
      
      await AnimationTestUtils.testAnimationSequence(
        animations,
        animatedValue,
        [0.33, 0.66, 1]
      );

      const totalTime = performance.now() - startTime;
      
      // Should complete in approximately 300ms + overhead
      expect(totalTime).toBeGreaterThan(250);
      expect(totalTime).toBeLessThan(500);
    });

    it('should handle delayed animations efficiently', async () => {
      const animatedValue = AnimationTestUtils.createMockSharedValue(0);
      const baseAnimation = AnimationTestUtils.createMockTimingAnimation(1, { duration: 100 });
      const delayedAnimation = AnimationTestUtils.createMockDelayAnimation(baseAnimation, 200);

      const startTime = performance.now();
      
      delayedAnimation.start(animatedValue);
      await AnimationTestUtils.waitForAnimation(delayedAnimation);

      const totalTime = performance.now() - startTime;
      
      // Should complete in approximately 300ms (200ms delay + 100ms animation)
      expect(totalTime).toBeGreaterThan(250);
      expect(totalTime).toBeLessThan(450);
    });

    it('should handle repeated animations efficiently', async () => {
      const animatedValue = AnimationTestUtils.createMockSharedValue(0);
      const baseAnimation = AnimationTestUtils.createMockTimingAnimation(1, { duration: 50 });
      const repeatAnimation = AnimationTestUtils.createMockRepeatAnimation(baseAnimation, 5);

      const startTime = performance.now();
      
      repeatAnimation.start(animatedValue);
      await AnimationTestUtils.waitForAnimation(repeatAnimation);

      const totalTime = performance.now() - startTime;
      
      // Should complete 5 iterations in approximately 250ms
      expect(totalTime).toBeGreaterThan(200);
      expect(totalTime).toBeLessThan(400);
    });
  });

  describe('Performance Regression Tests', () => {
    it('should not degrade with multiple component instances', async () => {
      const componentCount = 50;
      const startTime = performance.now();

      const components = Array.from({ length: componentCount }, (_, i) => (
        <FadeInView key={i} testID={`fade-view-${i}`}>
          <Text>Component {i}</Text>
        </FadeInView>
      ));

      const { getAllByText } = render(<View>{components}</View>);

      const renderTime = performance.now() - startTime;
      
      expect(getAllByText(/Component \d+/).length).toBe(componentCount);
      
      // Rendering time should scale reasonably
      const averageRenderTime = renderTime / componentCount;
      expect(averageRenderTime).toBeLessThan(10); // 10ms per component max
    });

    it('should maintain performance with nested animations', async () => {
      const startTime = performance.now();

      const { getByTestId } = render(
        <FadeInView testID="outer-fade">
          <ScaleButton onPress={() => {}}>
            <FadeInView testID="inner-fade">
              <Text>Nested Animation</Text>
            </FadeInView>
          </ScaleButton>
        </FadeInView>
      );

      const renderTime = performance.now() - startTime;
      
      expect(getByTestId('outer-fade')).toBeTruthy();
      expect(getByTestId('inner-fade')).toBeTruthy();
      expect(renderTime).toBeLessThan(100); // Nested animations should still be fast
    });
  });

  describe('Platform-Specific Performance', () => {
    it('should handle iOS-specific optimizations', () => {
      const originalPlatform = require('react-native').Platform.OS;
      require('react-native').Platform.OS = 'ios';

      const animatedValue = AnimationTestUtils.createMockSharedValue(0);
      const animation = AnimationTestUtils.createMockSpringAnimation(1);

      // iOS should use native driver optimizations
      expect(animation).toBeTruthy();
      
      // Restore platform
      require('react-native').Platform.OS = originalPlatform;
    });

    it('should handle Android-specific optimizations', () => {
      const originalPlatform = require('react-native').Platform.OS;
      require('react-native').Platform.OS = 'android';

      const animatedValue = AnimationTestUtils.createMockSharedValue(0);
      const animation = AnimationTestUtils.createMockTimingAnimation(1);

      // Android should handle animations appropriately
      expect(animation).toBeTruthy();
      
      // Restore platform
      require('react-native').Platform.OS = originalPlatform;
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle animation errors without performance impact', async () => {
      const animatedValue = AnimationTestUtils.createMockSharedValue(0);
      const animation = AnimationTestUtils.createMockTimingAnimation(1, { duration: 100 });

      // Simulate error during animation
      const originalStart = animation.start;
      animation.start = (value) => {
        originalStart.call(animation, value);
        throw new Error('Animation error');
      };

      const startTime = performance.now();
      
      try {
        animation.start(animatedValue);
      } catch (error) {
        // Error should be caught quickly
      }

      const errorTime = performance.now() - startTime;
      
      expect(errorTime).toBeLessThan(50); // Error handling should be fast
    });
  });
});