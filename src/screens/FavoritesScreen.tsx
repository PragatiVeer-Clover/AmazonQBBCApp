import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../Navigations';

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FavoritesScreen'>;

interface Branch {
  id: string;
  name: string;
  address: string;
  distance: string;
  isFavorite: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
}

interface BranchCardProps {
  branch: Branch;
}

interface ProductCardProps {
  product: Product;
}

const favoriteBranches = [
  {
    id: '1',
    name: 'Ayala Malls Vertis',
    address: 'Ayala Malls Vertis, North Avenue, Diliman, Quezon City',
    distance: '2.3 km away',
    isFavorite: true,
  },
];

const favoriteProducts: Product[] = [];

const BranchCard = ({ branch }: BranchCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardImageContainer}>
      <Image source={require('../assets/bback.png')} style={styles.cardImage} resizeMode="cover" />
      {branch.isFavorite && (
        <TouchableOpacity style={styles.favoriteIcon}>
          {/* Heart icon color is black, without a background circle */}
          <Text style={styles.heartIcon}>♥</Text> 
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.cardDetails}>
      <Text style={styles.cardTitle}>{branch.name}</Text>
      <Text style={styles.cardAddress}>{branch.address}</Text>
      <View style={styles.distanceContainer}>
        <Image source={require('../assets/locationpin.png')} style={styles.distanceIcon} />
        <Text style={styles.cardDistance}>{branch.distance}</Text>
      </View>
    </View>
  </View>
);

const ProductCard = ({ product }: ProductCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardImageContainer}>
      <Image source={require('../assets/bback.png')} style={styles.cardImage} resizeMode="cover" />
      {product.isFavorite && (
        <TouchableOpacity style={styles.favoriteIcon}>
          {/* Heart icon color is black, without a background circle */}
          <Text style={styles.heartIcon}>♥</Text>
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.cardDetails}>
      <Text style={styles.cardTitle}>{product.name}</Text>
      <Text style={styles.cardAddress}>{product.description}</Text>
    </View>
  </View>
);


// =======================================================
// --- Main Component: FavoritesScreen ---
// =======================================================

const FavoritesScreen = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState('branch');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          {/* Back arrow as a text character */}
          <Text style={styles.backArrow}>←</Text> 
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'branch' && styles.activeTab]} 
          onPress={() => setActiveTab('branch')}
        >
          <Text style={[styles.tabText, activeTab === 'branch' && styles.activeTabText]}>Branch</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'product' && styles.activeTab]} 
          onPress={() => setActiveTab('product')}
        >
          <Text style={[styles.tabText, activeTab === 'product' && styles.activeTabText]}>Product</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'branch' ? (
          <View style={styles.tabContent}>
            {favoriteBranches.map(branch => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </View>
        ) : (
          <View style={styles.tabContent}>
            {favoriteProducts.length > 0 ? (
              favoriteProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nothing Saved Yet</Text>
                <Text style={styles.emptySubtitle}>mark a Product as favorite and it will appear here</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>


    </SafeAreaView>
  );
};

// =======================================================
// --- Stylesheet ---
// =======================================================

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#333',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#F0F0F0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
   
    padding: 5, // Keep small padding for touch area
    zIndex: 1,
  },
  heartIcon: {
    fontSize: 24, // Use a good size for visibility
    color: '#000000', // **Solid Black**
    textAlign: 'center',
  },
  cardDetails: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  cardDistance: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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

export default FavoritesScreen;