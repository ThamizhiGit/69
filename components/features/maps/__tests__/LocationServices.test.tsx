import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { LocationPicker } from '../LocationPicker';
import { AddressSearch } from '../AddressSearch';
import { DeliveryRadiusIndicator } from '../DeliveryRadiusIndicator';
import { LocationBasedRestaurantFilter } from '../LocationBasedRestaurantFilter';
import { LocationService } from '../../../../services/locationService';
import { mockRestaurants } from '../../../../constants/mockData';

// Mock the LocationService
jest.mock('../../../../services/locationService');
const mockLocationService = LocationService as jest.Mocked<typeof LocationService>;

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock data
const mockLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  address: 'San Francisco, CA',
};

const mockAddress = {
  id: 'test-address',
  label: 'Test Address',
  street: '123 Test Street',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102',
  latitude: 37.7749,
  longitude: -122.4194,
  isDefault: false,
};

const mockRestaurant = mockRestaurants[0];

describe('LocationPicker', () => {
  const mockOnLocationSelect = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationService.getCurrentLocation.mockResolvedValue(mockLocation);
    mockLocationService.getAddressFromCoordinates.mockResolvedValue('123 Test Street, San Francisco, CA');
  });

  it('should render location picker correctly', () => {
    const { getByText } = render(
      <LocationPicker
        onLocationSelect={mockOnLocationSelect}
        onClose={mockOnClose}
      />
    );

    expect(getByText('Select Location')).toBeTruthy();
    expect(getByText('Tap on the map to select your delivery location')).toBeTruthy();
  });

  it('should handle current location button press', async () => {
    const { getByTestId } = render(
      <LocationPicker
        onLocationSelect={mockOnLocationSelect}
        onClose={mockOnClose}
        showCurrentLocationButton={true}
      />
    );

    // Mock successful location retrieval
    mockLocationService.getCurrentLocation.mockResolvedValue(mockLocation);

    // Find and press the current location button
    const locationButton = getByTestId('current-location-button');
    fireEvent.press(locationButton);

    await waitFor(() => {
      expect(mockLocationService.getCurrentLocation).toHaveBeenCalled();
    });
  });

  it('should handle location selection', async () => {
    const { getByTestId } = render(
      <LocationPicker
        initialLocation={mockLocation}
        onLocationSelect={mockOnLocationSelect}
        onClose={mockOnClose}
      />
    );

    // Mock the confirm button press
    const confirmButton = getByTestId('confirm-button');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockLocationService.getAddressFromCoordinates).toHaveBeenCalledWith(
        mockLocation.latitude,
        mockLocation.longitude
      );
      expect(mockOnLocationSelect).toHaveBeenCalled();
    });
  });

  it('should handle close button press', () => {
    const { getByTestId } = render(
      <LocationPicker
        onLocationSelect={mockOnLocationSelect}
        onClose={mockOnClose}
      />
    );

    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});

describe('AddressSearch', () => {
  const mockOnAddressSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationService.searchAddresses.mockResolvedValue([mockAddress]);
  });

  it('should render address search correctly', () => {
    const { getByPlaceholderText } = render(
      <AddressSearch onAddressSelect={mockOnAddressSelect} />
    );

    expect(getByPlaceholderText('Search for an address...')).toBeTruthy();
  });

  it('should handle text input and search', async () => {
    const { getByPlaceholderText } = render(
      <AddressSearch onAddressSelect={mockOnAddressSelect} />
    );

    const textInput = getByPlaceholderText('Search for an address...');
    fireEvent.changeText(textInput, 'Test Street');

    await waitFor(() => {
      expect(mockLocationService.searchAddresses).toHaveBeenCalledWith('Test Street');
    }, { timeout: 1000 }); // Account for debounce
  });

  it('should handle address selection', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AddressSearch onAddressSelect={mockOnAddressSelect} />
    );

    const textInput = getByPlaceholderText('Search for an address...');
    fireEvent.changeText(textInput, 'Test');

    await waitFor(() => {
      const suggestionItem = getByText('123 Test Street');
      fireEvent.press(suggestionItem);
      expect(mockOnAddressSelect).toHaveBeenCalledWith(mockAddress);
    });
  });
});

describe('DeliveryRadiusIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationService.validateDeliveryRadius.mockReturnValue({
      isValid: true,
      distance: 2.5,
      message: 'Delivery available (2.5km away)',
    });
  });

  it('should render delivery radius indicator correctly', () => {
    const { getByText } = render(
      <DeliveryRadiusIndicator
        userLocation={mockLocation}
        restaurant={mockRestaurant}
        maxRadius={10}
      />
    );

    expect(getByText('Delivery Available')).toBeTruthy();
    expect(getByText('2.5km away')).toBeTruthy();
    expect(getByText(mockRestaurant.name)).toBeTruthy();
  });

  it('should show outside delivery area when distance exceeds radius', () => {
    mockLocationService.validateDeliveryRadius.mockReturnValue({
      isValid: false,
      distance: 15.0,
      message: 'Outside delivery area (15.0km away, max 10km)',
    });

    const { getByText } = render(
      <DeliveryRadiusIndicator
        userLocation={mockLocation}
        restaurant={mockRestaurant}
        maxRadius={10}
      />
    );

    expect(getByText('Outside Delivery Area')).toBeTruthy();
    expect(getByText('15km away')).toBeTruthy();
  });
});

describe('LocationBasedRestaurantFilter', () => {
  const mockOnFilteredRestaurants = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocationService.filterRestaurantsByLocation.mockReturnValue(mockRestaurants.slice(0, 2));
  });

  it('should render restaurant filter correctly', () => {
    const { getByText } = render(
      <LocationBasedRestaurantFilter
        restaurants={mockRestaurants}
        userLocation={mockLocation}
        onFilteredRestaurants={mockOnFilteredRestaurants}
      />
    );

    expect(getByText('Filter by Distance')).toBeTruthy();
    expect(getByText('Nearby')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
    expect(getByText('Moderate')).toBeTruthy();
  });

  it('should handle filter selection', () => {
    const { getByText } = render(
      <LocationBasedRestaurantFilter
        restaurants={mockRestaurants}
        userLocation={mockLocation}
        onFilteredRestaurants={mockOnFilteredRestaurants}
      />
    );

    const nearbyFilter = getByText('Nearby');
    fireEvent.press(nearbyFilter);

    expect(mockLocationService.filterRestaurantsByLocation).toHaveBeenCalledWith(
      mockRestaurants,
      mockLocation,
      2 // Nearby radius
    );
    expect(mockOnFilteredRestaurants).toHaveBeenCalled();
  });

  it('should show no location message when location is null', () => {
    const { getByText } = render(
      <LocationBasedRestaurantFilter
        restaurants={mockRestaurants}
        userLocation={null}
        onFilteredRestaurants={mockOnFilteredRestaurants}
      />
    );

    expect(getByText('Enable location to filter restaurants by distance')).toBeTruthy();
  });
});

describe('LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate distance correctly', () => {
    const distance = LocationService.calculateDistance(
      37.7749, -122.4194, // San Francisco
      37.7849, -122.4094  // Nearby location
    );

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(5); // Should be less than 5km
  });

  it('should validate delivery radius correctly', () => {
    const userLocation = { latitude: 37.7749, longitude: -122.4194 };
    const restaurantLocation = { latitude: 37.7849, longitude: -122.4094 };

    const result = LocationService.validateDeliveryRadius(
      userLocation,
      restaurantLocation,
      10
    );

    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('distance');
    expect(result).toHaveProperty('message');
    expect(typeof result.isValid).toBe('boolean');
    expect(typeof result.distance).toBe('number');
    expect(typeof result.message).toBe('string');
  });

  it('should filter restaurants by location correctly', () => {
    const userLocation = { latitude: 37.7749, longitude: -122.4194 };
    
    const filtered = LocationService.filterRestaurantsByLocation(
      mockRestaurants,
      userLocation,
      10
    );

    expect(Array.isArray(filtered)).toBe(true);
    expect(filtered.length).toBeLessThanOrEqual(mockRestaurants.length);
  });

  it('should generate mock address suggestions', () => {
    const suggestions = LocationService.getMockAddressSuggestions('Test');

    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
    suggestions.forEach(suggestion => {
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('street');
      expect(suggestion).toHaveProperty('city');
      expect(suggestion).toHaveProperty('latitude');
      expect(suggestion).toHaveProperty('longitude');
    });
  });
});