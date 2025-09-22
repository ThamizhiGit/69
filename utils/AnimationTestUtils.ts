/**
 * Animation Testing Utilities
 * 
 * Provides utilities for testing React Native Reanimated animations
 * in a Jest environment with proper mocking and validation.
 */

export class MockAnimatedValue {
  private _value: number;
  private listeners: ((value: number) => void)[] = [];

  constructor(initialValue: number) {
    this._value = initialValue;
  }

  get value(): number {
    return this._value;
  }

  set value(newValue: number) {
    this._value = newValue;
    this.listeners.forEach(listener => listener(newValue));
  }

  addListener(listener: (value: number) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (value: number) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  removeAllListeners(): void {
    this.listeners = [];
  }
}

export class MockAnimationConfig {
  public type: string;
  public toValue: any;
  public config: any;
  public isRunning: boolean = false;
  public onProgress?: (progress: number) => void;
  public onComplete?: (finished: boolean) => void;

  constructor(type: string, toValue: any, config: any = {}) {
    this.type = type;
    this.toValue = toValue;
    this.config = config;
  }

  start(animatedValue: MockAnimatedValue): void {
    this.isRunning = true;
    
    if (this.type === 'delay') {
      const delay = this.config.delay || 0;
      setTimeout(() => {
        if (this.toValue instanceof MockAnimationConfig) {
          this.toValue.start(animatedValue);
        }
      }, delay);
      return;
    }

    if (this.type === 'repeat') {
      const count = this.config.count || -1; // -1 for infinite
      const baseAnimation = this.toValue as MockAnimationConfig;
      
      let currentCount = 0;
      const runIteration = () => {
        if (count === -1 || currentCount < count) {
          baseAnimation.onComplete = (finished) => {
            if (finished && (count === -1 || currentCount < count - 1)) {
              currentCount++;
              setTimeout(runIteration, 0);
            } else {
              this.isRunning = false;
              this.onComplete?.(finished);
            }
          };
          baseAnimation.start(animatedValue);
        }
      };
      
      runIteration();
      return;
    }

    const duration = this.getDuration();
    const startValue = animatedValue.value;
    const endValue = typeof this.toValue === 'number' ? this.toValue : 1;
    const startTime = performance.now();

    const animate = () => {
      if (!this.isRunning) {
        this.onComplete?.(false);
        return;
      }

      const currentTime = performance.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let easedProgress = progress;
      if (this.type === 'spring') {
        // Simple spring easing approximation
        easedProgress = 1 - Math.exp(-5 * progress) * Math.cos(10 * progress);
      }

      const currentValue = startValue + (endValue - startValue) * easedProgress;
      animatedValue.value = currentValue;

      this.onProgress?.(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isRunning = false;
        this.onComplete?.(true);
      }
    };

    requestAnimationFrame(animate);
  }

  stop(): void {
    this.isRunning = false;
  }

  private getDuration(): number {
    if (this.type === 'spring') {
      // Estimate spring duration based on damping and stiffness
      const damping = this.config.damping || 15;
      const stiffness = this.config.stiffness || 200;
      return Math.max(300, 1000 / Math.sqrt(stiffness / damping));
    }
    
    return this.config.duration || 300;
  }
}

export function createMockAnimation(
  type: string, 
  toValue: any, 
  config: any = {}
): MockAnimationConfig {
  return new MockAnimationConfig(type, toValue, config);
}

export function waitForAnimation(animation: MockAnimationConfig): Promise<void> {
  return new Promise((resolve) => {
    if (!animation.isRunning) {
      resolve();
      return;
    }

    const originalOnComplete = animation.onComplete;
    animation.onComplete = (finished) => {
      originalOnComplete?.(finished);
      resolve();
    };
  });
}

export async function expectAnimationToComplete(
  animation: MockAnimationConfig,
  animatedValue: MockAnimatedValue,
  expectedFinalValue: number,
  tolerance: number = 0.01
): Promise<void> {
  await waitForAnimation(animation);
  expect(Math.abs(animatedValue.value - expectedFinalValue)).toBeLessThanOrEqual(tolerance);
}

export async function expectAnimationValues(
  animation: MockAnimationConfig,
  animatedValue: MockAnimatedValue,
  checkPoints: { progress: number; expectedValue: number; tolerance?: number }[]
): Promise<void> {
  const values: number[] = [];
  const progresses: number[] = [];

  animation.onProgress = (progress) => {
    progresses.push(progress);
    values.push(animatedValue.value);
  };

  await waitForAnimation(animation);

  checkPoints.forEach(({ progress, expectedValue, tolerance = 0.1 }) => {
    // Find the closest recorded progress to the target
    let closestIndex = 0;
    let closestDiff = Math.abs(progresses[0] - progress);

    for (let i = 1; i < progresses.length; i++) {
      const diff = Math.abs(progresses[i] - progress);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = i;
      }
    }

    const actualValue = values[closestIndex];
    expect(Math.abs(actualValue - expectedValue)).toBeLessThanOrEqual(tolerance);
  });
}

export class AnimationTestUtils {
  static createMockSharedValue(initialValue: number): MockAnimatedValue {
    return new MockAnimatedValue(initialValue);
  }

  static createMockSpringAnimation(
    toValue: number,
    config: { damping?: number; stiffness?: number; mass?: number } = {}
  ): MockAnimationConfig {
    return createMockAnimation('spring', toValue, {
      damping: 15,
      stiffness: 200,
      mass: 1,
      ...config,
    });
  }

  static createMockTimingAnimation(
    toValue: number,
    config: { duration?: number; easing?: string } = {}
  ): MockAnimationConfig {
    return createMockAnimation('timing', toValue, {
      duration: 300,
      ...config,
    });
  }

  static createMockDelayAnimation(
    animation: MockAnimationConfig,
    delay: number
  ): MockAnimationConfig {
    return createMockAnimation('delay', animation, { delay });
  }

  static createMockRepeatAnimation(
    animation: MockAnimationConfig,
    count: number = -1
  ): MockAnimationConfig {
    return createMockAnimation('repeat', animation, { count });
  }

  static async testAnimationSequence(
    animations: MockAnimationConfig[],
    animatedValue: MockAnimatedValue,
    expectedValues: number[]
  ): Promise<void> {
    expect(animations.length).toBe(expectedValues.length);

    for (let i = 0; i < animations.length; i++) {
      animations[i].start(animatedValue);
      await waitForAnimation(animations[i]);
      await expectAnimationToComplete(animations[i], animatedValue, expectedValues[i]);
    }
  }

  static async testParallelAnimations(
    animations: MockAnimationConfig[],
    animatedValues: MockAnimatedValue[],
    expectedValues: number[]
  ): Promise<void> {
    expect(animations.length).toBe(animatedValues.length);
    expect(animations.length).toBe(expectedValues.length);

    // Start all animations
    animations.forEach((animation, index) => {
      animation.start(animatedValues[index]);
    });

    // Wait for all to complete
    await Promise.all(animations.map(animation => waitForAnimation(animation)));

    // Check final values
    expectedValues.forEach((expectedValue, index) => {
      expect(Math.abs(animatedValues[index].value - expectedValue)).toBeLessThanOrEqual(0.01);
    });
  }

  static measureAnimationPerformance(
    animation: MockAnimationConfig,
    animatedValue: MockAnimatedValue
  ): Promise<{ duration: number; frameCount: number; averageFPS: number }> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let frameCount = 0;

      animation.onProgress = () => {
        frameCount++;
      };

      animation.onComplete = () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        const averageFPS = frameCount > 0 ? (frameCount / duration) * 1000 : 0;

        resolve({
          duration,
          frameCount,
          averageFPS,
        });
      };

      animation.start(animatedValue);
    });
  }

  static expectSmoothAnimation(
    frameCount: number,
    duration: number,
    minFPS: number = 30
  ): void {
    const actualFPS = (frameCount / duration) * 1000;
    expect(actualFPS).toBeGreaterThanOrEqual(minFPS);
  }

  static expectAnimationDuration(
    actualDuration: number,
    expectedDuration: number,
    tolerance: number = 50 // 50ms tolerance
  ): void {
    expect(Math.abs(actualDuration - expectedDuration)).toBeLessThanOrEqual(tolerance);
  }
}

// Mock implementations for react-native-reanimated functions
export const mockReanimatedFunctions = {
  useSharedValue: (initial: any) => new MockAnimatedValue(initial),
  useAnimatedStyle: (fn: any) => ({}),
  withSpring: (value: any, config?: any) => createMockAnimation('spring', value, config),
  withTiming: (value: any, config?: any) => createMockAnimation('timing', value, config),
  withDelay: (delay: number, animation: any) => createMockAnimation('delay', animation, { delay }),
  withRepeat: (animation: any, count?: number) => createMockAnimation('repeat', animation, { count }),
  interpolate: (value: number, input: number[], output: number[]) => {
    if (input.length !== output.length) return output[0];
    
    for (let i = 0; i < input.length - 1; i++) {
      if (value >= input[i] && value <= input[i + 1]) {
        const ratio = (value - input[i]) / (input[i + 1] - input[i]);
        return output[i] + ratio * (output[i + 1] - output[i]);
      }
    }
    
    return value <= input[0] ? output[0] : output[output.length - 1];
  },
  runOnJS: (fn: any) => fn,
};