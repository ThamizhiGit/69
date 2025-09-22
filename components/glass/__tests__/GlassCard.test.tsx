import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassCard } from '../GlassCard';

// Mock expo-blur and expo-linear-gradient
jest.mock('expo-blur', () => ({
  BlurView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="blur-view" {...props}>{children}</View>;
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="linear-gradient" {...props}>{children}</View>;
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: (fn: any) => ({ }),
    withSpring: (value: any) => value,
    withTiming: (value: any) => value,
    default: {
      View,
    },
  };
});

describe('GlassCard', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <GlassCard>
        <Text>Card Content</Text>
      </GlassCard>
    );
    
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('should render with default glass effects', () => {
    const { getByTestId } = render(
      <GlassCard>
        <Text>Card Content</Text>
      </GlassCard>
    );
    
    const blurView = getByTestId('blur-view');
    const gradient = getByTestId('linear-gradient');
    
    expect(blurView).toBeTruthy();
    expect(gradient).toBeTruthy();
  });

  it('should handle press events when pressable', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GlassCard pressable onPress={onPressMock}>
        <Text>Pressable Card</Text>
      </GlassCard>
    );
    
    fireEvent.press(getByText('Pressable Card'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('should not handle press events when not pressable', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GlassCard onPress={onPressMock}>
        <Text>Non-pressable Card</Text>
      </GlassCard>
    );
    
    // Should not be pressable by default
    expect(() => fireEvent.press(getByText('Non-pressable Card'))).not.toThrow();
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should apply custom intensity', () => {
    const customIntensity = 30;
    const { getByTestId } = render(
      <GlassCard intensity={customIntensity}>
        <Text>Card Content</Text>
      </GlassCard>
    );
    
    const blurView = getByTestId('blur-view');
    expect(blurView.props.intensity).toBe(customIntensity);
  });

  it('should apply custom border radius', () => {
    const customBorderRadius = 20;
    const { getByTestId } = render(
      <GlassCard borderRadius={customBorderRadius}>
        <Text>Card Content</Text>
      </GlassCard>
    );
    
    const blurView = getByTestId('blur-view');
    expect(blurView.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          borderRadius: customBorderRadius,
        })
      ])
    );
  });

  it('should apply different variants correctly', () => {
    const variants = ['default', 'elevated', 'outlined'] as const;
    
    variants.forEach(variant => {
      const { getByTestId } = render(
        <GlassCard variant={variant}>
          <Text>Card Content</Text>
        </GlassCard>
      );
      
      const blurView = getByTestId('blur-view');
      expect(blurView).toBeTruthy();
    });
  });

  it('should apply custom padding', () => {
    const customPadding = 24;
    const { getByTestId } = render(
      <GlassCard padding={customPadding}>
        <Text>Card Content</Text>
      </GlassCard>
    );
    
    const gradient = getByTestId('linear-gradient');
    expect(gradient.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          padding: customPadding,
        })
      ])
    );
  });

  it('should handle disabled state correctly', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GlassCard pressable onPress={onPressMock} disabled={true}>
        <Text>Disabled Card</Text>
      </GlassCard>
    );
    
    fireEvent.press(getByText('Disabled Card'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should apply shadow effects', () => {
    const { getByTestId } = render(
      <GlassCard>
        <Text>Card Content</Text>
      </GlassCard>
    );
    
    const container = getByTestId('blur-view').parent;
    expect(container?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          shadowColor: '#000',
          shadowOpacity: expect.any(Number),
          shadowRadius: expect.any(Number),
        })
      ])
    );
  });
});