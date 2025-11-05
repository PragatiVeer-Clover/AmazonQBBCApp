import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import { KeyboardWrapper } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Strings from '../constants';

type OTPScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTP'>;
type OTPScreenRouteProp = RouteProp<RootStackParamList, 'OTP'>;

const OTPScreen = () => {
  const navigation = useNavigation<OTPScreenNavigationProp>();
  const route = useRoute<OTPScreenRouteProp>();
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
 // const [otp, setOtp] = useState(['1', '2', '3', '4']);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (value && index === 3) {
      // Check if OTP is complete after this change
      const isComplete = newOtp.every(digit => digit !== '');
      if (isComplete) {
        Keyboard.dismiss();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '']);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  const handleContinue = async () => {
    try {
      const kycDone = await AsyncStorage.getItem(Strings.KYC_DONE);
      if (kycDone === 'true') {
        await AsyncStorage.setItem(Strings.IS_LOGGED_IN, 'true');
        navigation.replace('Dashboard');
      } else {
        navigation.navigate('KYC');
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
      navigation.navigate('KYC');
    }
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#000',
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    backgroundColor: '#f9f9f9',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  resendText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  resendDisabled: {
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  continueButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#e5e5e5',
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
});

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardWrapper>
        <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.subtitle}>A 4-digit code has been sent to</Text>
        <Text style={styles.phoneNumber}>+91 {phoneNumber}</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { if (ref) inputRefs.current[index] = ref; }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleResend} disabled={!canResend}>
          <Text style={[styles.resendText, !canResend && styles.resendDisabled]}>
            Resend code{!canResend ? ` (00:${timer.toString().padStart(2, '0')}s)` : ''}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, !isOtpComplete && styles.continueButtonDisabled]}
            disabled={!isOtpComplete}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
        </View>
      </KeyboardWrapper>
    </SafeAreaView>
  );
};



export default OTPScreen;