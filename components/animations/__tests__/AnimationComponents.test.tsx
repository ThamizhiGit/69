import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { FadeInView } from '../FadeInView';
import { ScaleButton } from '../ScaleButton';
import { ParallaxScrollView } from '../ParallaxScrollView';
import { FloatingElements } from '../FloatingElements';
import { LoadingSkeleton } from '../LoadingSkeleton';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  const ScrollView = require('react-native').ScrollView;
  return {
    useSharedValue: (initial: any) => ({ value: initial }),
    useAnimatedStyle: (fn: any) => ({}),
    useAnimatedScrollHandler: (handler: any) => () => {},
    withSpring: (value: any, config?: any) => value,
    withTiming: (value: any, config?: any) => value,
    withDelay: (delay: number, animation: any) => animation,
    withRepeat: (animation: any, count?: number) => animation,
    interpolate: (value: number, input: number[], output: number[]) => output[0],
    Extrapolate: { CLAMP: 'clamp' },
    runOnJS: (fn: any) => fn,
    default: {
      View,
      ScrollView,
    },
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    TapGestureHandler: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    State: { BEGAN: 0, ACTIVE: 1, END: 2 },
  };
});

// Mock lottie-react-native
jest.mock('lottie-react-native', () => {
  const View = require('react-native').View;
  return ({ testID, ...props }: any) => <View testID={testID} {...props} />;
});

describe('FadeInView', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <FadeInView>
        <Text>Fade In Content</Text>
      </FadeInView>
    );
    
    expect(getByText('Fade In Content')).toBeTruthy();
  });

  it('should apply custom duration', () => {
    const { getByTestId } = render(
      <FadeInView duration={500} testID="fade-view">
        <Text>Content</Text>
      </FadeInView>
    );
    
    expect(getByTestId('fade-view')).toBeTruthy();
  });

  it('should apply custom delay', () => {
    const { getByTestId } = render(
      <FadeInView delay={200} testID="fade-view">
        <Text>Content</Text>
      </FadeInView>
    );
    
    expect(getByTestId('fade-view')).toBeTruthy();
  });

  it('should handle different directions', () => {
    const directions = ['up', 'down', 'left', 'right'] as const;
    
    directions.forEach(direction => {
      const { getByTestId } = render(
        <FadeInView direction={direction} testID={`fade-view-${direction}`}>
          <Text>Content</Text>
        </FadeInView>
      );
      
      expect(getByTestId(`fade-view-${direction}`)).toBeTruthy();
    });
  });
});

describe('ScaleButton', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <ScaleButton onPress={() => {}}>
        <Text>Scale Button</Text>
      </ScaleButton>
    );
    
    expect(getByText('Scale Button')).toBeTruthy();
  });

  it('should handle press events', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ScaleButton onPress={onPressMock}>
        <Text>Press Me</Text>
      </ScaleButton>
    );
    
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('should not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ScaleButton onPress={onPressMock} disabled={true}>
        <Text>Disabled Button</Text>
      </ScaleButton>
    );
    
    fireEvent.press(getByText('Disabled Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should apply custom scale values', () => {
    const { getByTestId } = render(
      <ScaleButton onPress={() => {}} scaleValue={0.9} testID="scale-button">
        <Text>Custom Scale</Text>
      </ScaleButton>
    );
    
    expect(getByTestId('scale-button')).toBeTruthy();
  });

  it('should handle haptic feedback', () => {
    const { getByText } = render(
      <ScaleButton onPress={() => {}} hapticFeedback={true}>
        <Text>Haptic Button</Text>
      </ScaleButton>
    );
    
    expect(getByText('Haptic Button')).toBeTruthy();
  });
});

describe('ParallaxScrollView', () => {
  const mockHeaderComponent = <View testID="header"><Text>Header</Text></View>;
  const mockChildren = <Text>Scroll Content</Text>;

  it('should render header and children correctly', () => {
    const { getByText, getByTestId } = render(
      <ParallaxScrollView headerComponent={mockHeaderComponent}>
        {mockChildren}
      </ParallaxScrollView>
    );
    
    expect(getByText('Header')).toBeTruthy();
    expect(getByText('Scroll Content')).toBeTruthy();
    expect(getByTestId('header')).toBeTruthy();
  });

  it('should apply custom header height', () => {
    const customHeight = 300;
    const { getByTestId } = render(
      <ParallaxScrollView 
        headerComponent={mockHeaderComponent} 
        headerHeight={customHeight}
        testID="parallax-scroll"
      >
        {mockChildren}
      </ParallaxScrollView>
    );
    
    expect(getByTestId('parallax-scroll')).toBeTruthy();
  });

  it('should apply custom parallax factor', () => {
    const { getByTestId } = render(
      <ParallaxScrollView 
        headerComponent={mockHeaderComponent}
        parallaxFactor={0.3}
        testID="parallax-scroll"
      >
        {mockChildren}
      </ParallaxScrollView>
    );
    
    expect(getByTestId('parallax-scroll')).toBeTruthy();
  });

  it('should handle scroll events', () => {
    const onScrollMock = jest.fn();
    const { getByTestId } = render(
      <ParallaxScrollView 
        headerComponent={mockHeaderComponent}
        onScroll={onScrollMock}
        testID="parallax-scroll"
      >
        {mockChildren}
      </ParallaxScrollView>
    );
    
    const scrollView = getByTestId('parallax-scroll');
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 100 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 800 },
      },
    });
    
    expect(onScrollMock).toHaveBeenCalled();
  });
});

describe('FloatingElements', () => {
  it('should render floating elements correctly', () => {
    const { getByTestId } = render(
      <FloatingElements testID="floating-elements" />
    );
    
    expect(getByTestId('floating-elements')).toBeTruthy();
  });

  it('should apply custom element count', () => {
    const { getByTestId } = render(
      <FloatingElements elementCount={10} testID="floating-elements" />
    );
    
    expect(getByTestId('floating-elements')).toBeTruthy();
  });

  it('should handle different animation types', () => {
    const animationTypes = ['float', 'rotate', 'pulse'] as const;
    
    animationTypes.forEach(type => {
      const { getByTestId } = render(
        <FloatingElements 
          animationType={type} 
          testID={`floating-elements-${type}`} 
        />
      );
      
      expect(getByTestId(`floating-elements-${type}`)).toBeTruthy();
    });
  });

  it('should apply custom speed', () => {
    const { getByTestId } = render(
      <FloatingElements speed={2} testID="floating-elements" />
    );
    
    expect(getByTestId('floating-elements')).toBeTruthy();
  });
});

describe('LoadingSkeleton', () => {
  it('should render skeleton correctly', () => {
    const { getByTestId } = render(
      <LoadingSkeleton testID="loading-skeleton" />
    );
    
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });

  it('should apply custom width and height', () => {
    const { getByTestId } = render(
      <LoadingSkeleton 
        width={200} 
        height={100} 
        testID="loading-skeleton" 
      />
    );
    
    const skeleton = getByTestId('loading-skeleton');
    expect(skeleton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 200,
          height: 100,
        })
      ])
    );
  });

  it('should handle different skeleton types', () => {
    const types = ['rectangle', 'circle', 'text'] as const;
    
    types.forEach(type => {
      const { getByTestId } = render(
        <LoadingSkeleton 
          type={type} 
          testID={`loading-skeleton-${type}`} 
        />
      );
      
      expect(getByTestId(`loading-skeleton-${type}`)).toBeTruthy();
    });
  });

  it('should apply custom border radius', () => {
    const { getByTestId } = render(
      <LoadingSkeleton 
        borderRadius={12} 
        testID="loading-skeleton" 
      />
    );
    
    const skeleton = getByTestId('loading-skeleton');
    expect(skeleton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          borderRadius: 12,
        })
      ])
    );
  });

  it('should handle animation speed', () => {
    const { getByTestId } = render(
      <LoadingSkeleton 
        animationSpeed={1500} 
        testID="loading-skeleton" 
      />
    );
    
    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });
});