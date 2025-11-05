import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Strings from '../constants';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem(Strings.IS_LOGGED_IN);
        const kycDone = await AsyncStorage.getItem(Strings.KYC_DONE);
        
        setTimeout(() => {
          if (isLoggedIn === 'true' && kycDone === 'true') {
            navigation.replace('Dashboard');
          } else {
            navigation.replace('Onboarding');
          }
        }, 2000);
      } catch (error) {
        console.error('Error checking login status:', error);
        setTimeout(() => {
          navigation.replace('Onboarding');
        }, 2000);
      }
    };
    
    checkLoginStatus();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bruno's Barbers</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SplashScreen;
