import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { GlassContainer } from './GlassContainer';
import { GlassCard } from './GlassCard';
import { glassTheme } from '../../constants/theme';

export const GlassDemo: React.FC = () => {
  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop'
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Glass Morphism Demo</Text>
        
        {/* Light Glass Container */}
        <GlassContainer
          intensity={20}
          tint="light"
          style={styles.glassContainer}
        >
          <Text style={styles.glassText}>Light Glass Container</Text>
          <Text style={styles.glassSubtext}>
            This demonstrates the glass morphism effect with light tint and 20px blur intensity.
          </Text>
        </GlassContainer>

        {/* Dark Glass Container */}
        <GlassContainer
          intensity={25}
          tint="dark"
          style={styles.glassContainer}
        >
          <Text style={[styles.glassText, styles.darkText]}>Dark Glass Container</Text>
          <Text style={[styles.glassSubtext, styles.darkText]}>
            This shows the dark variant with higher blur intensity.
          </Text>
        </GlassContainer>

        {/* Glass Card Example */}
        <GlassCard
          intensity={15}
          tint="light"
          style={styles.glassCard}
          onPress={() => console.log('Glass card pressed!')}
        >
          <Text style={styles.cardTitle}>Interactive Glass Card</Text>
          <Text style={styles.cardSubtext}>Tap me to see the interaction!</Text>
        </GlassCard>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: glassTheme.spacing.lg,
    justifyContent: 'center',
    gap: glassTheme.spacing.lg,
  },
  title: {
    fontSize: glassTheme.typography.sizes.xxxl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.xl,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  glassContainer: {
    minHeight: 120,
  },
  glassText: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.primary,
    marginBottom: glassTheme.spacing.sm,
  },
  glassSubtext: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.secondary,
    lineHeight: glassTheme.typography.lineHeights.relaxed * glassTheme.typography.sizes.md,
  },
  darkText: {
    color: glassTheme.colors.text.light,
  },
  glassCard: {
    minHeight: 100,
  },
  cardTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.primary,
    marginBottom: glassTheme.spacing.xs,
  },
  cardSubtext: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.secondary,
  },
});