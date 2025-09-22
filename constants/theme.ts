// Glass morphism design system and theme constants

export const glassTheme = {
  colors: {
    primary: '#FF6B35',
    secondary: '#2D3748',
    success: '#48BB78',
    warning: '#F6AD55',
    error: '#FC8181',
    background: {
      light: ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)'],
      dark: ['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.05)'],
      primary: ['rgba(255,107,53,0.2)', 'rgba(255,107,53,0.05)'],
    },
    border: {
      light: 'rgba(255,255,255,0.2)',
      dark: 'rgba(255,255,255,0.1)',
    },
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
      light: '#FFFFFF',
      muted: '#A0AEC0',
    }
  },
  blur: {
    light: 20,
    medium: 25,
    heavy: 30,
  },
  shadows: {
    glass: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    button: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    }
  }
};

export const getGradientColors = (tint: 'light' | 'dark' | 'default' | 'primary') => {
  switch (tint) {
    case 'light':
      return glassTheme.colors.background.light;
    case 'dark':
      return glassTheme.colors.background.dark;
    case 'primary':
      return glassTheme.colors.background.primary;
    default:
      return glassTheme.colors.background.light;
  }
};