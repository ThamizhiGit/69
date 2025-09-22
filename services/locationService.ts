import * as Location from 'expo-location';
import { Location as LocationType, Address, Restaurant } from '../types';

// Location service for handling GPS and location-related functionality
export class LocationService {
  // Request location permissions
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  // Get current location
  static async getCurrentLocation(): Promise<LocationType | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Get address from coordinates (reverse geocoding)
  static async getAddressFromCoordinates(
    latitude: number, 
    longitude: number
  ): Promise<string | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        return `${address.street || ''} ${address.city || ''}, ${address.region || ''}`.trim();
      }
      return null;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return null;
    }
  }

  // Calculate distance between two points (in kilometers)
  static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  // Convert degrees to radians
  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Check if location is within delivery radius
  static isWithinDeliveryRadius(
    userLocation: LocationType,
    restaurantLocation: LocationType,
    maxRadius: number = 10 // Default 10km radius
  ): boolean {
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      restaurantLocation.latitude,
      restaurantLocation.longitude
    );
    return distance <= maxRadius;
  }

  // Mock location for demo purposes
  static getMockLocation(): LocationType {
    return {
      latitude: 37.7749, // San Francisco coordinates
      longitude: -122.4194,
      address: 'San Francisco, CA'
    };
  }

  // Generate mock delivery route points
  static generateMockRoute(
    start: LocationType,
    end: LocationType,
    points: number = 10
  ): LocationType[] {
    const route: LocationType[] = [];
    
    for (let i = 0; i <= points; i++) {
      const progress = i / points;
      const lat = start.latitude + (end.latitude - start.latitude) * progress;
      const lng = start.longitude + (end.longitude - start.longitude) * progress;
      
      // Add some randomness to make the route more realistic
      const randomOffset = 0.001;
      const randomLat = lat + (Math.random() - 0.5) * randomOffset;
      const randomLng = lng + (Math.random() - 0.5) * randomOffset;
      
      route.push({
        latitude: randomLat,
        longitude: randomLng,
      });
    }
    
    return route;
  }

  // Search for addresses with autocomplete suggestions
  static async searchAddresses(query: string): Promise<Address[]> {
    try {
      if (query.length < 3) return [];

      const geocodeResults = await Location.geocodeAsync(query);
      
      return geocodeResults.map((result, index) => ({
        id: `search-${index}`,
        label: 'Search Result',
        street: result.street || query,
        city: result.city || 'Unknown City',
        state: result.region || 'Unknown State',
        zipCode: result.postalCode || '00000',
        latitude: result.latitude,
        longitude: result.longitude,
        isDefault: false,
      }));
    } catch (error) {
      console.error('Error searching addresses:', error);
      // Return mock suggestions for demo
      return this.getMockAddressSuggestions(query);
    }
  }

  // Get mock address suggestions for demo
  static getMockAddressSuggestions(query: string): Address[] {
    const mockSuggestions = [
      {
        id: 'mock-1',
        label: 'Home',
        street: `${query} Street`,
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        latitude: 37.7749 + Math.random() * 0.01,
        longitude: -122.4194 + Math.random() * 0.01,
        isDefault: false,
      },
      {
        id: 'mock-2',
        label: 'Work',
        street: `${query} Avenue`,
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        latitude: 37.7849 + Math.random() * 0.01,
        longitude: -122.4094 + Math.random() * 0.01,
        isDefault: false,
      },
      {
        id: 'mock-3',
        label: 'Other',
        street: `${query} Boulevard`,
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94104',
        latitude: 37.7649 + Math.random() * 0.01,
        longitude: -122.4294 + Math.random() * 0.01,
        isDefault: false,
      },
    ];

    return mockSuggestions.filter(suggestion => 
      suggestion.street.toLowerCase().includes(query.toLowerCase()) ||
      suggestion.city.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Filter restaurants by location and delivery radius
  static filterRestaurantsByLocation(
    restaurants: Restaurant[],
    userLocation: LocationType,
    maxRadius: number = 10
  ): Restaurant[] {
    return restaurants.filter(restaurant => 
      this.isWithinDeliveryRadius(
        userLocation,
        restaurant.location,
        maxRadius
      )
    );
  }

  // Get delivery radius validation result
  static validateDeliveryRadius(
    userLocation: LocationType,
    restaurantLocation: LocationType,
    maxRadius: number = 10
  ): {
    isValid: boolean;
    distance: number;
    message: string;
  } {
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      restaurantLocation.latitude,
      restaurantLocation.longitude
    );

    const isValid = distance <= maxRadius;
    
    return {
      isValid,
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal
      message: isValid 
        ? `Delivery available (${distance.toFixed(1)}km away)`
        : `Outside delivery area (${distance.toFixed(1)}km away, max ${maxRadius}km)`
    };
  }

  // Get coordinates from address string
  static async getCoordinatesFromAddress(address: string): Promise<LocationType | null> {
    try {
      const geocodeResults = await Location.geocodeAsync(address);
      
      if (geocodeResults.length > 0) {
        const result = geocodeResults[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          address,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      return null;
    }
  }

  // Watch location changes (for real-time tracking)
  static async watchLocation(
    callback: (location: LocationType) => void,
    options: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    } = {}
  ): Promise<{ remove: () => void } | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: options.accuracy || Location.Accuracy.Balanced,
          timeInterval: options.timeInterval || 5000, // 5 seconds
          distanceInterval: options.distanceInterval || 10, // 10 meters
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      return subscription;
    } catch (error) {
      console.error('Error watching location:', error);
      return null;
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();