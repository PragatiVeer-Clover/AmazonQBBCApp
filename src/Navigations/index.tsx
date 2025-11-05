import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import KYCScreen from '../screens/KYCScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LocationSetupScreen from '../screens/LocationSetupScreen';
import MapScreen from '../screens/MapScreen';
import BranchDetailsScreen from '../screens/BranchDetailsScreen';
import SearchScreen from '../screens/SearchScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoyaltyPointsScreen from '../screens/LoyaltyPointsScreen';
import LoyaltyScreen from '../screens/LoyaltyScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import InviteFriendsScreen from '../screens/InviteFriendsScreen';
import SettingsScreen from '../screens/SettingsScreen';


export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  OTP: { phoneNumber: string };
  KYC: undefined;
  Dashboard: undefined;
  LocationSetup: undefined;
  Map: {
    location: any;
    searchText: string;
    showBarbers?: boolean;
    selectedAddress?: string;
  };
  BranchDetails: {
    placeId: string;
    branchName: string;
    userLocation?: { latitude: number; longitude: number };
  };
  SearchScreen: undefined;
  ServicesScreen: undefined;
  ProfileScreen: undefined;
  LoyaltyPointsScreen: undefined;
  LoyaltyScreen: undefined;
  MyProfileScreen: undefined;
  FavoritesScreen: undefined;
  InviteFriendsScreen: undefined;
  SettingsScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <>
      {/* ✅ Global white status bar */}
      <StatusBar
        barStyle="dark-content"     // Dark icons/text for light background
        backgroundColor="#FFFFFF"   // White background
      />

      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="KYC" component={KYCScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="LocationSetup" component={LocationSetupScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="BranchDetails" component={BranchDetailsScreen} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="LoyaltyPointsScreen" component={LoyaltyPointsScreen} />
          <Stack.Screen name="LoyaltyScreen" component={LoyaltyScreen} />
          <Stack.Screen name="MyProfileScreen" component={MyProfileScreen} />
          <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
          <Stack.Screen name="InviteFriendsScreen" component={InviteFriendsScreen} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;
