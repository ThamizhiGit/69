import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GlassContainer } from '../../components/glass/GlassContainer';
import { 
  LocationPicker, 
  AddressSearch, 
  DeliveryRadiusIndicator,
  LocationBasedRestaurantFilter 
} from '../../components/features/maps';
import { useLocation } from '../../hooks/useLocation';
import { mockDataService } from '../../services/mockData';
import { Location, Address, Restaurant } from '../../types';

const { width } = Dimensions.get('window');

export default function LocationDemoScreen() {
  const { location, isLoading, error, hasPermission, requestLocation } = useLocation();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [restaurants] = useState<Restaurant[]>(mockDataService.getRestaurants());
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Handle address selection from search
  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    console.log('Selected address:', address);
  };

  // Handle location selection from picker
  const handleLocationSelect = (selectedLocation: Location, address?: Address) => {
    console.log('Selected location:', selectedLocation);
    if (address) {
      setSelectedAddress(address);
    }
    setShowLocationPicker(false);
  };

  // Handle filtered restaurants
  const handleFilteredRestaurants = (filtered: Restaurant[]) => {
    setFilteredRestaurants(filtered);
  };

  // Show location picker
  const showPicker = () => {
    setShowLocationPicker(true);
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      await requestLocation();
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  useEffect(() => {
    // Select first restaurant for demo
    if (restaurants.length > 0) {
      setSelectedRestaurant(restaurants[0]);
    }
  }, []);

  if (showLocationPicker) {
    return (
      <LocationPicker
        initialLocation={location || undefined}
        onLocationSelect={handleLocationSelect}
        onClose={() => setShowLocationPicker(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlassContainer intensity={25} style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Location Services Demo</Text>
          <View style={styles.placeholder} />
        </GlassContainer>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Location Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <GlassContainer intensity={20} style={styles.locationStatus}>
            <View style={styles.locationStatusContent}>
              <Ionicons 
                name={hasPermission ? "location" : "location-outline"} 
                size={24} 
                color={hasPermission ? "#48BB78" : "#999"} 
              />
              <View style={styles.locationStatusText}>
                <Text style={styles.locationStatusTitle}>
                  {hasPermission ? 'Location Access Granted' : 'Location Access Required'}
                </Text>
                <Text style={styles.locationStatusSubtitle}>
                  {location 
                    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                    : 'No location available'
                  }
                </Text>
              </View>
              <TouchableOpacity 
                onPress={getCurrentLocation}
                disabled={isLoading}
                style={styles.locationButton}
              >
                <Text style={styles.locationButtonText}>
                  {isLoading ? 'Getting...' : 'Get Location'}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassContainer>
        </View>

        {/* Address Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Search</Text>
          <AddressSearch
            onAddressSelect={handleAddressSelect}
            placeholder="Search for an address..."
            showCurrentLocationButton={true}
          />
          {selectedAddress && (
            <GlassContainer intensity={20} style={styles.selectedAddress}>
              <Text style={styles.selectedAddressTitle}>Selected Address:</Text>
              <Text style={styles.selectedAddressText}>
                {selectedAddress.street}, {selectedAddress.city}
              </Text>
            </GlassContainer>
          )}
        </View>

        {/* Location Picker Button */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Picker</Text>
          <TouchableOpacity onPress={showPicker} style={styles.pickerButton}>
            <GlassContainer intensity={25} style={styles.pickerButtonContent}>
              <Ionicons name="map" size={24} color="#007AFF" />
              <Text style={styles.pickerButtonText}>Open Map Picker</Text>
              <Ionicons name="chevron-forward" size={20} color="#007AFF" />
            </GlassContainer>
          </TouchableOpacity>
        </View>

        {/* Location-Based Restaurant Filter */}
        {location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurant Filter by Distance</Text>
            <LocationBasedRestaurantFilter
              restaurants={restaurants}
              userLocation={location}
              onFilteredRestaurants={handleFilteredRestaurants}
            />
            <Text style={styles.filterResult}>
              Showing {filteredRestaurants.length} of {restaurants.length} restaurants
            </Text>
          </View>
        )}

        {/* Delivery Radius Indicator */}
        {location && selectedRestaurant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Radius Check</Text>
            <DeliveryRadiusIndicator
              userLocation={location}
              restaurant={selectedRestaurant}
              maxRadius={10}
            />
          </View>
        )}

        {/* Restaurant List */}
        {location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
            {filteredRestaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                onPress={() => setSelectedRestaurant(restaurant)}
                style={styles.restaurantItem}
              >
                <GlassContainer 
                  intensity={selectedRestaurant?.id === restaurant.id ? 30 : 20} 
                  style={[
                    styles.restaurantItemContent,
                    selectedRestaurant?.id === restaurant.id && styles.restaurantItemSelected
                  ]}
                >
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <Text style={styles.restaurantCuisine}>
                      {restaurant.cuisine.join(', ')}
                    </Text>
                    <View style={styles.restaurantDetails}>
                      <View style={styles.restaurantDetail}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.restaurantDetailText}>{restaurant.rating}</Text>
                      </View>
                      <View style={styles.restaurantDetail}>
                        <Ionicons name="time" size={14} color="#666" />
                        <Text style={styles.restaurantDetailText}>{restaurant.deliveryTime}</Text>
                      </View>
                      <View style={styles.restaurantDetail}>
                        <Ionicons name="location" size={14} color="#666" />
                        <Text style={styles.restaurantDetailText}>
                          {location ? 
                            `${(Math.random() * 5 + 1).toFixed(1)}km` : 
                            'Distance unknown'
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                  {selectedRestaurant?.id === restaurant.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#48BB78" />
                  )}
                </GlassContainer>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.section}>
            <GlassContainer intensity={20} style={styles.errorContainer}>
              <Ionicons name="warning" size={24} color="#FF6B35" />
              <Text style={styles.errorText}>{error}</Text>
            </GlassContainer>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  locationStatus: {
    padding: 16,
  },
  locationStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationStatusText: {
    flex: 1,
    marginLeft: 12,
  },
  locationStatusTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  locationStatusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  locationButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedAddress: {
    padding: 12,
    marginTop: 8,
  },
  selectedAddressTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  selectedAddressText: {
    fontSize: 14,
    color: '#666',
  },
  pickerButton: {
    marginBottom: 8,
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    flex: 1,
    marginLeft: 12,
  },
  filterResult: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  restaurantItem: {
    marginBottom: 8,
  },
  restaurantItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  restaurantItemSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  restaurantDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B35',
    marginLeft: 12,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});