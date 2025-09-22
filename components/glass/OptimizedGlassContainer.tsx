import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { DeviceCapabilityDetector } from '../../services/performanceService';

interface OptimizedGlassContainerProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: number;
  borderWidth?: number;
  style?: ViewStyle;
  fallbackStyle?: ViewStyle;
  forceDisableBlur?: boolean;
}

export const OptimizedGlassContainer: React.FC<OptimizedGlassContainerProps> = ({
  children,
  intensity = 20,
  tint = 'light',
  borderRadius = 16,
  borderWidth = 1,
  style,
  fallbackStyle,
  forceDisableBlur = false,
}) => {
  const capabilities = DeviceCapabilityDetector.getCapabilities();
  const shouldUseBlur = capabilities.supportsBlur && !forceDisableBlur;
  
  // Adjust intensity based on device capabilities
  const optimizedIntensity = capabilities.isLowEnd 
    ? Math.min(intensity * 0.7, 15) 
    : intensity;

  const getGradientColors = (tintColor: string) => {
    const opacity = capabilities.isLowEnd ? 0.15 : 0.2;
    
    switch (tintColor) {
      case 'light':
        return [
          `rgba(255, 255, 255, ${opacity})`,
          `rgba(255, 255, 255, ${opacity * 0.5})`
        ];
      case 'dark':
        return [
          `rgba(0, 0, 0, ${opacity})`,
          `rgba(0, 0, 0, ${opacity * 0.5})`
        ];
      default:
        return [
          `rgba(255, 255, 255, ${opacity * 0.8})`,
          `rgba(255, 255, 255, ${opacity * 0.3})`
        ];
    }
  };

  const glassStyles = {
    container: {
      borderRadius,
      overflow: 'hidden' as const,
    },
    gradient: {
      flex: 1,
      borderRadius,
      borderWidth,
      borderColor: capabilities.isLowEnd 
        ? `rgba(255, 255, 255, 0.1)` 
        : `rgba(255, 255, 255, 0.2)`,
    },
    fallback: {
      backgroundColor: tint === 'dark' 
        ? 'rgba(0, 0, 0, 0.3)' 
        : 'rgba(255, 255, 255, 0.3)',
      borderRadius,
      borderWidth,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      ...fallbackStyle,
    }
  };

  // Fallback for low-end devices or when blur is disabled
  if (!shouldUseBlur) {
    return (
      <View style={[glassStyles.fallback, style]}>
        {children}
      </View>
    );
  }

  // Full glass effect for capable devices
  return (
    <BlurView 
      intensity={optimizedIntensity} 
      tint={tint} 
      style={[glassStyles.container, style]}
    >
      <LinearGradient
        colors={getGradientColors(tint)}
        style={glassStyles.gradient}
      >
        {children}
      </LinearGradient>
    </BlurView>
  );
};

// Performance-optimized glass card
export const OptimizedGlassCard: React.FC<OptimizedGlassContainerProps & {
  elevation?: number;
}> = ({ elevation = 8, ...props }) => {
  const capabilities = DeviceCapabilityDetector.getCapabilities();
  
  const shadowStyle = capabilities.isLowEnd ? {} : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: 0.1,
    shadowRadius: elevation,
    elevation: elevation,
  };

  return (
    <OptimizedGlassContainer
      {...props}
      style={[shadowStyle, props.style]}
    />
  );
};

// Lightweight glass effect for lists and repeated elements
export const LightweightGlassContainer: React.FC<OptimizedGlassContainerProps> = (props) => {
  return (
    <OptimizedGlassContainer
      {...props}
      intensity={10}
      forceDisableBlur={DeviceCapabilityDetector.shouldReduceAnimations()}
    />
  );
};