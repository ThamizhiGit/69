import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { GlassContainer, GlassCard, GlassButton, GlassNavBar } from '../../components/glass';
import { 
  FadeInView, 
  ScaleButton, 
  ParticleEffect,
  ParticleSystem 
} from '../../components/animations';
import { ConditionalMap } from '../../components/ui/ConditionalMap';
import { glassTheme } from '../../constants/theme';
import { useOrder, useCart } from '../../contexts';
import { mockOrderHistory, orderStatusMessages } from '../../constants/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OrderTrackingScreen() {
  const [showCelebration, setShowCelebration] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered'>('confirmed');
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [showMap, setShowMap] = useState(false);
  const [driverLocation, setDriverLocation] = useState({ latitude: 37.7649, longitude: -122.4294 });
  
  const { state: orderState } = useOrder();
  const { state: cartState } = useCart();
  const mapRef = useRef<any>(null);

  // Animation values
  const celebrationScale = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const mapScale = useSharedValue(0);

  // Get current order or use mock data
  const currentOrder = orderState.currentOrder || mockOrderHistory[2];

  // Mock route data
  const deliveryRoute = [
    { latitude: 37.7649, longitude: -122.4294 }, // Restaurant
    { latitude: 37.7679, longitude: -122.4264 },
    { latitude: 37.7709, longitude: -122.4234 },
    { latitude: 37.7739, longitude: -122.4204 },
    { latitude: 37.7749, longitude: -122.4194 }, // User location
  ];

  const userLocation = { latitude: 37.7749, longitude: -122.4194 };
  const restaurantLocation = { latitude: 37.7649, longitude: -122.4294 };

  useEffect(() => {
    // Celebration animation
    if (showCelebration) {
      celebrationScale.value = withSequence(
        withSpring(1.2, { duration: 500 }),
        withSpring(1, { duration: 300 })
      );

      setTimeout(() => setShowCelebration(false), 3000);
    }

    // Progress animation
    const statusIndex = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(currentStatus);
    progressAnimation.value = withTiming(statusIndex / 4, { duration: 1000 });

    // Pulse animation for active status
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );

    // Show map when out for delivery
    if (currentStatus === 'out_for_delivery' && !showMap) {
      setShowMap(true);
      mapScale.value = withSpring(1, { duration: 800 });
    }

    // Simulate order progress and driver movement
    const timer = setTimeout(() => {
      if (currentStatus === 'confirmed') {
        setCurrentStatus('preparing');
        setEstimatedTime(20);
      } else if (currentStatus === 'preparing') {
        setCurrentStatus('out_for_delivery');
        setEstimatedTime(15);
      }
    }, 5000);

    // Simulate driver movement
    const driverTimer = setInterval(() => {
      if (currentStatus === 'out_for_delivery') {
        setDriverLocation(prev => ({
          latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
        }));
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(driverTimer);
    };
  }, [currentStatus, showCelebration]);

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: showCelebration ? 1 : 0,
  }));

  const progressBarStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progressAnimation.value,
      [0, 1],
      [0, SCREEN_WIDTH - glassTheme.spacing.lg * 4],
      Extrapolate.CLAMP
    );
    return { width };
  });

  const mapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mapScale.value }],
    opacity: mapScale.value,
  }));

  const renderLiveMap = () => (
    <FadeInView style={styles.mapSection} delay={500}>
      <GlassCard intensity={25} tint="dark" style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>Live Tracking</Text>
          <TouchableOpacity 
            onPress={() => mapRef.current?.fitToCoordinates(deliveryRoute, {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            })}
          >
            <Text style={styles.mapAction}>📍</Text>
          </TouchableOpacity>
        </View>
        
        <Animated.View style={[styles.mapContainer, mapAnimatedStyle]}>
          <GlassContainer intensity={15} tint="dark" style={styles.mapGlassOverlay}>
            <ConditionalMap
              currentStatus={currentStatus}
              pulseAnimation={pulseAnimation}
              restaurantLocation={restaurantLocation}
              driverLocation={driverLocation}
              userLocation={userLocation}
              deliveryRoute={deliveryRoute}
            />
          </GlassContainer>
        </Animated.View>

        <View style={styles.mapFooter}>
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>🏪</Text>
              <Text style={styles.legendText}>Restaurant</Text>
            </View>
            {currentStatus === 'out_for_delivery' && (
              <View style={styles.legendItem}>
                <Text style={styles.legendIcon}>🚗</Text>
                <Text style={styles.legendText}>Driver</Text>
              </View>
            )}
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>📍</Text>
              <Text style={styles.legendText}>You</Text>
            </View>
          </View>
        </View>
      </GlassCard>
    </FadeInView>
  );

  const renderCelebrationModal = () => (
    <Animated.View style={[styles.celebrationOverlay, celebrationStyle]}>
      <ParticleEffect
        particleCount={30}
        colors={['#FF6B35', '#48BB78', '#F6AD55', '#9F7AEA']}
        duration={2000}
      />
      <GlassContainer intensity={30} tint="primary" style={styles.celebrationCard}>
        <Text style={styles.celebrationIcon}>🎉</Text>
        <Text style={styles.celebrationTitle}>Order Confirmed!</Text>
        <Text style={styles.celebrationText}>
          Your delicious meal is being prepared
        </Text>
      </GlassContainer>
    </Animated.View>
  );

  const renderOrderStatus = () => {
    const statuses = [
      { key: 'pending', label: 'Order Placed', icon: '📝' },
      { key: 'confirmed', label: 'Confirmed', icon: '✅' },
      { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
      { key: 'out_for_delivery', label: 'On the Way', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '🎉' },
    ];

    const currentIndex = statuses.findIndex(s => s.key === currentStatus);

    return (
      <FadeInView style={styles.statusSection} delay={400}>
        <GlassCard intensity={25} tint="dark" style={styles.statusCard}>
          <Text style={styles.statusTitle}>Order Status</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressBar, progressBarStyle]} />
            </View>
          </View>

          {/* Status Steps */}
          <View style={styles.statusSteps}>
            {statuses.map((status, index) => {
              const isActive = index === currentIndex;
              const isCompleted = index < currentIndex;
              const isPending = index > currentIndex;

              const stepStyle = useAnimatedStyle(() => {
                const scale = isActive ? pulseAnimation.value : 1;
                return { transform: [{ scale }] };
              });

              return (
                <Animated.View key={status.key} style={[styles.statusStep, stepStyle]}>
                  <View style={[
                    styles.statusDot,
                    isCompleted && styles.statusDotCompleted,
                    isActive && styles.statusDotActive,
                    isPending && styles.statusDotPending,
                  ]}>
                    <Text style={styles.statusIcon}>{status.icon}</Text>
                  </View>
                  <Text style={[
                    styles.statusLabel,
                    isActive && styles.statusLabelActive,
                    isCompleted && styles.statusLabelCompleted,
                  ]}>
                    {status.label}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          {/* Current Status Message */}
          <GlassContainer intensity={15} tint="dark" style={styles.statusMessage}>
            <Text style={styles.statusMessageText}>
              {orderStatusMessages[currentStatus]}
            </Text>
          </GlassContainer>
        </GlassCard>
      </FadeInView>
    );
  };

  const renderEstimatedTime = () => (
    <FadeInView style={styles.timeSection} delay={600}>
      <GlassCard intensity={20} tint="dark" style={styles.timeCard}>
        <View style={styles.timeHeader}>
          <Text style={styles.timeIcon}>⏰</Text>
          <View style={styles.timeDetails}>
            <Text style={styles.timeTitle}>Estimated Delivery</Text>
            <Text style={styles.timeValue}>{estimatedTime} minutes</Text>
          </View>
        </View>
        
        <View style={styles.timeProgress}>
          <View style={styles.timeProgressBar}>
            <Animated.View 
              style={[
                styles.timeProgressFill,
                {
                  width: `${((30 - estimatedTime) / 30) * 100}%`,
                }
              ]} 
            />
          </View>
          <Text style={styles.timeProgressText}>
            {Math.round(((30 - estimatedTime) / 30) * 100)}% Complete
          </Text>
        </View>
      </GlassCard>
    </FadeInView>
  );

  const renderOrderDetails = () => (
    <FadeInView style={styles.detailsSection} delay={800}>
      <GlassCard intensity={20} tint="dark" style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Order Details</Text>
        
        <View style={styles.orderInfo}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order ID</Text>
            <Text style={styles.orderValue}>#{currentOrder.id}</Text>
          </View>
          
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Restaurant</Text>
            <Text style={styles.orderValue}>
              {currentOrder.restaurantId === '1' ? 'Bella Italia' : 
               currentOrder.restaurantId === '2' ? 'Sushi Zen' : 'Burger Palace'}
            </Text>
          </View>
          
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Items</Text>
            <Text style={styles.orderValue}>{currentOrder.items.length} items</Text>
          </View>
          
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Total</Text>
            <Text style={styles.orderValueTotal}>${currentOrder.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Driver Info (if out for delivery) */}
        {currentStatus === 'out_for_delivery' && currentOrder.driver && (
          <View style={styles.driverSection}>
            <Text style={styles.driverTitle}>Your Driver</Text>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>👨‍🚗</Text>
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{currentOrder.driver.name}</Text>
                <Text style={styles.driverRating}>⭐ {currentOrder.driver.rating}</Text>
                <Text style={styles.driverVehicle}>
                  {currentOrder.driver.vehicle.type} • {currentOrder.driver.vehicle.licensePlate}
                </Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Text style={styles.callButtonText}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </GlassCard>
    </FadeInView>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Background Effects */}
        <ParticleSystem 
          particleCount={8} 
          colors={['rgba(255,107,53,0.2)', 'rgba(72,187,120,0.2)']}
        />

        {/* Navigation */}
        <GlassNavBar
          title="Order Tracking"
          leftComponent={<Text style={styles.navIcon}>←</Text>}
          onLeftPress={() => router.replace('/(main)/(tabs)')}
          rightComponent={
            <TouchableOpacity>
              <Text style={styles.navIcon}>📞</Text>
            </TouchableOpacity>
          }
          intensity={25}
          tint="dark"
        />

        <Animated.ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
        >
          {renderOrderStatus()}
          {showMap && renderLiveMap()}
          {renderEstimatedTime()}
          {renderOrderDetails()}

          <View style={styles.bottomSpacing} />
        </Animated.ScrollView>

        {/* Action Buttons */}
        <FadeInView style={styles.actionButtons} delay={1000}>
          <View style={styles.buttonRow}>
            <GlassButton
              title="Order Again"
              onPress={() => router.push('/(main)/(tabs)/search')}
              variant="outline"
              size="medium"
              style={styles.actionButton}
            />
            
            <GlassButton
              title="View Receipt"
              onPress={() => console.log('View receipt')}
              variant="primary"
              size="medium"
              style={styles.actionButton}
            />
          </View>
        </FadeInView>

        {/* Celebration Modal */}
        {showCelebration && renderCelebrationModal()}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  navIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    paddingTop: 100,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 1000,
  },
  celebrationCard: {
    padding: glassTheme.spacing.xl,
    alignItems: 'center',
    marginHorizontal: glassTheme.spacing.lg,
  },
  celebrationIcon: {
    fontSize: 64,
    marginBottom: glassTheme.spacing.lg,
  },
  celebrationTitle: {
    fontSize: glassTheme.typography.sizes.xxl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.sm,
    textAlign: 'center',
  },
  celebrationText: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.9,
    textAlign: 'center',
  },
  statusSection: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.lg,
  },
  statusCard: {
    padding: glassTheme.spacing.lg,
  },
  statusTitle: {
    fontSize: glassTheme.typography.sizes.xl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.lg,
  },
  progressContainer: {
    marginBottom: glassTheme.spacing.xl,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: glassTheme.colors.primary,
    borderRadius: 2,
  },
  statusSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: glassTheme.spacing.lg,
  },
  statusStep: {
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: glassTheme.spacing.sm,
  },
  statusDotCompleted: {
    backgroundColor: glassTheme.colors.success,
  },
  statusDotActive: {
    backgroundColor: glassTheme.colors.primary,
    borderWidth: 3,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  statusDotPending: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statusIcon: {
    fontSize: 20,
  },
  statusLabel: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: glassTheme.typography.weights.medium,
  },
  statusLabelActive: {
    color: glassTheme.colors.primary,
    opacity: 1,
    fontWeight: glassTheme.typography.weights.bold,
  },
  statusLabelCompleted: {
    color: glassTheme.colors.success,
    opacity: 1,
  },
  statusMessage: {
    padding: glassTheme.spacing.md,
    alignItems: 'center',
  },
  statusMessageText: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    lineHeight: glassTheme.typography.lineHeights.relaxed * glassTheme.typography.sizes.md,
  },
  timeSection: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.lg,
  },
  timeCard: {
    padding: glassTheme.spacing.lg,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: glassTheme.spacing.md,
  },
  timeIcon: {
    fontSize: 32,
    marginRight: glassTheme.spacing.md,
  },
  timeDetails: {
    flex: 1,
  },
  timeTitle: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
    marginBottom: glassTheme.spacing.xs,
  },
  timeValue: {
    fontSize: glassTheme.typography.sizes.xl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.primary,
  },
  timeProgress: {
    marginTop: glassTheme.spacing.md,
  },
  timeProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: glassTheme.spacing.sm,
  },
  timeProgressFill: {
    height: '100%',
    backgroundColor: glassTheme.colors.success,
    borderRadius: 4,
  },
  timeProgressText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
    textAlign: 'center',
  },
  detailsSection: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.lg,
  },
  detailsCard: {
    padding: glassTheme.spacing.lg,
  },
  detailsTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.md,
  },
  orderInfo: {
    marginBottom: glassTheme.spacing.lg,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: glassTheme.spacing.sm,
  },
  orderLabel: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
  },
  orderValue: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  orderValueTotal: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.primary,
    fontWeight: glassTheme.typography.weights.bold,
  },
  driverSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: glassTheme.spacing.md,
  },
  driverTitle: {
    fontSize: glassTheme.typography.sizes.md,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.sm,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: glassTheme.spacing.md,
  },
  driverAvatarText: {
    fontSize: 24,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: glassTheme.typography.sizes.md,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  driverRating: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
    marginBottom: glassTheme.spacing.xs,
  },
  driverVehicle: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: glassTheme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: 20,
  },
  actionButtons: {
    padding: glassTheme.spacing.lg,
    paddingBottom: glassTheme.spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: glassTheme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 120,
  },
  // Map styles
  mapSection: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.lg,
  },
  mapCard: {
    padding: glassTheme.spacing.lg,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: glassTheme.spacing.md,
  },
  mapTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
  },
  mapAction: {
    fontSize: 20,
    padding: glassTheme.spacing.sm,
  },
  mapContainer: {
    height: 250,
    borderRadius: glassTheme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: glassTheme.spacing.md,
  },
  mapGlassOverlay: {
    flex: 1,
    borderRadius: glassTheme.borderRadius.lg,
    overflow: 'hidden',
  },

  restaurantMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: glassTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: glassTheme.colors.text.light,
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: glassTheme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: glassTheme.colors.text.light,
  },
  userMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9F7AEA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: glassTheme.colors.text.light,
  },
  markerIcon: {
    fontSize: 16,
  },
  mapFooter: {
    marginTop: glassTheme.spacing.sm,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  legendItem: {
    alignItems: 'center',
    flex: 1,
  },
  legendIcon: {
    fontSize: 16,
    marginBottom: glassTheme.spacing.xs,
  },
  legendText: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
    textAlign: 'center',
  },
});