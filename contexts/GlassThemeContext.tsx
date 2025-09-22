import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { glassTheme } from '../constants/theme';
import { glassConfigs } from '../constants/glassStyles';

interface GlassThemeContextType {
  theme: typeof glassTheme;
  isDark: boolean;
  glassConfig: typeof glassConfigs.normal | typeof glassConfigs.normalDark;
  getGlassConfig: (variant?: 'subtle' | 'normal' | 'strong' | 'primary') => any;
  colors: typeof glassTheme.colors;
  spacing: typeof glassTheme.spacing;
  borderRadius: typeof glassTheme.borderRadius;
  typography: typeof glassTheme.typography;
  shadows: typeof glassTheme.shadows;
}

const GlassThemeContext = createContext<GlassThemeContextType | undefined>(undefined);

interface GlassThemeProviderProps {
  children: ReactNode;
  forceDarkMode?: boolean;
}

export const GlassThemeProvider: React.FC<GlassThemeProviderProps> = ({
  children,
  forceDarkMode = false,
}) => {
  const systemColorScheme = useColorScheme();
  const isDark = forceDarkMode || systemColorScheme === 'dark';

  const getGlassConfig = (variant: 'subtle' | 'normal' | 'strong' | 'primary' = 'normal') => {
    if (variant === 'primary') {
      return glassConfigs.primary;
    }
    
    if (isDark) {
      switch (variant) {
        case 'subtle':
          return glassConfigs.subtleDark;
        case 'strong':
          return glassConfigs.strongDark;
        case 'normal':
        default:
          return glassConfigs.normalDark;
      }
    } else {
      switch (variant) {
        case 'subtle':
          return glassConfigs.subtle;
        case 'strong':
          return glassConfigs.strong;
        case 'normal':
        default:
          return glassConfigs.normal;
      }
    }
  };

  const contextValue: GlassThemeContextType = {
    theme: glassTheme,
    isDark,
    glassConfig: isDark ? glassConfigs.normalDark : glassConfigs.normal,
    getGlassConfig,
    colors: glassTheme.colors,
    spacing: glassTheme.spacing,
    borderRadius: glassTheme.borderRadius,
    typography: glassTheme.typography,
    shadows: glassTheme.shadows,
  };

  return (
    <GlassThemeContext.Provider value={contextValue}>
      {children}
    </GlassThemeContext.Provider>
  );
};

export const useGlassTheme = (): GlassThemeContextType => {
  const context = useContext(GlassThemeContext);
  if (!context) {
    throw new Error('useGlassTheme must be used within a GlassThemeProvider');
  }
  return context;
};

// Hook for getting consistent glass configurations
export const useGlassConfig = (variant?: 'subtle' | 'normal' | 'strong' | 'primary') => {
  const { getGlassConfig } = useGlassTheme();
  return getGlassConfig(variant);
};

// Hook for getting theme-aware colors
export const useThemeColors = () => {
  const { colors, isDark } = useGlassTheme();
  
  return {
    ...colors,
    // Dynamic colors based on theme
    background: isDark ? colors.background.dark : colors.background.light,
    border: isDark ? colors.border.dark : colors.border.light,
    text: {
      primary: isDark ? colors.text.light : colors.text.primary,
      secondary: isDark ? colors.text.muted : colors.text.secondary,
      muted: colors.text.muted,
    },
  };
};