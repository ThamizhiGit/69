import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../../app/(main)/(tabs)/profile';

// Mock the required modules
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('../../../contexts', () => ({
  useUser: () => ({
    user: null,
    updatePreferences: jest.fn(),
  }),
  useApp: () => ({
    state: { theme: 'light' },
    setTheme: jest.fn(),
    resetApp: jest.fn(),
  }),
  useOrder: () => ({
    state: { orderHistory: [] },
  }),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('ProfileScreen', () => {
  it('should render profile screen with user information', () => {
    const { getByText } = render(<ProfileScreen />);
    
    // Check if main sections are rendered
    expect(getByText('Your Statistics')).toBeTruthy();
    expect(getByText('Recent Orders')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });

  it('should show edit profile modal when edit button is pressed', async () => {
    const { getByText, queryByText } = render(<ProfileScreen />);
    
    // Find and press the edit button (emoji)
    const editButton = getByText('✏️');
    fireEvent.press(editButton);
    
    // Check if edit modal appears
    await waitFor(() => {
      expect(queryByText('Edit Profile')).toBeTruthy();
    });
  });

  it('should show logout confirmation modal', async () => {
    const { getByText, queryByText } = render(<ProfileScreen />);
    
    // Find and press the sign out button
    const signOutButton = getByText('Sign Out');
    fireEvent.press(signOutButton);
    
    // Check if logout modal appears
    await waitFor(() => {
      expect(queryByText('Are you sure you want to sign out?')).toBeTruthy();
    });
  });

  it('should display user statistics', () => {
    const { getByText } = render(<ProfileScreen />);
    
    // Check if statistics are displayed
    expect(getByText('Total Orders')).toBeTruthy();
    expect(getByText('Total Spent')).toBeTruthy();
    expect(getByText('Avg Rating')).toBeTruthy();
    expect(getByText('Member')).toBeTruthy();
  });
});