import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image, Platform, PermissionsAndroid, Alert, FlatList, Linking, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Strings from '../constants';
import { BarberListIcon } from '../components';
import { starProducts } from '../data';
// ⚠️ We no longer need the Ionicons import since we are using local images
// import Ionicons from 'react-native-vector-icons/Ionicons'; 

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

// MODIFIED COMPONENT: Notification icon now uses a local Image asset
const NotificationBadge = ({ count = 0 }) => (
    <View style={{ position: 'relative' }} pointerEvents="none">
        <Image 
          source={require('../assets/notification_pin.png')} // 🔔 REPLACED WITH IMAGE
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
    </View>
);

const badgeStyles = StyleSheet.create({
    badge: {
        position: 'absolute',
        right: -5,
        top: -5,
        backgroundColor: '#666', // Adjusted to grey/silver color from the screenshot
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: Platform.OS === 'ios' ? 1 : 0, // Tiny adjustment for better centering
    },
});

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<'location' | 'notification'>('location');
  const [showNotificationListModal, setShowNotificationListModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [nearbyBarbers, setNearbyBarbers] = useState<any[]>([]);
  const [kycDone, setKycDone] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userAddress, setUserAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Get dynamic dates
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
  
  const formatDate = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const allNotificationIds = ['1', '2', '3', '4', '5', '6'];
  const allSelected = selectedNotifications.length === allNotificationIds.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(allNotificationIds);
    }
    setShowOptionsMenu(false);
  };

  const handleMarkAsRead = () => {
    setSelectedNotifications([]);
    setShowOptionsMenu(false);
  };

  useEffect(() => {
    checkPermissions();
    checkKycStatus();
    loadUserAddress();
  }, []);

  const loadUserAddress = async () => {
    try {
      const latitude = await AsyncStorage.getItem(Strings.LATITUDE);
      const longitude = await AsyncStorage.getItem(Strings.LONITUDE);
      console.log('Loading address for coordinates:', latitude, longitude);
      
      if (latitude && longitude) {
        setIsLoadingAddress(true);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Strings.GOMAPS_API_KEY}`;
        console.log('Geocoding URL:', url);
        const response = await fetch(url);
        const data = await response.json();
        console.log('Geocoding response:', data);
        
        if (data.status === 'OK' && data.results.length > 0) {
          const address = data.results[0].formatted_address;
          console.log('Address loaded:', address);
          setUserAddress(address);
        } else {
          console.log('Geocoding failed:', data.status);
        }
        setIsLoadingAddress(false);
      } else {
        console.log('No coordinates found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error loading address:', error);
      setIsLoadingAddress(false);
    }
  };

  const checkKycStatus = async () => {
    try {
      const kycStatus = await AsyncStorage.getItem(Strings.KYC_DONE);
      if (kycStatus === 'true') {
        setKycDone(true);
        const firstName = await AsyncStorage.getItem('firstName');
        if (firstName) {
          setUserName(firstName);
        }
        loadNearbyBarbers();
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m away`;
    } else {
      return `${(distance / 1000).toFixed(1)}km away`;
    }
  };

  const loadNearbyBarbers = async () => {
    try {
      const latitude = await AsyncStorage.getItem(Strings.LATITUDE);
      const longitude = await AsyncStorage.getItem(Strings.LONITUDE);
      console.log('Loading nearby barbers for coordinates:', latitude, longitude);
      
      if (latitude && longitude) {
        const url = `${Strings.NEARBY_PLACES_API_URL}?location=${latitude},${longitude}&radius=${Strings.REDIUS}&type=${Strings.NAME_PLACE}&key=${Strings.GOMAPS_API_KEY}`;
        console.log('Places API URL:', url);
        const response = await fetch(url);
        const data = await response.json();
        console.log('Places API response:', data);
        
        if (data.status === 'OK') {
          const barbersWithDistance = (data.results || []).map((barber: any) => {
            const distance = calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              barber.geometry.location.lat,
              barber.geometry.location.lng
            );
            return {
              ...barber,
              distance: distance,
              distanceText: formatDistance(distance)
            };
          }).filter((barber: any) => barber.distance > 50)
            .sort((a: any, b: any) => a.distance - b.distance);
          console.log('Nearby barbers found:', barbersWithDistance.length);
          setNearbyBarbers(barbersWithDistance.slice(0, 5));
        } else {
          console.log('Places API failed:', data.status);
        }
      } else {
        console.log('No coordinates found for barber search');
      }
    } catch (error) {
      console.error('Error loading nearby barbers:', error);
    }
  };

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const locationGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        const notificationGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        
        if (!locationGranted) {
          setCurrentPermission('location');
          setShowPermissionsModal(true);
        } else {
          console.log('Location permission already granted, getting location...');
          Geolocation.getCurrentPosition(
            async (position) => {
              console.log('Location received:', position.coords);
              const { latitude, longitude } = position.coords;
              await AsyncStorage.setItem(Strings.LATITUDE, latitude.toString());
              await AsyncStorage.setItem(Strings.LONITUDE, longitude.toString());
              console.log('Location saved to AsyncStorage');
              loadUserAddress();
              loadNearbyBarbers();
            },
            (error) => {
              console.log('Error getting location:', error);
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
          );
          if (!notificationGranted) {
            setCurrentPermission('notification');
            setShowPermissionsModal(true);
          }
        }
      } else {
        Geolocation.getCurrentPosition(
          async (position) => {
            console.log('iOS Location permission already granted');
            const { latitude, longitude } = position.coords;
            await AsyncStorage.setItem(Strings.LATITUDE, latitude.toString());
            await AsyncStorage.setItem(Strings.LONITUDE, longitude.toString());
            console.log('iOS Location saved to AsyncStorage');
            loadUserAddress();
            loadNearbyBarbers();
          },
          (error) => {
            if (error.code === 1) {
              setCurrentPermission('location');
              setShowPermissionsModal(true);
            } else {
              console.log('iOS Location error:', error);
              setCurrentPermission('location');
              setShowPermissionsModal(true);
            }
          },
          { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
        );
      }
    } catch (err) {
      console.warn('Error checking permissions:', err);
    }
  };



  const handlePermissionAllow = async () => {
    if (currentPermission === 'location') {
      try {
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
            Alert.alert('Permission Denied', 'Location permission is required.');
            setShowPermissionsModal(false);
            navigation.navigate('LocationSetup');
            return;
          }
        }
        
        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await AsyncStorage.setItem(Strings.LATITUDE, latitude.toString());
            await AsyncStorage.setItem(Strings.LONITUDE, longitude.toString());
            console.log('Location saved to AsyncStorage');
            loadUserAddress();
            loadNearbyBarbers();
            
            // Check notification permission
            const notificationGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            if (!notificationGranted) {
              setCurrentPermission('notification');
            } else {
              setShowPermissionsModal(false);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            
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
            setShowPermissionsModal(false);
          },
          { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
        );
      } catch (error) {
        console.error('Permission error:', error);
        setShowPermissionsModal(false);
        Alert.alert('Error', 'Failed to request location permission.');
      }
    } else {
      try {
        if (Platform.OS === 'android') {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'Allow Bruno\'s Barbers to send you notifications about orders and offers.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
        }
        setShowPermissionsModal(false);
      } catch (err) {
        setShowPermissionsModal(false);
      }
    }
  };

  const handlePermissionSkip = () => {
    if (currentPermission === 'location') {
      setShowPermissionsModal(false);
      navigation.navigate('LocationSetup');
    } else {
      setShowPermissionsModal(false);
    }
  };

  const openMapScreen = async () => {
    try {
      const latitude = await AsyncStorage.getItem(Strings.LATITUDE);
      const longitude = await AsyncStorage.getItem(Strings.LONITUDE);
      
      if (latitude && longitude) {
        navigation.navigate('Map', {
          location: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          searchText: userAddress || 'Current Location',
          showBarbers: true,
          selectedAddress: userAddress
        });
      } else {
        navigation.navigate('LocationSetup');
      }
    } catch (error) {
      console.error('Error opening map screen:', error);
      navigation.navigate('LocationSetup');
    }
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  iconWrapper: {
    position: 'relative',
  },
  headerIcon: {
    width: 30,
    height: 30,
  },
  locationPinIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  profileIconContainer: { 
    padding: 5,
  },
  headerLogo: {
    height: 60,
    width: 120,
  },
  notificationIconContainer: { 
    padding: 5,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  promoCard: {
    backgroundColor: '#e8e8e8',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    marginTop: 10,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  promoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  activeIndicator: {
    backgroundColor: '#333',
  },
  branchSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  branchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#666',
  },
  barbersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  barberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    width: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  branchImagePlaceholder: {
    backgroundColor: '#EBEBEB',
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchImage: {
    width: 80,
    height: 80,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  heartText: {
    fontSize: 18,
    color: '#000',
    marginTop: -2,
  },
  cardContent: {
    padding: 12,
  },
  barberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  barberAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
  },
  barberDistanceText: {
    fontSize: 12,
    color: '#666',
  },
  starProductsSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  starProductsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  starProductsList: {
    paddingBottom: 20,
  },
  starProductCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  starProductIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  starProductEmoji: {
    fontSize: 24,
  },
  starProductName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  productsSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  productsList: {
    paddingBottom: 20,
  },
  productCard: {
    width: width * 0.45,
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    overflow: 'hidden',
  },
  productImagePlaceholder: {
    width: '100%',
    height: width * 0.45 * 1.1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImageIcon: {
    fontSize: 100,
    color: '#ccc',
  },
  productImage: {
    width: 100,
    height: 100,
  },
  productDetails: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 5,
    color: '#000',
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
   
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  originalPrice: {
    fontSize: 10,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountText: {
    fontSize: 8,
    color: 'red',
    textDecorationLine: 'none',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  locationIllustration: {
    alignItems: 'center',
    marginBottom: 30,
  },
  locationImage: {
    width: 160,
    height: 160,
  },
  notificationIllustration: {
    alignItems: 'center',
    marginBottom: 30,
  },
  notificationImage: {
    width: 160,
    height: 160,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
  },
  allowButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  allowButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerIcon: {
    width: 30,
    height: 30,
  },
  notificationListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  notificationList: {
    flex: 1,
    width: '100%',
  },
  
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationFullScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  
  moreButton: {
    padding: 5,
  },
  moreText: {
    fontSize: 24,
    color: '#000',
  },
  
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 15,
  },
  notificationItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  iconText: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  itemMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionsMenu: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  checkmark: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  backArrow:{

  },
  backButton:{
    
  },
});

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          {/* PROFILE ICON REPLACED */}
          <TouchableOpacity style={styles.profileIconContainer} onPress={openMapScreen}>
              <Image 
          source={require('../assets/locationpin.png')} // 🔔 REPLACED WITH IMAGE
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
          </TouchableOpacity>
          
          <Image source={require('../assets/app_logo.png')} style={styles.headerLogo} resizeMode="contain" />
          
          {/* NOTIFICATION ICON REPLACED */}
          <TouchableOpacity 
            style={styles.notificationIconContainer} 
            onPress={() => {
              console.log('Notification icon pressed');
              setShowNotificationListModal(true);
            }}
            activeOpacity={0.7}
          >
              <NotificationBadge count={3} />
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hello, {userName}!</Text>
          <TouchableOpacity style={styles.locationContainer} onPress={openMapScreen}>
            {/* LOCATION PIN ICON REPLACED */}
            <Image 
                source={require('../assets/locationpin.png')} // 📍 REPLACED WITH IMAGE
                style={styles.locationPinIcon}
                resizeMode="contain"
            />
            <Text style={styles.locationText}>{isLoadingAddress ? 'Loading location...' : userAddress || 'Loading location...'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>Get 20% Off Your First Cut ❤️</Text>
          <Text style={styles.promoSubtitle}>
            Book your first appointment today and enjoy a fresh style at a special price.
          </Text>
          <View style={styles.promoIndicators}>
            <View style={[styles.indicator, styles.activeIndicator]} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>
        </View>

        {kycDone && (
          <>
            <View style={styles.branchSection}>
              <Text style={styles.branchTitle}>Branches Near You</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All </Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={nearbyBarbers}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.barbersList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.barberCard}
                  onPress={async () => {
                    const latitude = await AsyncStorage.getItem(Strings.LATITUDE);
                    const longitude = await AsyncStorage.getItem(Strings.LONITUDE);
                    navigation.navigate('BranchDetails', {
                      placeId: item.place_id,
                      branchName: item.name || 'Barber Shop',
                      userLocation: latitude && longitude ? {
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude)
                      } : undefined
                    });
                  }}
                >
                  <View style={styles.branchImagePlaceholder}>
                    <Image source={require('../assets/bback.png')} style={styles.branchImage} resizeMode="cover" />
                  </View>
                  
                  <TouchableOpacity style={styles.heartIcon}>
                    <Text style={styles.heartText}>♡</Text> 
                  </TouchableOpacity>

                  <View style={styles.cardContent}>
                    <Text style={styles.barberName} numberOfLines={1}>{item.name || 'Barber Shop'}</Text>
                    <Text style={styles.barberAddress} numberOfLines={1}>{item.vicinity || 'Location'}</Text>
                    <View style={styles.distanceContainer}>
                      <Image 
                        source={require('../assets/locationpin.png')}
                        style={styles.distanceIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.barberDistanceText}>{item.distanceText || 'N/A'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />

            <View style={styles.starProductsSection}>
              <Text style={styles.starProductsTitle}>Star Products</Text>
              <FlatList
                data={starProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.starProductsList}
                renderItem={({ item }) => (
                  <View style={styles.starProductCard}>
                    <View style={styles.starProductIcon}>
                      <Text style={styles.starProductEmoji}>★</Text>
                    </View>
                    <Text style={styles.starProductName}>{item.name}</Text>
                  </View>
                )}
              />
            </View>

            <View style={styles.productsSection}>
              <View style={styles.productsHeader}>
                <Text style={styles.productsTitle}>Products</Text>
                <Text style={styles.viewAllText}>View All {'>'}</Text>
              </View>
              <FlatList
                data={[
                  { id: '1', name: "Bruno's Hairwax Classic", price: '₱360', originalPrice: '₱450', discount: '20% off' },
                  { id: '2', name: "Bruno's Hairstyling Paste", price: '₱360', originalPrice: '₱450', discount: '20% off' },
                  { id: '3', name: "Bruno's Pomade Strong Hold", price: '₱360', originalPrice: '₱450', discount: '20% off' },
                  { id: '4', name: "Bruno's Matte Clay Wax", price: '₱360', originalPrice: '₱450', discount: '20% off' },
                ]}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.productsList}
                renderItem={({ item }) => (
                  <View style={styles.productCard}>
                    <View style={styles.productImagePlaceholder}>
                      <Image source={require('../assets/bback.png')} style={styles.productImage} resizeMode="cover" />
                    </View>
                    <View style={styles.productDetails}>
                      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                     
                      <View style={styles.priceRow}>
                         <Text style={styles.currentPrice}>{item.price}</Text>
                        <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                        <Text style={styles.discountText}>({item.discount})</Text>
                      </View>
                    </View>
                  </View>
                )}
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Image source={require('../assets/home.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => {
          if (!isNavigating) {
            setIsNavigating(true);
            navigation.replace('SearchScreen');
            setTimeout(() => setIsNavigating(false), 1000);
          }
        }}>
          <Image source={require('../assets/search.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => {
          if (!isNavigating) {
            setIsNavigating(true);
            navigation.replace('ServicesScreen');
            setTimeout(() => setIsNavigating(false), 1000);
          }
        }}>
          <Image source={require('../assets/services.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => {
          if (!isNavigating) {
            setIsNavigating(true);
            navigation.replace('ProfileScreen');
            setTimeout(() => setIsNavigating(false), 1000);
          }
        }}>
          <Image source={require('../assets/profile.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <Modal visible={showPermissionsModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={currentPermission === 'location' ? styles.locationIllustration : styles.notificationIllustration}>
              <Image 
                source={currentPermission === 'location' 
                  ? require('../assets/locationpermission.png') 
                  : require('../assets/notification permission.png')
                }
                style={currentPermission === 'location' ? styles.locationImage : styles.notificationImage}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.modalTitle}>
              {currentPermission === 'location' ? 'Location' : 'Notification'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {currentPermission === 'location' 
                ? 'Allow Bruno\'s Barbers to access your location to help you find nearby branches.'
                : 'Please enable notifications to receive updates on your orders and offers.'
              }
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.skipButton, { marginRight: 15 }]}
                onPress={handlePermissionSkip}
              >
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.allowButton}
                onPress={handlePermissionAllow}
              >
                <Text style={styles.allowButtonText}>Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notification List Modal */}
      <Modal 
        visible={showNotificationListModal} 
        transparent={false} 
        animationType="slide"
        onRequestClose={() => setShowNotificationListModal(false)}
      >
        <SafeAreaView style={styles.notificationFullScreen}>
          <View style={styles.notificationHeader}>
            <TouchableOpacity onPress={() => setShowNotificationListModal(false)} style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.notificationTitle}>Notifications</Text>
            <TouchableOpacity style={styles.moreButton} onPress={() => setShowOptionsMenu(!showOptionsMenu)}>
              <Text style={styles.moreText}>⋮</Text>
            </TouchableOpacity>
            {showOptionsMenu && (
              <View style={styles.optionsMenu}>
                <TouchableOpacity style={styles.optionItem} onPress={handleSelectAll}>
                  <Text style={styles.optionText}>{allSelected ? 'Deselect All' : 'Select All'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionItem} onPress={handleMarkAsRead}>
                  <Text style={styles.optionText}>Mark as read</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <ScrollView style={styles.notificationContent} showsVerticalScrollIndicator={false}>
            {/* Today Section */}
            <Text style={styles.sectionHeader}>Today</Text>
            
            <TouchableOpacity 
              style={[
                styles.notificationItem, 
                selectedNotifications.includes('1') && { backgroundColor: '#e3f2fd' }
              ]} 
              onPress={() => {
                if (selectedNotifications.includes('1')) {
                  setSelectedNotifications(prev => prev.filter(id => id !== '1'));
                } else {
                  setSelectedNotifications(prev => [...prev, '1']);
                }
              }}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🎉</Text>
                {selectedNotifications.includes('1') && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>Loyalty Points</Text>
                <Text style={styles.itemMessage}>Congratulations! You just earned 10 BB points.</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.notificationItem, 
                selectedNotifications.includes('2') && { backgroundColor: '#e3f2fd' }
              ]} 
              onPress={() => {
                if (selectedNotifications.includes('2')) {
                  setSelectedNotifications(prev => prev.filter(id => id !== '2'));
                } else {
                  setSelectedNotifications(prev => [...prev, '2']);
                }
              }}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📅</Text>
                {selectedNotifications.includes('2') && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>Appointment Confirmed ✂️</Text>
                <Text style={styles.itemMessage}>Your booking at Bruno's Barbers is scheduled for August 18, 2025, at 3:00 PM</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.notificationItem, 
                selectedNotifications.includes('3') && { backgroundColor: '#e3f2fd' }
              ]} 
              onPress={() => {
                if (selectedNotifications.includes('3')) {
                  setSelectedNotifications(prev => prev.filter(id => id !== '3'));
                } else {
                  setSelectedNotifications(prev => [...prev, '3']);
                }
              }}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📦</Text>
                {selectedNotifications.includes('3') && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>Order Delivered</Text>
                <Text style={styles.itemMessage}>Your Bruno's products have been delivered. Enjoy your grooming essentials!</Text>
              </View>
            </TouchableOpacity>
            
            {/* Yesterday Section */}
            <Text style={styles.sectionHeader}>Yesterday</Text>
            
            <TouchableOpacity 
              style={[
                styles.notificationItem, 
                selectedNotifications.includes('4') && { backgroundColor: '#e3f2fd' }
              ]} 
              onPress={() => {
                if (selectedNotifications.includes('4')) {
                  setSelectedNotifications(prev => prev.filter(id => id !== '4'));
                } else {
                  setSelectedNotifications(prev => [...prev, '4']);
                }
              }}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🏷️</Text>
                {selectedNotifications.includes('4') && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>New Offer Just for You!</Text>
                <Text style={styles.itemMessage}>Use code STYLE20 and get 20% off your next haircut.</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.notificationItem, 
                selectedNotifications.includes('5') && { backgroundColor: '#e3f2fd' }
              ]} 
              onPress={() => {
                if (selectedNotifications.includes('5')) {
                  setSelectedNotifications(prev => prev.filter(id => id !== '5'));
                } else {
                  setSelectedNotifications(prev => [...prev, '5']);
                }
              }}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🏷️</Text>
                {selectedNotifications.includes('5') && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>Groom & Save!</Text>
                <Text style={styles.itemMessage}>Use CARE25 for 25% off on selected hair products.</Text>
              </View>
            </TouchableOpacity>
            
            {/* Day Before Yesterday Section */}
            <Text style={styles.sectionHeader}>{formatDate(dayBeforeYesterday)}</Text>
            
            <TouchableOpacity 
              style={[
                styles.notificationItem, 
                selectedNotifications.includes('6') && { backgroundColor: '#e3f2fd' }
              ]} 
              onPress={() => {
                if (selectedNotifications.includes('6')) {
                  setSelectedNotifications(prev => prev.filter(id => id !== '6'));
                } else {
                  setSelectedNotifications(prev => [...prev, '6']);
                }
              }}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📅</Text>
                {selectedNotifications.includes('6') && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>Appointment Confirmed ✂️</Text>
                <Text style={styles.itemMessage}>Your booking at Bruno's Barbers is scheduled for August 18, 2025, at 3:00 PM</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};



export default DashboardScreen;