import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BarberMarker = () => {
  return (
    <View style={styles.container}>
      <View style={styles.marker}>
        <Text style={styles.letter}>B</Text>
      </View>
      <View style={styles.triangle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  letter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#000',
    marginTop: -2,
  },
});

export default BarberMarker;