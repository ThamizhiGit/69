import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassContainer, GlassCard, GlassButton, GlassNavBar } from '../../../../components/glass';
import { 
  FadeInView, 
  ScaleButton, 
  ParticleSystem 
} from '../../../../components/animations';
import { glassTheme } from '../../../../constants/theme';
import { mockDataService } from '../../../../services/mockData';
import { useCart } from '../../../../contexts';

export default function MenuItemCustomizationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<{ [key: string]: string }>({});
  const [isFlipped, setIsFlipped] = useState(false);
  const { addItem } = useCart();

  // Animation values
  const flipAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);

  // Get menu item data
  const menuItem = mockDataService.getMenuItemById(id || '1');
  const restaurant = mockDataService.getRestaurantById('1'); // Default restaurant

  if (!menuItem || !restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  // Calculate total price
  const basePrice = menuItem.price * quantity;
  const customizationPrice = Object.values(selectedCustomizations).reduce((total, optionId) => {
    // Find the customization option and add its price
    for (const customization of menuItem.customizations) {
      const option = customization.options.find(opt => opt.id === optionId);
      if (option) {
        total += option.price * quantity;
      }
    }
    return total;
  }, 0);
  const totalPrice = basePrice + customizationPrice;

  // Card flip animation
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 1], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: scaleAnimation.value },
      ],
    };
  });

  const backCardAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 1], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale: scaleAnimation.value },
      ],
    };
  });

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
    flipAnimation.value = withSpring(isFlipped ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
    
    // Bounce animation
    scaleAnimation.value = withSequence(
      withSpring(1.05, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );
  };

  const handleCustomizationSelect = (customizationId: string, optionId: string) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [customizationId]: optionId,
    }));
  };

  const handleAddToCart = () => {
    addItem(menuItem, restaurant, quantity, selectedCustomizations);
    
    // Flying animation effect
    scaleAnimation.value = withSequence(
      withSpring(1.2, { duration: 200 }),
      withSpring(0.8, { duration: 200 }),
      withSpring(1, { duration: 200 })
    );
    
    // Navigate back after animation
    setTimeout(() => {
      router.back();
    }, 600);
  };

  const renderCustomizationOptions = () => {
    if (menuItem.customizations.length === 0) {
      return (
        <FadeInView delay={600}>
          <GlassCard intensity={15} tint="dark" style={styles.noCustomizationsCard}>
            <Text style={styles.noCustomizationsText}>
              No customizations available for this item
            </Text>
          </GlassCard>
        </FadeInView>
      );
    }

    return menuItem.customizations.map((customization, index) => (
      <FadeInView key={customization.id} delay={600 + index * 100}>
        <GlassCard intensity={20} tint="dark" style={styles.customizationCard}>
          <Text style={styles.customizationTitle}>
            {customization.name}
            {customization.required && <Text style={styles.requiredText}> *</Text>}
          </Text>
          
          <View style={styles.customizationOptions}>
            {customization.options.map((option) => {
              const isSelected = selectedCustomizations[customization.id] === option.id;
              
              return (
                <ScaleButton
                  key={option.id}
                  onPress={() => handleCustomizationSelect(customization.id, option.id)}
                  scaleValue={0.95}
                >
                  <GlassCard
                    intensity={isSelected ? 25 : 15}
                    tint={isSelected ? 'primary' : 'dark'}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <Text style={[
                        styles.optionName,
                        isSelected && styles.optionNameSelected
                      ]}>
                        {option.name}
                      </Text>
                      {option.price > 0 && (
                        <Text style={[
                          styles.optionPrice,
                          isSelected && styles.optionPriceSelected
                        ]}>
                          +${option.price.toFixed(2)}
                        </Text>
                      )}
                    </View>
                    <View style={[
                      styles.optionRadio,
                      isSelected && styles.optionRadioSelected
                    ]}>
                      {isSelected && <View style={styles.optionRadioDot} />}
                    </View>
                  </GlassCard>
                </ScaleButton>
              );
            })}
          </View>
        </GlassCard>
      </FadeInView>
    ));
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: menuItem.image }}
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
          title="Customize Item"
          leftComponent={<Text style={styles.navIcon}>←</Text>}
          onLeftPress={() => router.back()}
          rightComponent={<Text style={styles.navIcon}>ℹ️</Text>}
          onRightPress={handleFlipCard}
          intensity={25}
          tint="dark"
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* 3D Flip Card */}
          <FadeInView style={styles.cardContainer} delay={200}>
            <View style={styles.flipCardContainer}>
              {/* Front Card */}
              <Animated.View style={[styles.flipCard, cardAnimatedStyle]}>
                <GlassContainer
                  intensity={25}
                  tint="dark"
                  style={styles.itemCard}
                >
                  <View style={styles.itemImageContainer}>
                    <View style={styles.itemImagePlaceholder}>
                      <Text style={styles.itemImageIcon}>🍽️</Text>
                    </View>
                    <TouchableOpacity onPress={handleFlipCard} style={styles.flipButton}>
                      <Text style={styles.flipButtonText}>Flip for details</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{menuItem.name}</Text>
                    <Text style={styles.itemPrice}>${menuItem.price.toFixed(2)}</Text>
                    
                    {menuItem.dietary.length > 0 && (
                      <View style={styles.dietaryTags}>
                        {menuItem.dietary.map((tag) => (
                          <View key={tag} style={styles.dietaryTag}>
                            <Text style={styles.dietaryTagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </GlassContainer>
              </Animated.View>

              {/* Back Card */}
              <Animated.View style={[styles.flipCard, styles.flipCardBack, backCardAnimatedStyle]}>
                <GlassContainer
                  intensity={25}
                  tint="dark"
                  style={styles.itemCard}
                >
                  <TouchableOpacity onPress={handleFlipCard} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.itemDetailsContent}>
                    <Text style={styles.itemDetailsTitle}>Item Details</Text>
                    <Text style={styles.itemDescription}>{menuItem.description}</Text>
                    
                    <View style={styles.itemSpecs}>
                      <View style={styles.specItem}>
                        <Text style={styles.specLabel}>Category</Text>
                        <Text style={styles.specValue}>{menuItem.category}</Text>
                      </View>
                      <View style={styles.specItem}>
                        <Text style={styles.specLabel}>Available</Text>
                        <Text style={[
                          styles.specValue,
                          { color: menuItem.isAvailable ? '#48BB78' : '#FC8181' }
                        ]}>
                          {menuItem.isAvailable ? 'Yes' : 'No'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </GlassContainer>
              </Animated.View>
            </View>
          </FadeInView>

          {/* Quantity Selector */}
          <FadeInView style={styles.section} delay={400}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <GlassCard intensity={20} tint="dark" style={styles.quantityCard}>
              <View style={styles.quantitySelector}>
                <ScaleButton onPress={() => handleQuantityChange(-1)}>
                  <GlassContainer
                    intensity={20}
                    tint="dark"
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </GlassContainer>
                </ScaleButton>
                
                <Animated.View style={[styles.quantityDisplay, { transform: [{ scale: scaleAnimation }] }]}>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </Animated.View>
                
                <ScaleButton onPress={() => handleQuantityChange(1)}>
                  <GlassContainer
                    intensity={20}
                    tint="dark"
                    style={styles.quantityButton}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </GlassContainer>
                </ScaleButton>
              </View>
            </GlassCard>
          </FadeInView>

          {/* Customizations */}
          <FadeInView style={styles.section} delay={500}>
            <Text style={styles.sectionTitle}>Customizations</Text>
            {renderCustomizationOptions()}
          </FadeInView>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Add to Cart Button */}
        <FadeInView style={styles.addToCartContainer} delay={800}>
          <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
            <GlassButton
              title={`Add to Cart • $${totalPrice.toFixed(2)}`}
              onPress={handleAddToCart}
              variant="primary"
              size="large"
              fullWidth
              intensity={25}
            />
          </Animated.View>
        </FadeInView>
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
  navIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
    paddingTop: 100,
  },
  cardContainer: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.lg,
    height: 300,
  },
  flipCardContainer: {
    flex: 1,
    position: 'relative',
  },
  flipCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  flipCardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  itemCard: {
    flex: 1,
    padding: glassTheme.spacing.lg,
  },
  itemImageContainer: {
    alignItems: 'center',
    marginBottom: glassTheme.spacing.lg,
  },
  itemImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: glassTheme.borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: glassTheme.spacing.md,
  },
  itemImageIcon: {
    fontSize: 48,
  },
  flipButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: glassTheme.spacing.md,
    paddingVertical: glassTheme.spacing.sm,
    borderRadius: glassTheme.borderRadius.full,
  },
  flipButtonText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  itemInfo: {
    alignItems: 'center',
  },
  itemName: {
    fontSize: glassTheme.typography.sizes.xxl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.sm,
  },
  itemPrice: {
    fontSize: glassTheme.typography.sizes.xl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.primary,
    marginBottom: glassTheme.spacing.md,
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: glassTheme.spacing.xs,
    justifyContent: 'center',
  },
  dietaryTag: {
    backgroundColor: 'rgba(72,187,120,0.2)',
    paddingHorizontal: glassTheme.spacing.sm,
    paddingVertical: glassTheme.spacing.xs,
    borderRadius: glassTheme.borderRadius.sm,
  },
  dietaryTagText: {
    fontSize: glassTheme.typography.sizes.xs,
    color: '#48BB78',
    fontWeight: glassTheme.typography.weights.medium,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: glassTheme.spacing.md,
    paddingVertical: glassTheme.spacing.sm,
    borderRadius: glassTheme.borderRadius.full,
    marginBottom: glassTheme.spacing.md,
  },
  backButtonText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  itemDetailsContent: {
    flex: 1,
  },
  itemDetailsTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.md,
    textAlign: 'center',
  },
  itemDescription: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
    lineHeight: glassTheme.typography.lineHeights.relaxed * glassTheme.typography.sizes.md,
    marginBottom: glassTheme.spacing.lg,
    textAlign: 'center',
  },
  itemSpecs: {
    gap: glassTheme.spacing.md,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: glassTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  specLabel: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
  },
  specValue: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  section: {
    marginBottom: glassTheme.spacing.lg,
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
  quantityCard: {
    marginHorizontal: glassTheme.spacing.lg,
    padding: glassTheme.spacing.lg,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: glassTheme.spacing.xl,
  },
  quantityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: glassTheme.typography.sizes.xl,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.bold,
  },
  quantityDisplay: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: glassTheme.borderRadius.full,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: glassTheme.typography.sizes.xxxl,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.bold,
  },
  customizationCard: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
    padding: glassTheme.spacing.lg,
  },
  customizationTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.md,
  },
  requiredText: {
    color: glassTheme.colors.primary,
  },
  customizationOptions: {
    gap: glassTheme.spacing.sm,
  },
  optionCard: {
    padding: glassTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: glassTheme.colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
    marginBottom: glassTheme.spacing.xs,
  },
  optionNameSelected: {
    color: glassTheme.colors.primary,
  },
  optionPrice: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
  },
  optionPriceSelected: {
    color: glassTheme.colors.primary,
    opacity: 1,
  },
  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: glassTheme.colors.primary,
  },
  optionRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: glassTheme.colors.primary,
  },
  noCustomizationsCard: {
    marginHorizontal: glassTheme.spacing.lg,
    padding: glassTheme.spacing.lg,
    alignItems: 'center',
  },
  noCustomizationsText: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
    textAlign: 'center',
  },
  addToCartContainer: {
    padding: glassTheme.spacing.lg,
    paddingBottom: glassTheme.spacing.xl,
  },
  bottomSpacing: {
    height: 120,
  },
});