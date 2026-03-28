import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Nexus</Text>
      <Text style={styles.subtitle}>3D Modelleme Destekli E-ticaret Platformu</Text>
      <View style={styles.separator} />
      <Text style={styles.info}>
        Bu uygulama, online mobilya ve dekorasyon alışverişinde ölçek belirsizliği sorununu
        çözmek amacıyla geliştirilmiştir.
      </Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  separator: {
    marginVertical: Spacing.lg,
    height: 1,
    width: '80%',
    backgroundColor: Colors.border,
  },
  info: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
