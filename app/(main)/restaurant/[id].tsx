import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer, GlassCard, GlassButton } from '../../../components/glass';
import { 
  FadeInView, 
  ScaleButton, 
  ParallaxScrollView,
  ParticleSystem 
} from '../../../components/animations';
import { glassTheme } from '../../../constants/theme';
import { mockDataService } from '../../../services/mockData';
import { useCart } from '../../../contexts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const { state: cartState, addItem } = useCart();

  // Get restaurant data
  const restaurant = mockDataService.getRestaurantById(id || '1');
  const menuItems = mockDataService.getMenuItemsByRestaurant(id || '1');

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Restaurant not found</Text>
      </View>
    );
  }

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated header styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
      [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [-HEADER_HEIGHT, 0],
      [2, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Animated navigation bar
  const navBarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_HEIGHT - 100, HEADER_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  // Animated overlay
  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT * 0.5],
      [0.3, 0.7],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  const handleAddToCart = (menuItem: any) => {
    addItem(menuItem, restaurant, 1);
    console.log(`Added ${menuItem.name} to cart`);
  };

  const handleGoBack = () => {
    router.back();
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <View style={styles.container}>
      {/* Parallax Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <ImageBackground
          source={{ uri: restaurant.image }}
          style={styles.headerImage}
          resizeMode="cover"
        >
          <Animated.View style={[styles.headerOverlay, overlayAnimatedStyle]}>
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.3)',
                'rgba(0,0,0,0.1)',
                'rgba(0,0,0,0.8)',
              ]}
              style={styles.headerGradient}
            />
          </Animated.View>
        </ImageBackground>
      </Animated.View>

      {/* Floating Navigation */}
      <View style={[styles.floatingNav, { top: insets.top + 10 }]}>
        <FadeInView delay={200}>
          <ScaleButton onPress={handleGoBack}>
            <GlassContainer
              intensity={25}
              tint="dark"
              style={styles.navButton}
            >
              <Text style={styles.navIcon}>←</Text>
            </GlassContainer>
          </ScaleButton>
        </FadeInView>

        <View style={styles.navActions}>
          <FadeInView delay={300}>
            <ScaleButton onPress={toggleFavorite}>
              <GlassContainer
                intensity={25}
                tint="dark"
                style={styles.navButton}
              >
                <Text style={styles.navIcon}>
                  {isFavorite ? '❤️' : '🤍'}
                </Text>
              </GlassContainer>
            </ScaleButton>
          </FadeInView>

          <FadeInView delay={400}>
            <ScaleButton onPress={() => console.log('Share restaurant')}>
              <GlassContainer
                intensity={25}
                tint="dark"
                style={styles.navButton}
              >
                <Text style={styles.navIcon}>📤</Text>
              </GlassContainer>
            </ScaleButton>
          </FadeInView>
        </View>
      </View>

      {/* Animated Navigation Bar */}
      <Animated.View style={[styles.animatedNavBar, navBarAnimatedStyle]}>
        <GlassContainer
          intensity={30}
          tint="dark"
          style={[styles.navBarContainer, { paddingTop: insets.top }]}
        >
          <View style={styles.navBarContent}>
            <TouchableOpacity onPress={handleGoBack} style={styles.navBarButton}>
              <Text style={styles.navBarIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.navBarTitle}>{restaurant.name}</Text>
            <TouchableOpacity onPress={toggleFavorite} style={styles.navBarButton}>
              <Text style={styles.navBarIcon}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>
        </GlassContainer>
      </Animated.View>

      {/* Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Spacer */}
        <View style={{ height: HEADER_HEIGHT }} />

        {/* Restaurant Info */}
        <FadeInView style={styles.restaurantInfo} delay={500}>
          <GlassContainer
            intensity={25}
            tint="dark"
            style={styles.infoContainer}
          >
            <View style={styles.restaurantHeader}>
              <View style={styles.restaurantTitleSection}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantCuisine}>
                  {restaurant.cuisine.join(' • ')}
                </Text>
                <Text style={styles.restaurantDescription}>
                  {restaurant.description}
                </Text>
              </View>
              
              <View style={styles.restaurantStatus}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: restaurant.isOpen ? '#48BB78' : '#FC8181' }
                ]} />
                <Text style={styles.statusText}>
                  {restaurant.isOpen ? 'Open Now' : 'Closed'}
                </Text>
              </View>
            </View>

            <View style={styles.restaurantMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>⭐</Text>
                <Text style={styles.metaText}>{restaurant.rating}</Text>
                <Text style={styles.metaLabel}>Rating</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>🚚</Text>
                <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
                <Text style={styles.metaLabel}>Delivery</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>💰</Text>
                <Text style={styles.metaText}>${restaurant.deliveryFee}</Text>
                <Text style={styles.metaLabel}>Fee</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📦</Text>
                <Text style={styles.metaText}>${restaurant.minimumOrder}</Text>
                <Text style={styles.metaLabel}>Minimum</Text>
              </View>
            </View>
          </GlassContainer>
        </FadeInView>

        {/* Menu Categories */}
        <FadeInView style={styles.section} delay={600}>
          <Text style={styles.sectionTitle}>Menu</Text>
          
          {/* Category Navigation */}
          <View style={styles.categoryNav}>
            {['All', 'Popular', 'Pizza', 'Pasta', 'Desserts'].map((category, index) => (
              <FadeInView key={category} delay={700 + index * 50}>
                <ScaleButton onPress={() => console.log(`Selected ${category}`)}>
                  <GlassCard
                    intensity={15}
                    tint="dark"
                    style={[
                      styles.categoryNavItem,
                      index === 0 && styles.categoryNavItemActive
                    ]}
                  >
                    <Text style={[
                      styles.categoryNavText,
                      index === 0 && styles.categoryNavTextActive
                    ]}>
                      {category}
                    </Text>
                  </GlassCard>
                </ScaleButton>
              </FadeInView>
            ))}
          </View>
        </FadeInView>

        {/* Menu Items */}
        <FadeInView style={styles.section} delay={800}>
          {menuItems.map((item, index) => (
            <FadeInView key={item.id} delay={900 + index * 100}>
              <ScaleButton
                onPress={() => console.log(`Selected ${item.name}`)}
                scaleValue={0.98}
              >
                <GlassCard
                  intensity={20}
                  tint="dark"
                  style={styles.menuItemCard}
                >
                  <View style={styles.menuItemContent}>
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemDescription}>
                        {item.description}
                      </Text>
                      <View style={styles.menuItemMeta}>
                        <Text style={styles.menuItemPrice}>${item.price}</Text>
                        {item.dietary.length > 0 && (
                          <View style={styles.dietaryTags}>
                            {item.dietary.map((tag) => (
                              <View key={tag} style={styles.dietaryTag}>
                                <Text style={styles.dietaryTagText}>{tag}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.menuItemActions}>
                      <View style={styles.menuItemImagePlaceholder}>
                        <Text style={styles.menuItemImageIcon}>🍽️</Text>
                      </View>
                      <GlassButton
                        title="Add"
                        onPress={() => handleAddToCart(item)}
                        variant="primary"
                        size="small"
                        style={styles.addButton}
                      />
                    </View>
                  </View>
                </GlassCard>
              </ScaleButton>
            </FadeInView>
          ))}
        </FadeInView>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      {/* Floating Cart Button */}
      {cartState.items.length > 0 && (
        <FadeInView style={styles.floatingCart} delay={1000}>
          <ScaleButton onPress={() => router.push('/(main)/cart')}>
            <GlassContainer
              intensity={25}
              tint="primary"
              style={styles.cartButton}
            >
              <View style={styles.cartButtonContent}>
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartState.items.length}</Text>
                </View>
                <Text style={styles.cartButtonText}>
                  View Cart • ${cartState.total.toFixed(2)}
                </Text>
                <Text style={styles.cartButtonIcon}>🛒</Text>
              </View>
            </GlassContainer>
          </ScaleButton>
        </FadeInView>
      )}

      {/* Background Effects */}
      <ParticleSystem 
        particleCount={6} 
        colors={['rgba(255,107,53,0.1)', 'rgba(72,187,120,0.1)']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    fontSize: glassTheme.typography.sizes.lg,
    color: glassTheme.colors.text.light,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1,
  },
  headerImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerGradient: {
    flex: 1,
  },
  floatingNav: {
    position: 'absolute',
    left: glassTheme.spacing.lg,
    right: glassTheme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  navActions: {
    flexDirection: 'row',
    gap: glassTheme.spacing.sm,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
  },
  animatedNavBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  navBarContainer: {
    paddingBottom: glassTheme.spacing.md,
  },
  navBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: glassTheme.spacing.lg,
    minHeight: 44,
  },
  navBarButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBarIcon: {
    fontSize: 20,
  },
  navBarTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  restaurantInfo: {
    marginTop: -50, // Overlap with header
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.lg,
  },
  infoContainer: {
    padding: glassTheme.spacing.lg,
  },
  restaurantHeader: {
    marginBottom: glassTheme.spacing.lg,
  },
  restaurantTitleSection: {
    marginBottom: glassTheme.spacing.md,
  },
  restaurantName: {
    fontSize: glassTheme.typography.sizes.xxxl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  restaurantCuisine: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.primary,
    fontWeight: glassTheme.typography.weights.medium,
    marginBottom: glassTheme.spacing.sm,
  },
  restaurantDescription: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
    lineHeight: glassTheme.typography.lineHeights.relaxed * glassTheme.typography.sizes.md,
  },
  restaurantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: glassTheme.spacing.sm,
    paddingVertical: glassTheme.spacing.xs,
    borderRadius: glassTheme.borderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: glassTheme.spacing.xs,
  },
  statusText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaIcon: {
    fontSize: 20,
    marginBottom: glassTheme.spacing.xs,
  },
  metaText: {
    fontSize: glassTheme.typography.sizes.md,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  metaLabel: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
  },
  section: {
    marginBottom: glassTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: glassTheme.typography.sizes.xl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryNav: {
    flexDirection: 'row',
    paddingHorizontal: glassTheme.spacing.lg,
    gap: glassTheme.spacing.sm,
  },
  categoryNavItem: {
    paddingHorizontal: glassTheme.spacing.md,
    paddingVertical: glassTheme.spacing.sm,
  },
  categoryNavItemActive: {
    backgroundColor: glassTheme.colors.primary,
  },
  categoryNavText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  categoryNavTextActive: {
    color: glassTheme.colors.text.light,
  },
  menuItemCard: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
    padding: glassTheme.spacing.lg,
  },
  menuItemContent: {
    flexDirection: 'row',
  },
  menuItemInfo: {
    flex: 1,
    marginRight: glassTheme.spacing.md,
  },
  menuItemName: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  menuItemDescription: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
    marginBottom: glassTheme.spacing.sm,
    lineHeight: glassTheme.typography.lineHeights.normal * glassTheme.typography.sizes.sm,
  },
  menuItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemPrice: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.primary,
  },
  dietaryTags: {
    flexDirection: 'row',
    gap: glassTheme.spacing.xs,
  },
  dietaryTag: {
    backgroundColor: 'rgba(72,187,120,0.2)',
    paddingHorizontal: glassTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: glassTheme.borderRadius.sm,
  },
  dietaryTagText: {
    fontSize: glassTheme.typography.sizes.xs,
    color: '#48BB78',
    fontWeight: glassTheme.typography.weights.medium,
  },
  menuItemActions: {
    alignItems: 'center',
    gap: glassTheme.spacing.sm,
  },
  menuItemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: glassTheme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemImageIcon: {
    fontSize: 32,
  },
  addButton: {
    minWidth: 80,
  },
  floatingCart: {
    position: 'absolute',
    bottom: 30,
    left: glassTheme.spacing.lg,
    right: glassTheme.spacing.lg,
  },
  cartButton: {
    padding: glassTheme.spacing.md,
    borderRadius: glassTheme.borderRadius.xl,
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: glassTheme.spacing.sm,
  },
  cartBadge: {
    backgroundColor: glassTheme.colors.text.light,
    borderRadius: glassTheme.borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: glassTheme.typography.sizes.sm,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.primary,
  },
  cartButtonText: {
    fontSize: glassTheme.typography.sizes.md,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.light,
    flex: 1,
    textAlign: 'center',
  },
  cartButtonIcon: {
    fontSize: 20,
  },
  bottomSpacing: {
    height: 120,
  },
});