import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ImageBackground, 
  TextInput, 
  TouchableOpacity 
} from 'react-native';
import { GlassContainer, GlassCard, GlassNavBar } from '../../../components/glass';
import { 
  FadeInView, 
  FloatingFoodItems, 
  ScaleButton, 
  ParticleSystem, 
  BackgroundOrbs,
  LoadingSkeleton,
  RestaurantCardSkeleton 
} from '../../../components/animations';
import { glassTheme } from '../../../constants/theme';
import { 
  featuredRestaurants, 
  foodCategories, 
  mockUser,
  nearbyRestaurants 
} from '../../../constants/mockData';
import { useApp, useUser } from '../../../contexts';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { state: appState } = useApp();
  const { user } = useUser();

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const currentUser = user || mockUser;
  const userLocation = appState.currentLocation || {
    latitude: 37.7749,
    longitude: -122.4194,
    address: 'San Francisco, CA'
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log('Searching for:', query);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log('Selected category:', categoryId);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Background Animations */}
        <BackgroundOrbs orbCount={6} paused={isLoading} />
        <ParticleSystem 
          particleCount={12} 
          colors={[
            'rgba(255,107,53,0.4)', 
            'rgba(72,187,120,0.3)', 
            'rgba(246,173,85,0.3)',
            'rgba(159,122,234,0.3)'
          ]}
          paused={isLoading}
        />
        <FloatingFoodItems paused={isLoading} />
        
        {/* Navigation Bar with Location */}
        <GlassNavBar
          title={`📍 ${userLocation.address?.split(',')[0] || 'San Francisco'}`}
          rightComponent={
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          }
          intensity={25}
          tint="dark"
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <FadeInView style={styles.welcomeSection} delay={200}>
            <GlassContainer
              intensity={20}
              tint="dark"
              style={styles.welcomeContainer}
            >
              <Text style={styles.welcomeTitle}>
                Hello, {currentUser.name.split(' ')[0]}! 👋
              </Text>
              <Text style={styles.welcomeSubtitle}>
                What would you like to eat today?
              </Text>
            </GlassContainer>
          </FadeInView>

          {/* Search Bar */}
          <FadeInView style={styles.searchSection} delay={300}>
            <GlassContainer
              intensity={searchFocused ? 25 : 20}
              tint="dark"
              style={[
                styles.searchContainer,
                searchFocused && styles.searchContainerFocused
              ]}
            >
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search restaurants, cuisines..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={searchQuery}
                  onChangeText={handleSearch}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </GlassContainer>
          </FadeInView>

          {/* Categories */}
          <FadeInView style={styles.section} delay={400}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesContainer}>
                {isLoading ? (
                  // Loading skeletons for categories
                  Array.from({ length: 6 }).map((_, index) => (
                    <View key={`skeleton-${index}`} style={styles.categorySkeleton}>
                      <LoadingSkeleton width={40} height={40} borderRadius={20} />
                      <LoadingSkeleton width={50} height={10} style={{ marginTop: 8 }} />
                    </View>
                  ))
                ) : (
                  foodCategories.map((category, index) => (
                    <FadeInView key={category.id} delay={500 + index * 50}>
                      <ScaleButton
                        onPress={() => handleCategorySelect(category.id)}
                        scaleValue={0.95}
                      >
                        <GlassCard
                          intensity={selectedCategory === category.id ? 25 : 15}
                          tint={selectedCategory === category.id ? 'primary' : 'dark'}
                          style={[
                            styles.categoryCard,
                            selectedCategory === category.id && styles.categoryCardSelected
                          ]}
                        >
                          <Text style={styles.categoryIcon}>{category.icon}</Text>
                          <Text style={[
                            styles.categoryName,
                            selectedCategory === category.id && styles.categoryNameSelected
                          ]}>
                            {category.name}
                          </Text>
                        </GlassCard>
                      </ScaleButton>
                    </FadeInView>
                  ))
                )}
              </View>
            </ScrollView>
          </FadeInView>

          {/* Featured Restaurants */}
          <FadeInView style={styles.section} delay={600}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Restaurants</Text>
              {!isLoading && (
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            {isLoading ? (
              // Loading skeletons for restaurants
              Array.from({ length: 3 }).map((_, index) => (
                <RestaurantCardSkeleton key={`restaurant-skeleton-${index}`} />
              ))
            ) : (
              featuredRestaurants.map((restaurant, index) => (
                <FadeInView key={restaurant.id} delay={700 + index * 100}>
                  <ScaleButton
                    onPress={() => console.log(`Selected ${restaurant.name}`)}
                    scaleValue={0.98}
                  >
                    <GlassCard
                      intensity={20}
                      tint="dark"
                      style={styles.restaurantCard}
                    >
                      <View style={styles.restaurantHeader}>
                        <View style={styles.restaurantImagePlaceholder}>
                          <Text style={styles.restaurantImageIcon}>🍽️</Text>
                        </View>
                        <View style={styles.restaurantInfo}>
                          <Text style={styles.restaurantName}>{restaurant.name}</Text>
                          <Text style={styles.restaurantCuisine}>
                            {restaurant.cuisine.join(' • ')}
                          </Text>
                          <View style={styles.restaurantMeta}>
                            <Text style={styles.rating}>⭐ {restaurant.rating}</Text>
                            <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
                          </View>
                        </View>
                        <View style={styles.restaurantStatus}>
                          <View style={[
                            styles.statusDot,
                            { backgroundColor: restaurant.isOpen ? '#48BB78' : '#FC8181' }
                          ]} />
                          <Text style={styles.statusText}>
                            {restaurant.isOpen ? 'Open' : 'Closed'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.restaurantDescription}>
                        {restaurant.description}
                      </Text>
                      <View style={styles.restaurantFooter}>
                        <Text style={styles.deliveryFee}>
                          ${restaurant.deliveryFee} delivery fee
                        </Text>
                        <Text style={styles.minimumOrder}>
                          Min. ${restaurant.minimumOrder}
                        </Text>
                      </View>
                    </GlassCard>
                  </ScaleButton>
                </FadeInView>
              ))
            )}
          </FadeInView>

          {/* Nearby Restaurants */}
          <FadeInView style={styles.section} delay={800}>
            <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.nearbyContainer}>
                {nearbyRestaurants.slice(0, 5).map((restaurant, index) => (
                  <FadeInView key={restaurant.id} delay={900 + index * 100}>
                    <ScaleButton
                      onPress={() => console.log(`Selected ${restaurant.name}`)}
                      scaleValue={0.95}
                    >
                      <GlassCard
                        intensity={18}
                        tint="dark"
                        style={styles.nearbyCard}
                      >
                        <View style={styles.nearbyImagePlaceholder}>
                          <Text style={styles.nearbyImageIcon}>🏪</Text>
                        </View>
                        <Text style={styles.nearbyName}>{restaurant.name}</Text>
                        <Text style={styles.nearbyRating}>⭐ {restaurant.rating}</Text>
                        <Text style={styles.nearbyTime}>{restaurant.deliveryTime}</Text>
                      </GlassCard>
                    </ScaleButton>
                  </FadeInView>
                ))}
              </View>
            </ScrollView>
          </FadeInView>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 100, // Account for nav bar
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  welcomeSection: {
    margin: glassTheme.spacing.lg,
    marginTop: glassTheme.spacing.lg,
  },
  welcomeContainer: {
    padding: glassTheme.spacing.lg,
  },
  welcomeTitle: {
    fontSize: glassTheme.typography.sizes.xl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.9,
  },
  searchSection: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
  },
  searchContainer: {
    padding: glassTheme.spacing.md,
  },
  searchContainerFocused: {
    borderWidth: 2,
    borderColor: glassTheme.colors.primary,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: glassTheme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    paddingVertical: glassTheme.spacing.xs,
  },
  clearButton: {
    padding: glassTheme.spacing.xs,
  },
  clearIcon: {
    fontSize: 16,
    color: glassTheme.colors.text.light,
    opacity: 0.6,
  },
  section: {
    marginTop: glassTheme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  seeAllText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.primary,
    fontWeight: glassTheme.typography.weights.medium,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: glassTheme.spacing.lg,
    gap: glassTheme.spacing.sm,
  },
  categoryCard: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: glassTheme.colors.primary,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: glassTheme.spacing.xs,
  },
  categoryName: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    fontWeight: glassTheme.typography.weights.medium,
  },
  categoryNameSelected: {
    color: glassTheme.colors.primary,
  },
  restaurantCard: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
    padding: glassTheme.spacing.lg,
  },
  restaurantHeader: {
    flexDirection: 'row',
    marginBottom: glassTheme.spacing.sm,
  },
  restaurantImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: glassTheme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: glassTheme.spacing.md,
  },
  restaurantImageIcon: {
    fontSize: 24,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  restaurantCuisine: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
    marginBottom: glassTheme.spacing.xs,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTheme.spacing.sm,
  },
  rating: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  deliveryTime: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
  },
  restaurantStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: glassTheme.spacing.xs,
  },
  statusText: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
  },
  restaurantDescription: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
    marginBottom: glassTheme.spacing.sm,
    lineHeight: glassTheme.typography.lineHeights.normal * glassTheme.typography.sizes.sm,
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryFee: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.primary,
    fontWeight: glassTheme.typography.weights.medium,
  },
  minimumOrder: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
  },
  nearbyContainer: {
    flexDirection: 'row',
    paddingHorizontal: glassTheme.spacing.lg,
    gap: glassTheme.spacing.md,
  },
  nearbyCard: {
    width: 120,
    padding: glassTheme.spacing.md,
    alignItems: 'center',
  },
  nearbyImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: glassTheme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: glassTheme.spacing.sm,
  },
  nearbyImageIcon: {
    fontSize: 20,
  },
  nearbyName: {
    fontSize: glassTheme.typography.sizes.sm,
    fontWeight: glassTheme.typography.weights.medium,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.xs,
  },
  nearbyRating: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  nearbyTime: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 100,
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
