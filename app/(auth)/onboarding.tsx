import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer, GlassButton } from '../../components/glass';
import { FadeInView, StaggeredFadeInView } from '../../components/animations';
import { glassTheme } from '../../constants/theme';
import { onboardingSlides } from '../../constants/onboardingData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    router.replace('/(main)/(tabs)');
  };

  const renderSlide = (slide: typeof onboardingSlides[0], index: number) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const imageAnimatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.8, 1, 0.8],
        Extrapolate.CLAMP
      );

      const translateX = interpolate(
        scrollX.value,
        inputRange,
        [SCREEN_WIDTH * 0.25, 0, -SCREEN_WIDTH * 0.25],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ scale }, { translateX }],
      };
    });

    const contentAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );

      const translateY = interpolate(
        scrollX.value,
        inputRange,
        [50, 0, -50],
        Extrapolate.CLAMP
      );

      return {
        opacity,
        transform: [{ translateY }],
      };
    });

    return (
      <View key={slide.id} style={styles.slide}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Background Image with Parallax */}
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <ImageBackground
            source={{ uri: slide.image }}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.3)',
                'rgba(0,0,0,0.1)',
                'rgba(0,0,0,0.7)',
              ]}
              style={styles.imageOverlay}
            />
          </ImageBackground>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
          <GlassContainer
            intensity={25}
            tint="dark"
            style={styles.glassContent}
          >
            <StaggeredFadeInView staggerDelay={200}>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </StaggeredFadeInView>
          </GlassContainer>
        </Animated.View>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {onboardingSlides.map((_, index) => {
          const dotAnimatedStyle = useAnimatedStyle(() => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];

            const scale = interpolate(
              scrollX.value,
              inputRange,
              [0.8, 1.2, 0.8],
              Extrapolate.CLAMP
            );

            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.4, 1, 0.4],
              Extrapolate.CLAMP
            );

            return {
              transform: [{ scale }],
              opacity,
            };
          });

          return (
            <Animated.View
              key={index}
              style={[styles.dot, dotAnimatedStyle]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
      >
        {onboardingSlides.map((slide, index) => renderSlide(slide, index))}
      </Animated.ScrollView>

      {/* Skip Button */}
      <FadeInView style={styles.skipButton} delay={500}>
        <GlassButton
          title="Skip"
          onPress={handleSkip}
          variant="outline"
          size="small"
          intensity={15}
          tint="dark"
        />
      </FadeInView>

      {/* Bottom Controls */}
      <FadeInView style={styles.bottomControls} delay={800}>
        <GlassContainer
          intensity={20}
          tint="dark"
          style={styles.controlsContainer}
        >
          {renderPagination()}
          
          <GlassButton
            title={currentIndex === onboardingSlides.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            variant="primary"
            size="large"
            fullWidth
            style={styles.nextButton}
          />
        </GlassContainer>
      </FadeInView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  imageContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 200,
    left: glassTheme.spacing.lg,
    right: glassTheme.spacing.lg,
  },
  glassContent: {
    padding: glassTheme.spacing.xl,
  },
  subtitle: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.primary,
    fontWeight: glassTheme.typography.weights.medium,
    marginBottom: glassTheme.spacing.xs,
    textAlign: 'center',
  },
  title: {
    fontSize: glassTheme.typography.sizes.xxxl,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.bold,
    marginBottom: glassTheme.spacing.md,
    textAlign: 'center',
    lineHeight: glassTheme.typography.lineHeights.tight * glassTheme.typography.sizes.xxxl,
  },
  description: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    lineHeight: glassTheme.typography.lineHeights.relaxed * glassTheme.typography.sizes.md,
    opacity: 0.9,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: glassTheme.spacing.lg,
    zIndex: 10,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: glassTheme.spacing.lg,
    right: glassTheme.spacing.lg,
  },
  controlsContainer: {
    padding: glassTheme.spacing.lg,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: glassTheme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: glassTheme.colors.text.light,
    marginHorizontal: 4,
  },
  nextButton: {
    marginTop: glassTheme.spacing.md,
  },
});