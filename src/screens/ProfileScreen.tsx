import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Strings from '../constants';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileScreen'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [isNavigating, setIsNavigating] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userPhone, setUserPhone] = useState('');
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const phone = await AsyncStorage.getItem('userPhone');
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      
      if (phone) setUserPhone(phone);
      
      if (firstName && lastName) {
        const fullName = `${firstName} ${lastName}`;
        setUserName(fullName);
        setUserInitials(`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase());
      } else if (firstName) {
        setUserName(firstName);
        setUserInitials(firstName.charAt(0).toUpperCase());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              // Preserve latitude, longitude, and KYC status
              const latitude = await AsyncStorage.getItem('latitude');
              const longitude = await AsyncStorage.getItem('longitude');
              const kycDone = await AsyncStorage.getItem(Strings.KYC_DONE);
              
              await AsyncStorage.clear();
              
              // Restore latitude, longitude, and KYC status
              if (latitude) await AsyncStorage.setItem('latitude', latitude);
              if (longitude) await AsyncStorage.setItem('longitude', longitude);
              if (kycDone) await AsyncStorage.setItem(Strings.KYC_DONE, kycDone);
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }, 
          style: "destructive" 
        }
      ]
    );
  };

  const handleNavigation = (screenName: keyof RootStackParamList) => {
    if (!isNavigating) {
      setIsNavigating(true);
      const mainTabs = ['Dashboard', 'SearchScreen', 'ServicesScreen', 'ProfileScreen'];
      if (mainTabs.includes(screenName)) {
        navigation.replace(screenName);
      } else {
        navigation.navigate(screenName);
      }
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  const menuItems = [
    { icon: require('../assets/loyalitypoint.png'), title: 'Loyalty Points', hasArrow: true, onPress: () => handleNavigation('LoyaltyScreen'), isImage: true },
    { icon: require('../assets/myprofile.png'), title: 'My Profile', hasArrow: true, onPress: () => handleNavigation('MyProfileScreen'), isImage: true },
    { icon: require('../assets/favorites.png'), title: 'Favorites', hasArrow: true, onPress: () => handleNavigation('FavoritesScreen'), isImage: true },
    { icon: require('../assets/invitefafri.png'), title: 'Invite family & friends', hasArrow: true, onPress: () => handleNavigation('InviteFriendsScreen'), isImage: true },
    { icon: require('../assets/setting.png'), title: 'Settings', hasArrow: true, onPress: () => handleNavigation('SettingsScreen'), isImage: true }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationIconContainer}>
          <Image source={require('../assets/locationpin.png')} style={styles.locationIcon} resizeMode="contain" />
        </TouchableOpacity>
        
        <Image source={require('../assets/app_logo.png')} style={styles.headerLogo} resizeMode="contain" />
        
        <TouchableOpacity style={styles.notificationIconContainer}>
          <Image source={require('../assets/notification_pin.png')} style={styles.notificationIcon} resizeMode="contain" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          {userPhone && <Text style={styles.userPhone}>{userPhone}</Text>}
          <TouchableOpacity style={styles.qrButton}>
            <Image source={require('../assets/pp1.png')} style={styles.qrImage} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuLeft}>
                {item.isImage ? (
                  <Image source={item.icon} style={styles.menuIconImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                )}
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              {item.hasArrow && <Text style={styles.arrow}>›</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutContainer} onPress={handleLogout}>
          <Image source={require('../assets/logout.png')} style={styles.menuIconImage} resizeMode="cover" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => handleNavigation('Dashboard')}>
          <Image source={require('../assets/home.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => handleNavigation('SearchScreen')}>
          <Image source={require('../assets/search.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => handleNavigation('ServicesScreen')}>
          <Image source={require('../assets/services.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <Image source={require('../assets/profile.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  locationIconContainer: {
    padding: 5,
  },
  locationIcon: {
    width: 40,
    height: 40,
  },
  headerLogo: {
    height: 110,
    width: 150,
  },
  notificationIconContainer: {
    padding: 5,
    position: 'relative',
  },
  notificationIcon: {
    width: 40,
    height: 40,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#666',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  qrButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: 30,
    height: 30,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuIconImage: {
    width: 24,
    height: 24,
    marginRight: 15,
    borderRadius: 2,
    overflow: 'hidden',
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  logoutText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
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
});