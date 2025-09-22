import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '../../glass/GlassContainer';
import { LocationService } from '../../../services/locationService';
import { Location, Restaurant } from '../../../types';

const { width } = Dimensions.get('window');

interface DeliveryRadiusIndicatorProps {
  userLocation: Location;
  restaurant: Restaurant;
  maxRadius?: number;
  style?: any;
}

export const DeliveryRadiusIndicator: React.FC<DeliveryRadiusIndicatorProps> = ({
  userLocation,
  restaurant,
  maxRadius = 10,
  style,
}) => {
  // Animation values
  const scale = useSharedValue(0);
  const progress = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Get validation result
  const validation = LocationService.validateDeliveryRadius(
    userLocation,
    restaurant.location,
    maxRadius
  );

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progressBarAnimatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progress.value * 100, 100)}%`,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.7, 1],
      ['#FF6B35', '#FFA500', '#48BB78']
    ),
  }));

  const statusIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Initialize animations
  useEffect(() => {
    // Entrance animation
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    
    // Progress animation
    const progressValue = Math.min(maxRadius / validation.distance, 1);
    progress.value = withTiming(progressValue, { duration: 1000 });
    
    // Pulse animation for status
    if (validation.isValid) {
      pulseScale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );
    }
  }, [userLocation, restaurant, maxRadius]);

  const getStatusIcon = () => {
    if (validation.isValid) {
      return <Ionicons name="checkmark-circle" size={24} color="#48BB78" />;
    } else {
      return <Ionicons name="close-circle" size={24} color="#FF6B35" />;
    }
  };

  const getStatusColor = () => {
    return validation.isValid ? '#48BB78' : '#FF6B35';
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle, style]}>
      <GlassContainer intensity={25} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Animated.View style={statusIconAnimatedStyle}>
            {getStatusIcon()}
          </Animated.View>
          <View style={styles.headerText}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {validation.isValid ? 'Delivery Available' : 'Outside Delivery Area'}
            </Text>
            <Text style={styles.distanceText}>
              {validation.distance}km away
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressBarAnimatedStyle]} />
          </View>
          <Text style={styles.maxRadiusText}>
            Max: {maxRadius}km
          </Text>
        </View>

        {/* Message */}
        <Text style={styles.messageText}>
          {validation.message}
        </Text>

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.restaurantDetails}>
            <View style={styles.deliveryInfo}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
            </View>
            <View style={styles.deliveryInfo}>
              <Ionicons name="bicycle-outline" size={14} color="#666" />
              <Text style={styles.deliveryFee}>
                ${restaurant.deliveryFee.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </GlassContainer>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  maxRadiusText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  restaurantInfo: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  deliveryFee: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});