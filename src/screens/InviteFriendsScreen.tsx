import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Clipboard,
  Alert,
  Share,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const REFERRAL_CODE = 'ONLT4MTBGQVD6PBEIZEW3Z';
const SHARE_MESSAGE = `Hey! Check out this awesome salon app. Use my referral code ${REFERRAL_CODE} to get exclusive discounts when you book your salon appointment!`;

const InviteFriendsScreen = () => {
  const navigation = useNavigation();

  const handleCopy = () => {
    Clipboard.setString(REFERRAL_CODE);
    Alert.alert('Copied!', 'Referral code has been copied to your clipboard.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: SHARE_MESSAGE,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite family & friends</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image 
          source={require('../assets/invite.png')} 
          style={styles.illustration} 
          resizeMode="contain" 
        />
        
        <Text style={styles.mainTitle}>Invite Friends, Get Benefits</Text>
        <Text style={styles.description}>
          Share your referral code and enjoy exclusive discounts when your friends book their salon appointments.
        </Text>

        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>{REFERRAL_CODE}</Text>
          <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
           <Image source={require('../assets/shrein.png')} style={styles.shareIconImage} />
          </TouchableOpacity>
        </View>

        <Text style={styles.shareOptionText}>Share via other apps</Text>

        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Image source={require('../assets/shrein.png')} style={styles.shareIconImage} />
          <Text style={styles.shareButtonText}>Share referral code</Text>
        </TouchableOpacity>
      </ScrollView>


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
  },
  scrollContent: {
    paddingHorizontal: 30,
    alignItems: 'center',
    paddingBottom: 20,
  },
  illustration: {
    width: '100%',
    height: 250,
    marginVertical: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  codeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  codeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  copyButton: {
    padding: 5,
    marginLeft: 10,
  },
  copyIcon: {
    fontSize: 20,
  },
  shareOptionText: {
    fontSize: 14,
    color: '#999',
    marginVertical: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  shareButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginLeft: 8,
  },
  shareIcon: {
    fontSize: 18,
  },
  shareIconImage: {
    width: 30,
    height: 30,
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

export default InviteFriendsScreen;