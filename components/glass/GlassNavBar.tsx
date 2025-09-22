import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassContainer } from './GlassContainer';
import { glassTheme } from '../../constants/theme';

interface GlassNavBarProps {
  title?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  transparent?: boolean;
  showBorder?: boolean;
}

export const GlassNavBar: React.FC<GlassNavBarProps> = ({
  title,
  leftComponent,
  rightComponent,
  onLeftPress,
  onRightPress,
  intensity = 20,
  tint = 'light',
  transparent = false,
  showBorder = true,
}) => {
  const insets = useSafeAreaInsets();

  const NavBarContent = () => (
    <View style={[styles.navbar, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Left Component */}
        <View style={styles.leftContainer}>
          {leftComponent ? (
            <TouchableOpacity onPress={onLeftPress} style={styles.actionButton}>
              {leftComponent}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          {title ? (
            <Text style={[
              styles.title,
              { color: tint === 'dark' ? glassTheme.colors.text.light : glassTheme.colors.text.primary }
            ]}>
              {title}
            </Text>
          ) : null}
        </View>

        {/* Right Component */}
        <View style={styles.rightContainer}>
          {rightComponent ? (
            <TouchableOpacity onPress={onRightPress} style={styles.actionButton}>
              {rightComponent}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );

  if (transparent) {
    return (
      <>
        <StatusBar
          barStyle={tint === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.transparentContainer}>
          <NavBarContent />
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={tint === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <GlassContainer
        intensity={intensity}
        tint={tint}
        borderRadius={0}
        borderWidth={showBorder ? 1 : 0}
        style={styles.container}
      >
        <NavBarContent />
      </GlassContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transparentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navbar: {
    paddingBottom: glassTheme.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: glassTheme.spacing.lg,
    minHeight: 44,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 2,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.semibold,
    textAlign: 'center',
  },
  actionButton: {
    padding: glassTheme.spacing.xs,
    borderRadius: glassTheme.borderRadius.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});