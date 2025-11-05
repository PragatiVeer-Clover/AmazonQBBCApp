import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';

type ServicesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ServicesScreen'>;

const ServicesScreen = () => {
  const navigation = useNavigation<ServicesScreenNavigationProp>();
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeTab, setActiveTab] = useState('Services');
  const [showBranchModal, setShowBranchModal] = useState(false);

  const handleNavigation = (screenName: keyof RootStackParamList) => {
    if (!isNavigating) {
      setIsNavigating(true);
      const mainTabs = ['Dashboard', 'SearchScreen', 'ServicesScreen', 'ProfileScreen'];
      if (mainTabs.includes(screenName)) {
        navigation.replace(screenName);
      } else {
        navigation.navigate(screenName);
      }
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  const branches = [
    { name: 'Ayala Malls Vertis', distance: '200 m away' },
    { name: 'Ayala Heights', distance: '2 km away' },
    { name: 'Commonwealth', distance: '3 km away' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Services / Orders</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Services' && styles.activeTab]}
            onPress={() => setActiveTab('Services')}
          >
            <Text style={[styles.tabText, activeTab === 'Services' && styles.activeTabText]}>Services</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Products' && styles.activeTab]}
            onPress={() => setActiveTab('Products')}
          >
            <Text style={[styles.tabText, activeTab === 'Products' && styles.activeTabText]}>Products</Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        <View style={styles.emptyState}>
          {activeTab === 'Services' ? (
            <>
              <Text style={styles.emptyTitle}>No appointments</Text>
              <Text style={styles.emptySubtitle}>
                Book your first appointment and enjoy a fresh new style at your favorite Bruno's branch.
              </Text>
              <TouchableOpacity style={styles.bookButton} onPress={() => setShowBranchModal(true)}>
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.emptyTitle}>No Purchases Yet</Text>
              <Text style={styles.emptySubtitle}>
                You haven't brought anything so far. Explore our product and make yours first purchase today
              </Text>
              <TouchableOpacity style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Explore Store</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => handleNavigation('Dashboard')}>
          <Image source={require('../assets/home.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => handleNavigation('SearchScreen')}>
          <Image source={require('../assets/search.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <Image source={require('../assets/services.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => handleNavigation('ProfileScreen')}>
          <Image source={require('../assets/profile.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Branch Selection Modal */}
      <Modal
        visible={showBranchModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBranchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <View style={styles.illustrationContainer}>
                <Image source={require('../assets/showservices.png')} style={styles.serviceImage} resizeMode="contain" />
              </View>
              <Text style={styles.modalTitle}>Pickup a Branch For Services</Text>
              <Text style={styles.modalSubtitle}>Choose a branch to explore available services.</Text>
            </View>

            <Text style={styles.selectBranchText}>Select Branch</Text>
            
            {branches.map((branch, index) => (
              <TouchableOpacity key={index} style={styles.branchItem}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <Text style={styles.branchDistance}>{branch.distance}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.changeLocationButton}>
              <Text style={styles.changeLocationText}>Change Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ServicesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#333',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  bookButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  bookButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 30,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  illustrationContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  serviceImage: {
    width: 180,
    height: 180,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  selectBranchText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  branchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  branchName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  branchDistance: {
    fontSize: 14,
    color: '#666',
  },
  changeLocationButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  changeLocationText: {
    fontSize: 16,
    color: '#333',
    textDecorationLine: 'underline',
  },
});