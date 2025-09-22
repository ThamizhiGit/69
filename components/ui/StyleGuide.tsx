import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { GlassContainer } from '../glass/GlassContainer';
import { GlassCard } from '../glass/GlassCard';
import { GlassButton } from '../glass/GlassButton';
import { LoadingState } from './LoadingState';
import { ErrorBoundary } from './ErrorBoundary';
import { GlassToast, toast } from './GlassToast';
import { useGlassTheme } from '../../contexts/GlassThemeContext';
import { standardGlassStyles, glassConfigs } from '../../constants/glassStyles';
import { hapticFeedback } from '../../utils/hapticFeedback';

export const StyleGuide: React.FC = () => {
  const { colors, spacing, typography, borderRadius } = useGlassTheme();
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const showToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <GlassToast
        visible={showToast}
        message={`This is a ${toastType} toast notification`}
        type={toastType}
        onHide={() => setShowToast(false)}
      />

      {/* Header */}
      <GlassContainer {...glassConfigs.normal} style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Glass Morphism Style Guide
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Standardized components and animations
        </Text>
      </GlassContainer>

      {/* Glass Configurations */}
      <GlassCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Glass Configurations
        </Text>
        
        <View style={styles.row}>
          <GlassContainer {...glassConfigs.subtle} style={styles.glassDemo}>
            <Text style={styles.glassLabel}>Subtle</Text>
          </GlassContainer>
          
          <GlassContainer {...glassConfigs.normal} style={styles.glassDemo}>
            <Text style={styles.glassLabel}>Normal</Text>
          </GlassContainer>
          
          <GlassContainer {...glassConfigs.strong} style={styles.glassDemo}>
            <Text style={styles.glassLabel}>Strong</Text>
          </GlassContainer>
        </View>

        <GlassContainer {...glassConfigs.primary} style={styles.glassDemoWide}>
          <Text style={[styles.glassLabel, { color: colors.text.light }]}>Primary</Text>
        </GlassContainer>
      </GlassCard>

      {/* Button Variants */}
      <GlassCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Button Variants
        </Text>
        
        <View style={styles.buttonRow}>
          <GlassButton
            title="Primary"
            onPress={() => hapticFeedback.buttonPress()}
            variant="primary"
            size="medium"
          />
          
          <GlassButton
            title="Secondary"
            onPress={() => hapticFeedback.buttonPress()}
            variant="secondary"
            size="medium"
          />
          
          <GlassButton
            title="Outline"
            onPress={() => hapticFeedback.buttonPress()}
            variant="outline"
            size="medium"
          />
        </View>

        <View style={styles.buttonRow}>
          <GlassButton
            title="Small"
            onPress={() => hapticFeedback.buttonPress()}
            size="small"
          />
          
          <GlassButton
            title="Medium"
            onPress={() => hapticFeedback.buttonPress()}
            size="medium"
          />
          
          <GlassButton
            title="Large"
            onPress={() => hapticFeedback.buttonPress()}
            size="large"
          />
        </View>

        <GlassButton
          title="Full Width Button"
          onPress={() => hapticFeedback.buttonPress()}
          fullWidth
          style={{ marginTop: spacing.md }}
        />
      </GlassCard>

      {/* Loading States */}
      <GlassCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Loading States
        </Text>
        
        <LoadingState message="Loading content..." variant="glass" />
        
        <View style={{ marginTop: spacing.md }}>
          <LoadingState message="Transparent loading..." variant="transparent" />
        </View>
      </GlassCard>

      {/* Toast Notifications */}
      <GlassCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Toast Notifications
        </Text>
        
        <View style={styles.buttonRow}>
          <GlassButton
            title="Success"
            onPress={() => showToastDemo('success')}
            size="small"
          />
          
          <GlassButton
            title="Error"
            onPress={() => showToastDemo('error')}
            size="small"
          />
          
          <GlassButton
            title="Warning"
            onPress={() => showToastDemo('warning')}
            size="small"
          />
          
          <GlassButton
            title="Info"
            onPress={() => showToastDemo('info')}
            size="small"
          />
        </View>
      </GlassCard>

      {/* Haptic Feedback */}
      <GlassCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Haptic Feedback
        </Text>
        
        <View style={styles.buttonRow}>
          <GlassButton
            title="Light"
            onPress={() => hapticFeedback.buttonPress()}
            size="small"
          />
          
          <GlassButton
            title="Medium"
            onPress={() => hapticFeedback.addToCart()}
            size="small"
          />
          
          <GlassButton
            title="Heavy"
            onPress={() => hapticFeedback.longPress()}
            size="small"
          />
        </View>

        <View style={styles.buttonRow}>
          <GlassButton
            title="Success"
            onPress={() => hapticFeedback.orderConfirmed()}
            size="small"
          />
          
          <GlassButton
            title="Error"
            onPress={() => hapticFeedback.errorOccurred()}
            size="small"
          />
          
          <GlassButton
            title="Selection"
            onPress={() => hapticFeedback.toggle()}
            size="small"
          />
        </View>
      </GlassCard>

      {/* Error Boundary Demo */}
      <GlassCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Error Boundary
        </Text>
        
        <ErrorBoundary>
          <View style={styles.errorDemo}>
            <Text style={{ color: colors.text.secondary }}>
              This content is wrapped in an ErrorBoundary
            </Text>
          </View>
        </ErrorBoundary>
      </GlassCard>

      {/* Typography Scale */}
      <GlassCard style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Typography Scale
        </Text>
        
        <Text style={[{ fontSize: typography.sizes.xs, color: colors.text.secondary }]}>
          Extra Small (12px)
        </Text>
        <Text style={[{ fontSize: typography.sizes.sm, color: colors.text.secondary }]}>
          Small (14px)
        </Text>
        <Text style={[{ fontSize: typography.sizes.md, color: colors.text.primary }]}>
          Medium (16px)
        </Text>
        <Text style={[{ fontSize: typography.sizes.lg, color: colors.text.primary }]}>
          Large (18px)
        </Text>
        <Text style={[{ fontSize: typography.sizes.xl, color: colors.text.primary }]}>
          Extra Large (20px)
        </Text>
        <Text style={[{ fontSize: typography.sizes.xxl, color: colors.text.primary }]}>
          2X Large (24px)
        </Text>
        <Text style={[{ fontSize: typography.sizes.xxxl, color: colors.text.primary }]}>
          3X Large (32px)
        </Text>
      </GlassCard>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  glassDemo: {
    flex: 1,
    marginHorizontal: 4,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassDemoWide: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorDemo: {
    padding: 16,
    alignItems: 'center',
  },
});