import React from 'react';
import { ViewStyle, ImageStyle } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  headerComponent?: React.ReactNode;
  headerHeight?: number;
  parallaxFactor?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  onScroll?: (scrollY: number) => void;
  showsVerticalScrollIndicator?: boolean;
}

export const ParallaxScrollView: React.FC<ParallaxScrollViewProps> = ({
  children,
  headerComponent,
  headerHeight = 250,
  parallaxFactor = 0.5,
  style,
  contentContainerStyle,
  onScroll,
  showsVerticalScrollIndicator = true,
}) => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      if (onScroll) {
        onScroll(event.contentOffset.y);
      }
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-headerHeight, 0, headerHeight],
      [-headerHeight * parallaxFactor, 0, headerHeight * parallaxFactor],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [-headerHeight, 0],
      [2, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateY },
        { scale },
      ],
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, headerHeight * 0.5, headerHeight],
      [0, 0.3, 0.7],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <Animated.ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      {headerComponent && (
        <Animated.View
          style={[
            {
              height: headerHeight,
              overflow: 'hidden',
            },
            headerAnimatedStyle,
          ]}
        >
          {headerComponent}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              },
              overlayAnimatedStyle,
            ]}
          />
        </Animated.View>
      )}
      {children}
    </Animated.ScrollView>
  );
};

// Enhanced parallax with multiple layers
export const MultiLayerParallaxScrollView: React.FC<{
  children: React.ReactNode;
  layers: Array<{
    component: React.ReactNode;
    parallaxFactor: number;
    height: number;
  }>;
  style?: ViewStyle;
}> = ({ children, layers, style }) => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <Animated.ScrollView
      style={style}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {layers.map((layer, index) => {
        const layerAnimatedStyle = useAnimatedStyle(() => {
          const translateY = interpolate(
            scrollY.value,
            [-layer.height, 0, layer.height],
            [-layer.height * layer.parallaxFactor, 0, layer.height * layer.parallaxFactor],
            Extrapolate.CLAMP
          );

          return {
            transform: [{ translateY }],
          };
        });

        return (
          <Animated.View
            key={index}
            style={[
              {
                height: layer.height,
                position: index === 0 ? 'relative' : 'absolute',
                top: index === 0 ? 0 : layers.slice(0, index).reduce((sum, l) => sum + l.height, 0),
                left: 0,
                right: 0,
                zIndex: layers.length - index,
              },
              layerAnimatedStyle,
            ]}
          >
            {layer.component}
          </Animated.View>
        );
      })}
      {children}
    </Animated.ScrollView>
  );
};