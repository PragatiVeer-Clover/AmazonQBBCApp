import React, { useState, useEffect, useRef, useCallback } from 'react';
import {View,Text,StyleSheet,ScrollView,Image,TouchableOpacity,Dimensions,ActivityIndicator,Modal,Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import Strings from '../constants/index';

const { width } = Dimensions.get('window');

interface Review {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  profile_photo_url?: string;
}

interface Photo {
  height: number;
  html_attributions: string[];
  photo_reference: string;
  width: number;
}

interface BranchItem {
  placeId: string;
  branchName: string;
  userLocation?: { latitude: number; longitude: number };
}

type RootStackParamList = {
  BranchDetails: BranchItem;
};

type BranchDetailsRouteProp = RouteProp<RootStackParamList, 'BranchDetails'>;

const TABS = ['Services', 'Photos', 'About', 'Reviews'];

const SERVICES = [
  {
    id: '1',
    title: 'Hair-cut,Wash & Style',
    image: require('../assets/hair_cut_wash.png'),
  },
  {
    id: '2',
    title: 'Hair Color',
    image: require('../assets/hair_color.png'),
  },
  {
    id: '3',
    title: 'Nail Bar',
    image: require('../assets/nail_bar.png'),
  },
  {
    id: '4',
    title: 'Face',
    image: require('../assets/face.png'),
  },
  {
    id: '5',
    title: 'Massage & Spa',
    image: require('../assets/massage_spa.png'),
  },
  {
    id: '6',
    title: `Men's Groming`,
    image: require('../assets/mens_grooming.png'),
  },
  {
    id: '7',
    title: 'Waxing,Bleaching & Threading',
    image: require('../assets/waxing_thread.png'),
  },
  {
    id: '8',
    title: 'Waxing,Bleaching & Threading',
    image: require('../assets/waxing_thread.png'),
  },
];

const HEADER_IMAGES = [
  require('../assets/banner.png'),
  require('../assets/banner.png'),
  require('../assets/banner.png'),
  require('../assets/banner.png'),
  require('../assets/banner.png'),
  require('../assets/banner.png'),
  require('../assets/banner.png'),
  require('../assets/banner.png'),
  require('../assets/banner.png'),
  require('../assets/banner.png'),
  require('../assets/banner.png'),
  require('../assets/banner.png'),
];

export default function BranchDetailsScreen() {
  const [loading, setLoading] = useState(false);
  const route = useRoute<BranchDetailsRouteProp>();
  const navigation = useNavigation();
  const { placeId, branchName, userLocation } = route.params;

  // States for branch details
  const [branchDetails, setBranchDetails] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [fetchedFullOpeningHours, setFetchedFullOpeningHours] = useState<string[] | null>(null);
  const [displayTodayHours, setDisplayTodayHours] = useState<string | null>(null);
  const [isHoursModalVisible, setIsHoursModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isCallNotSupportedModalVisible, setIsCallNotSupportedModalVisible] = useState(false);
  const [callNotSupportedMessage, setCallNotSupportedMessage] = useState('');
  const [isMapNotSupportedModalVisible, setIsMapNotSupportedModalVisible] = useState(false);
  const [mapNotSupportedMessage, setMapNotSupportedMessage] = useState('');
  const [fetchedPhotos, setFetchedPhotos] = useState<Photo[]>([]);
  const [distanceKm, setDistanceKm] = useState<string>('0');

  // Tab and scroll states
  const [activeTab, setActiveTab] = useState('Services');
  const [isTabSticky, setIsTabSticky] = useState(false);
  const [tabBarY, setTabBarY] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [headerIsVisible, setHeaderIsVisible] = useState(false);

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const headerRef = useRef<View>(null);
  const tabContainerRef = useRef<View>(null);
  const servicesRef = useRef<View>(null);
  const photosRef = useRef<View>(null);
  const aboutRef = useRef<View>(null);
  const reviewsRef = useRef<View>(null);
  const sectionRefs = { Services: servicesRef, Photos: photosRef, About: aboutRef, Reviews: reviewsRef };
  const sectionYPositions = useRef<{ Reviews?: number; About?: number; Photos?: number }>({});

  // Calculate distance
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  }, []);

  const scrollToSection = useCallback((tabName: string) => {
    const ref = sectionRefs[tabName as keyof typeof sectionRefs];
    if (ref && ref.current && scrollViewRef.current) {
      ref.current.measureLayout(
        scrollViewRef.current as any,
        (x, y, width, height) => {
          const offset = headerHeight;
          scrollViewRef.current?.scrollTo({ y: y - offset, animated: true });
        },
      );
    }
  }, [headerHeight]);

  const handleScroll = useCallback((event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const newIsTabSticky = scrollY >= tabBarY - headerHeight;
    setIsTabSticky(newIsTabSticky);
    setHeaderIsVisible(newIsTabSticky);

    let newActiveTab = activeTab;
    const offset = headerHeight + 20;

    if (sectionYPositions.current.Reviews && scrollY >= sectionYPositions.current.Reviews - offset) {
      newActiveTab = 'Reviews';
    } else if (sectionYPositions.current.About && scrollY >= sectionYPositions.current.About - offset) {
      newActiveTab = 'About';
    } else if (sectionYPositions.current.Photos && scrollY >= sectionYPositions.current.Photos - offset) {
      newActiveTab = 'Photos';
    } else {
      newActiveTab = 'Services';
    }

    if (newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
    }
  }, [activeTab, tabBarY, headerHeight]);

  const onLayout = useCallback(() => {
    if (headerRef.current) {
      headerRef.current.measure((x, y, width, height) => {
        setHeaderHeight(height);
      });
    }

    if (tabContainerRef.current) {
      tabContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTabBarY(pageY);
      });
    }

    const measureSections = () => {
      const positions: { [key: string]: number } = {};
      const sectionKeys = Object.keys(sectionRefs);
      let loadedCount = 0;

      sectionKeys.forEach(key => {
        sectionRefs[key as keyof typeof sectionRefs].current?.measureLayout(
          scrollViewRef.current as any,
          (x, y, width, height) => {
            positions[key] = y;
            loadedCount++;
            if (loadedCount === sectionKeys.length) {
              sectionYPositions.current = positions;
            }
          },
        );
      });
    };

    setTimeout(measureSections, 100);
  }, []);

  useEffect(() => {
    const fetchBranchDetails = async () => {
      if (!placeId) {
        setDetailsError('Branch ID not available to fetch details.');
        setLoadingDetails(false);
        return;
      }
      setLoading(true);
      setLoadingDetails(true);
      setDetailsError(null);
      setReviews([]);
      setAmenities([]);
      setFetchedFullOpeningHours(null);
      setDisplayTodayHours(null);
      setPhoneNumber(null);
      setFetchedPhotos([]);

      try {
        const apiUrl = `${Strings.PLACE_IMAGE_URL}${placeId}&key=${Strings.GOMAPS_API_KEY}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        setLoading(false);

        if (data.status === 'OK' && data.result) {
          setBranchDetails(data.result);
          
          if (data.result.reviews) {
            setReviews(data.result.reviews);
          }

          const fetchedAmenities: string[] = [];
          const result = data.result;

          if (result.wheelchair_accessible_entrance)
            fetchedAmenities.push('Wheelchair Accessible Entrance');
          if (result.restroom) fetchedAmenities.push('Restroom Available');
          if (result.outdoor_seating) fetchedAmenities.push('Outdoor Seating');
          if (result.parking) fetchedAmenities.push('Parking Available');
          if (result.reservable)
            fetchedAmenities.push('Reservations Available');
          if (result.curbside_pickup) fetchedAmenities.push('Curbside Pickup');
          if (result.delivery) fetchedAmenities.push('Delivery');
          if (result.takeout) fetchedAmenities.push('Takeout');

          setAmenities(fetchedAmenities);

          if (data.result.opening_hours?.weekday_text) {
            const fullHours = data.result.opening_hours.weekday_text;
            setFetchedFullOpeningHours(fullHours);
            const currentDayIndex = (new Date().getDay() + 6) % 7;
            const todayEntry = fullHours[currentDayIndex];
            if (todayEntry) {
              const extractedTime = todayEntry.split(': ').slice(1).join(': ');
              setDisplayTodayHours(extractedTime);
            } else {
              setDisplayTodayHours('Hours not available');
            }
          } else {
            setFetchedFullOpeningHours(null);
            setDisplayTodayHours('Hours not available');
          }

          if (result.international_phone_number) {
            setPhoneNumber(result.international_phone_number);
          } else if (result.formatted_phone_number) {
            setPhoneNumber(result.formatted_phone_number);
          }

          if (data.result.photos) {
            setFetchedPhotos(data.result.photos);
          }

          // Calculate distance
          if (userLocation && result.geometry?.location) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              result.geometry.location.lat,
              result.geometry.location.lng
            );
            setDistanceKm(distance);
          }
        } else if (data.status === 'ZERO_RESULTS') {
          setDetailsError('No details found for this branch.');
          setDisplayTodayHours('Hours not available');
        } else {
          setDetailsError(
            data.error_message || 'Failed to fetch branch details.',
          );
          setDisplayTodayHours('Hours not available');
        }
      } catch (error: any) {
        setLoading(false);
        console.error('Error fetching branch details:', error);
        setDetailsError(
          `Failed to load details: ${error.message || 'Unknown error'}`,
        );
        setDisplayTodayHours('Hours not available');
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchBranchDetails();
  }, [placeId, userLocation, calculateDistance]);

  const currentDayIndexForModal = (new Date().getDay() + 6) % 7;

  const handleCall = () => {
    if (phoneNumber) {
      const url = `tel:${phoneNumber}`;
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            setCallNotSupportedMessage(
              `Phone call not supported on this device. Number: ${phoneNumber}`,
            );
            setIsCallNotSupportedModalVisible(true);
          }
        })
        .catch(err => {
          console.error('An error occurred while trying to make a call', err);
          setCallNotSupportedMessage(
            `An error occurred: ${err.message || 'Unknown error'}`,
          );
          setIsCallNotSupportedModalVisible(true);
        });
    } else {
      setCallNotSupportedMessage('Phone number not available for this branch.');
      setIsCallNotSupportedModalVisible(true);
    }
  };

  const handleGetDirections = () => {
    if (branchDetails?.geometry?.location) {
      const branchLat = branchDetails.geometry.location.lat;
      const branchLng = branchDetails.geometry.location.lng;
      
      let url;
      if (userLocation) {
        // Show route from user location to branch
        url = Platform.select({
          ios: `maps:?saddr=${userLocation.latitude},${userLocation.longitude}&daddr=${branchLat},${branchLng}&dirflg=d`,
          android: `google.navigation:q=${branchLat},${branchLng}&mode=d`,
        });
      } else {
        // Fallback to just showing branch location
        url = Platform.select({
          ios: `maps:0,0?q=${branchLat},${branchLng}(${encodeURIComponent(
            branchName || 'Branch',
          )})`,
          android: `geo:${branchLat},${branchLng}?q=${branchLat},${branchLng}(${encodeURIComponent(
            branchName || 'Branch',
          )})`,
        });
      }

      if (url) {
        Linking.canOpenURL(url)
          .then(supported => {
            if (supported) {
              Linking.openURL(url);
            } else {
              setMapNotSupportedMessage(
                'Map application not found or supported on this device.',
              );
              setIsMapNotSupportedModalVisible(true);
            }
          })
          .catch(err => {
            console.error('An error occurred while trying to open map', err);
            setMapNotSupportedMessage(
              `An error occurred: ${err.message || 'Unknown error'}`,
            );
            setIsMapNotSupportedModalVisible(true);
          });
      }
    } else {
      setMapNotSupportedMessage(
        'Location coordinates not available for this branch.',
      );
      setIsMapNotSupportedModalVisible(true);
    }
  };

  const renderServicesSection = () => (
    <View ref={servicesRef} style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Services</Text>
      <View style={styles.gridContainer}>
        {SERVICES.map((item, index) => (
          <View
            key={index}
            style={[
              styles.gridItem,
              (index + 1) % 4 !== 0 && styles.marginRight,
            ]}>
            <Image source={item.image} style={styles.gridImage} />
            <Text style={styles.gridText}>{item.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPhotosSection = () => (
    <View ref={photosRef} style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Photos</Text>
      {loadingDetails ? (
        <View style={styles.photoStatusContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.photoStatusText}>Loading photos...</Text>
        </View>
      ) : detailsError ? (
        <View style={styles.photoStatusContainer}>
          <Text style={styles.statusErrorText}>Error: {detailsError}</Text>
        </View>
      ) : fetchedPhotos.length === 0 ? (
        <View style={styles.photoStatusContainer}>
          <Text style={styles.photoStatusText}>
            No photos available for this branch.
          </Text>
        </View>
      ) : (
        <View style={styles.fetchedPhotoContainer}>
          {fetchedPhotos.map((photo, index) => (
            <Image
              key={index}
              source={{
                uri: `${Strings.PHOTO_SHOW}${photo.photo_reference}&key=${Strings.GOMAPS_API_KEY}`,
              }}
              style={[
                styles.fetchedPhotoItem,
                (index + 1) % 4 !== 0 && styles.marginRight,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderAboutSection = () => (
    <View ref={aboutRef} style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>About</Text>
      <View>
        {loadingDetails ? (
          <ActivityIndicator
            size="small"
            color="#0000ff"
            style={{ marginVertical: 10 }}
          />
        ) : detailsError ? (
          <Text style={styles.statusErrorText}>
            Could not load about details: {detailsError}
          </Text>
        ) : (
          <Text style={styles.aboutText}>
            {branchDetails?.editorial_summary?.overview ||
              'No detailed description available for this branch.'}
          </Text>
        )}

        <Text style={styles.aboutHeading}>Amenities</Text>
        {loadingDetails ? (
          <ActivityIndicator
            size="small"
            color="#0000ff"
            style={{ marginVertical: 10 }}
          />
        ) : detailsError ? (
          <Text style={styles.statusErrorText}>
            Could not load amenities: {detailsError}
          </Text>
        ) : amenities.length > 0 ? (
          <View style={styles.amenitiesList}>
            {amenities.map((amenity, idx) => (
              <Text key={idx} style={styles.amenityItem}>
                • {amenity}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.aboutText}>
            No specific amenities listed for this branch.
          </Text>
        )}
      </View>
    </View>
  );

  const renderReviewsSection = () => (
    <View ref={reviewsRef} style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Reviews</Text>
      {loadingDetails ? (
        <View style={styles.reviewStatusContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.reviewStatusText}>Loading reviews...</Text>
        </View>
      ) : detailsError ? (
        <View style={styles.reviewStatusContainer}>
          <Text style={styles.statusErrorText}>Error: {detailsError}</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.reviewStatusContainer}>
          <Text style={styles.reviewStatusText}>
            No reviews available yet for this branch.
          </Text>
        </View>
      ) : (
        <View style={styles.reviewsListContainer}>
          {reviews.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                {review.profile_photo_url && (
                  <Image
                    source={{ uri: review.profile_photo_url }}
                    style={styles.reviewerImage}
                  />
                )}
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>
                    {review.author_name}
                  </Text>
                  <Text style={styles.reviewRating}>
                    {'⭐'.repeat(review.rating)} {review.rating}
                  </Text>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
              <Text style={styles.reviewTime}>
                {review.relative_time_description}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {headerIsVisible && (
        <View
          ref={headerRef}
          onLayout={event => {
            const { height } = event.nativeEvent.layout;
            setHeaderHeight(height);
          }}
          style={styles.headerWrapper}>
          <View style={styles.customHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{branchName || 'Branch Details'}</Text>
          </View>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={onLayout}
        contentContainerStyle={{ paddingBottom: 120 }}>

        <View style={styles.headerImageContainer}>
          <Image source={HEADER_IMAGES[0]} style={styles.headerImage} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.salonName}>{branchName}</Text>
          <Text style={styles.address}>{branchDetails?.formatted_address}</Text>
          <Text style={styles.subText}>Unisex · ₹₹</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.openText}>
              {branchDetails?.opening_hours?.open_now ? '🟢 Open now' : '🔴 Closed'}
            </Text>
            <TouchableOpacity
              onPress={() => setIsHoursModalVisible(true)}
              style={styles.hoursDropdownContainer}
              disabled={
                !fetchedFullOpeningHours ||
                fetchedFullOpeningHours.length === 0
              }>
              <Text style={styles.timeText}>
                {displayTodayHours || 'Hours not available'}
              </Text>
              {fetchedFullOpeningHours &&
                fetchedFullOpeningHours.length > 0 && (
                  <Text style={styles.dropdownIcon}>▼</Text>
                )}
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGetDirections}
              disabled={!branchDetails?.geometry?.location || loadingDetails}>
              <Text>📍 Get Directions ({distanceKm} Km)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCall}
              disabled={!phoneNumber || loadingDetails}>
              <Text>📞 Contact</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.offerCard}>
            <Text style={styles.offerTitle}>🎉 Get 40% OFF</Text>
            <Text>25% Discount + 15% Cashback</Text>
          </View>
        </View>

        <View ref={tabContainerRef} style={styles.tabContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => scrollToSection(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderServicesSection()}
        {renderPhotosSection()}
        {renderAboutSection()}
        {renderReviewsSection()}

      </ScrollView>

      {isTabSticky && (
        <View style={[styles.stickyTabContainer, { top: headerHeight }]}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => scrollToSection(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book services</Text>
        </TouchableOpacity>
    
       
      </View>
{/* Hours Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isHoursModalVisible}
        onRequestClose={() => {
          setIsHoursModalVisible(!isHoursModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Opening Hours</Text>
              <Text style={styles.modalHeaderSubtitle}>
                {branchName || 'Branch Details'}
              </Text>
            </View>
            {fetchedFullOpeningHours?.map((dayText, index) => (
              <View
                key={index}
                style={[
                  styles.modalTimingRow,
                  index === currentDayIndexForModal &&
                  styles.highlightedDayRow,
                ]}>
                <Text
                  style={[
                    styles.modalTextDay,
                    index === currentDayIndexForModal &&
                    styles.highlightedDayText,
                  ]}>
                  {dayText.split(':')[0]}
                </Text>
                <Text
                  style={[
                    styles.modalTextTime,
                    index === currentDayIndexForModal &&
                    styles.highlightedDayText,
                  ]}>
                  {dayText.split(': ').slice(1).join(': ') || 'Closed'}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsHoursModalVisible(!isHoursModalVisible)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Call Not Supported Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isCallNotSupportedModalVisible}
        onRequestClose={() => {
          setIsCallNotSupportedModalVisible(!isCallNotSupportedModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.statusErrorText}>
              {callNotSupportedMessage}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() =>
                setIsCallNotSupportedModalVisible(
                  !isCallNotSupportedModalVisible,
                )
              }>
              <Text style={styles.modalCloseButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Map Not Supported Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMapNotSupportedModalVisible}
        onRequestClose={() => {
          setIsMapNotSupportedModalVisible(!isMapNotSupportedModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.statusErrorText}>
              {mapNotSupportedMessage}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() =>
                setIsMapNotSupportedModalVisible(
                  !isMapNotSupportedModalVisible,
                )
              }>
              <Text style={styles.modalCloseButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImageContainer: {
    width: '100%',
    height: 200,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  infoContainer: {
    padding: 16,
  },
  salonName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  address: {
    fontSize: 14,
    color: '#555',
  },
  subText: {
    color: '#777',
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  openText: {
    color: 'green',
  },
  hoursDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  timeText: {
    color: '#333',
    marginRight: 5,
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  offerCard: {
    backgroundColor: '#e9f4ff',
    padding: 12,
    borderRadius: 12,
  },
  offerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  stickyTabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    zIndex: 100,
  },
  tabText: {
    fontSize: 16,
    color: '#777',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 4,
  },
  sectionContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  gridItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  gridText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  photoStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 60,
  },
  photoStatusText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  fetchedPhotoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  fetchedPhotoItem: {
    width: '23%',
    height: (width - 20 - 3 * 8) / 4,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  marginRight: {
    marginRight: 8,
  },
  aboutHeading: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  aboutText: {
    marginTop: 4,
    color: '#444',
  },
  amenitiesList: {
    marginTop: 8,
    paddingLeft: 10,
  },
  amenityItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  footer: {
     justifyContent: 'flex-end', // ensures right alignment
    flexDirection: 'row',
   
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
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 70,
    right: 20,
  },
  bookButton: {
    backgroundColor: '#e5e5e5',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reviewsListContainer: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewRating: {
    fontSize: 14,
    color: '#888',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
  },
  reviewTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    textAlign: 'right',
  },
  reviewStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 100,
  },
  reviewStatusText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  statusErrorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    width: '100%',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  modalTimingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
    paddingVertical: 2,
  },
  modalTextDay: {
    fontSize: 16,
  },
  modalTextTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  highlightedDayRow: {
    backgroundColor: '#f0faff',
    borderRadius: 5,
  },
  highlightedDayText: {
    fontWeight: 'bold',
    color: '#00aaff',
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#00aaff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});