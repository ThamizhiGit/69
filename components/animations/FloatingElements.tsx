import React, { useEffect } from 'react';
import { View, Dimensions, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingElement {
  id: string;
  component: React.ReactNode;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
  scale?: number;
  rotation?: number;
}

interface FloatingElementsProps {
  elements: FloatingElement[];
  style?: ViewStyle;
  paused?: boolean;
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({
  elements,
  style,
  paused = false,
}) => {
  return (
    <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, style]}>
      {elements.map((element) => (
        <FloatingElement
          key={element.id}
          element={element}
          paused={paused}
        />
      ))}
    </View>
  );
};

const FloatingElement: React.FC<{
  element: FloatingElement;
  paused: boolean;
}> = ({ element, paused }) => {
  const progress = useSharedValue(0);
  const rotationProgress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [element.startX, element.endX],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      progress.value,
      [0, 1],
      [element.startY, element.endY],
      Extrapolate.CLAMP
    );

    const scale = element.scale || 1;
    const rotation = element.rotation 
      ? interpolate(rotationProgress.value, [0, 1], [0, element.rotation])
      : 0;

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  useEffect(() => {
    if (!paused) {
      progress.value = withDelay(
        element.delay,
        withRepeat(
          withTiming(1, { duration: element.duration }),
          -1,
          true
        )
      );

      if (element.rotation) {
        rotationProgress.value = withDelay(
          element.delay,
          withRepeat(
            withTiming(1, { duration: element.duration * 2 }),
            -1,
            false
          )
        );
      }
    }
  }, [paused, element]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
        },
        animatedStyle,
      ]}
    >
      {element.component}
    </Animated.View>
  );
};

// Predefined floating food items for the home screen
export const FloatingFoodItems: React.FC<{
  paused?: boolean;
}> = ({ paused = false }) => {
  const foodEmojis = ['🍕', '🍔', '🍣', '🍝', '🥗', '🍰', '🍜', '🌮'];
  
  const elements: FloatingElement[] = foodEmojis.map((emoji, index) => ({
    id: `food-${index}`,
    component: (
      <View style={{
        fontSize: 24,
        opacity: 0.3,
      }}>
        <Animated.Text style={{ fontSize: 24 }}>{emoji}</Animated.Text>
      </View>
    ),
    startX: Math.random() * SCREEN_WIDTH,
    startY: SCREEN_HEIGHT + 50,
    endX: Math.random() * SCREEN_WIDTH,
    endY: -50,
    duration: 8000 + Math.random() * 4000,
    delay: index * 1000,
    scale: 0.8 + Math.random() * 0.4,
    rotation: Math.random() * 360,
  }));

  return <FloatingElements elements={elements} paused={paused} />;
};

// Particle effect for celebrations
export const ParticleEffect: React.FC<{
  particleCount?: number;
  colors?: string[];
  duration?: number;
  paused?: boolean;
}> = ({
  particleCount = 20,
  colors = ['#FF6B35', '#48BB78', '#F6AD55', '#9F7AEA'],
  duration = 3000,
  paused = false,
}) => {
  const particles: FloatingElement[] = Array.from({ length: particleCount }, (_, index) => ({
    id: `particle-${index}`,
    component: (
      <View
        style={{
          width: 4 + Math.random() * 6,
          height: 4 + Math.random() * 6,
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: 10,
        }}
      />
    ),
    startX: SCREEN_WIDTH / 2,
    startY: SCREEN_HEIGHT / 2,
    endX: SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 200,
    endY: SCREEN_HEIGHT / 2 + (Math.random() - 0.5) * 200,
    duration: duration + Math.random() * 1000,
    delay: Math.random() * 500,
    scale: 1,
  }));

  return <FloatingElements elements={particles} paused={paused} />;
};