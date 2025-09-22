import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainerProps } from '../../types';
import { glassTheme, getGradientColors } from '../../constants/theme';

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  intensity = 20,
  tint = 'light',
  borderRadius = 16,
  borderWidth = 1,
  style,
}) => {
  const gradientColors = getGradientColors(tint);
  const borderColor = tint === 'dark' 
    ? glassTheme.colors.border.dark 
    : glassTheme.colors.border.light;
  
  // Map custom tint values to valid BlurView tint values
  const getValidTint = (customTint: string) => {
    switch (customTint) {
      case 'primary':
        return 'light'; // Use light for primary
      case 'dark':
        return 'dark';
      case 'light':
      case 'default':
      default:
        return 'light';
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={intensity}
        tint={getValidTint(tint)}
        style={[
          styles.blurView,
          {
            borderRadius,
            overflow: 'hidden',
          }
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            {
              borderRadius,
              borderWidth,
              borderColor,
            }
          ]}
        >
          <View style={styles.content}>
            {children}
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...glassTheme.shadows.glass,
    backgroundColor: 'transparent',
  },
  blurView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  content: {
    flex: 1,
    padding: glassTheme.spacing.md,
    backgroundColor: 'transparent',
  },
});