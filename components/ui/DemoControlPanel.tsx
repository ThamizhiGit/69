import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { GlassContainer } from '../glass/GlassContainer';
import { GlassCard } from '../glass/GlassCard';
import { GlassButton } from '../glass/GlassButton';
import { useGlassTheme } from '../../contexts/GlassThemeContext';
import { demoDataService } from '../../services/demoDataService';
import { hapticFeedback } from '../../utils/hapticFeedback';
import { toast } from './GlassToast';

interface DemoControlPanelProps {
  onScenarioChange?: (scenarioId: string) => void;
  onReset?: () => void;
}

export const DemoControlPanel: React.FC<DemoControlPanelProps> = ({
  onScenarioChange,
  onReset,
}) => {
  const { colors, spacing, typography } = useGlassTheme();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const scenarios = demoDataService.getAvailableScenarios();
  const demoStats = demoDataService.getDemoStats();
  const tooltips = demoDataService.getDemoTooltips();

  const handleScenarioSelect = (scenarioId: string) => {
    hapticFeedback.buttonPress();
    
    Alert.alert(
      'Load Demo Scenario',
      `Are you sure you want to load the "${scenarios.find(s => s.id === scenarioId)?.name}" scenario? This will reset current data.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => hapticFeedback.buttonPress()
        },
        {
          text: 'Load',
          style: 'default',
          onPress: () => {
            hapticFeedback.orderConfirmed();
            demoDataService.loadDemoScenario(scenarioId as any);
            setSelectedScenario(scenarioId);
            onScenarioChange?.(scenarioId);
            toast.success(`${scenarios.find(s => s.id === scenarioId)?.name} scenario loaded!`);
          }
        }
      ]
    );
  };

  const handleReset = () => {
    hapticFeedback.buttonPress();
    
    Alert.alert(
      'Reset Demo Data',
      'Are you sure you want to reset all demo data to the default state?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => hapticFeedback.buttonPress()
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            hapticFeedback.removeFromCart();
            demoDataService.resetToDefault();
            setSelectedScenario(null);
            onReset?.();
            toast.info('Demo data reset to default state');
          }
        }
      ]
    );
  };

  const handleAutoPopulate = () => {
    hapticFeedback.buttonPress();
    demoDataService.autoPopulateDemoData();
    toast.success('Demo data auto-populated based on time of day!');
  };

  if (!isVisible) {
    return (
      <View style={styles.toggleContainer}>
        <GlassButton
          title="📱 Demo Controls"
          onPress={() => {
            hapticFeedback.buttonPress();
            setIsVisible(true);
          }}
          size="small"
          variant="outline"
        />
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <GlassContainer
        intensity={25}
        tint="light"
        style={styles.panel}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              🎮 Demo Control Panel
            </Text>
            <GlassButton
              title="✕"
              onPress={() => {
                hapticFeedback.buttonPress();
                setIsVisible(false);
              }}
              size="small"
              variant="outline"
              style={styles.closeButton}
            />
          </View>

          {/* Demo Stats */}
          <GlassCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              📊 Current Demo State
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {demoStats.totalOrders}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                  Orders
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  ${demoStats.totalSpent.toFixed(2)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                  Total Spent
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {demoStats.cartItems}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                  Cart Items
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {demoStats.savedAddresses}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                  Addresses
                </Text>
              </View>
            </View>

            {demoStats.isDemoMode && (
              <View style={styles.demoIndicator}>
                <Text style={[styles.demoText, { color: colors.success }]}>
                  🟢 Demo Mode Active
                </Text>
              </View>
            )}
          </GlassCard>

          {/* Demo Scenarios */}
          <GlassCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              🎭 Demo Scenarios
            </Text>
            
            {scenarios.map((scenario) => (
              <GlassCard
                key={scenario.id}
                style={[
                  styles.scenarioCard,
                  selectedScenario === scenario.id && styles.selectedScenario
                ]}
                onPress={() => handleScenarioSelect(scenario.id)}
              >
                <View style={styles.scenarioContent}>
                  <Text style={styles.scenarioIcon}>{scenario.icon}</Text>
                  <View style={styles.scenarioInfo}>
                    <Text style={[styles.scenarioName, { color: colors.text.primary }]}>
                      {scenario.name}
                    </Text>
                    <Text style={[styles.scenarioDescription, { color: colors.text.secondary }]}>
                      {scenario.description}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              ⚡ Quick Actions
            </Text>
            
            <View style={styles.actionButtons}>
              <GlassButton
                title="🕐 Auto-Populate"
                onPress={handleAutoPopulate}
                size="small"
                variant="secondary"
                style={styles.actionButton}
              />
              
              <GlassButton
                title="🔄 Reset All"
                onPress={handleReset}
                size="small"
                variant="outline"
                style={styles.actionButton}
              />
            </View>
          </GlassCard>

          {/* Demo Tips */}
          <GlassCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              💡 Demo Tips
            </Text>
            
            <Text style={[styles.tipText, { color: colors.text.secondary }]}>
              {tooltips.reset}
            </Text>
            
            <Text style={[styles.tipText, { color: colors.text.secondary, marginTop: spacing.sm }]}>
              • Try different scenarios to see various user states
            </Text>
            <Text style={[styles.tipText, { color: colors.text.secondary }]}>
              • Notice the glass morphism effects throughout
            </Text>
            <Text style={[styles.tipText, { color: colors.text.secondary }]}>
              • Experience smooth animations and haptic feedback
            </Text>
          </GlassCard>

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </GlassContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    minWidth: 40,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  demoIndicator: {
    alignItems: 'center',
    marginTop: 8,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scenarioCard: {
    marginBottom: 8,
  },
  selectedScenario: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  scenarioContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scenarioIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  scenarioDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 18,
  },
});