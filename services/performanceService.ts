import React from 'react';
import { Platform, Dimensions } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

// Device capability detection
export interface DeviceCapabilities {
  isLowEnd: boolean;
  supportsBlur: boolean;
  maxAnimations: number;
  preferredFrameRate: number;
  memoryLevel: 'low' | 'medium' | 'high';
}

// Performance metrics interface
export interface PerformanceMetrics {
  fps: number;
  averageFPS: number;
  frameDrops: number;
  memoryUsage: number;
  animationCount: number;
  lastMeasurement: number;
}

// FPS monitoring class
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fpsHistory: number[] = [];
  private frameDrops = 0;
  private isMonitoring = false;
  private animationFrameId: number | null = null;
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.measureFPS();
  }

  stop() {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private measureFPS = () => {
    if (!this.isMonitoring) return;

    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      const fps = this.frameCount;
      this.fpsHistory.push(fps);
      
      // Keep only last 30 measurements (30 seconds)
      if (this.fpsHistory.length > 30) {
        this.fpsHistory.shift();
      }
      
      // Count frame drops (FPS below 55)
      if (fps < 55) {
        this.frameDrops++;
        console.warn(`Performance warning: FPS ${fps}`);
      }
      
      // Notify callbacks
      const metrics: PerformanceMetrics = {
        fps,
        averageFPS: this.getAverageFPS(),
        frameDrops: this.frameDrops,
        memoryUsage: this.getMemoryUsage(),
        animationCount: AnimationRegistry.getActiveCount(),
        lastMeasurement: currentTime,
      };
      
      this.callbacks.forEach(callback => callback(metrics));
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    this.animationFrameId = requestAnimationFrame(this.measureFPS);
  };

  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  getCurrentFPS(): number {
    return this.fpsHistory[this.fpsHistory.length - 1] || 0;
  }

  getFrameDrops(): number {
    return this.frameDrops;
  }

  private getMemoryUsage(): number {
    // Estimate memory usage based on active animations and components
    const baseMemory = 50; // Base app memory in MB
    const animationMemory = AnimationRegistry.getActiveCount() * 2; // 2MB per animation
    return baseMemory + animationMemory;
  }

  onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  reset() {
    this.fpsHistory = [];
    this.frameDrops = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
  }
}

// Animation registry for tracking active animations
export class AnimationRegistry {
  private static animations = new Map<string, {
    id: string;
    type: string;
    startTime: number;
    sharedValue?: SharedValue<any>;
    cleanup?: () => void;
  }>();

  static register(id: string, type: string, sharedValue?: SharedValue<any>, cleanup?: () => void) {
    this.animations.set(id, {
      id,
      type,
      startTime: performance.now(),
      sharedValue,
      cleanup,
    });
  }

  static unregister(id: string) {
    const animation = this.animations.get(id);
    if (animation?.cleanup) {
      animation.cleanup();
    }
    this.animations.delete(id);
  }

  static getActiveCount(): number {
    return this.animations.size;
  }

  static getAnimations() {
    return Array.from(this.animations.values());
  }

  static cleanup() {
    this.animations.forEach((animation, id) => {
      if (animation.cleanup) {
        animation.cleanup();
      }
    });
    this.animations.clear();
  }

  static cleanupOldAnimations(maxAge = 30000) { // 30 seconds
    const now = performance.now();
    this.animations.forEach((animation, id) => {
      if (now - animation.startTime > maxAge) {
        this.unregister(id);
      }
    });
  }
}

// Device capability detector
export class DeviceCapabilityDetector {
  private static capabilities: DeviceCapabilities | null = null;

  static getCapabilities(): DeviceCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    const { width, height } = Dimensions.get('window');
    const screenSize = width * height;
    const isTablet = Math.min(width, height) >= 768;
    
    // Detect device performance level based on screen size and platform
    const isLowEnd = this.detectLowEndDevice(screenSize);
    
    this.capabilities = {
      isLowEnd,
      supportsBlur: !isLowEnd || Platform.OS === 'ios',
      maxAnimations: isLowEnd ? 3 : isTablet ? 8 : 5,
      preferredFrameRate: isLowEnd ? 30 : 60,
      memoryLevel: this.getMemoryLevel(screenSize, isLowEnd),
    };

    return this.capabilities;
  }

  private static detectLowEndDevice(screenSize: number): boolean {
    // Consider devices with small screens or older Android versions as low-end
    if (Platform.OS === 'android') {
      const androidVersion = Platform.Version as number;
      if (androidVersion < 23) return true; // Android 6.0 and below
    }
    
    // Screen size based detection
    if (screenSize < 800000) return true; // Less than ~800k pixels
    
    return false;
  }

  private static getMemoryLevel(screenSize: number, isLowEnd: boolean): 'low' | 'medium' | 'high' {
    if (isLowEnd) return 'low';
    if (screenSize > 2000000) return 'high'; // Large screens
    return 'medium';
  }

  static shouldReduceAnimations(): boolean {
    return this.getCapabilities().isLowEnd;
  }

  static shouldDisableBlur(): boolean {
    return !this.getCapabilities().supportsBlur;
  }

  static getMaxConcurrentAnimations(): number {
    return this.getCapabilities().maxAnimations;
  }
}

// Performance optimization utilities
export class PerformanceOptimizer {
  private static fpsMonitor = new FPSMonitor();
  private static isOptimizing = false;

  static startMonitoring() {
    this.fpsMonitor.start();
    
    // Auto-cleanup old animations every 30 seconds
    setInterval(() => {
      AnimationRegistry.cleanupOldAnimations();
    }, 30000);
  }

  static stopMonitoring() {
    this.fpsMonitor.stop();
  }

  static getFPSMonitor() {
    return this.fpsMonitor;
  }

  static enableAutoOptimization() {
    if (this.isOptimizing) return;
    
    this.isOptimizing = true;
    this.fpsMonitor.onMetricsUpdate((metrics) => {
      // Auto-optimize when FPS drops below threshold
      if (metrics.fps < 45 && metrics.animationCount > 3) {
        console.warn('Auto-optimization triggered: reducing animation quality');
        this.reduceAnimationQuality();
      }
      
      // Cleanup memory when usage is high
      if (metrics.memoryUsage > 200) {
        console.warn('High memory usage detected: cleaning up animations');
        AnimationRegistry.cleanupOldAnimations(15000); // More aggressive cleanup
      }
    });
  }

  static disableAutoOptimization() {
    this.isOptimizing = false;
  }

  private static reduceAnimationQuality() {
    // This would be implemented to reduce animation complexity
    // For now, we'll just log the action
    console.log('Reducing animation quality for better performance');
  }

  static getOptimizedAnimationConfig(baseConfig: any) {
    const capabilities = DeviceCapabilityDetector.getCapabilities();
    
    if (capabilities.isLowEnd) {
      return {
        ...baseConfig,
        duration: Math.min(baseConfig.duration * 0.7, 200), // Faster animations
        damping: Math.max(baseConfig.damping * 1.5, 20), // Less bouncy
        stiffness: Math.min(baseConfig.stiffness * 0.8, 150), // Less stiff
      };
    }
    
    return baseConfig;
  }

  static shouldSkipAnimation(): boolean {
    const activeAnimations = AnimationRegistry.getActiveCount();
    const maxAnimations = DeviceCapabilityDetector.getMaxConcurrentAnimations();
    
    return activeAnimations >= maxAnimations;
  }
}

// Global performance instance
export const performanceMonitor = new FPSMonitor();
export const deviceCapabilities = DeviceCapabilityDetector.getCapabilities();

// Performance hooks for React components
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  
  React.useEffect(() => {
    const unsubscribe = performanceMonitor.onMetricsUpdate(setMetrics);
    performanceMonitor.start();
    
    return () => {
      unsubscribe();
      performanceMonitor.stop();
    };
  }, []);
  
  return metrics;
};