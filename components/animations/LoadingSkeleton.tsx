import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { glassTheme } from '../../constants/theme';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = glassTheme.borderRadius.sm,
  style,
}) => {
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerProgress.value,
      [0, 1],
      [-100, 100]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerAnimatedStyle]}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.1)',
            'rgba(255,255,255,0.3)',
            'rgba(255,255,255,0.1)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

// Skeleton for restaurant cards
export const RestaurantCardSkeleton: React.FC = () => (
  <View style={styles.restaurantSkeleton}>
    <View style={styles.restaurantHeader}>
      <LoadingSkeleton width={60} height={60} borderRadius={glassTheme.borderRadius.md} />
      <View style={styles.restaurantInfo}>
        <LoadingSkeleton width="70%" height={16} />
        <LoadingSkeleton width="50%" height={12} style={{ marginTop: 8 }} />
        <LoadingSkeleton width="40%" height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
    <LoadingSkeleton width="100%" height={12} style={{ marginTop: 12 }} />
    <LoadingSkeleton width="80%" height={12} style={{ marginTop: 4 }} />
  </View>
);

// Skeleton for category cards
export const CategoryCardSkeleton: React.FC = () => (
  <View style={styles.categorySkeleton}>
    <LoadingSkeleton width={40} height={40} borderRadius={20} />
    <LoadingSkeleton width={50} height={10} style={{ marginTop: 8 }} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  restaurantSkeleton: {
    padding: glassTheme.spacing.lg,
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: glassTheme.borderRadius.lg,
  },
  restaurantHeader: {
    flexDirection: 'row',
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: glassTheme.spacing.md,
  },
  categorySkeleton: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: glassTheme.borderRadius.md,
    marginRight: glassTheme.spacing.sm,
  },
});