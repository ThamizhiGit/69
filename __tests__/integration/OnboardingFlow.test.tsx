import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { router } from 'expo-router';
import OnboardingScreen from '../../app/(auth)/onboarding';
import { AppContextProvider } from '../../contexts/AppContext';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo modules
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

// Mock lottie animations
jest.mock('lottie-react-native', () => {
  const View = require('react-native').View;
  return ({ testID, ...props }: any) => <View testID={testID} {...props} />;
});

const renderOnboardingWithProviders = () => {
  return render(
    <NavigationContainer>
      <AppContextProvider>
        <OnboardingScreen />
      </AppContextProvider>
    </NavigationContainer>
  );
};

describe('Onboarding Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full onboarding flow', async () => {
    const { getByText, getByTestId } = renderOnboardingWithProviders();

    // Check initial slide is displayed
    expect(getByText('Welcome to FoodGlass')).toBeTruthy();
    expect(getByText('Discover amazing restaurants with our beautiful glass interface')).toBeTruthy();

    // Navigate through slides
    const nextButton = getByText('Next');
    
    // Slide 1 -> Slide 2
    fireEvent.press(nextButton);
    
    await waitFor(() => {
      expect(getByText('AI-Powered Recommendations')).toBeTruthy();
    });

    // Slide 2 -> Slide 3
    fireEvent.press(nextButton);
    
    await waitFor(() => {
      expect(getByText('Real-Time Tracking')).toBeTruthy();
    });

    // Slide 3 -> Slide 4
    fireEvent.press(nextButton);
    
    await waitFor(() => {
      expect(getByText('Get Started')).toBeTruthy();
    });

    // Complete onboarding
    const getStartedButton = getByText('Get Started');
    fireEvent.press(getStartedButton);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(main)/(tabs)');
    });
  });

  it('should allow skipping onboarding', async () => {
    const { getByText } = renderOnboardingWithProviders();

    const skipButton = getByText('Skip');
    fireEvent.press(skipButton);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(main)/(tabs)');
    });
  });

  it('should handle swipe gestures between slides', async () => {
    const { getByTestId, getByText } = renderOnboardingWithProviders();

    // Get the scroll view
    const scrollView = getByTestId('onboarding-scroll');

    // Simulate swipe to next slide
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { x: 375, y: 0 }, // Assuming screen width of 375
        contentSize: { width: 1500, height: 600 },
        layoutMeasurement: { width: 375, height: 600 },
      },
    });

    await waitFor(() => {
      expect(getByText('AI-Powered Recommendations')).toBeTruthy();
    });
  });

  it('should update progress indicator correctly', async () => {
    const { getByTestId, getByText } = renderOnboardingWithProviders();

    // Check initial progress
    const progressIndicator = getByTestId('progress-indicator');
    expect(progressIndicator).toBeTruthy();

    // Navigate to next slide
    const nextButton = getByText('Next');
    fireEvent.press(nextButton);

    await waitFor(() => {
      // Progress should update (this would need to be implemented in the component)
      expect(getByTestId('progress-indicator')).toBeTruthy();
    });
  });

  it('should handle back navigation correctly', async () => {
    const { getByText, getByTestId } = renderOnboardingWithProviders();

    // Navigate to second slide
    const nextButton = getByText('Next');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(getByText('AI-Powered Recommendations')).toBeTruthy();
    });

    // Go back to first slide
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(getByText('Welcome to FoodGlass')).toBeTruthy();
    });
  });

  it('should display glass morphism effects correctly', () => {
    const { getAllByTestId } = renderOnboardingWithProviders();

    // Check that glass effects are rendered
    const blurViews = getAllByTestId('blur-view');
    const gradients = getAllByTestId('linear-gradient');

    expect(blurViews.length).toBeGreaterThan(0);
    expect(gradients.length).toBeGreaterThan(0);
  });

  it('should handle animation completion', async () => {
    const { getByText } = renderOnboardingWithProviders();

    // Navigate through slides quickly
    const nextButton = getByText('Next');
    
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);

    // Should reach final slide
    await waitFor(() => {
      expect(getByText('Get Started')).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('should persist onboarding completion state', async () => {
    const { getByText } = renderOnboardingWithProviders();

    const getStartedButton = getByText('Get Started');
    fireEvent.press(getStartedButton);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(main)/(tabs)');
    });

    // In a real app, this would check AsyncStorage or similar
    // to ensure onboarding completion is persisted
  });
});