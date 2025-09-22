import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { 
  PerformanceOptimizer, 
  DeviceCapabilityDetector,
  PerformanceMetrics,
  AnimationRegistry 
} from '../../services/performanceService';

interface PerformanceMonitorProps {
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  compact?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  visible = __DEV__, // Only show in development by default
  position = 'top-right',
  compact = false,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [capabilities] = useState(() => DeviceCapabilityDetector.getCapabilities());
  
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (!visible) return;

    // Start performance monitoring
    PerformanceOptimizer.startMonitoring();
    PerformanceOptimizer.enableAutoOptimization();

    // Subscribe to metrics updates
    const fpsMonitor = PerformanceOptimizer.getFPSMonitor();
    const unsubscribe = fpsMonitor.onMetricsUpdate(setMetrics);

    // Animate in
    scale.value = withSpring(1);
    opacity.value = withSpring(1);

    return () => {
      unsubscribe();
      PerformanceOptimizer.stopMonitoring();
      PerformanceOptimizer.disableAutoOptimization();
    };
  }, [visible]);

  if (!visible) return null;

  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 9999,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: 50, left: 10 };
      case 'top-right':
        return { ...baseStyle, top: 50, right: 10 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 50, left: 10 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 50, right: 10 };
      default:
        return { ...baseStyle, top: 50, right: 10 };
    }
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return '#4CAF50'; // Green
    if (fps >= 45) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getMemoryColor = (memory: number) => {
    if (memory < 100) return '#4CAF50'; // Green
    if (memory < 200) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const formatBytes = (bytes: number) => {
    return `${Math.round(bytes)}MB`;
  };

  return (
    <Animated.View style={[styles.container, getPositionStyle(), animatedStyle]}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
      >
        <Text style={styles.title}>
          {compact ? 'PERF' : 'Performance'}
        </Text>
        {metrics && (
          <Text style={[styles.fps, { color: getFPSColor(metrics.fps) }]}>
            {metrics.fps} FPS
          </Text>
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.details}>
          {metrics && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Current FPS:</Text>
                <Text style={[styles.value, { color: getFPSColor(metrics.fps) }]}>
                  {metrics.fps}
                </Text>
              </View>
              
              <View style={styles.row}>
                <Text style={styles.label}>Average FPS:</Text>
                <Text style={[styles.value, { color: getFPSColor(metrics.averageFPS) }]}>
                  {metrics.averageFPS}
                </Text>
              </View>
              
              <View style={styles.row}>
                <Text style={styles.label}>Frame Drops:</Text>
                <Text style={[styles.value, { color: metrics.frameDrops > 5 ? '#F44336' : '#4CAF50' }]}>
                  {metrics.frameDrops}
                </Text>
              </View>
              
              <View style={styles.row}>
                <Text style={styles.label}>Memory:</Text>
                <Text style={[styles.value, { color: getMemoryColor(metrics.memoryUsage) }]}>
                  {formatBytes(metrics.memoryUsage)}
                </Text>
              </View>
              
              <View style={styles.row}>
                <Text style={styles.label}>Animations:</Text>
                <Text style={styles.value}>
                  {metrics.animationCount}/{capabilities.maxAnimations}
                </Text>
              </View>
            </>
          )}
          
          <View style={styles.separator} />
          
          <View style={styles.row}>
            <Text style={styles.label}>Device:</Text>
            <Text style={[styles.value, { color: capabilities.isLowEnd ? '#F44336' : '#4CAF50' }]}>
              {capabilities.isLowEnd ? 'Low-end' : 'High-end'}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Blur Support:</Text>
            <Text style={[styles.value, { color: capabilities.supportsBlur ? '#4CAF50' : '#F44336' }]}>
              {capabilities.supportsBlur ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Memory Level:</Text>
            <Text style={styles.value}>
              {capabilities.memoryLevel.toUpperCase()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              const fpsMonitor = PerformanceOptimizer.getFPSMonitor();
              fpsMonitor.reset();
              AnimationRegistry.cleanup();
            }}
          >
            <Text style={styles.resetText}>Reset Metrics</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
    minWidth: 120,
    maxWidth: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fps: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  details: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#CCCCCC',
    fontSize: 10,
    flex: 1,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 8,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    padding: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

// Hook for using performance metrics in components
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  
  useEffect(() => {
    const fpsMonitor = PerformanceOptimizer.getFPSMonitor();
    const unsubscribe = fpsMonitor.onMetricsUpdate(setMetrics);
    
    return unsubscribe;
  }, []);
  
  return metrics;
};

// Performance warning component
export const PerformanceWarning: React.FC<{
  threshold?: number;
  onWarning?: (fps: number) => void;
}> = ({ threshold = 45, onWarning }) => {
  const metrics = usePerformanceMetrics();
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    if (metrics && metrics.fps < threshold) {
      setShowWarning(true);
      onWarning?.(metrics.fps);
      
      // Auto-hide warning after 3 seconds
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [metrics, threshold, onWarning]);
  
  if (!showWarning || !metrics) return null;
  
  return (
    <View style={styles.warningContainer}>
      <Text style={styles.warningText}>
        ⚠️ Low FPS: {metrics.fps}
      </Text>
    </View>
  );
};

const warningStyles = StyleSheet.create({
  warningContainer: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    borderRadius: 8,
    padding: 12,
    zIndex: 9998,
  },
  warningText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});