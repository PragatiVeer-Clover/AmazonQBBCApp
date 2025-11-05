import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';

type LoyaltyPointsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoyaltyPointsScreen'>;

const mockRewards = [
  { id: '1', name: '10% Off Next Order', expires: '2025-12-31', status: 'unexpired', pointsCost: 500 },
  { id: '2', name: 'Free Coffee', expires: '2025-11-05', status: 'unexpired', pointsCost: 100 },
  { id: '3', name: '20% Off All Items', expires: '2024-01-01', status: 'expired', pointsCost: 800 },
];
const userPoints = 750;
const nextTierGoal = 1000;
const currentTier = 'Silver';
const nextTier = 'Gold';

const RewardItem = ({ reward, isExpired }: { reward: any; isExpired: boolean }) => (
    <View style={[styles.rewardCard, isExpired && styles.expiredCard]}>
        <View style={styles.rewardDetails}>
            <Text style={styles.rewardName}>{reward.name}</Text>
            <Text style={styles.rewardCost}>{reward.pointsCost} Points</Text>
            <Text style={styles.rewardExpiry}>
                {isExpired ? 'Expired on:' : 'Expires:'} {reward.expires}
            </Text>
        </View>
        <TouchableOpacity 
            style={[styles.redeemButton, isExpired && styles.disabledButton]}
            disabled={isExpired}
        >
            <Text style={styles.redeemButtonText}>
                {isExpired ? 'Expired' : 'Redeem'}
            </Text>
        </TouchableOpacity>
    </View>
);

const RewardList = ({ data, isExpired = false }: { data: any[]; isExpired?: boolean }) => (
  <FlatList
    data={data}
    renderItem={({ item }) => <RewardItem reward={item} isExpired={isExpired} />}
    keyExtractor={(item) => item.id}
    contentContainerStyle={styles.listContainer}
  />
);


const LoyaltyPointsScreen = () => {
  const navigation = useNavigation<LoyaltyPointsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState('unexpired');
  
  const progressValue = userPoints / nextTierGoal;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty Points</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Points Header Section */}
      <View style={styles.header}>
        <Image source={require('../assets/loyalitypoint.png')} style={styles.loyaltyIcon} resizeMode="contain" />
        <Text style={styles.pointsTitle}>Your Loyalty Points</Text>
        <Text style={styles.pointsCount}>{userPoints}</Text>
        <Text style={styles.tierText}>Current Tier: {currentTier}</Text>
      </View>

      {/* Progress Bar Section */}
      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          {nextTierGoal - userPoints} points to reach {nextTier}
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressValue * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
            <Text style={styles.tierLabel}>{currentTier}</Text>
            <Text style={styles.tierLabel}>{nextTier}</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'unexpired' && styles.activeTab]}
          onPress={() => setActiveTab('unexpired')}
        >
          <Text style={[styles.tabText, activeTab === 'unexpired' && styles.activeTabText]}>Unexpired</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'expired' && styles.activeTab]}
          onPress={() => setActiveTab('expired')}
        >
          <Text style={[styles.tabText, activeTab === 'expired' && styles.activeTabText]}>Expired</Text>
        </TouchableOpacity>
      </View>

      {/* Rewards List */}
      <View style={styles.rewardsContainer}>
        <RewardList 
          data={mockRewards.filter(r => r.status === activeTab)} 
          isExpired={activeTab === 'expired'} 
        />
      </View>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  loyaltyIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  pointsTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '400',
  },
  pointsCount: {
    fontSize: 48,
    color: '#FFC107',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  tierText: {
    fontSize: 14,
    color: '#FFF',
  },
  progressCard: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#333',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierLabel: {
    fontSize: 12,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  rewardsContainer: {
    flex: 1,
  },
  listContainer: {
    padding: 10,
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  expiredCard: {
    opacity: 0.6,
    borderLeftColor: '#D32F2F',
  },
  rewardDetails: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rewardCost: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  rewardExpiry: {
    fontSize: 12,
    color: '#999',
  },
  redeemButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  redeemButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
});

export default LoyaltyPointsScreen;