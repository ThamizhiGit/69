import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
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
import { Location, Restaurant } from '../../../types';

const { width } = Dimensions.get('window');

interface LocationBasedRestaurantFilterProps {
  restaurants: Restaurant[];
  userLocation: Location | null;
  onFilteredRestaurants: (restaurants: Restaurant[]) => void;
  maxRadius?: number;
  style?: any;
}

interface FilterOption {
  id: string;
  label: string;
  radius: number;
  icon: string;
}

const filterOptions: FilterOption[] = [
  { id: 'nearby', label: 'Nearby', radius: 2, icon: 'walk' },
  { id: 'close', label: 'Close', radius: 5, icon: 'bicycle' },
  { id: 'moderate', label: 'Moderate', radius: 10, icon: 'car' },
  { id: 'far', label: 'All Areas', radius: 50, icon: 'airplane' },
];

export const LocationBasedRestaurantFilter: React.FC<LocationBasedRestaurantFilterProps> = ({
  restaurants,
  userLocation,
  onFilteredRestaurants,
  maxRadius = 10,
  style,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('moderate');
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);
  const [restaurantCounts, setRestaurantCounts] = useState<{ [key: string]: number }>({});

  // Animation values
  const containerScale = useSharedValue(0);
  const filterItemScales = useSharedValue<{ [key: string]: number }>({});

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  // Filter restaurants by location
  const filterRestaurantsByLocation = (radius: number) => {
    if (!userLocation) {
      setFilteredRestaurants(restaurants);
      return restaurants;
    }

    const filtered = LocationService.filterRestaurantsByLocation(
      restaurants,
      userLocation,
      radius
    );

    setFilteredRestaurants(filtered);
    onFilteredRestaurants(filtered);
    return filtered;
  };

  // Calculate restaurant counts for each filter
  const calculateRestaurantCounts = () => {
    if (!userLocation) {
      const counts: { [key: string]: number } = {};
      filterOptions.forEach(option => {
        counts[option.id] = restaurants.length;
      });
      setRestaurantCounts(counts);
      return;
    }

    const counts: { [key: string]: number } = {};
    filterOptions.forEach(option => {
      const filtered = LocationService.filterRestaurantsByLocation(
        restaurants,
        userLocation,
        option.radius
      );
      counts[option.id] = filtered.length;
    });
    setRestaurantCounts(counts);
  };

  // Handle filter selection
  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    
    const selectedOption = filterOptions.find(option => option.id === filterId);
    if (selectedOption) {
      filterRestaurantsByLocation(selectedOption.radius);
    }

    // Animate selection
    animateFilterSelection(filterId);
  };

  // Animate filter selection
  const animateFilterSelection = (filterId: string) => {
    filterOptions.forEach(option => {
      if (option.id === filterId) {
        // Scale up selected item
        filterItemScales.value = {
          ...filterItemScales.value,
          [option.id]: withSpring(1.1, { damping: 15, stiffness: 150 }),
        };
        
        // Then scale back to normal
        setTimeout(() => {
          filterItemScales.value = {
            ...filterItemScales.value,
            [option.id]: withSpring(1, { damping: 15, stiffness: 150 }),
          };
        }, 200);
      }
    });
  };

  // Get animated style for filter item
  const getFilterItemAnimatedStyle = (filterId: string) => {
    return useAnimatedStyle(() => {
      const scale = filterItemScales.value[filterId] || 1;
      return {
        transform: [{ scale }],
      };
    });
  };

  // Render filter item
  const renderFilterItem = ({ item }: { item: FilterOption }) => {
    const isSelected = selectedFilter === item.id;
    const count = restaurantCounts[item.id] || 0;
    
    return (
      <Animated.View style={getFilterItemAnimatedStyle(item.id)}>
        <TouchableOpacity
          onPress={() => handleFilterSelect(item.id)}
          style={[
            styles.filterItem,
            isSelected && styles.filterItemSelected,
          ]}
        >
          <GlassContainer
            intensity={isSelected ? 30 : 20}
            style={[
              styles.filterItemContent,
              isSelected && styles.filterItemContentSelected,
            ]}
          >
            <View style={styles.filterIcon}>
              <Ionicons
                name={item.icon as any}
                size={20}
                color={isSelected ? '#007AFF' : '#666'}
              />
            </View>
            <Text
              style={[
                styles.filterLabel,
                isSelected && styles.filterLabelSelected,
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.filterRadius,
                isSelected && styles.filterRadiusSelected,
              ]}
            >
              {item.radius}km
            </Text>
            <View style={styles.filterCount}>
              <Text
                style={[
                  styles.filterCountText,
                  isSelected && styles.filterCountTextSelected,
                ]}
              >
                {count}
              </Text>
            </View>
          </GlassContainer>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Initialize
  useEffect(() => {
    containerScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    calculateRestaurantCounts();
    
    // Apply initial filter
    const initialOption = filterOptions.find(option => option.id === selectedFilter);
    if (initialOption) {
      filterRestaurantsByLocation(initialOption.radius);
    }
  }, [restaurants, userLocation]);

  // Update counts when restaurants or location changes
  useEffect(() => {
    calculateRestaurantCounts();
  }, [restaurants, userLocation]);

  if (!userLocation) {
    return (
      <View style={[styles.container, style]}>
        <GlassContainer intensity={20} style={styles.noLocationContent}>
          <Ionicons name="location-outline" size={24} color="#999" />
          <Text style={styles.noLocationText}>
            Enable location to filter restaurants by distance
          </Text>
        </GlassContainer>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle, style]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filter by Distance</Text>
        <Text style={styles.headerSubtitle}>
          {filteredRestaurants.length} of {restaurants.length} restaurants
        </Text>
      </View>
      
      <FlatList
        data={filterOptions}
        renderItem={renderFilterItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  filterList: {
    paddingHorizontal: 12,
  },
  filterItem: {
    marginHorizontal: 4,
  },
  filterItemSelected: {
    // Additional styling for selected state
  },
  filterItemContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  filterItemContentSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  filterIcon: {
    marginBottom: 6,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  filterLabelSelected: {
    color: '#007AFF',
  },
  filterRadius: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  filterRadiusSelected: {
    color: '#007AFF',
  },
  filterCount: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterCountTextSelected: {
    color: '#007AFF',
  },
  noLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  noLocationText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 12,
    flex: 1,
  },
});