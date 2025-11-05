import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safeArea?: boolean;
  padding?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  safeArea = true,
  padding = true,
}) => {
  const Wrapper = safeArea ? SafeAreaView : View;
  
  return (
    <Wrapper style={[styles.container, style]}>
      <View style={[padding && styles.padding, style]}>
        {children}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  padding: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
});

export default Container;