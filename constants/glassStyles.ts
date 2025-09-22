// Standardized glass morphism styles for UI consistency
import { StyleSheet } from 'react-native';
import { glassTheme } from './theme';

// Standard glass effect configurations
export const glassConfigs = {
  // Standard glass intensities
  subtle: { intensity: 15, tint: 'light' as const },
  normal: { intensity: 20, tint: 'light' as const },
  strong: { intensity: 25, tint: 'light' as const },
  
  // Dark mode variants
  subtleDark: { intensity: 15, tint: 'dark' as const },
  normalDark: { intensity: 20, tint: 'dark' as const },
  strongDark: { intensity: 25, tint: 'dark' as const },
  
  // Primary branded variants
  primary: { intensity: 20, tint: 'primary' as const },
  primaryStrong: { intensity: 25, tint: 'primary' as const },
};

// Standardized glass component styles
export const standardGlassStyles = StyleSheet.create({
  // Container variants
  card: {
    borderRadius: glassTheme.borderRadius.lg,
    borderWidth: 1,
    ...glassTheme.shadows.card,
  },
  
  modal: {
    borderRadius: glassTheme.borderRadius.xl,
    borderWidth: 1,
    ...glassTheme.shadows.glass,
  },
  
  bottomSheet: {
    borderTopLeftRadius: glassTheme.borderRadius.xl,
    borderTopRightRadius: glassTheme.borderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    ...glassTheme.shadows.glass,
  },
  
  navbar: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    ...glassTheme.shadows.card,
  },
  
  button: {
    borderRadius: glassTheme.borderRadius.lg,
    borderWidth: 1,
    ...glassTheme.shadows.button,
  },
  
  // Content padding standards
  contentPadding: {
    padding: glassTheme.spacing.md,
  },
  
  contentPaddingLarge: {
    padding: glassTheme.spacing.lg,
  },
  
  contentPaddingSmall: {
    padding: glassTheme.spacing.sm,
  },
  
  // Loading state styles
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  
  // Error state styles
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: glassTheme.spacing.lg,
  },
  
  errorText: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.error,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.md,
  },
  
  // Animation consistency
  standardTransition: {
    duration: 300,
  },
  
  fastTransition: {
    duration: 200,
  },
  
  slowTransition: {
    duration: 500,
  },
});

// Glass effect validation utility
export const validateGlassConfig = (config: { intensity?: number; tint?: string }) => {
  const { intensity = 20, tint = 'light' } = config;
  
  // Ensure intensity is within valid range
  const validIntensity = Math.max(10, Math.min(30, intensity));
  
  // Ensure tint is valid
  const validTints = ['light', 'dark', 'default', 'primary'];
  const validTint = validTints.includes(tint) ? tint : 'light';
  
  return { intensity: validIntensity, tint: validTint };
};

// Standard spacing utilities
export const spacing = {
  xs: glassTheme.spacing.xs,
  sm: glassTheme.spacing.sm,
  md: glassTheme.spacing.md,
  lg: glassTheme.spacing.lg,
  xl: glassTheme.spacing.xl,
  xxl: glassTheme.spacing.xxl,
};

// Standard border radius utilities
export const borderRadius = {
  sm: glassTheme.borderRadius.sm,
  md: glassTheme.borderRadius.md,
  lg: glassTheme.borderRadius.lg,
  xl: glassTheme.borderRadius.xl,
  full: glassTheme.borderRadius.full,
};