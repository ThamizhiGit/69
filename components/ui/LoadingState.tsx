import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GlassContainer } from '../glass/GlassContainer';
import { glassTheme } from '../../constants/theme';
import { standardGlassStyles, glassConfigs } from '../../constants/glassStyles';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  variant?: 'glass' | 'transparent';
  style?: any;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'large',
  variant = 'glass',
  style,
}) => {
  const content = (
    <View style={[standardGlassStyles.loadingContainer, style]}>
      <ActivityIndicator 
        size={size} 
        color={glassTheme.colors.primary} 
      />
      {message && (
        <Text style={styles.loadingText}>
          {message}
        </Text>
      )}
    </View>
  );

  if (variant === 'glass') {
    return (
      <GlassContainer
        {...glassConfigs.normal}
        style={standardGlassStyles.card}
      >
        {content}
      </GlassContainer>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  loadingText: {
    marginTop: glassTheme.spacing.md,
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: glassTheme.typography.weights.medium,
  },
});