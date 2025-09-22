import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer } from '../../glass/GlassContainer';
import { LocationService } from '../../../services/locationService';
import { Address, Location } from '../../../types';

const { width } = Dimensions.get('window');

interface AddressSearchProps {
  onAddressSelect: (address: Address) => void;
  onLocationSelect?: (location: Location) => void;
  placeholder?: string;
  initialValue?: string;
  showCurrentLocationButton?: boolean;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
  onAddressSelect,
  onLocationSelect,
  placeholder = "Search for an address...",
  initialValue = "",
  showCurrentLocationButton = true,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const inputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Animation values
  const searchBarScale = useSharedValue(1);
  const suggestionsHeight = useSharedValue(0);
  const currentLocationButtonOpacity = useSharedValue(1);

  // Animated styles
  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBarScale.value }],
  }));

  const suggestionsAnimatedStyle = useAnimatedStyle(() => ({
    height: suggestionsHeight.value,
    opacity: interpolate(
      suggestionsHeight.value,
      [0, 200],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  const currentLocationButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: currentLocationButtonOpacity.value,
  }));

  // Search for addresses
  const searchAddresses = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await LocationService.searchAddresses(searchQuery);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      
      // Animate suggestions appearance
      if (results.length > 0) {
        suggestionsHeight.value = withSpring(Math.min(results.length * 70, 280), {
          damping: 15,
          stiffness: 150,
        });
      } else {
        suggestionsHeight.value = withTiming(0, { duration: 200 });
      }
    } catch (error) {
      console.error('Error searching addresses:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text input change
  const handleTextChange = (text: string) => {
    setQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(text);
    }, 300);
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    searchBarScale.value = withSpring(1.02, { damping: 15, stiffness: 150 });
    
    if (query.length >= 2) {
      searchAddresses(query);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    searchBarScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    
    // Hide suggestions after a delay to allow selection
    setTimeout(() => {
      setShowSuggestions(false);
      suggestionsHeight.value = withTiming(0, { duration: 200 });
    }, 150);
  };

  // Handle address selection
  const handleAddressSelect = (address: Address) => {
    setQuery(`${address.street}, ${address.city}`);
    setShowSuggestions(false);
    suggestionsHeight.value = withTiming(0, { duration: 200 });
    
    onAddressSelect(address);
    
    if (onLocationSelect) {
      onLocationSelect({
        latitude: address.latitude,
        longitude: address.longitude,
        address: `${address.street}, ${address.city}, ${address.state}`,
      });
    }
    
    Keyboard.dismiss();
  };

  // Get current location
  const getCurrentLocation = async () => {
    setIsLoading(true);
    currentLocationButtonOpacity.value = withTiming(0.5, { duration: 200 });
    
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        const addressString = await LocationService.getAddressFromCoordinates(
          location.latitude,
          location.longitude
        );
        
        const currentAddress: Address = {
          id: 'current-location',
          label: 'Current Location',
          street: addressString || 'Current Location',
          city: 'Current City',
          state: 'Current State',
          zipCode: '00000',
          latitude: location.latitude,
          longitude: location.longitude,
          isDefault: false,
        };
        
        handleAddressSelect(currentAddress);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLoading(false);
      currentLocationButtonOpacity.value = withTiming(1, { duration: 200 });
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    suggestionsHeight.value = withTiming(0, { duration: 200 });
    inputRef.current?.focus();
  };

  // Render suggestion item
  const renderSuggestionItem = ({ item, index }: { item: Address; index: number }) => (
    <TouchableOpacity
      onPress={() => handleAddressSelect(item)}
      style={styles.suggestionItem}
    >
      <View style={styles.suggestionIcon}>
        <Ionicons name="location-outline" size={20} color="#666" />
      </View>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>
          {item.street}
        </Text>
        <Text style={styles.suggestionSubtitle} numberOfLines={1}>
          {item.city}, {item.state} {item.zipCode}
        </Text>
      </View>
      <View style={styles.suggestionArrow}>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Animated.View style={[styles.searchBar, searchBarAnimatedStyle]}>
        <GlassContainer intensity={25} style={styles.searchBarContent}>
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={20} color="#666" />
          </View>
          
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={query}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCorrect={false}
            autoCapitalize="words"
          />
          
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
          
          {showCurrentLocationButton && (
            <Animated.View style={currentLocationButtonAnimatedStyle}>
              <TouchableOpacity
                onPress={getCurrentLocation}
                disabled={isLoading}
                style={styles.locationButton}
              >
                <Ionicons 
                  name="locate" 
                  size={20} 
                  color={isLoading ? "#999" : "#007AFF"} 
                />
              </TouchableOpacity>
            </Animated.View>
          )}
        </GlassContainer>
      </Animated.View>

      {/* Suggestions List */}
      {showSuggestions && (
        <Animated.View style={[styles.suggestionsContainer, suggestionsAnimatedStyle]}>
          <GlassContainer intensity={25} style={styles.suggestionsContent}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.suggestionsList}
            />
          </GlassContainer>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  searchBar: {
    marginBottom: 8,
  },
  searchBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  locationButton: {
    marginLeft: 8,
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 999,
    overflow: 'hidden',
  },
  suggestionsContent: {
    maxHeight: 280,
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  suggestionArrow: {
    marginLeft: 8,
  },
});