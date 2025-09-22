import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { GlassContainer, GlassCard, GlassButton, GlassNavBar } from '../../components/glass';
import { 
  FadeInView, 
  ScaleButton, 
  ParticleSystem,
  ParticleEffect 
} from '../../components/animations';
import { glassTheme } from '../../constants/theme';
import { useCart } from '../../contexts';
import { CartItem } from '../../types';

export default function CartScreen() {
  const { state: cartState, removeItem, updateQuantity, clearCart } = useCart();
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
    
    // Show celebration for quantity increase
    if (newQuantity > 0) {
      setCelebrationVisible(true);
      setTimeout(() => setCelebrationVisible(false), 1000);
    }
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove ${itemName} from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeItem(itemId)
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearCart
        },
      ]
    );
  };

  const handleCheckout = () => {
    router.push('/(main)/checkout');
  };

  const renderCartItem = (item: CartItem, index: number) => {
    return (
      <SwipeableCartItem
        key={item.menuItem.id}
        item={item}
        index={index}
        onQuantityChange={handleQuantityChange}
        onRemove={handleRemoveItem}
      />
    );
  };

  const renderEmptyCart = () => (
    <FadeInView style={styles.emptyCartContainer} delay={300}>
      <GlassCard intensity={20} tint="dark" style={styles.emptyCartCard}>
        <Text style={styles.emptyCartIcon}>🛒</Text>
        <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
        <Text style={styles.emptyCartText}>
          Add some delicious items from our restaurants to get started!
        </Text>
        <GlassButton
          title="Browse Restaurants"
          onPress={() => router.push('/(main)/(tabs)/search')}
          variant="primary"
          size="medium"
          style={styles.browseButton}
        />
      </GlassCard>
    </FadeInView>
  );

  const renderCartSummary = () => (
    <FadeInView style={styles.summaryContainer} delay={600}>
      <GlassCard intensity={25} tint="dark" style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${cartState.subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>${cartState.deliveryFee.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>${cartState.total.toFixed(2)}</Text>
        </View>
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

        {/* Celebration Effect */}
        {celebrationVisible && (
          <ParticleEffect
            particleCount={20}
            colors={['#FF6B35', '#48BB78', '#F6AD55', '#9F7AEA']}
            duration={1000}
          />
        )}

        {/* Navigation */}
        <GlassNavBar
          title={`Cart (${cartState.items.length})`}
          leftComponent={<Text style={styles.navIcon}>←</Text>}
          onLeftPress={() => router.back()}
          rightComponent={
            cartState.items.length > 0 ? (
              <TouchableOpacity onPress={handleClearCart}>
                <Text style={styles.navIcon}>🗑️</Text>
              </TouchableOpacity>
            ) : null
          }
          intensity={25}
          tint="dark"
        />

        <Animated.ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
        >
          {cartState.items.length === 0 ? (
            renderEmptyCart()
          ) : (
            <>
              {/* Restaurant Info */}
              {cartState.restaurant && (
                <FadeInView style={styles.restaurantInfo} delay={200}>
                  <GlassCard intensity={20} tint="dark" style={styles.restaurantCard}>
                    <View style={styles.restaurantHeader}>
                      <View style={styles.restaurantImagePlaceholder}>
                        <Text style={styles.restaurantImageIcon}>🏪</Text>
                      </View>
                      <View style={styles.restaurantDetails}>
                        <Text style={styles.restaurantName}>
                          {cartState.restaurant.name}
                        </Text>
                        <Text style={styles.restaurantMeta}>
                          {cartState.restaurant.deliveryTime} • ${cartState.restaurant.deliveryFee} delivery
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                </FadeInView>
              )}

              {/* Cart Items */}
              <FadeInView style={styles.itemsSection} delay={400}>
                <Text style={styles.sectionTitle}>Your Items</Text>
                {cartState.items.map((item, index) => renderCartItem(item, index))}
              </FadeInView>

              {/* Order Summary */}
              {renderCartSummary()}
            </>
          )}

          <View style={styles.bottomSpacing} />
        </Animated.ScrollView>

        {/* Checkout Button */}
        {cartState.items.length > 0 && (
          <FadeInView style={styles.checkoutContainer} delay={800}>
            <GlassButton
              title={`Proceed to Checkout • $${cartState.total.toFixed(2)}`}
              onPress={handleCheckout}
              variant="primary"
              size="large"
              fullWidth
              intensity={25}
            />
          </FadeInView>
        )}
      </ImageBackground>
    </View>
  );
}

// Swipeable Cart Item Component
const SwipeableCartItem: React.FC<{
  item: CartItem;
  index: number;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string, itemName: string) => void;
}> = ({ item, index, onQuantityChange, onRemove }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.98);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      scale.value = withSpring(1);
      
      if (event.translationX < -100) {
        // Swipe left to delete
        translateX.value = withTiming(-300);
        opacity.value = withTiming(0, undefined, () => {
          runOnJS(onRemove)(item.menuItem.id, item.menuItem.name);
        });
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const deleteOpacity = interpolate(
      translateX.value,
      [-100, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    const deleteOpacity = interpolate(
      translateX.value,
      [-100, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity: deleteOpacity,
    };
  });

  return (
    <FadeInView delay={500 + index * 100}>
      <View style={styles.swipeContainer}>
        {/* Delete Button */}
        <Animated.View style={[styles.deleteButton, deleteButtonStyle]}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Animated.View>

        {/* Cart Item */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={animatedStyle}>
            <GlassCard intensity={20} tint="dark" style={styles.cartItemCard}>
              <View style={styles.cartItemContent}>
                <View style={styles.itemImagePlaceholder}>
                  <Text style={styles.itemImageIcon}>🍽️</Text>
                </View>
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.menuItem.name}</Text>
                  <Text style={styles.itemPrice}>${item.menuItem.price.toFixed(2)}</Text>
                  
                  {Object.keys(item.customizations).length > 0 && (
                    <Text style={styles.itemCustomizations}>
                      {Object.values(item.customizations).join(', ')}
                    </Text>
                  )}
                </View>
                
                <View style={styles.quantityControls}>
                  <ScaleButton
                    onPress={() => onQuantityChange(item.menuItem.id, item.quantity - 1)}
                  >
                    <GlassContainer
                      intensity={15}
                      tint="dark"
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </GlassContainer>
                  </ScaleButton>
                  
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  
                  <ScaleButton
                    onPress={() => onQuantityChange(item.menuItem.id, item.quantity + 1)}
                  >
                    <GlassContainer
                      intensity={15}
                      tint="dark"
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </GlassContainer>
                  </ScaleButton>
                </View>
              </View>
              
              <View style={styles.itemFooter}>
                <Text style={styles.itemTotal}>
                  Total: ${item.totalPrice.toFixed(2)}
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </FadeInView>
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
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: glassTheme.spacing.lg,
    marginTop: 100,
  },
  emptyCartCard: {
    padding: glassTheme.spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: glassTheme.spacing.lg,
  },
  emptyCartTitle: {
    fontSize: glassTheme.typography.sizes.xl,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.sm,
    textAlign: 'center',
  },
  emptyCartText: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: glassTheme.typography.lineHeights.relaxed * glassTheme.typography.sizes.md,
    marginBottom: glassTheme.spacing.lg,
  },
  browseButton: {
    minWidth: 200,
  },
  restaurantInfo: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.lg,
  },
  restaurantCard: {
    padding: glassTheme.spacing.lg,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: glassTheme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: glassTheme.spacing.md,
  },
  restaurantImageIcon: {
    fontSize: 20,
  },
  restaurantDetails: {
    flex: 1,
  },
  restaurantName: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  restaurantMeta: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
  },
  itemsSection: {
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
  swipeContainer: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.md,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#FC8181',
    borderRadius: glassTheme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  deleteButtonText: {
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.semibold,
    fontSize: glassTheme.typography.sizes.sm,
  },
  cartItemCard: {
    padding: glassTheme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cartItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: glassTheme.spacing.sm,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: glassTheme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: glassTheme.spacing.md,
  },
  itemImageIcon: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
    marginRight: glassTheme.spacing.md,
  },
  itemName: {
    fontSize: glassTheme.typography.sizes.md,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  itemPrice: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.primary,
    fontWeight: glassTheme.typography.weights.medium,
    marginBottom: glassTheme.spacing.xs,
  },
  itemCustomizations: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTheme.spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: glassTheme.typography.sizes.lg,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.bold,
  },
  quantityText: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.semibold,
    minWidth: 30,
    textAlign: 'center',
  },
  itemFooter: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: glassTheme.typography.sizes.md,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.primary,
  },
  summaryContainer: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.lg,
  },
  summaryCard: {
    padding: glassTheme.spacing.lg,
  },
  summaryTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.md,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: glassTheme.spacing.sm,
  },
  summaryLabel: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: glassTheme.spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: glassTheme.typography.sizes.lg,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.bold,
  },
  summaryTotalValue: {
    fontSize: glassTheme.typography.sizes.lg,
    color: glassTheme.colors.primary,
    fontWeight: glassTheme.typography.weights.bold,
  },
  checkoutContainer: {
    padding: glassTheme.spacing.lg,
    paddingBottom: glassTheme.spacing.xl,
  },
  bottomSpacing: {
    height: 120,
  },
});