import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassContainer } from '../GlassContainer';

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="blur-view" {...props}>{children}</View>;
  },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="linear-gradient" {...props}>{children}</View>;
  },
}));

describe('GlassContainer', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <GlassContainer>
        <Text>Test Content</Text>
      </GlassContainer>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should render with default props', () => {
    const { getByTestId } = render(
      <GlassContainer>
        <Text>Test Content</Text>
      </GlassContainer>
    );
    
    const blurView = getByTestId('blur-view');
    const gradient = getByTestId('linear-gradient');
    
    expect(blurView).toBeTruthy();
    expect(gradient).toBeTruthy();
  });

  it('should apply custom intensity', () => {
    const customIntensity = 25;
    const { getByTestId } = render(
      <GlassContainer intensity={customIntensity}>
        <Text>Test Content</Text>
      </GlassContainer>
    );
    
    const blurView = getByTestId('blur-view');
    expect(blurView.props.intensity).toBe(customIntensity);
  });

  it('should apply custom tint', () => {
    const customTint = 'dark';
    const { getByTestId } = render(
      <GlassContainer tint={customTint}>
        <Text>Test Content</Text>
      </GlassContainer>
    );
    
    const blurView = getByTestId('blur-view');
    expect(blurView.props.tint).toBe(customTint);
  });

  it('should apply custom border radius', () => {
    const customBorderRadius = 24;
    const { getByTestId } = render(
      <GlassContainer borderRadius={customBorderRadius}>
        <Text>Test Content</Text>
      </GlassContainer>
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

  it('should apply custom styles', () => {
    const customStyle = { margin: 10 };
    const { getByTestId } = render(
      <GlassContainer style={customStyle}>
        <Text>Test Content</Text>
      </GlassContainer>
    );
    
    // The custom style should be applied to the container
    const container = getByTestId('blur-view').parent;
    expect(container?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });

  it('should handle different tint values correctly', () => {
    const tints = ['light', 'dark', 'default'] as const;
    
    tints.forEach(tint => {
      const { getByTestId } = render(
        <GlassContainer tint={tint}>
          <Text>Test Content</Text>
        </GlassContainer>
      );
      
      const blurView = getByTestId('blur-view');
      expect(blurView.props.tint).toBe(tint);
    });
  });

  it('should apply glass shadow styles', () => {
    const { getByTestId } = render(
      <GlassContainer>
        <Text>Test Content</Text>
      </GlassContainer>
    );
    
    const container = getByTestId('blur-view').parent;
    expect(container?.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 24,
        })
      ])
    );
  });
});