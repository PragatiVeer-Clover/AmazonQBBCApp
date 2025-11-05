import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Text,
  Dimensions,
  TextInput,
  FlatList,
  TouchableOpacity,
  Keyboard,
  SafeAreaView,
  ListRenderItem,
  Alert,
} from 'react-native';

// Local Imports
import Strings from '../../constants/Constants';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps'; // Import Region type
import Geolocation from 'react-native-geolocation-service';
import debounce from 'lodash.debounce';
import CustomHeader from '../../components/CustomHeader';
import {goBack} from '../../utils/NavigationUtils';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {
  storeLocation,
  getLocation,
  setValue,
} from '../../utils/keychainStorage';
import Constants from '../../constants/Constants';

// =====================================
// GLOBAL CONSTANTS (Declared once per file)
// =====================================
const {width, height} = Dimensions.get('window');

/**
 * @constant {number} ASPECT_RATIO
 * @description The aspect ratio of the device screen, used for map delta calculations.
 */
const ASPECT_RATIO = width / height;

/**
 * @constant {number} LATITUDE_DELTA
 * @description The latitude span of the map view. A smaller value means a more zoomed-in view.
 */
const LATITUDE_DELTA = 0.0922;

/**
 * @constant {number} LONGITUDE_DELTA
 * @description The longitude span of the map view, derived from `LATITUDE_DELTA` and `ASPECT_RATIO`.
 */
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// =====================================
// INTERFACES
// =====================================

/**
 * @interface Location
 * @description Defines the structure for a geographical region or point, including map delta values.
 */
interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * @interface GoMapsPrediction
 * @description Represents a place prediction from the GoMaps Autocomplete API.
 */
interface GoMapsPrediction {
  description: string;
  place_id: string;
}

/**
 * @interface GoMapsAddressComponent
 * @description Represents an individual component of a geographical address (e.g., city, street).
 */
interface GoMapsAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * @interface GoMapsGeocodeResult
 * @description Represents a geocoding result from the GoMaps Geocoding API.
 */
interface GoMapsGeocodeResult {
  address_components: GoMapsAddressComponent[];
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * @type {RootStackParamList}
 * @description Defines the type mapping for navigation routes and their parameters within the application's root stack.
 */
type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  EditProfileScreen: undefined;
  ServiceMenuScreen: undefined;
  OtpScreen: undefined;
  StickyTabBarScreen: undefined;
  PermissionScreen: undefined;
  MapPicker: undefined;
  MainApp: {
    screen: 'Home';
    params?: {
      selectedAddress?: string;
      selectedCoords?: {latitude: number; longitude: number};
    };
  };
};

// =====================================
// MAP PICKER COMPONENT
// =====================================
const MapPicker: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // =====================================
  // STATE VARIABLES
  // =====================================

  /**
   * @state {Location | null} currentLocation
   * @description Stores the user's current geographical location, if available.
   */
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  /**
   * @state {Location | null} selectedPlace
   * @description Stores the coordinates of the location currently selected on the map or via search.
   */
  const [selectedPlace, setSelectedPlace] = useState<Location | null>(null);

  /**
   * @state {string} selectedAddressText
   * @description The user-friendly text representation of the selected address.
   */
  const [selectedAddressText, setSelectedAddressText] =
    useState<string>('Select a location');

  /**
   * @state {string} addressToStoreInKeychain
   * @description The address text that will actually be stored in the Keychain (simplified).
   */
  const [addressToStoreInKeychain, setAddressToStoreInKeychain] =
    useState<string>('');

  /**
   * @state {boolean} loading
   * @description Indicates if the initial location data is being loaded.
   */
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * @state {boolean} geocodingLoading
   * @description Indicates if a geocoding or reverse geocoding operation is in progress.
   */
  const [geocodingLoading, setGeocodingLoading] = useState<boolean>(false);

  /**
   * @state {string} searchText
   * @description The text currently entered in the search input field.
   */
  const [searchText, setSearchText] = useState<string>('');

  /**
   * @state {GoMapsPrediction[]} predictions
   * @description An array of place predictions returned by the autocomplete API.
   */
  const [predictions, setPredictions] = useState<GoMapsPrediction[]>([]);

  /**
   * @constant {React.RefObject<MapView | null>} mapRef
   * @description Ref for the MapView component, used to control map animations.
   */
  const mapRef = useRef<MapView | null>(null);

  /**
   * @state {boolean} displaySearchResults
   * @description Controls the visibility of the search predictions FlatList.
   */
  const [displaySearchResults, setDisplaySearchResults] =
    useState<boolean>(false);

  // =====================================
  // EFFECTS
  // =====================================

  /**
   * @effect
   * @description Initializes the map with either a stored location from Keychain or a default Navi Mumbai location.
   * This effect runs only once on component mount.
   */
  useEffect(() => {
    /**
     * @function initializeLocation
     * @description Asynchronously attempts to retrieve and set the initial location for the map.
     * It prioritizes stored location from Keychain; otherwise, defaults to Navi Mumbai.
     */
    const initializeLocation = async () => {
      setLoading(true);
      try {
        const storedLocation = await getLocation();
        if (storedLocation) {
          const region: Location = {
            latitude: storedLocation.latitude,
            longitude: storedLocation.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          };
          setCurrentLocation(region);
          setSelectedPlace(region);
          setAddressToStoreInKeychain(storedLocation.address);
          setSearchText(storedLocation.address);
          await setValue(Constants.CITY_ADDRESS, storedLocation.address);
        } else {
          const defaultLoc = {
            latitude: 19.033,
            longitude: 73.0297,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          };
          setCurrentLocation(defaultLoc);
          setSelectedPlace(defaultLoc);
        }
      } catch (e) {
        // Fallback to default even if Keychain retrieval fails
        const defaultLoc = {
          latitude: 19.033,
          longitude: 73.0297,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        setCurrentLocation(defaultLoc);
        setSelectedPlace(defaultLoc);
      } finally {
        setLoading(false);
      }
    };

    initializeLocation();
  }, []); // Empty dependency array ensures this runs only once on mount

  const extractAddresses = (
    addressComponents: GoMapsAddressComponent[],
    fullFormattedAddress: string,
    defaultAddress: string = 'Unknown Location',
  ): {displayAddress: string; keychainAddress: string} => {
    let area = '';
    let city = '';

    // Temporary holders for raw components
    let tempLocality = ''; // Generally the city or a major neighborhood
    let tempSublocalityLevel1 = ''; // Often a specific area or neighborhood
    let tempAdministrativeAreaLevel2 = ''; // Often the district/city

    for (const component of addressComponents) {
      if (component.types.includes('sublocality_level_1')) {
        tempSublocalityLevel1 = component.long_name;
      }
      if (component.types.includes('locality')) {
        tempLocality = component.long_name;
      }
      if (component.types.includes('administrative_area_level_2')) {
        tempAdministrativeAreaLevel2 = component.long_name;
      }
    }

    // --- Determine 'Area' for keychainAddress ---
    if (tempSublocalityLevel1) {
      area = tempSublocalityLevel1;
    } else if (tempLocality) {
      area = tempLocality;
    }

    // --- Determine 'City' for keychainAddress ---
    if (tempAdministrativeAreaLevel2) {
      city = tempAdministrativeAreaLevel2;
    } else if (tempLocality) {
      city = tempLocality;
    }

    // --- Special handling for "Navi Mumbai" for keychainAddress ---
    const lowerCaseFullAddress = fullFormattedAddress.toLowerCase();
    const lowerCaseCity = city.toLowerCase();

    if (
      lowerCaseFullAddress.includes('navi mumbai') &&
      !lowerCaseCity.includes('navi mumbai')
    ) {
      city = 'Navi Mumbai';
      if (
        area &&
        area.toLowerCase().includes('thane') &&
        lowerCaseFullAddress.includes('airoli')
      ) {
        area = 'Airoli';
      }
    } else if (
      lowerCaseFullAddress.includes('mumbai') &&
      !lowerCaseFullAddress.includes('navi mumbai') &&
      !lowerCaseCity.includes('mumbai')
    ) {
      city = 'Mumbai';
    }

    // --- Construct keychainAddress ---
    let keychainAddressResult = '';
    const normalizedArea = area.toLowerCase();
    const normalizedCity = city.toLowerCase();

    if (area && city) {
      if (
        normalizedArea === normalizedCity ||
        normalizedCity.includes(normalizedArea)
      ) {
        keychainAddressResult = city;
      } else {
        keychainAddressResult = `${area}, ${city}`;
      }
    } else if (area) {
      keychainAddressResult = area;
    } else if (city) {
      keychainAddressResult = city;
    } else {
      // Fallback for keychain address if area/city components are missing
      const parts = fullFormattedAddress
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);
      keychainAddressResult = parts.slice(0, 2).join(', '); // Take first two significant parts
    }
    if (!keychainAddressResult) {
      keychainAddressResult = fullFormattedAddress || defaultAddress;
    }

    // --- Construct displayAddress (full address) ---
    // For display, we want the most complete and readable address, usually the formatted_address
    const displayAddressResult = fullFormattedAddress || defaultAddress;

    return {
      displayAddress: displayAddressResult,
      keychainAddress: keychainAddressResult,
    };
  };

  /**
   * @function updateAddressFromCoordinates
   * @description Performs reverse geocoding for given coordinates and updates state.
   * This is used for current location, marker drag, and map idle.
   * @param {number} latitude - Latitude of the location.
   * @param {number} longitude - Longitude of the location.
   * @returns {Promise<void>}
   */
  const updateAddressFromCoordinates = async (
    latitude: number,
    longitude: number,
  ): Promise<void> => {
    setGeocodingLoading(true);
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Strings.GOMAPS_API_KEY}`;
      const response = await fetch(geocodeUrl);
      const data: {results?: GoMapsGeocodeResult[]; status: string} =
        await response.json();

      if (data.results && data.results.length > 0) {
        const fullFormattedAddress =
          data.results[0].formatted_address || 'Unknown Location';
        const {displayAddress, keychainAddress} = extractAddresses(
          data.results[0].address_components,
          fullFormattedAddress,
        );

        setSelectedAddressText(displayAddress); // Update display text
        setAddressToStoreInKeychain(keychainAddress); // Update address for Keychain storage
        setSearchText(displayAddress); // Also update search input to reflect current map center
      } else {
        setSelectedAddressText('Unknown Location');
        setAddressToStoreInKeychain('Unknown Location');
        setSearchText('Unknown Location');
      }
    } catch (e) {
      setSelectedAddressText('Error getting address');
      setAddressToStoreInKeychain('Error getting address');
      setSearchText('Error getting address');
      console.error('Reverse geocoding failed:', e);
      Alert.alert('Error', 'Could not get address for this location.');
    } finally {
      setGeocodingLoading(false);
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    setGeocodingLoading(true);
    try {
      if (Platform.OS === 'ios') {
        const status = await Geolocation.requestAuthorization('whenInUse');
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Please enable location services in settings to use your current location.',
          );
          setGeocodingLoading(false);
          return;
        }
      } else if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to show it on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Please enable location services in settings to use your current location.',
          );
          setGeocodingLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        async position => {
          const region: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          };
          setCurrentLocation(region);
          setSelectedPlace(region);

          await updateAddressFromCoordinates(
            position.coords.latitude,
            position.coords.longitude,
          );
          mapRef.current?.animateToRegion(region, 1000);
        },
        (error: any) => {
          setGeocodingLoading(false);
          Alert.alert(
            'Location Error',
            'Could not get your current location. Please ensure location services are enabled and try again.',
          );
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } catch (err: any) {
      setGeocodingLoading(false);
      Alert.alert(
        'Error',
        'Something went wrong while trying to get your current location.',
      );
    }
  };

  const fetchGoMapsPredictions = async (input: string): Promise<void> => {
    if (!input) {
      setPredictions([]);
      setDisplaySearchResults(false);
      return;
    }
    try {
      const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input,
      )}&key=${Strings.GOMAPS_API_KEY}`;
      const response = await fetch(autocompleteUrl);
      const data: {predictions?: GoMapsPrediction[]} = await response.json();
      if (data.predictions) {
        setPredictions(data.predictions);
        setDisplaySearchResults(true);
      } else {
        setPredictions([]);
        setDisplaySearchResults(false);
      }
    } catch (error: any) {
      setPredictions([]);
      setDisplaySearchResults(false);
    }
  };

  /**
   * @constant {Function} debouncedFetchPredictions
   * @description A debounced version of `fetchGoMapsPredictions`.
   * It delays the execution of `fetchGoMapsPredictions` by 500ms,
   * ensuring the API is not called too frequently during typing.
   */
  const debouncedFetchPredictions = useCallback(
    debounce(fetchGoMapsPredictions, 500),
    [],
  );

  const handleSearchTextChange = (text: string): void => {
    setSearchText(text);
    setSelectedAddressText('Select a location'); // Reset selected address display
    setAddressToStoreInKeychain(''); // Clear keychain address when searching
    setSelectedPlace(null); // Reset selected place on map
    if (text.length > 2) {
      debouncedFetchPredictions(text);
    } else {
      setPredictions([]);
      setDisplaySearchResults(false);
    }
  };

  const onPlaceSelect = async (prediction: GoMapsPrediction): Promise<void> => {
    setPredictions([]); // Clear predictions list
    setDisplaySearchResults(false); // Hide search results
    Keyboard.dismiss(); // Dismiss keyboard
    setGeocodingLoading(true); // Show loading indicator

    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${prediction.place_id}&key=${Strings.GOMAPS_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData: {results?: GoMapsGeocodeResult[]; status: string} =
        await detailsResponse.json();

      if (detailsData.results && detailsData.results.length > 0) {
        const {lat, lng} = detailsData.results[0].geometry.location;
        const fullFormattedAddress =
          detailsData.results[0].formatted_address || prediction.description;

        const {displayAddress, keychainAddress} = extractAddresses(
          detailsData.results[0].address_components,
          fullFormattedAddress,
        );

        const newRegion: Location = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        setSelectedPlace(newRegion);

        // Display the full address derived from formatted_address or prediction
        setSearchText(displayAddress);
        setSelectedAddressText(displayAddress);

        // Store the simplified keychainAddress in Keychain
        setAddressToStoreInKeychain(keychainAddress);
        await storeLocation(lat, lng, keychainAddress);

        mapRef.current?.animateToRegion(newRegion, 1000); // Animate map to selected place
      } else {
        Alert.alert(
          'Error',
          'Could not get full details for the selected place.',
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Failed to retrieve place details. Please try again.',
      );
    } finally {
      setGeocodingLoading(false); // Hide loading indicator
    }
  };

  const renderPredictionItem: ListRenderItem<GoMapsPrediction> = useCallback(
    ({item}) => (
      <TouchableOpacity
        style={styles.predictionItem}
        onPress={() => onPlaceSelect(item)}>
        <Text style={styles.predictionText}>{item.description}</Text>
      </TouchableOpacity>
    ),
    [onPlaceSelect],
  );

  const handleConfirmLocation = async () => {
    if (
      selectedPlace &&
      addressToStoreInKeychain &&
      selectedAddressText !== 'Select a location'
    ) {
      await storeLocation(
        selectedPlace.latitude,
        selectedPlace.longitude,
        addressToStoreInKeychain,
      );

      // Navigate back to the Home screen with the keychain-friendly address
      navigation.navigate('MainApp', {
        screen: 'Home',
        params: {
          selectedAddress: addressToStoreInKeychain, // Pass the simplified address
          selectedCoords: {
            latitude: selectedPlace.latitude,
            longitude: selectedPlace.longitude,
          },
        },
      });
    } else {
      Alert.alert(
        'Selection Error',
        'Please select a location on the map or search for one before confirming.',
      );
    }
  };

  const handleMapPress = async (event: any): Promise<void> => {
    // Dismiss keyboard and hide search results when map is tapped
    Keyboard.dismiss();
    setDisplaySearchResults(false);

    const {latitude, longitude} = event.nativeEvent.coordinate;
    const newLocation: Location = {
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
    setSelectedPlace(newLocation); // Set the marker to the tapped location
    await updateAddressFromCoordinates(latitude, longitude); // Get address for the tapped location
    mapRef.current?.animateToRegion(newLocation, 500); // Animate to the tapped location
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <CustomHeader
        showBack={true}
        title="Change Location"
        onBackPress={goBack}
      />
      <View style={styles.contentContainer}>
        <View style={styles.topSection}>
          <View style={styles.searchSection}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search your location..."
              value={searchText}
              onChangeText={handleSearchTextChange}
              onFocus={() => {
                // Show search results if there's enough text or existing predictions
                if (searchText.length > 2 || predictions.length > 0)
                  setDisplaySearchResults(true);
              }}
              // Delay hiding search results to allow click on items
              onBlur={() =>
                setTimeout(() => setDisplaySearchResults(false), 200)
              }
            />

            <View style={styles.orSeparator}>
              <Text style={styles.orText}>Or</Text>
            </View>

            <TouchableOpacity
              style={styles.useCurrentLocationButton}
              onPress={getCurrentLocation}>
              {geocodingLoading && !displaySearchResults ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.useCurrentLocationButtonText}>
                  Use My Current Location
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Render search predictions if `displaySearchResults` is true and predictions exist */}
          {displaySearchResults && predictions.length > 0 && (
            <FlatList<GoMapsPrediction>
              data={predictions}
              keyExtractor={item => item.place_id}
              renderItem={renderPredictionItem}
              style={styles.predictionList}
              keyboardShouldPersistTaps="handled" // Prevents keyboard dismissal on tap outside
            />
          )}

          {/* Show overlay loading indicator during geocoding, if search results are not active */}
          {geocodingLoading && displaySearchResults === false && (
            <View style={styles.overlayLoading}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.overlayLoadingText}>
                Fetching location details...
              </Text>
            </View>
          )}
        </View>

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          // Set initial region to selected place or default Navi Mumbai if no place is selected
          initialRegion={
            selectedPlace || {
              latitude: 19.033,
              longitude: 73.0297,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }
          }
          region={selectedPlace} // Add this to ensure map updates when selectedPlace changes
          showsUserLocation={true}
          showsMyLocationButton={true}
          onPress={handleMapPress}
        >
          {/* Render a marker at the selected location */}
          {selectedPlace && (
            <Marker
              coordinate={{
                latitude: selectedPlace.latitude,
                longitude: selectedPlace.longitude,
              }}
              title="Selected Location"
              description={selectedAddressText}
              pinColor="red" // Make marker more visible
              draggable={true} // Allow dragging the marker
              onDragEnd={async (e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                const newLocation: Location = {
                  latitude,
                  longitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                };
                setSelectedPlace(newLocation);
                await updateAddressFromCoordinates(latitude, longitude);
              }}
            />
          )}
        </MapView>

        <View style={styles.confirmButtonContainer}>
          <Text style={styles.selectedAddressDisplay}>
            Selected: {selectedAddressText}
          </Text>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmLocation}>
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// =====================================
// STYLES
// =====================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 30,
  },
  contentContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
    zIndex: 1, // Ensures search results overlay map
    backgroundColor: '#fff',
  },
  searchSection: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  orSeparator: {
    alignItems: 'center',
    marginVertical: 10,
  },
  orText: {
    fontSize: 16,
    color: '#888',
  },
  useCurrentLocationButton: {
    backgroundColor: '#5CACEE', // A shade of blue
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  useCurrentLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  predictionList: {
    maxHeight: Dimensions.get('window').height * 0.4, // Max height for scrollable predictions
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginHorizontal: 15,
    marginBottom: 10,
    // Position it directly below the search input by not using absolute positioning here
  },
  predictionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionText: {
    fontSize: 14,
    color: '#555',
  },
  overlayLoading: {
    position: 'absolute',
    top: '50%', // Center vertically
    left: '50%', // Center horizontally
    transform: [{translateX: -50}, {translateY: -50}], // Adjust for element size
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    zIndex: 100, // Ensure it's on top
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayLoadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  map: {
    flex: 1, // Map takes remaining vertical space
  },
  confirmButtonContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    width: '100%',
  },
  selectedAddressDisplay: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MapPicker;