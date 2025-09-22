import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { glassTheme } from '../../constants/theme';

interface ConditionalMapProps {
  currentStatus: string;
  pulseAnimation: any;
  restaurantLocation: { latitude: number; longitude: number };
  driverLocation: { latitude: number; longitude: number };
  userLocation: { latitude: number; longitude: number };
  deliveryRoute: Array<{ latitude: number; longitude: number }>;
}

export const ConditionalMap: React.FC<ConditionalMapProps> = ({
  currentStatus,
  pulseAnimation,
}) => {
  if (Platform.OS === 'web') {
    // Web placeholder for map
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderTitle}>🗺️ Live Tracking Map</Text>
        <Text style={styles.mapPlaceholderText}>
          Map view is available on mobile devices
        </Text>
        <View style={styles.webTrackingInfo}>
          <View style={styles.webMarkerInfo}>
            <Text style={styles.markerIcon}>🏪</Text>
            <Text style={styles.webMarkerText}>Restaurant</Text>
          </View>
          {currentStatus === 'out_for_delivery' && (
            <Animated.View style={[styles.webMarkerInfo, { transform: [{ scale: pulseAnimation }] }]}>
              <Text style={styles.markerIcon}>🚗</Text>
              <Text style={styles.webMarkerText}>Driver (En Route)</Text>
            </Animated.View>
          )}
          <View style={styles.webMarkerInfo}>
            <Text style={styles.markerIcon}>📍</Text>
            <Text style={styles.webMarkerText}>Your Location</Text>
          </View>
        </View>
      </View>
    );
  }

  // For native platforms, show a loading placeholder
  // The actual MapView would be loaded dynamically in a real implementation
  return (
    <View style={styles.map}>
      <Text style={styles.mapLoadingText}>Map loading...</Text>
      <Text style={styles.mapLoadingSubtext}>
        Native map view would appear here on mobile devices
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoadingText: {
    textAlign: 'center',
    color: glassTheme.colors.text.light,
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.semibold,
    marginBottom: glassTheme.spacing.sm,
  },
  mapLoadingSubtext: {
    textAlign: 'center',
    color: glassTheme.colors.text.light,
    fontSize: glassTheme.typography.sizes.md,
    opacity: 0.7,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: glassTheme.spacing.lg,
  },
  mapPlaceholderTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.md,
    textAlign: 'center',
  },
  mapPlaceholderText: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.lg,
  },
  webTrackingInfo: {
    alignItems: 'center',
  },
  webMarkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: glassTheme.spacing.sm,
  },
  webMarkerText: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    marginLeft: glassTheme.spacing.sm,
  },
  markerIcon: {
    fontSize: 16,
  },
});