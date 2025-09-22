import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { GlassContainer } from './GlassContainer';
import { glassTheme } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  disabled?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  onPress,
  intensity = 15,
  tint = 'light',
  style,
  contentStyle,
  disabled = false,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;
  
  return (
    <CardWrapper
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.cardWrapper, style]}
    >
      <GlassContainer
        intensity={intensity}
        tint={tint}
        borderRadius={glassTheme.borderRadius.lg}
        style={styles.container}
      >
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </GlassContainer>
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    ...glassTheme.shadows.card,
  },
  container: {
    minHeight: 80,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});