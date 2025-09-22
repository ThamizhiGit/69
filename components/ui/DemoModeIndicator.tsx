import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { GlassContainer } from '../glass/GlassContainer';
import { useGlassTheme } from '../../contexts/GlassThemeContext';
import { demoDataService } from '../../services/demoDataService';
import { animationConfig } from '../../constants/animations';

interface DemoModeIndicatorProps {
  position?: 'top' | 'bottom';
  showTooltips?: boolean;
}

export const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({
  position = 'top',
  showTooltips = true,
}) => {
  const { colors, spacing, typography } = useGlassTheme();
  const [isDemoMode, setIsDemoMode] = useState(demoDataService.isDemoMode());
  const [currentTooltip, setCurrentTooltip] = useState<string>('');
  
  const pulseScale = useSharedValue(1);
  const tooltipOpacity = useSharedValue(0);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const tooltipStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
  }));

  useEffect(() => {
    // Start pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: animationConfig.durations.slow }),
        withTiming(1, { duration: animationConfig.durations.slow })
      ),
      -1,
      false
    );

    // Cycle through tooltips
    if (showTooltips && isDemoMode) {
      const tooltips = Object.values(demoDataService.getDemoTooltips());
      let tooltipIndex = 0;

      const showNextTooltip = () => {
        setCurrentTooltip(tooltips[tooltipIndex]);
        tooltipOpacity.value = withTiming(1, { duration: animationConfig.durations.normal });
        
        setTimeout(() => {
          tooltipOpacity.value = withTiming(0, { duration: animationConfig.durations.normal });
          tooltipIndex = (tooltipIndex + 1) % tooltips.length;
        }, 4000);
      };

      showNextTooltip();
      const interval = setInterval(showNextTooltip, 6000);

      return () => clearInterval(interval);
    }
  }, [isDemoMode, showTooltips]);

  // Update demo mode status
  useEffect(() => {
    const checkDemoMode = () => {
      setIsDemoMode(demoDataService.isDemoMode());
    };

    const interval = setInterval(checkDemoMode, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isDemoMode) {
    return null;
  }

  const containerStyle = position === 'top' ? styles.topContainer : styles.bottomContainer;

  return (
    <View style={[containerStyle, styles.container]}>
      <Animated.View style={pulseStyle}>
        <GlassContainer
          intensity={20}
          tint="primary"
          borderRadius={20}
          style={styles.indicator}
        >
          <View style={styles.content}>
            <Text style={styles.demoIcon}>🎮</Text>
            <Text style={[styles.demoText, { color: colors.text.light }]}>
              DEMO MODE
            </Text>
          </View>
        </GlassContainer>
      </Animated.View>

      {showTooltips && currentTooltip && (
        <Animated.View style={[styles.tooltipContainer, tooltipStyle]}>
          <GlassContainer
            intensity={25}
            tint="light"
            borderRadius={12}
            style={styles.tooltip}
          >
            <Text style={[styles.tooltipText, { color: colors.text.primary }]}>
              {currentTooltip}
            </Text>
          </GlassContainer>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
    alignItems: 'center',
  },
  topContainer: {
    top: 60,
  },
  bottomContainer: {
    bottom: 100,
  },
  indicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tooltipContainer: {
    marginTop: 12,
    maxWidth: 300,
  },
  tooltip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tooltipText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
});