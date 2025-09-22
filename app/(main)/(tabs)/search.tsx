import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { GlassContainer, GlassCard, GlassNavBar, GlassBottomSheet, GlassButton } from '../../../components/glass';
import { 
  FadeInView, 
  ScaleButton, 
  ParticleSystem,
  LoadingSkeleton,
  RestaurantCardSkeleton 
} from '../../../components/animations';
import { glassTheme } from '../../../constants/theme';
import { 
  mockRestaurants, 
  foodCategories, 
  popularSearches,
  restaurantCategories 
} from '../../../constants/mockData';
import { mockDataService } from '../../../services/mockData';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'delivery_time' | 'delivery_fee'>('rating');
  const [minRating, setMinRating] = useState(0);
  const [maxDeliveryFee, setMaxDeliveryFee] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and search restaurants
  const filteredRestaurants = useMemo(() => {
    let results = mockRestaurants;

    // Filter by search query
    if (searchQuery.trim()) {
      results = mockDataService.searchRestaurants(searchQuery);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(restaurant =>
        restaurant.cuisine.some(cuisine =>
          cuisine.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );
    }

    // Filter by rating
    if (minRating > 0) {
      results = results.filter(restaurant => restaurant.rating >= minRating);
    }

    // Filter by delivery fee
    results = results.filter(restaurant => restaurant.deliveryFee <= maxDeliveryFee);

    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'delivery_time':
          return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
        case 'delivery_fee':
          return a.deliveryFee - b.deliveryFee;
        default:
          return 0;
      }
    });

    return results;
  }, [searchQuery, selectedCategory, sortBy, minRating, maxDeliveryFee]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    // Simulate search delay
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handlePopularSearch = (term: string) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSortBy('rating');
    setMinRating(0);
    setMaxDeliveryFee(10);
    setShowFilters(false);
  };

  const renderFilterBottomSheet = () => (
    <GlassBottomSheet
      visible={showFilters}
      onClose={() => setShowFilters(false)}
      height={500}
      intensity={25}
      tint="dark"
    >
      <View style={styles.filterContent}>
        <Text style={styles.filterTitle}>Filter Restaurants</Text>

        {/* Sort By */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Sort By</Text>
          <View style={styles.sortOptions}>
            {[
              { key: 'rating', label: 'Rating' },
              { key: 'delivery_time', label: 'Delivery Time' },
              { key: 'delivery_fee', label: 'Delivery Fee' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setSortBy(option.key as any)}
                style={[
                  styles.sortOption,
                  sortBy === option.key && styles.sortOptionSelected,
                ]}
              >
                <Text style={[
                  styles.sortOptionText,
                  sortBy === option.key && styles.sortOptionTextSelected,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
          <View style={styles.ratingOptions}>
            {[0, 3.5, 4.0, 4.5].map((rating) => (
              <TouchableOpacity
                key={rating}
                onPress={() => setMinRating(rating)}
                style={[
                  styles.ratingOption,
                  minRating === rating && styles.ratingOptionSelected,
                ]}
              >
                <Text style={[
                  styles.ratingOptionText,
                  minRating === rating && styles.ratingOptionTextSelected,
                ]}>
                  {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Delivery Fee Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Max Delivery Fee</Text>
          <View style={styles.feeOptions}>
            {[10, 5, 3, 1].map((fee) => (
              <TouchableOpacity
                key={fee}
                onPress={() => setMaxDeliveryFee(fee)}
                style={[
                  styles.feeOption,
                  maxDeliveryFee === fee && styles.feeOptionSelected,
                ]}
              >
                <Text style={[
                  styles.feeOptionText,
                  maxDeliveryFee === fee && styles.feeOptionTextSelected,
                ]}>
                  ${fee}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filter Actions */}
        <View style={styles.filterActions}>
          <GlassButton
            title="Clear All"
            onPress={clearFilters}
            variant="outline"
            size="medium"
            style={styles.filterButton}
          />
          <GlassButton
            title="Apply Filters"
            onPress={() => setShowFilters(false)}
            variant="primary"
            size="medium"
            style={styles.filterButton}
          />
        </View>
      </View>
    </GlassBottomSheet>
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
          title="Discover Food"
          rightComponent={
            <TouchableOpacity onPress={() => setShowFilters(true)}>
              <Text style={styles.filterIcon}>⚙️</Text>
            </TouchableOpacity>
          }
          intensity={25}
          tint="dark"
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Search Section */}
          <FadeInView style={styles.searchSection} delay={200}>
            <GlassContainer
              intensity={20}
              tint="dark"
              style={styles.searchContainer}
            >
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search restaurants, cuisines, dishes..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => handleSearch('')}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </GlassContainer>
          </FadeInView>

          {/* Popular Searches */}
          {!searchQuery && (
            <FadeInView style={styles.section} delay={300}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              <View style={styles.popularSearches}>
                {popularSearches.map((term, index) => (
                  <FadeInView key={term} delay={400 + index * 50}>
                    <ScaleButton onPress={() => handlePopularSearch(term)}>
                      <GlassCard
                        intensity={15}
                        tint="dark"
                        style={styles.popularSearchCard}
                      >
                        <Text style={styles.popularSearchText}>{term}</Text>
                      </GlassCard>
                    </ScaleButton>
                  </FadeInView>
                ))}
              </View>
            </FadeInView>
          )}

          {/* Categories */}
          <FadeInView style={styles.section} delay={400}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesContainer}>
                {restaurantCategories.map((category, index) => (
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
                ))}
              </View>
            </ScrollView>
          </FadeInView>

          {/* Results */}
          <FadeInView style={styles.section} delay={600}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>
                {searchQuery ? `Results for "${searchQuery}"` : 'All Restaurants'}
              </Text>
              <Text style={styles.resultsCount}>
                {filteredRestaurants.length} restaurants
              </Text>
            </View>

            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <RestaurantCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((restaurant, index) => (
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
                            <Text style={styles.deliveryFee}>${restaurant.deliveryFee} fee</Text>
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
                    </GlassCard>
                  </ScaleButton>
                </FadeInView>
              ))
            ) : (
              <FadeInView delay={700}>
                <GlassCard
                  intensity={15}
                  tint="dark"
                  style={styles.noResultsCard}
                >
                  <Text style={styles.noResultsIcon}>🔍</Text>
                  <Text style={styles.noResultsTitle}>No restaurants found</Text>
                  <Text style={styles.noResultsText}>
                    Try adjusting your search or filters
                  </Text>
                </GlassCard>
              </FadeInView>
            )}
          </FadeInView>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Filter Bottom Sheet */}
        {renderFilterBottomSheet()}
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
  scrollView: {
    flex: 1,
    paddingTop: 100,
  },
  filterIcon: {
    fontSize: 20,
  },
  searchSection: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
  },
  searchContainer: {
    padding: glassTheme.spacing.md,
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
  sectionTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  popularSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: glassTheme.spacing.lg,
    gap: glassTheme.spacing.sm,
  },
  popularSearchCard: {
    paddingHorizontal: glassTheme.spacing.md,
    paddingVertical: glassTheme.spacing.sm,
  },
  popularSearchText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: glassTheme.spacing.lg,
    gap: glassTheme.spacing.sm,
  },
  categoryCard: {
    width: 80,
    height: 80,
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
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
  },
  resultsCount: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
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
  deliveryFee: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.primary,
    fontWeight: glassTheme.typography.weights.medium,
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
    lineHeight: glassTheme.typography.lineHeights.normal * glassTheme.typography.sizes.sm,
  },
  noResultsCard: {
    marginHorizontal: glassTheme.spacing.lg,
    padding: glassTheme.spacing.xl,
    alignItems: 'center',
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: glassTheme.spacing.md,
  },
  noResultsTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.sm,
  },
  noResultsText: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
  // Filter styles
  filterContent: {
    flex: 1,
  },
  filterTitle: {
    fontSize: glassTheme.typography.sizes.xl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.lg,
  },
  filterSection: {
    marginBottom: glassTheme.spacing.lg,
  },
  filterSectionTitle: {
    fontSize: glassTheme.typography.sizes.md,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.sm,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: glassTheme.spacing.sm,
  },
  sortOption: {
    flex: 1,
    padding: glassTheme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: glassTheme.borderRadius.md,
    alignItems: 'center',
  },
  sortOptionSelected: {
    backgroundColor: glassTheme.colors.primary,
  },
  sortOptionText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  sortOptionTextSelected: {
    color: glassTheme.colors.text.light,
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: glassTheme.spacing.sm,
  },
  ratingOption: {
    flex: 1,
    padding: glassTheme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: glassTheme.borderRadius.md,
    alignItems: 'center',
  },
  ratingOptionSelected: {
    backgroundColor: glassTheme.colors.primary,
  },
  ratingOptionText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  ratingOptionTextSelected: {
    color: glassTheme.colors.text.light,
  },
  feeOptions: {
    flexDirection: 'row',
    gap: glassTheme.spacing.sm,
  },
  feeOption: {
    flex: 1,
    padding: glassTheme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: glassTheme.borderRadius.md,
    alignItems: 'center',
  },
  feeOptionSelected: {
    backgroundColor: glassTheme.colors.primary,
  },
  feeOptionText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  feeOptionTextSelected: {
    color: glassTheme.colors.text.light,
  },
  filterActions: {
    flexDirection: 'row',
    gap: glassTheme.spacing.md,
    marginTop: glassTheme.spacing.lg,
  },
  filterButton: {
    flex: 1,
  },
});