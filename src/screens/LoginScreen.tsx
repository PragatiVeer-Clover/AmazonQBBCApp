import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import { KeyboardWrapper } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\d{10}$/; // Must have 10 digits
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      await AsyncStorage.setItem('mobileNumber', phoneNumber);
    } catch (error) {
      console.error('Error saving mobile number:', error);
    }

    navigation.navigate('OTP', { phoneNumber });
  };

  const isValidPhone = validatePhoneNumber(phoneNumber);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardWrapper>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require('../assets/app_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Log in or Sign up</Text>

          <View style={styles.phoneContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={[styles.phoneInput, error && styles.phoneInputError]}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setError('');
                if (text.length === 10) {
                  Keyboard.dismiss();
                }
              }}
              maxLength={10}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.footer}>
            <Text style={styles.termsText}>
              By clicking below, you agree to our Terms & Conditions and Privacy Policy
            </Text>

            <TouchableOpacity
              style={[
                styles.sendButton,
                isValidPhone ? styles.sendButtonActive : styles.sendButtonInactive,
              ]}
              onPress={handleSendOTP}
              activeOpacity={isValidPhone ? 0.7 : 1}
            >
              <Text
                style={[
                  styles.sendButtonText,
                  isValidPhone ? styles.sendButtonTextActive : styles.sendButtonTextInactive,
                ]}
              >
                Send OTP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  header: { marginBottom: 40, alignItems: 'flex-start' },
  logoImage: { width: 200, height: 60 },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#000',
    marginBottom: 32,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  phoneContainer: { flexDirection: 'row', gap: 12 },
  countryCode: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  phoneInputError: {
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  footer: { position: 'absolute', bottom: 40, left: 24, right: 24 },
  termsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  sendButton: {
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
  },
  sendButtonInactive: {
    backgroundColor: '#e5e5e5', // gray background
  },
  sendButtonActive: {
    backgroundColor: '#000', // black background when valid
  },
  sendButtonText: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  sendButtonTextInactive: {
    color: '#000', // black text when inactive
  },
  sendButtonTextActive: {
    color: '#fff', // white text when active
  },
});

export default LoginScreen;
