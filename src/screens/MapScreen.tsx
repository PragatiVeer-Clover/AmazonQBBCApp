import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Platform, Linking, PermissionsAndroid, ActivityIndicator, TextInput, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Strings from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarberMarker } from '../components';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;
type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

const { width, height } = Dimensions.get('window');

const MapScreen = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const route = useRoute<MapScreenRouteProp>();
  const { location, searchText, showBarbers, selectedAddress } = route.params || {};
  const mapRef = useRef<MapView>(null);
  
  const [selectedLocation, setSelectedLocation] = useState(location);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [nearbyBarbers, setNearbyBarbers] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      searchNearbyBarbers(selectedLocation.latitude, selectedLocation.longitude);
    }
  }, [selectedLocation]);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        // No fallback location
        setCurrentLocation(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };


  
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Distance in meters
  };

  const searchNearbyBarbers = async (latitude: number, longitude: number) => {
    try {
      const url = `${Strings.NEARBY_PLACES_API_URL}?location=${latitude},${longitude}&radius=${Strings.REDIUS}&type=${Strings.NAME_PLACE}&key=${Strings.GOMAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK') {
        // Filter out barbers too close to selected location (within 50 meters)
        const filteredBarbers = (data.results || []).filter((barber: any) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            barber.geometry.location.lat,
            barber.geometry.location.lng
          );
          return distance > 50; // Only show barbers more than 50 meters away
        });
        setNearbyBarbers(filteredBarbers);
      }
    } catch (error) {
      console.error('Error fetching nearby barbers:', error);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Request permission first
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show it on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setIsLoadingLocation(false);
          Alert.alert('Permission Denied', 'Location permission is required.');
          return;
        }
      }
      
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setSelectedLocation(newLocation);
          setCurrentLocation(newLocation);
          setSearchInput('Current Location');
          
          // Animate map to current location
          if (mapRef.current) {
            mapRef.current.animateToRegion(newLocation, 1000);
          }
          
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
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
    } catch (error) {
      console.error('Permission error:', error);
      setIsLoadingLocation(false);
      Alert.alert('Error', 'Failed to request location permission.');
    }
  };

  const searchPlaces = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`${Strings.AUTOCOMPLETE_API_URL}?input=${encodeURIComponent(input)}&key=${Strings.GOMAPS_API_KEY}`);
      const data = await response.json();
      
      if (data.predictions) {
        setSuggestions(data.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const handleSelectPlace = async (suggestion: any) => {
    setSearchInput(suggestion.description);
    setShowSuggestions(false);
    
    try {
      const response = await fetch(`${Strings.NEARBY_PLACES_DETAILS_API_URL}?place_id=${suggestion.place_id}&key=${Strings.GOMAPS_API_KEY}`);
      const data = await response.json();
      
      if (data.result && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location;
        const newLocation = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setSelectedLocation(newLocation);
        
        if (mapRef.current) {
          mapRef.current.animateToRegion(newLocation, 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem(Strings.LATITUDE, selectedLocation.latitude.toString());
      await AsyncStorage.setItem(Strings.LONITUDE, selectedLocation.longitude.toString());
      console.log('Selected location stored:', selectedLocation);
      
      // Navigate back to Dashboard
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error storing location:', error);
      navigation.navigate('Dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a place..."
            value={searchInput}
            onChangeText={(text) => {
              setSearchInput(text);
              searchPlaces(text);
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelectPlace(item)}
                  >
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={selectedLocation}
          onMapReady={() => setIsMapReady(true)}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Selected Location"
              description={searchText || 'Selected Location'}
              pinColor="red"
            />
          )}
          {nearbyBarbers.map((barber, index) => (
            <Marker
              key={`barber-${index}`}
              coordinate={{
                latitude: barber.geometry.location.lat,
                longitude: barber.geometry.location.lng,
              }}
              title={barber.name}
              description={barber.vicinity}
            >
              <BarberMarker />
            </Marker>
          ))}
        </MapView>
        {!isMapReady && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Loading Map...</Text>
          </View>
        )}
      </View>

      {/* Location Info */}
      <View style={styles.locationInfo}>
        <View style={styles.locationDetails}>
          <View style={styles.locationPin}>
            <View style={styles.locationTeardrop}>
              <View style={styles.locationDot} />
            </View>
            <View style={styles.locationShadow} />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationTitle}>{searchInput || searchText || selectedAddress || 'Selected Location'}</Text>
            {showBarbers && nearbyBarbers.length > 0 && (
              <Text style={styles.locationSubtitle}>{nearbyBarbers.length} barber shops nearby</Text>
            )}
          </View>
          <TouchableOpacity style={styles.changeButton}>
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Use Current Location Button */}
      <View style={styles.currentLocationContainer}>
        <TouchableOpacity 
          style={[styles.currentLocationButton, isLoadingLocation && styles.buttonDisabled]} 
          onPress={handleUseCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <View style={styles.currentLocationIcon}>
              <View style={styles.locationTeardrop}>
                <View style={styles.locationDot} />
              </View>
              <View style={styles.locationShadow} />
            </View>
          )}
          <Text style={styles.currentLocationText}>
            {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  searchDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginLeft: 10,
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
  searchContainer: {
    flex: 1,
    marginLeft: 10,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
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
  mapContainer: {
    flex: 1,
  },
  map: {
    width: width,
    height: '100%',
  },
  locationInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPin: {
    alignItems: 'center',
    position: 'relative',
    marginRight: 15,
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
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  changeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  changeButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  currentLocationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 15,
  },
  currentLocationIcon: {
    alignItems: 'center',
    position: 'relative',
    marginRight: 15,
  },
  currentLocationText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
});

export default MapScreen;