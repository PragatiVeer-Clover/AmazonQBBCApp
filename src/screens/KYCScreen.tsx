import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,

} from 'react-native';
import { Button, RadioButton } from '../components';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Strings from '../constants';

// Define the component's props (if you were passing navigation or an action)
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';

type KYCScreenNavigationProp = StackNavigationProp<RootStackParamList, 'KYC'>;

// --- The main screen component ---
const KYCScreen: React.FC = () => {
  const navigation = useNavigation<KYCScreenNavigationProp>();
  // 1. State for form fields
  const [mobileNumber, setMobileNumber] = useState('');

  // Load mobile number from AsyncStorage
  useEffect(() => {
    const loadMobileNumber = async () => {
      try {
        const savedMobileNumber = await AsyncStorage.getItem('mobileNumber');
        if (savedMobileNumber) {
          setMobileNumber(savedMobileNumber);
        }
      } catch (error) {
        console.error('Error loading mobile number:', error);
      }
    };
    loadMobileNumber();
  }, []);
 // const [firstName, setFirstName] = useState('');
 // const [lastName, setLastName] = useState('');
 // const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
 // const [birthdayMonth, setBirthdayMonth] = useState('');
  //const [birthdayDay, setBirthdayDay] = useState('');
 // const [birthdayYear, setBirthdayYear] = useState('');

  const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [email, setEmail] = useState('');
const [birthdayMonth, setBirthdayMonth] = useState(''); // June
const [birthdayDay, setBirthdayDay] = useState('');
const [birthdayYear, setBirthdayYear] = useState('');

  // Helper function to get days in month
  const getDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return 31;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    return new Date(yearNum, monthNum, 0).getDate();
  };

  // Helper function to check leap year
  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Dropdown data
  const months = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({
    label: String(currentYear - i),
    value: String(currentYear - i),
  }));

  // Dynamic days based on selected month and year
  const maxDays = getDaysInMonth(birthdayMonth, birthdayYear);
  const days = Array.from({ length: maxDays }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  }));

  // Handle day selection with validation
  const handleDaySelect = (day: string) => {
    if (!birthdayMonth) {
      Alert.alert('Validation', 'Please select month first');
      return;
    }
    setShowDayModal(true);
  };

  // Handle month selection and reset day if invalid
  const handleMonthSelect = (month: string) => {
    setBirthdayMonth(month);
    if (birthdayDay && birthdayYear) {
      const newMaxDays = getDaysInMonth(month, birthdayYear);
      if (parseInt(birthdayDay) > newMaxDays) {
        setBirthdayDay('');
      }
    }
  };

  // Handle year selection and reset day if invalid
  const handleYearSelect = (year: string) => {
    setBirthdayYear(year);
    if (birthdayDay && birthdayMonth) {
      const newMaxDays = getDaysInMonth(birthdayMonth, year);
      if (parseInt(birthdayDay) > newMaxDays) {
        setBirthdayDay('');
      }
    }
  };
  const [referralCode, setReferralCode] = useState('');
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  // 1. (Continued) Add validation state
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    birthdayYear: ''
  });

  // 2. Update handleContinue function:
  const handleContinue = async () => {
    const newErrors = {
      // Check if required fields are empty (after trimming whitespace)
      firstName: !firstName.trim() ? 'First name is required' : '',
      lastName: !lastName.trim() ? 'Last name is required' : '',
      birthdayYear: !birthdayYear.trim() ? 'Birth year is required' : ''
    };
    
    // Set the errors state
    setErrors(newErrors);
    
    // Check if there are NO errors
    if (!newErrors.firstName && !newErrors.lastName && !newErrors.birthdayYear) {
      try {
        // Store KYC data in AsyncStorage
        await AsyncStorage.setItem(Strings.KYC_DONE, 'true');
        await AsyncStorage.setItem(Strings.IS_LOGGED_IN, 'true');
        await AsyncStorage.setItem('firstName', firstName);
        await AsyncStorage.setItem('lastName', lastName);
        await AsyncStorage.setItem('email', email);
        await AsyncStorage.setItem('gender', gender);
        await AsyncStorage.setItem('birthday', `${birthdayMonth}/${birthdayDay}/${birthdayYear}`);
        
        // Don't store default location - let Dashboard handle location permission
        
        console.log('KYC Form Submitted and stored');
        navigation.replace('Dashboard');
      } catch (error) {
        console.error('Error storing KYC data:', error);
        Alert.alert('Error', 'Failed to save data. Please try again.');
      }
    }
  };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold', 
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoIcon: {
    color: '#888',
    fontWeight: 'normal',
    fontSize: 12,
  },
  textInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    backgroundColor: '#fff',
    flex: 1, 
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 5,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  countryCode: {
    backgroundColor: '#eee',
    height: 50,
    paddingHorizontal: 15,
    lineHeight: 50, 
    fontSize: 16,
    fontWeight: '500',
    borderRightColor: '#ccc',
    borderRightWidth: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  nameInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  radioRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  birthdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdown: {
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    textAlign: 'center',
    flex: 1,
  },
  dropdownArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#666',
    marginRight: 5,
  },
  continueButton: {
    marginTop: 30,
  },
  selectedText: {
    color: '#000',
  },
  placeholderText: {
    color: '#999',
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
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayItem: {
    padding: 10,
    margin: 2,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    maxWidth: '13%',
  },
  modalItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalCloseButton: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginTop: 10,
  },
  modalCloseText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

  // 3. Render the UI based on the design
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* Test to verify screen is loading */}
       
        
        {/* Header Text */}
        <Text style={styles.header}>Let's Get You Started</Text>
        <Text style={styles.subtitle}>
          We need some basic info to get you going.
        </Text>

        {/* Mobile Number Input Group */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: '#f5f5f5', color: '#666' }]}
              value={mobileNumber}
              editable={false}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Name Input Group with Error Display */}
        <View style={styles.nameRow}>
          <View style={styles.nameInputContainer}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[styles.textInput, errors.firstName && styles.inputError]}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            {!!errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>
          <View style={styles.nameInputContainer}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={[styles.textInput, errors.lastName && styles.inputError]}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            {!!errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>
        </View>

        {/* Email Input Group */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Gender Radio Group */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioRow}>
            <RadioButton 
              label="Male" 
              selected={gender === 'Male'} 
              onPress={() => setGender('Male')} 
            />
            <RadioButton 
              label="Female" 
              selected={gender === 'Female'} 
              onPress={() => setGender('Female')} 
            />
          </View>
        </View>
        
        {/* Birthday Dropdown Group with Error Display */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birthday * <Text style={styles.infoIcon}>ⓘ</Text></Text>
          <View style={styles.birthdayRow}>
            <TouchableOpacity 
              style={[styles.textInput, styles.dropdown]} 
              onPress={() => setShowMonthModal(true)}
            >
              <Text style={[birthdayMonth ? styles.selectedText : styles.placeholderText, styles.dropdownText]}>
                {birthdayMonth ? months.find(m => m.value === birthdayMonth)?.label : 'Month'}
              </Text>
              <View style={styles.dropdownArrow} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.textInput, styles.dropdown]} 
              onPress={() => handleDaySelect('')}
            >
              <Text style={[birthdayDay ? styles.selectedText : styles.placeholderText, styles.dropdownText]}>
                {birthdayDay || 'Day'}
              </Text>
              <View style={styles.dropdownArrow} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.textInput, styles.dropdown]} 
              onPress={() => setShowYearModal(true)}
            >
              <Text style={[birthdayYear ? styles.selectedText : styles.placeholderText, styles.dropdownText]}>
                {birthdayYear || 'Year'}
              </Text>
              <View style={styles.dropdownArrow} />
            </TouchableOpacity>
          </View>
          {!!errors.birthdayYear && <Text style={styles.errorText}>{errors.birthdayYear}</Text>}
        </View>

        {/* Referral Code Input Group */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Referral Code</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter Referral Code"
            value={referralCode}
            onChangeText={setReferralCode}
          />
        </View>
        
        {/* Continue Button with onPress={handleContinue} */}
        <Button 
          title="Continue" 
          onPress={handleContinue}
          variant="primary"
          style={styles.continueButton}
        />

        </ScrollView>
        
        {/* Month Modal */}
        <Modal visible={showMonthModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <FlatList
                data={months}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      handleMonthSelect(item.value);
                      setShowMonthModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowMonthModal(false)}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Day Modal */}
        <Modal visible={showDayModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Day</Text>
              <FlatList
                data={days}
                keyExtractor={(item) => item.value}
                numColumns={7}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dayItem}
                    onPress={() => {
                      setBirthdayDay(item.value);
                      setShowDayModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDayModal(false)}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Year Modal */}
        <Modal visible={showYearModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Year</Text>
              <FlatList
                data={years}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      handleYearSelect(item.value);
                      setShowYearModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowYearModal(false)}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
};



export default KYCScreen;