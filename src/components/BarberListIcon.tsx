import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BarberListIcon = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.letter}>B</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default BarberListIcon;