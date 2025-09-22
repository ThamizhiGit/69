import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  PlatformService, 
  usePlatformConfig, 
  useScreenInfo,
  useResponsiveValue 
} from '../../services/platformService';
import { 
  getPlatformAnimationConfig, 
  getPlatformGlassConfig,
  createOptimizedAnimationConfig 
} from '../../constants/platformAnimations';
import { ResponsiveUtils } from '../../utils/responsive';

// Platform-optimized glass container
interface PlatformGlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  fallbackOpacity?: number;
}

export const PlatformGlassContainer: React.FC<PlatformGlassContainerProps> = ({
  children,
  style,
  intensity,
  fallbackOpacity = 0.1,
}) => {
  const glassConfig = getPlatformGlassConfig();
  const shouldUseBlur = PlatformService.shouldUseBlur();
  
  const effectiveIntensity = intensity || glassConfig.blurIntensity;
  
  if (!shouldUseBlur) {
    // Fallback for platforms that don't support blur
    return (
      <View
        style={[
          {
            backgroundColor: glassConfig.backgroundColor || `rgba(255, 255, 255, ${fallbackOpacity})`,
            borderRadius: glassConfig.borderRadius,
            borderWidth: glassConfig.borderWidth,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={effectiveIntensity}
      tint="light"
      style={[
        {
          borderRadius: glassConfig.borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)']}
        style={{
          flex: 1,
          borderRadius: glassConfig.borderRadius,
          borderWidth: glassConfig.borderWidth,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}
      >
        {children}
      </LinearGradient>
    </BlurView>
  );
};

// Platform-optimized button
interface PlatformButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export const PlatformButton: React.FC<PlatformButtonProps> = ({
  children,
  onPress,
  style,
  textStyle,
  size = 'medium',
  variant = 'primary',
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const platformConfig = getPlatformAnimationConfig();
  const buttonDimensions = ResponsiveUtils.getButtonDimensions(size);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    
    const config = createOptimizedAnimationConfig({
      damping: platformConfig.spring.snappy.damping,
      stiffness: platformConfig.spring.snappy.stiffness,
    });
    
    scale.value = withSpring(platformConfig.transforms.scale.pressed, config);
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    const config = createOptimizedAnimationConfig({
      damping: platformConfig.spring.gentle.damping,
      stiffness: platformConfig.spring.gentle.stiffness,
    });
    
    scale.value = withSpring(1, config);
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: buttonDimensions.height,
      paddingHorizontal: buttonDimensions.paddingHorizontal,
      borderRadius: ResponsiveUtils.rbr(12),
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: '#007AFF',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => ({
    fontSize: buttonDimensions.fontSize,
    fontWeight: '600',
    color: variant === 'primary' ? '#FFFFFF' : '#007AFF',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <Animated.View style={[getButtonStyle(), style, animatedStyle]}>
        {typeof children === 'string' ? (
          <Text style={[getTextStyle(), textStyle]}>{children}</Text>
        ) : (
          children
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Platform-optimized card
interface PlatformCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: number;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
  children,
  style,
  onPress,
  elevation = 4,
}) => {
  const scale = useSharedValue(1);
  const glassConfig = getPlatformGlassConfig();
  const cardDimensions = ResponsiveUtils.getCardDimensions();
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!onPress) return;
    
    const config = createOptimizedAnimationConfig();
    scale.value = withSpring(0.98, config);
  };

  const handlePressOut = () => {
    if (!onPress) return;
    
    const config = createOptimizedAnimationConfig();
    scale.value = withSpring(1, config);
  };

  const cardStyle: ViewStyle = {
    borderRadius: glassConfig.borderRadius,
    margin: cardDimensions.margin,
    ...PlatformService.isIOS() && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: glassConfig.shadowOpacity,
      shadowRadius: glassConfig.shadowRadius,
    },
    ...PlatformService.isAndroid() && {
      elevation: elevation,
    },
  };

  const CardContent = (
    <Animated.View style={[cardStyle, style, animatedStyle]}>
      <PlatformGlassContainer>
        {children}
      </PlatformGlassContainer>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

// Responsive grid container
interface ResponsiveGridProps {
  children: React.ReactNode[];
  minItemWidth?: number;
  spacing?: number;
  style?: ViewStyle;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  minItemWidth = 150,
  spacing = 16,
  style,
}) => {
  const columns = ResponsiveUtils.getGridColumns(minItemWidth);
  const screenInfo = useScreenInfo();
  
  const renderGrid = () => {
    const rows: React.ReactNode[][] = [];
    
    for (let i = 0; i < children.length; i += columns) {
      rows.push(children.slice(i, i + columns));
    }
    
    return rows.map((row, rowIndex) => (
      <View
        key={rowIndex}
        style={{
          flexDirection: 'row',
          justifyContent: screenInfo.deviceType === 'tablet' ? 'flex-start' : 'space-between',
          marginBottom: spacing,
        }}
      >
        {row.map((child, colIndex) => (
          <View
            key={colIndex}
            style={{
              flex: screenInfo.deviceType === 'tablet' ? 0 : 1,
              marginRight: screenInfo.deviceType === 'tablet' && colIndex < row.length - 1 ? spacing : 0,
            }}
          >
            {child}
          </View>
        ))}
        {/* Fill empty spaces in tablet layout */}
        {screenInfo.deviceType === 'tablet' && row.length < columns &&
          Array.from({ length: columns - row.length }).map((_, index) => (
            <View key={`empty-${index}`} style={{ flex: 0, width: minItemWidth }} />
          ))
        }
      </View>
    ));
  };

  return (
    <View style={[{ padding: spacing }, style]}>
      {renderGrid()}
    </View>
  );
};

// Platform-optimized modal
interface PlatformModalProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  style?: ViewStyle;
}

export const PlatformModal: React.FC<PlatformModalProps> = ({
  children,
  visible,
  onClose,
  style,
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const modalDimensions = ResponsiveUtils.getModalDimensions();
  
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  const modalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    const config = createOptimizedAnimationConfig();
    
    if (visible) {
      opacity.value = withTiming(1, config);
      scale.value = withSpring(1, config);
    } else {
      opacity.value = withTiming(0, config);
      scale.value = withSpring(0.8, config);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    }}>
      {/* Backdrop */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          backdropStyle,
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      
      {/* Modal Content */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <Animated.View
          style={[
            {
              width: modalDimensions.width,
              maxWidth: modalDimensions.maxWidth,
              maxHeight: modalDimensions.maxHeight,
            },
            style,
            modalStyle,
          ]}
        >
          <PlatformGlassContainer>
            {children}
          </PlatformGlassContainer>
        </Animated.View>
      </View>
    </View>
  );
};

// Platform-optimized text with responsive sizing
interface PlatformTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export const PlatformText: React.FC<PlatformTextProps> = ({
  children,
  style,
  size = 'medium',
  weight = 'normal',
}) => {
  const fontSize = useResponsiveValue({
    xs: size === 'small' ? 12 : size === 'medium' ? 14 : size === 'large' ? 16 : 18,
    sm: size === 'small' ? 13 : size === 'medium' ? 15 : size === 'large' ? 17 : 19,
    md: size === 'small' ? 14 : size === 'medium' ? 16 : size === 'large' ? 18 : 20,
    lg: size === 'small' ? 15 : size === 'medium' ? 17 : size === 'large' ? 19 : 22,
    xl: size === 'small' ? 16 : size === 'medium' ? 18 : size === 'large' ? 20 : 24,
    default: size === 'small' ? 14 : size === 'medium' ? 16 : size === 'large' ? 18 : 20,
  });

  const fontWeight = weight === 'normal' ? '400' : 
                   weight === 'medium' ? '500' : 
                   weight === 'semibold' ? '600' : '700';

  return (
    <Text
      style={[
        {
          fontSize,
          fontWeight,
          color: '#FFFFFF',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};