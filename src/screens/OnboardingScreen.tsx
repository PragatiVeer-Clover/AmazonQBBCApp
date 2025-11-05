import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const screens = [
  {
    title: "Welcome to Bruno's Barbers",
    subtitle: "Your style, our craft. Book an appointment and manage your grooming with ease.",
    buttonText: "Next",
  },
  {
    title: "Book in Seconds",
    subtitle: "Schedule your cut anytime, anywhere—fast, simple, and stress-free.",
    buttonText: "Next",
  },
  {
    title: "Never Miss a Spot",
    subtitle: "Get reminders, exclusive offers, and updates on new grooming trends.",
    buttonText: "Get Started",
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentScreen = screens[currentIndex];

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  imageIcon: {
    width: 260,
    height: 260,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mountain: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 60,
    borderRightWidth: 60,
    borderBottomWidth: 80,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#999',
    position: 'absolute',
    bottom: 60,
    left: 40,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#999',
    position: 'absolute',
    top: 60,
    right: 60,
  },
  textContainer: {
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    lineHeight: 38,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
  footer: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  dotActive: {
    width: 32,
    backgroundColor: '#000',
  },
  nextButton: {
    backgroundColor: '#e5e5e5',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 28,
  },
  nextText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
  },
});

  return (
    <SafeAreaView style={styles.container}>
      {currentIndex < screens.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <View style={styles.imagePlaceholder}>
          <View style={styles.imageIcon}>
            <View style={styles.mountain} />
            <View style={styles.circle} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentScreen.title}</Text>
          <Text style={styles.subtitle}>{currentScreen.subtitle}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {screens.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>{currentScreen.buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};



export default OnboardingScreen;
