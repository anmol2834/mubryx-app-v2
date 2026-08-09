import { View, Text, StyleSheet } from 'react-native';
import { Brand, Typography } from '@/constants/brand';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Explore</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.white },
  text: { ...Typography.h2, color: Brand.textPrimary },
});
