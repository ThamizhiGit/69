import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { GlassContainer, GlassCard, GlassButton, GlassNavBar } from '../../components/glass';
import { 
  FadeInView, 
  ScaleButton, 
  ParticleSystem 
} from '../../components/animations';
import { glassTheme } from '../../constants/theme';
import { useCart, useUser, useOrder } from '../../contexts';
import { mockUser, deliveryTimeSlots } from '../../constants/mockData';

type CheckoutStep = 'delivery' | 'payment' | 'review';

export default function CheckoutScreen() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('delivery');
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(0);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const { state: cartState, clearCart } = useCart();
  const { user } = useUser();
  const { addOrder } = useOrder();

  // Animation values
  const stepProgress = useSharedValue(0);
  const cardFlip = useSharedValue(0);

  const currentUser = user || mockUser;
  const steps: CheckoutStep[] = ['delivery', 'payment', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);

  // Update progress animation when step changes
  React.useEffect(() => {
    stepProgress.value = withSpring(currentStepIndex / (steps.length - 1));
  }, [currentStep, currentStepIndex]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(stepProgress.value, [0, 1], [0, 100])}%`,
  }));

  const handleNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    } else {
      handlePlaceOrder();
    }
  };

  const handlePreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    } else {
      router.back();
    }
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
    cardFlip.value = withSpring(isFlipped ? 0 : 1);
  };

  const handlePlaceOrder = () => {
    // Create order
    const newOrder = {
      userId: currentUser.id,
      restaurantId: cartState.restaurant?.id || '1',
      items: cartState.items,
      totalAmount: cartState.total,
      deliveryAddress: currentUser.addresses[selectedAddress],
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    };

    addOrder(newOrder);
    clearCart();
    router.replace('/(main)/tracking');
  };

  const renderStepIndicator = () => (
    <FadeInView style={styles.stepIndicator} delay={200}>
      <GlassCard intensity={20} tint="dark" style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>
            Step {currentStepIndex + 1} of {steps.length}
          </Text>
          <Text style={styles.stepName}>
            {currentStep === 'delivery' && 'Delivery Details'}
            {currentStep === 'payment' && 'Payment Method'}
            {currentStep === 'review' && 'Review Order'}
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressBarStyle]} />
        </View>
        
        <View style={styles.stepDots}>
          {steps.map((step, index) => (
            <View
              key={step}
              style={[
                styles.stepDot,
                index <= currentStepIndex && styles.stepDotActive,
              ]}
            />
          ))}
        </View>
      </GlassCard>
    </FadeInView>
  );

  const renderDeliveryStep = () => (
    <FadeInView style={styles.stepContent} delay={400}>
      {/* Address Selection */}
      <GlassCard intensity={20} tint="dark" style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        {currentUser.addresses.map((address, index) => (
          <ScaleButton
            key={address.id}
            onPress={() => setSelectedAddress(index)}
            scaleValue={0.98}
          >
            <GlassCard
              intensity={selectedAddress === index ? 25 : 15}
              tint={selectedAddress === index ? 'primary' : 'dark'}
              style={[
                styles.addressCard,
                selectedAddress === index && styles.addressCardSelected
              ]}
            >
              <View style={styles.addressHeader}>
                <Text style={[
                  styles.addressLabel,
                  selectedAddress === index && styles.addressLabelSelected
                ]}>
                  {address.label}
                </Text>
                {address.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.addressText,
                selectedAddress === index && styles.addressTextSelected
              ]}>
                {address.street}, {address.city}, {address.state} {address.zipCode}
              </Text>
            </GlassCard>
          </ScaleButton>
        ))}
      </GlassCard>

      {/* Delivery Time */}
      <GlassCard intensity={20} tint="dark" style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Delivery Time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.timeSlots}>
            {deliveryTimeSlots.map((slot, index) => (
              <ScaleButton
                key={index}
                onPress={() => setSelectedTimeSlot(index)}
                scaleValue={0.95}
              >
                <GlassCard
                  intensity={selectedTimeSlot === index ? 25 : 15}
                  tint={selectedTimeSlot === index ? 'primary' : 'dark'}
                  style={[
                    styles.timeSlot,
                    selectedTimeSlot === index && styles.timeSlotSelected
                  ]}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedTimeSlot === index && styles.timeSlotTextSelected
                  ]}>
                    {slot}
                  </Text>
                </GlassCard>
              </ScaleButton>
            ))}
          </View>
        </ScrollView>
      </GlassCard>

      {/* Delivery Instructions */}
      <GlassCard intensity={20} tint="dark" style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Delivery Instructions (Optional)</Text>
        <GlassContainer intensity={15} tint="dark" style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Add delivery instructions..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            multiline
            numberOfLines={3}
          />
        </GlassContainer>
      </GlassCard>
    </FadeInView>
  );

  const renderPaymentStep = () => {
    const cardAnimatedStyle = useAnimatedStyle(() => {
      const rotateY = interpolate(cardFlip.value, [0, 1], [0, 180]);
      return {
        transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      };
    });

    const backCardStyle = useAnimatedStyle(() => {
      const rotateY = interpolate(cardFlip.value, [0, 1], [180, 360]);
      return {
        transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      };
    });

    return (
      <FadeInView style={styles.stepContent} delay={400}>
        {/* Payment Methods */}
        <GlassCard intensity={20} tint="dark" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {currentUser.paymentMethods.map((method, index) => (
            <ScaleButton
              key={method.id}
              onPress={() => setSelectedPayment(index)}
              scaleValue={0.98}
            >
              <GlassCard
                intensity={selectedPayment === index ? 25 : 15}
                tint={selectedPayment === index ? 'primary' : 'dark'}
                style={[
                  styles.paymentCard,
                  selectedPayment === index && styles.paymentCardSelected
                ]}
              >
                <View style={styles.paymentHeader}>
                  <Text style={styles.paymentIcon}>
                    {method.type === 'credit' ? '💳' : 
                     method.type === 'debit' ? '💳' : 
                     method.type === 'paypal' ? '🅿️' : '📱'}
                  </Text>
                  <View style={styles.paymentDetails}>
                    <Text style={[
                      styles.paymentType,
                      selectedPayment === index && styles.paymentTypeSelected
                    ]}>
                      {method.type.charAt(0).toUpperCase() + method.type.slice(1)} Card
                    </Text>
                    <Text style={[
                      styles.paymentNumber,
                      selectedPayment === index && styles.paymentNumberSelected
                    ]}>
                      •••• •••• •••• {method.last4}
                    </Text>
                  </View>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
              </GlassCard>
            </ScaleButton>
          ))}
        </GlassCard>

        {/* 3D Card Preview */}
        <GlassCard intensity={20} tint="dark" style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Card Preview</Text>
          <View style={styles.cardPreviewContainer}>
            <TouchableOpacity onPress={handleFlipCard}>
              <Animated.View style={[styles.creditCard, cardAnimatedStyle]}>
                <GlassContainer intensity={25} tint="primary" style={styles.cardFront}>
                  <Text style={styles.cardNumber}>
                    •••• •••• •••• {currentUser.paymentMethods[selectedPayment]?.last4}
                  </Text>
                  <View style={styles.cardBottom}>
                    <Text style={styles.cardHolder}>
                      {currentUser.paymentMethods[selectedPayment]?.cardholderName}
                    </Text>
                    <Text style={styles.cardExpiry}>
                      {currentUser.paymentMethods[selectedPayment]?.expiryMonth}/
                      {currentUser.paymentMethods[selectedPayment]?.expiryYear}
                    </Text>
                  </View>
                </GlassContainer>
              </Animated.View>
            </TouchableOpacity>

            <Animated.View style={[styles.creditCard, styles.cardBack, backCardStyle]}>
              <GlassContainer intensity={25} tint="dark" style={styles.cardBackContent}>
                <View style={styles.magneticStripe} />
                <View style={styles.cvvSection}>
                  <Text style={styles.cvvLabel}>CVV</Text>
                  <View style={styles.cvvBox}>
                    <Text style={styles.cvvText}>•••</Text>
                  </View>
                </View>
              </GlassContainer>
            </Animated.View>
          </View>
        </GlassCard>
      </FadeInView>
    );
  };

  const renderReviewStep = () => (
    <FadeInView style={styles.stepContent} delay={400}>
      {/* Order Summary */}
      <GlassCard intensity={20} tint="dark" style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartState.items.map((item, index) => (
          <View key={`${item.menuItem.id}-${index}`} style={styles.reviewItem}>
            <Text style={styles.reviewItemName}>
              {item.quantity}x {item.menuItem.name}
            </Text>
            <Text style={styles.reviewItemPrice}>
              ${item.totalPrice.toFixed(2)}
            </Text>
          </View>
        ))}
        
        <View style={styles.reviewDivider} />
        
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Subtotal</Text>
          <Text style={styles.reviewValue}>${cartState.subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Delivery Fee</Text>
          <Text style={styles.reviewValue}>${cartState.deliveryFee.toFixed(2)}</Text>
        </View>
        
        <View style={styles.reviewItem}>
          <Text style={styles.reviewTotalLabel}>Total</Text>
          <Text style={styles.reviewTotalValue}>${cartState.total.toFixed(2)}</Text>
        </View>
      </GlassCard>

      {/* Delivery Details */}
      <GlassCard intensity={20} tint="dark" style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.reviewDetail}>
          <Text style={styles.reviewDetailLabel}>Address</Text>
          <Text style={styles.reviewDetailValue}>
            {currentUser.addresses[selectedAddress]?.street}, {currentUser.addresses[selectedAddress]?.city}
          </Text>
        </View>
        
        <View style={styles.reviewDetail}>
          <Text style={styles.reviewDetailLabel}>Time</Text>
          <Text style={styles.reviewDetailValue}>
            {deliveryTimeSlots[selectedTimeSlot]}
          </Text>
        </View>
        
        <View style={styles.reviewDetail}>
          <Text style={styles.reviewDetailLabel}>Payment</Text>
          <Text style={styles.reviewDetailValue}>
            {currentUser.paymentMethods[selectedPayment]?.type} •••• {currentUser.paymentMethods[selectedPayment]?.last4}
          </Text>
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
          particleCount={6} 
          colors={['rgba(255,107,53,0.2)', 'rgba(72,187,120,0.2)']}
        />

        {/* Navigation */}
        <GlassNavBar
          title="Checkout"
          leftComponent={<Text style={styles.navIcon}>←</Text>}
          onLeftPress={handlePreviousStep}
          intensity={25}
          tint="dark"
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderStepIndicator()}
          
          {currentStep === 'delivery' && renderDeliveryStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'review' && renderReviewStep()}

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Action Buttons */}
        <FadeInView style={styles.actionButtons} delay={600}>
          <View style={styles.buttonRow}>
            {currentStepIndex > 0 && (
              <GlassButton
                title="Previous"
                onPress={handlePreviousStep}
                variant="outline"
                size="medium"
                style={styles.actionButton}
              />
            )}
            
            <GlassButton
              title={currentStep === 'review' ? 'Place Order' : 'Next'}
              onPress={handleNextStep}
              variant="primary"
              size="medium"
              style={[styles.actionButton, { flex: currentStepIndex === 0 ? 1 : 0.6 }]}
            />
          </View>
        </FadeInView>
      </ImageBackground>
    </View>
  );
}const 
styles = StyleSheet.create({
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
  stepIndicator: {
    marginHorizontal: glassTheme.spacing.lg,
    marginBottom: glassTheme.spacing.lg,
  },
  stepCard: {
    padding: glassTheme.spacing.lg,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: glassTheme.spacing.md,
  },
  stepTitle: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
    marginBottom: glassTheme.spacing.xs,
  },
  stepName: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: glassTheme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: glassTheme.colors.primary,
    borderRadius: 2,
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: glassTheme.spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  stepDotActive: {
    backgroundColor: glassTheme.colors.primary,
  },
  stepContent: {
    gap: glassTheme.spacing.lg,
  },
  sectionCard: {
    marginHorizontal: glassTheme.spacing.lg,
    padding: glassTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.md,
  },
  addressCard: {
    padding: glassTheme.spacing.md,
    marginBottom: glassTheme.spacing.sm,
  },
  addressCardSelected: {
    borderWidth: 2,
    borderColor: glassTheme.colors.primary,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: glassTheme.spacing.xs,
  },
  addressLabel: {
    fontSize: glassTheme.typography.sizes.md,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.light,
  },
  addressLabelSelected: {
    color: glassTheme.colors.primary,
  },
  defaultBadge: {
    backgroundColor: glassTheme.colors.success,
    paddingHorizontal: glassTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: glassTheme.borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  addressText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
  },
  addressTextSelected: {
    color: glassTheme.colors.primary,
    opacity: 1,
  },
  timeSlots: {
    flexDirection: 'row',
    gap: glassTheme.spacing.sm,
    paddingHorizontal: glassTheme.spacing.lg,
  },
  timeSlot: {
    paddingHorizontal: glassTheme.spacing.md,
    paddingVertical: glassTheme.spacing.sm,
    minWidth: 120,
  },
  timeSlotSelected: {
    borderWidth: 2,
    borderColor: glassTheme.colors.primary,
  },
  timeSlotText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
    textAlign: 'center',
  },
  timeSlotTextSelected: {
    color: glassTheme.colors.primary,
  },
  inputContainer: {
    padding: glassTheme.spacing.md,
  },
  textInput: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  paymentCard: {
    padding: glassTheme.spacing.md,
    marginBottom: glassTheme.spacing.sm,
  },
  paymentCardSelected: {
    borderWidth: 2,
    borderColor: glassTheme.colors.primary,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: glassTheme.spacing.md,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentType: {
    fontSize: glassTheme.typography.sizes.md,
    fontWeight: glassTheme.typography.weights.semibold,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  paymentTypeSelected: {
    color: glassTheme.colors.primary,
  },
  paymentNumber: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
  },
  paymentNumberSelected: {
    color: glassTheme.colors.primary,
    opacity: 1,
  },
  cardPreviewContainer: {
    alignItems: 'center',
    height: 200,
    justifyContent: 'center',
  },
  creditCard: {
    width: 300,
    height: 180,
    borderRadius: glassTheme.borderRadius.lg,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    transform: [{ rotateY: '180deg' }],
  },
  cardFront: {
    flex: 1,
    padding: glassTheme.spacing.lg,
    justifyContent: 'space-between',
  },
  cardNumber: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.light,
    letterSpacing: 2,
    marginTop: glassTheme.spacing.xl,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolder: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  cardExpiry: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  cardBackContent: {
    flex: 1,
    padding: glassTheme.spacing.lg,
  },
  magneticStripe: {
    height: 40,
    backgroundColor: '#000',
    marginVertical: glassTheme.spacing.lg,
  },
  cvvSection: {
    alignItems: 'flex-end',
  },
  cvvLabel: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    marginBottom: glassTheme.spacing.xs,
  },
  cvvBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: glassTheme.spacing.sm,
    borderRadius: glassTheme.borderRadius.sm,
    width: 50,
  },
  cvvText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: glassTheme.spacing.sm,
  },
  reviewItemName: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    flex: 1,
  },
  reviewItemPrice: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: glassTheme.spacing.sm,
  },
  reviewLabel: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    opacity: 0.8,
  },
  reviewValue: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  reviewTotalLabel: {
    fontSize: glassTheme.typography.sizes.lg,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.bold,
  },
  reviewTotalValue: {
    fontSize: glassTheme.typography.sizes.lg,
    color: glassTheme.colors.primary,
    fontWeight: glassTheme.typography.weights.bold,
  },
  reviewDetail: {
    marginBottom: glassTheme.spacing.md,
  },
  reviewDetailLabel: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
    marginBottom: glassTheme.spacing.xs,
  },
  reviewDetailValue: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
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
    flex: 0.4,
  },
  bottomSpacing: {
    height: 120,
  },
});