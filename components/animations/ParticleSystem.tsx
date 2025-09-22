import React, { useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
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

interface Particle {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface ParticleSystemProps {
  particleCount?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  duration?: number;
  paused?: boolean;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particleCount = 15,
  colors = ['rgba(255,107,53,0.3)', 'rgba(72,187,120,0.3)', 'rgba(246,173,85,0.3)'],
  minSize = 2,
  maxSize = 6,
  duration = 8000,
  paused = false,
}) => {
  const particles: Particle[] = Array.from({ length: particleCount }, (_, index) => ({
    id: `particle-${index}`,
    startX: Math.random() * SCREEN_WIDTH,
    startY: SCREEN_HEIGHT + 50,
    endX: Math.random() * SCREEN_WIDTH,
    endY: -50,
    size: minSize + Math.random() * (maxSize - minSize),
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: duration + Math.random() * 2000,
    delay: Math.random() * 5000,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <AnimatedParticle
          key={particle.id}
          particle={particle}
          paused={paused}
        />
      ))}
    </View>
  );
};

const AnimatedParticle: React.FC<{
  particle: Particle;
  paused: boolean;
}> = ({ particle, paused }) => {
  const progress = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [particle.startX, particle.endX],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      progress.value,
      [0, 1],
      [particle.startY, particle.endY],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.1, 0.9, 1],
      [0, 1, 1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX },
        { translateY },
      ],
      opacity,
    };
  });

  useEffect(() => {
    if (!paused) {
      progress.value = withDelay(
        particle.delay,
        withRepeat(
          withTiming(1, { duration: particle.duration }),
          -1,
          false
        )
      );
    }
  }, [paused, particle]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
};

// Subtle background orbs for depth
export const BackgroundOrbs: React.FC<{
  orbCount?: number;
  paused?: boolean;
}> = ({ orbCount = 8, paused = false }) => {
  const orbs = Array.from({ length: orbCount }, (_, index) => ({
    id: `orb-${index}`,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: 100 + Math.random() * 200,
    color: `rgba(255,107,53,${0.02 + Math.random() * 0.03})`,
    duration: 10000 + Math.random() * 5000,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {orbs.map((orb) => (
        <AnimatedOrb key={orb.id} orb={orb} paused={paused} />
      ))}
    </View>
  );
};

const AnimatedOrb: React.FC<{
  orb: any;
  paused: boolean;
}> = ({ orb, paused }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (!paused) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: orb.duration }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(1, { duration: orb.duration }),
        -1,
        true
      );
    }
  }, [paused, orb]);

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          left: orb.x,
          top: orb.y,
          width: orb.size,
          height: orb.size,
          backgroundColor: orb.color,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  particle: {
    position: 'absolute',
    borderRadius: 10,
  },
  orb: {
    position: 'absolute',
    borderRadius: 1000,
  },
});