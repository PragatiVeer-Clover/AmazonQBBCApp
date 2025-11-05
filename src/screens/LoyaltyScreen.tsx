import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';
import { SafeAreaView } from 'react-native-safe-area-context';

type LoyaltyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoyaltyScreen'>;

const LoyaltyScreen = () => {
  const navigation = useNavigation<LoyaltyScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty Points</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Points Card */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Your Total BB Points</Text>
          <Text style={styles.pointsValue}>50</Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoIcon}>ⓘ</Text>
          <Text style={styles.infoText}>Reach 500 BB points to unlock the reward.</Text>
        </View>

        {/* Active Reward */}
        <View style={styles.rewardCard}>
          <Text style={styles.rewardTitle}>BUY 1 GET 1 Free</Text>
          <Text style={styles.rewardDescription}>
            Book any service, get another service under 500 for free.
          </Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>STYLEB1G1</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.pointsRequired}>500 Points</Text>
        </View>

        {/* Expired Reward */}
        <View style={styles.rewardCard}>
          <View style={styles.rewardHeader}>
            <Text style={styles.rewardTitle}>Buy Shampoo, Get Conditioner Free</Text>
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>Expired</Text>
            </View>
          </View>
          <Text style={styles.rewardDescription}>
            Purchase any salon shampoo (under ₹400) and score a matching conditioner on us—stock up now!
          </Text>
          <View style={styles.divider} />
          <View style={styles.bottomRow}>
            <Text style={styles.pointsRequired}>380 Points</Text>
            <Text style={styles.expiryDate}>Expiry Date: 15 Aug 2025</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Dashboard')}>
          <Image source={require('../assets/home.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('SearchScreen')}>
          <Image source={require('../assets/search.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('ServicesScreen')}>
          <Image source={require('../assets/services.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('ProfileScreen')}>
          <Image source={require('../assets/profile.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoyaltyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
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
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pointsCard: {
    backgroundColor: '#f0f0f0',
    marginTop: 20,
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  pointsValue: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  infoIcon: {
    fontSize: 18,
    color: '#666',
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  rewardCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  codeContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  codeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
    borderStyle: 'dotted',
  },
  pointsRequired: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  expiredBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  expiredText: {
    fontSize: 12,
    color: '#666',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryDate: {
    fontSize: 12,
    color: '#999',
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