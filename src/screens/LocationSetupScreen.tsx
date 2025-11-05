import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Strings from '../constants';

type LocationSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LocationSetup'>;

interface PlaceSuggestion {
  place_id: string;
  description: string;
}

const LocationSetupScreen = () => {
  const navigation = useNavigation<LocationSetupScreenNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUseCurrentLocation = async () => {
  try {
    setIsLoadingLocation(true);
    const permission = Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const result = await request(permission);

    if (result === RESULTS.GRANTED) {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // ✅ Store in AsyncStorage
          await AsyncStorage.setItem(Strings.LATITUDE, latitude.toString());
          await AsyncStorage.setItem(Strings.LONITUDE, longitude.toString());

          // ✅ Optional: Reverse geocode to get address
          let address = 'Current Location';
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Strings.GOMAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.status === 'OK' && data.results.length > 0) {
              address = data.results[0].formatted_address;
            }
          } catch (err) {
            // Reverse geocode failed silently
          }

          // ✅ Navigate to Map screen
          setIsLoadingLocation(false);
          navigation.navigate('Map', {
            location: {
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            searchText: address,
            selectedAddress: address,
            showBarbers: true,
          });
        },
        (error) => {
          setIsLoadingLocation(false);
          let errorMessage = 'Unable to get current location.';
          
          switch (error.code) {
            case 1:
              errorMessage = 'Location permission denied. Please enable location access in settings.';
              break;
            case 2:
              errorMessage = 'Location unavailable. Please check your GPS/network connection.';
              break;
            case 3:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'Unable to get location. Please check GPS settings and try again.';
          }
          
          Alert.alert('Location Error', errorMessage);
        },
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
      );
    } else if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
      setIsLoadingLocation(false);
      Alert.alert(
        'Permission Denied',
        'Location permission is required to get your current location.'
      );
    }
  } catch (error) {
    setIsLoadingLocation(false);
    Alert.alert('Error', 'Failed to request location permission.');
  }
};


  const handleContinue = () => {
    navigation.goBack();
  };

  const searchPlaces = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const autocompleteUrl = `${Strings.AUTOCOMPLETE_API_URL}?input=${encodeURIComponent(
        input,
      )}&key=${Strings.GOMAPS_API_KEY}`;
      
      const response = await fetch(autocompleteUrl);
      const data = await response.json();
      
      if (data.predictions) {
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      // Error fetching places silently
    }
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    searchPlaces(text);
  };

  const selectSuggestion = async (suggestion: any) => {
    setSearchText(suggestion.description);
    setShowSuggestions(false);
    
    try {
      // Get place details to fetch coordinates
      const detailsUrl = `${Strings.NEARBY_PLACES_DETAILS_API_URL}?place_id=${suggestion.place_id}&key=${Strings.GOMAPS_API_KEY}`;
      const response = await fetch(detailsUrl);
      const data = await response.json();
      
      if (data.result && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location;
        navigation.navigate('Map', {
          location: {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          searchText: suggestion.description
        });
      } else {
        // Fallback to default location if coordinates not found
        navigation.navigate('Map', {
          location: {
            latitude: 14.5995,
            longitude: 120.9842,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          searchText: suggestion.description
        });
      }
    } catch (error) {
      // Navigate with default location on error
      navigation.navigate('Map', {
        location: {
          latitude: 14.5995,
          longitude: 120.9842,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        searchText: suggestion.description
      });
    }
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#999',
    position: 'relative',
  },
  searchIconHandle: {
    position: 'absolute',
    width: 6,
    height: 2,
    backgroundColor: '#999',
    right: -4,
    bottom: -1,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  locationIconContainer: {
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
    width: 18,
  },
  locationPin: {
    alignItems: 'center',
    position: 'relative',
  },
  locationTeardrop: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    transform: [{ rotate: '-45deg' }],
  },
  locationShadow: {
    width: 8,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginTop: -2,
    opacity: 0.5,
  },
  currentLocationText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  continueButton: {
    backgroundColor: '#e5e5e5',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <View style={styles.searchIconContainer}>
              <View style={styles.searchIconCircle}>
                <View style={styles.searchIconHandle} />
              </View>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Location"
              value={searchText}
              onChangeText={handleSearchTextChange}
              placeholderTextColor="#999"
            />
          </View>
          
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(item)}
                  >
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </TouchableOpacity>
                )}
                style={styles.suggestionsList}
              />
            </View>
          )}
        </View>

        {/* Use Current Location Button */}
        <TouchableOpacity 
          style={[styles.currentLocationButton, isLoadingLocation && styles.buttonDisabled]} 
          onPress={handleUseCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <View style={styles.locationIconContainer}>
              <View style={styles.locationPin}>
                <View style={styles.locationTeardrop}>
                  <View style={styles.locationDot} />
                </View>
                <View style={styles.locationShadow} />
              </View>
            </View>
          )}
          <Text style={styles.currentLocationText}>
            {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};



export default LocationSetupScreen;