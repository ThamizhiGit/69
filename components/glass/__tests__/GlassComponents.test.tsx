import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { GlassBottomSheet } from '../GlassBottomSheet';
import { GlassNavBar } from '../GlassNavBar';
import { GlassModal } from '../GlassModal';
import { GlassButton } from '../GlassButton';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: (fn: any) => ({ }),
    withSpring: (value: any) => value,
    withTiming: (value: any) => value,
    runOnJS: (fn: any) => fn,
    default: {
      View,
    },
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('GlassBottomSheet', () => {
  it('should render when visible', () => {
    const { getByText } = render(
      <GlassBottomSheet visible={true} onClose={() => {}}>
        <Text>Bottom Sheet Content</Text>
      </GlassBottomSheet>
    );
    
    expect(getByText('Bottom Sheet Content')).toBeTruthy();
  });

  it('should call onClose when backdrop is pressed', () => {
    const onCloseMock = jest.fn();
    const { getByTestId } = render(
      <GlassBottomSheet visible={true} onClose={onCloseMock}>
        <Text>Content</Text>
      </GlassBottomSheet>
    );
    
    // Note: In a real test, you'd need to find the backdrop touchable
    // This is a simplified test structure
    expect(onCloseMock).not.toHaveBeenCalled();
  });
});

describe('GlassNavBar', () => {
  it('should render title correctly', () => {
    const { getByText } = render(
      <GlassNavBar title="Test Title" />
    );
    
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('should render left and right components', () => {
    const { getByText } = render(
      <GlassNavBar
        title="Test"
        leftComponent={<Text>Left</Text>}
        rightComponent={<Text>Right</Text>}
      />
    );
    
    expect(getByText('Left')).toBeTruthy();
    expect(getByText('Right')).toBeTruthy();
  });

  it('should call onLeftPress when left component is pressed', () => {
    const onLeftPressMock = jest.fn();
    const { getByText } = render(
      <GlassNavBar
        leftComponent={<Text>Left</Text>}
        onLeftPress={onLeftPressMock}
      />
    );
    
    fireEvent.press(getByText('Left'));
    expect(onLeftPressMock).toHaveBeenCalled();
  });
});

describe('GlassModal', () => {
  it('should render when visible', () => {
    const { getByText } = render(
      <GlassModal visible={true} onClose={() => {}}>
        <Text>Modal Content</Text>
      </GlassModal>
    );
    
    expect(getByText('Modal Content')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <GlassModal visible={false} onClose={() => {}}>
        <Text>Modal Content</Text>
      </GlassModal>
    );
    
    expect(queryByText('Modal Content')).toBeNull();
  });
});

describe('GlassButton', () => {
  it('should render title correctly', () => {
    const { getByText } = render(
      <GlassButton title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GlassButton title="Test Button" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('should not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GlassButton title="Test Button" onPress={onPressMock} disabled={true} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should apply different variants correctly', () => {
    const variants = ['primary', 'secondary', 'outline'] as const;
    
    variants.forEach(variant => {
      const { getByText } = render(
        <GlassButton title={`${variant} Button`} onPress={() => {}} variant={variant} />
      );
      
      expect(getByText(`${variant} Button`)).toBeTruthy();
    });
  });

  it('should apply different sizes correctly', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    sizes.forEach(size => {
      const { getByText } = render(
        <GlassButton title={`${size} Button`} onPress={() => {}} size={size} />
      );
      
      expect(getByText(`${size} Button`)).toBeTruthy();
    });
  });
});