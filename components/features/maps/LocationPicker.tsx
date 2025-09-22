import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '../../glass/GlassContainer';
import { LocationService } from '../../../services/locationService';
import { Location, Address } from '../../../types';

const { width, height } = Dimensions.get('window');

interface LocationPickerProps {
  initialLocation?: Location;
  onLocationSelect: (location: Location, address?: Address) => void;
  onClose: () => void;
  showCurrentLocationButton?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onLocationSelect,
  onClose,
  showCurrentLocationButton = true,
}) => {
  const mapRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || 37.7749,
    longitude: initialLocation?.longitude || -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const pinScale = useSharedValue(1);
  const pinTranslateY = useSharedValue(0);
  const confirmButtonScale = useSharedValue(0);

  // Animated styles
  const pinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pinScale.value },
      { translateY: pinTranslateY.value },
    ],
  }));

  const confirmButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmButtonScale.value }],
  }));

  // Pin drop animation
  const animatePinDrop = () => {
    pinScale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    
    pinTranslateY.value = withSequence(
      withTiming(-20, { duration: 200 }),
      withSpring(0, { damping: 10, stiffness: 150 })
    );

    // Show confirm button
    confirmButtonScale.value = withSpring(1, { damping: 8, stiffness: 100 });
  };

  // Handle map press
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newLocation: Location = { latitude, longitude };
    
    setSelectedLocation(newLocation);
    animatePinDrop();
  };

  // Get current location
  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setSelectedLocation(location);
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
        // Animate to current location
        mapRef.current?.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
        
        animatePinDrop();
      } else {
        Alert.alert(
          'Location Access',
          'Unable to get your current location. Please check your location permissions.'
        );
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm location selection
  const confirmLocation = async () => {
    if (!selectedLocation) return;

    setIsLoading(true);
    try {
      // Get address from coordinates
      const addressString = await LocationService.getAddressFromCoordinates(
        selectedLocation.latitude,
        selectedLocation.longitude
      );

      const locationWithAddress: Location = {
        ...selectedLocation,
        address: addressString || 'Unknown Address',
      };

      // Create address object
      const address: Address = {
        id: `addr-${Date.now()}`,
        label: 'Selected Location',
        street: addressString || 'Unknown Street',
        city: 'Unknown City',
        state: 'Unknown State',
        zipCode: '00000',
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        isDefault: false,
      };

      onLocationSelect(locationWithAddress, address);
    } catch (error) {
      console.error('Error confirming location:', error);
      // Still proceed with basic location data
      onLocationSelect(selectedLocation);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialLocation) {
      animatePinDrop();
    }
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        // Web placeholder for location picker
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderTitle}>📍 Location Picker</Text>
          <Text style={styles.placeholderText}>
            Interactive map is available on mobile devices
          </Text>
          {selectedLocation && (
            <View style={styles.selectedLocationInfo}>
              <Ionicons name="location" size={24} color="#FF6B35" />
              <Text style={styles.selectedLocationText}>
                Location: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.webSelectButton}
            onPress={() => {
              const defaultLocation = { latitude: 37.7749, longitude: -122.4194 };
              setSelectedLocation(defaultLocation);
              onLocationSelect(defaultLocation);
            }}
          >
            <Text style={styles.webSelectButtonText}>Use Default Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Native map placeholder
        <View style={styles.map}>
          <Text style={styles.mapLoadingText}>Map loading...</Text>
          {selectedLocation && (
            <Animated.View style={[styles.customPin, pinAnimatedStyle]}>
              <View style={styles.pinHead}>
                <Ionicons name="location" size={24} color="#fff" />
              </View>
              <View style={styles.pinTail} />
            </Animated.View>
          )}
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <GlassContainer intensity={25} style={styles.headerContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={styles.placeholder} />
        </GlassContainer>
      </View>

      {/* Current Location Button */}
      {showCurrentLocationButton && (
        <View style={styles.currentLocationButton}>
          <TouchableOpacity
            onPress={getCurrentLocation}
            disabled={isLoading}
            style={styles.locationButtonTouchable}
          >
            <GlassContainer intensity={25} style={styles.locationButtonContent}>
              <Ionicons 
                name="locate" 
                size={24} 
                color={isLoading ? "#999" : "#007AFF"} 
              />
            </GlassContainer>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirm Button */}
      {selectedLocation && (
        <Animated.View style={[styles.confirmButton, confirmButtonAnimatedStyle]}>
          <TouchableOpacity
            onPress={confirmLocation}
            disabled={isLoading}
            style={styles.confirmButtonTouchable}
          >
            <GlassContainer intensity={25} style={styles.confirmButtonContent}>
              <Text style={styles.confirmButtonText}>
                {isLoading ? 'Confirming...' : 'Confirm Location'}
              </Text>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </GlassContainer>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <GlassContainer intensity={20} style={styles.instructionsContent}>
          <Text style={styles.instructionsText}>
            Tap on the map to select your delivery location
          </Text>
        </GlassContainer>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  mapLoadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  mapPlaceholder: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  selectedLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 8,
  },
  selectedLocationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  webSelectButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  webSelectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
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
  currentLocationButton: {
    position: 'absolute',
    top: 120,
    right: 20,
    zIndex: 1000,
  },
  locationButtonTouchable: {
    borderRadius: 25,
  },
  locationButtonContent: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  confirmButtonTouchable: {
    borderRadius: 25,
  },
  confirmButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  instructionsContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  customPin: {
    alignItems: 'center',
  },
  pinHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF6B35',
    marginTop: -2,
  },
});