import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMausam } from '../src/context/MausamContext';
import { GlassCard } from '../src/components/UI';

export default function PreferencesScreen() {
  const router = useRouter();
  const {
    profile,
    updateProfile,
    resetProfile,
    themeMode,
    setThemeMode,
    colors,
    isDark,
  } = useMausam();

  const [autoLocation, setAutoLocation] = useState(true);

  const handleToggleUnit = () => {
    const nextUnit = profile?.unit === 'F' ? 'C' : 'F';
    updateProfile({ unit: nextUnit });
  };

  const handleToggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Clear all saved profile and preference data and start fresh?'
      );
      if (confirmed) {
        resetProfile();
        router.replace('/welcome');
      }
    } else {
      Alert.alert(
        'Reset Personalization',
        'This will clear saved data and start fresh. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset & Start Fresh',
            style: 'destructive',
            onPress: () => {
              resetProfile();
              router.replace('/welcome');
            },
          },
        ]
      );
    }
  };

  const handleGoToWelcome = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Return to Welcome Page? (You can run onboarding again from there).'
      );
      if (confirmed) {
        updateProfile({ onboardingCompleted: false });
        router.replace('/welcome');
      }
    } else {
      Alert.alert(
        'Go to Welcome Page',
        'Would you like to return to the Welcome Page to restart onboarding?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Welcome',
            onPress: () => {
              updateProfile({ onboardingCompleted: false });
              router.replace('/welcome');
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#090D14' : '#F6F4EE' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>User Preferences</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card}>
          {/* Units */}
          <Pressable style={styles.row} onPress={handleToggleUnit}>
            <View style={styles.rowLeft}>
              <Ionicons name="globe-outline" size={20} color={colors.accent} />
              <Text style={[styles.label, { color: colors.text }]}>Units</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.value, { color: colors.textSecondary }]}>
                °{profile?.unit || 'C'} ({profile?.unit === 'F' ? 'Fahrenheit' : 'Celsius'})
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

          {/* Notification Preferences */}
          <Pressable style={styles.row} onPress={() => router.push('/alerts')}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.accent} />
              <Text style={[styles.label, { color: colors.text }]}>Notification Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

          {/* Auto-location Switch */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="location-outline" size={20} color={colors.accent} />
              <Text style={[styles.label, { color: colors.text }]}>Auto-location</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.value, { color: autoLocation ? '#10B981' : colors.textSecondary }]}>
                {autoLocation ? 'On' : 'Off'}
              </Text>
              <Switch
                value={autoLocation}
                onValueChange={setAutoLocation}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#10B98180' }}
                thumbColor={autoLocation ? '#10B981' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

          {/* Language Auto-detect */}
          <Pressable style={styles.row} onPress={() => router.push('/(tabs)/ai')}>
            <View style={styles.rowLeft}>
              <Ionicons name="language-outline" size={20} color={colors.accent} />
              <View>
                <Text style={[styles.label, { color: colors.text }]}>Language</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  AI will reply in the same language you type
                </Text>
              </View>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.value, { color: colors.accent }]}>Auto-detect</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

          {/* Theme */}
          <Pressable style={styles.row} onPress={handleToggleTheme}>
            <View style={styles.rowLeft}>
              <Ionicons
                name={isDark ? 'moon-outline' : 'sunny-outline'}
                size={20}
                color={colors.accent}
              />
              <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.value, { color: colors.textSecondary }]}>
                {themeMode === 'dark' ? 'Dark' : 'Light'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

          {/* Data & Privacy */}
          <Pressable
            style={styles.row}
            onPress={() => {
              Alert.alert('Data & Privacy', 'Mausam stores all your profile and preference data locally on your device.');
            }}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.accent} />
              <Text style={[styles.label, { color: colors.text }]}>Data & Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

          {/* Reset Personalization */}
          <Pressable style={styles.row} onPress={handleReset}>
            <View style={styles.rowLeft}>
              <Ionicons name="refresh-outline" size={20} color="#F87171" />
              <View>
                <Text style={[styles.label, { color: '#F87171' }]}>Reset Personalization</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
                  Clear saved data and start fresh
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#F87171" />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

          {/* Go to Welcome Page */}
          <Pressable style={styles.row} onPress={handleGoToWelcome}>
            <View style={styles.rowLeft}>
              <Ionicons name="enter-outline" size={20} color={colors.accent} />
              <Text style={[styles.label, { color: colors.accent, fontWeight: '700' }]}>
                Go to Welcome Page
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </Pressable>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 44 : 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  subLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
