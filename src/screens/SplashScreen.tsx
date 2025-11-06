import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Strings from '../constants';

const { width } = Dimensions.get('window');

type SplashScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Splash'
>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

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
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 9,
        duration: 4000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0, // fade out
        duration: 4000,
        useNativeDriver: true,
      }),
    ]).start();

    checkLoginStatus();
  }, [navigation, scaleAnim, opacityAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Animated.Image
          source={require('../assets/b_logo.png')}
          style={[
            styles.logo,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
          resizeMode="contain"
        />
      </View>
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
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
});

export default SplashScreen;
