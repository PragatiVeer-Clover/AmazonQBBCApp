import React, { FC } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const OffersScreens = () => {
  const navigation = useNavigation();
  
  const offersData = [
    {
      id: 1,
      title: 'Summer Discount Offer',
      description: 'Enjoy 15% off your next haircut or grooming service.!',
      date: 'August 18, 2025 - August 31, 2025',
      code: 'BARBER15',
    },
    {
      id: 2,
      title: 'Festive Grooming Offer',
      description: 'Get ₹200 off on any premium haircut or beard service.',
      date: 'October 10, 2025 – October 25, 2025',
      code: 'FESTIVE200',
    },
    {
      id: 3,
      title: 'Weekend Treat Offer',
      description:
        'Enjoy 20% off when you book your appointment on a Saturday or Sunday.',
      date: 'October 5, 2025 – October 20, 2025',
      code: 'WEEKEND20',
    },
  ];

  const renderItems = ({ item }: any) => {
    return (
      <View style={styles.offerCard}>
        <Text style={styles.offerTitle}>{item.title}</Text>
        <Text style={styles.offerSubtitle}>{item.description}</Text>
        <View style={styles.codeView}>
          <Text style={styles.codeText}>{item.code}</Text>
        </View>
        <Text style={styles.offerSubtitle}>
          <Text style={styles.validityLabel}>Validity: </Text>
          {item.date}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.icon}> {'<'} </Text>
      </TouchableOpacity>
      <Text style={styles.title}>Offers</Text>
      <FlatList
        data={offersData}
        renderItem={renderItems}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  icon: {
    fontSize: 24,
    color: '#333',
    marginBottom: 15,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  offerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  codeView: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 10,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  validityLabel: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default OffersScreens;
