import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SettingsScreen'>;

const NavRow = ({ iconSource, title, onPress }: { iconSource: any, title: string, onPress: () => void }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={styles.rowContent}>
      <Image source={iconSource} style={styles.rowIconImage} />
      <Text style={styles.rowText}>{title}</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

const ToggleRow = ({ iconSource, title, isEnabled, onToggle }: { iconSource: any, title: string, isEnabled: boolean, onToggle: () => void }) => (
  <View style={styles.row}>
    <View style={styles.rowContent}>
      <Image source={iconSource} style={styles.rowIconImage} />
      <Text style={styles.rowText}>{title}</Text>
    </View>
    <Switch
      trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
      thumbColor={isEnabled ? "#FFFFFF" : "#FFFFFF"}
      onValueChange={onToggle}
      value={isEnabled}
    />
  </View>
);

const DangerRow = ({ iconSource, title, onPress }: { iconSource: any, title: string, onPress: () => void }) => (
  <TouchableOpacity style={styles.dangerRow} onPress={onPress}>
    <Image source={iconSource} style={styles.dangerIconImage} />
    <Text style={styles.dangerText}>{title}</Text>
  </TouchableOpacity>
);

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const toggleNotifications = () => 
    setIsNotificationsEnabled(previousState => !previousState);

  const handleAction = (title: string) => {
    console.log(`Navigating to: ${title}`);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => console.log("Account Deleted!"), style: "destructive" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionContainer}>
          <ToggleRow 
            iconSource={require('../assets/notifi.png')} 
            title="Notifications" 
            isEnabled={isNotificationsEnabled} 
            onToggle={toggleNotifications} 
          />
          <View style={styles.separator} />
          <NavRow 
            iconSource={require('../assets/privacypolicy.png')} 
            title="Privacy policy" 
            onPress={() => handleAction('Privacy policy')} 
          />
          <View style={styles.separator} />
          <NavRow 
            iconSource={require('../assets/privacypolicy.png')} 
            title="Terms and conditions" 
            onPress={() => handleAction('Terms and conditions')} 
          />
        </View>

        <View style={styles.sectionContainer}>
          <NavRow 
            iconSource={require('../assets/helpcenter.png')} 
            title="Help Center" 
            onPress={() => handleAction('Help Center')} 
          />
          <View style={styles.separator} />
          <NavRow 
            iconSource={require('../assets/chat.png')} 
            title="Chat with us" 
            onPress={() => handleAction('Chat with us')} 
          />
          <View style={styles.separator} />
          <NavRow 
            iconSource={require('../assets/faq.png')} 
            title="FAQs" 
            onPress={() => handleAction('FAQs')} 
          />
        </View>

        <View style={styles.sectionContainer}>
          <DangerRow 
            iconSource={require('../assets/deleteaccount.png')} 
            title="Delete Account" 
            onPress={handleDeleteAccount} 
          />
        </View>
      </View>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
    fontSize: 20,
  },
  rowIconImage: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  rowText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 55,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  dangerIcon: {
    marginRight: 15,
    width: 24,
    textAlign: 'center',
    fontSize: 20,
  },
  dangerIconImage: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  dangerText: {
    fontSize: 16,
    color: '#D32F2F',
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

export default SettingsScreen;