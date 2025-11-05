import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchScreen'>;

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [isNavigating, setIsNavigating] = useState(false);

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
  const categories = ['Facewash', 'Hair cream', 'Hair wax', 'grooming'];
  const recentSearches = [
    'Trending hair products',
    'Best grooming products',
    'Best-selling hair wax'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={[styles.searchIcon, { fontSize: 20, color: '#999' }]}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products and branches ..."
            placeholderTextColor="#999"
          />
        </View>

        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryChip}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recently Searched Section */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recently Searched</Text>
            <TouchableOpacity>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {recentSearches.map((search, index) => (
            <TouchableOpacity key={index} style={styles.recentItem}>
              <View style={styles.clockIcon}>
                <Text style={{ fontSize: 16, color: '#666' }}>🕐</Text>
              </View>
              <Text style={styles.recentText}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem} onPress={() => handleNavigation('Dashboard')}>
          <Image source={require('../assets/home.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <Image source={require('../assets/search.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => handleNavigation('ServicesScreen')}>
          <Image source={require('../assets/services.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem} onPress={() => handleNavigation('ProfileScreen')}>
          <Image source={require('../assets/profile.png')} style={styles.footerIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  recentSection: {
    paddingBottom: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearAll: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recentText: {
    fontSize: 16,
    color: '#333',
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
