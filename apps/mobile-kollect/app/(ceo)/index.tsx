import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/app/context/ThemeContext';

export default function CeoDashboardScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Dashboard
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Vue d&apos;ensemble de votre activité
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
});

