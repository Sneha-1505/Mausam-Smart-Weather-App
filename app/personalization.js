import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMausam } from '../src/context/MausamContext';
import { GlassCard } from '../src/components/UI';
import { getPersonaPriorities } from '../src/data/personaPriorities';
import { getAvatarById, AvatarFigure } from '../src/data/avatars';

export default function PersonalizationScreen() {
  const router = useRouter();
  const { profile, colors, isDark } = useMausam();

  const personaKey = profile?.persona || 'farmer';
  const personaConfig = getPersonaPriorities(personaKey);
  const avatar = getAvatarById(profile?.avatar || 'farmer');

  const priorityLabels = personaConfig?.priorities?.map((p) => p.label).join(', ') || 'Rain, Soil Moisture, Wind';

  const routineDate = profile?.routine?.date;
  const routineStart = profile?.routine?.start || '08:30';
  const routineEnd = profile?.routine?.end || '18:00';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#090D14' : '#F6F4EE' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Your Personalization</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Avatar Banner */}
        <GlassCard style={styles.introCard}>
          <AvatarFigure id={avatar.id} size={84} borderColor={colors.accent} style={{ marginBottom: 12 }} />
          <Text style={[styles.introText, { color: colors.text }]}>
            Based on your profile, we've customized your experience for you!
          </Text>
        </GlassCard>

        {/* 1. Your Persona Card */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(74, 222, 128, 0.15)' }]}>
              <Ionicons name="leaf" size={20} color="#4ADE80" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Your Persona: <Text style={{ color: '#4ADE80' }}>{personaKey.charAt(0).toUpperCase() + personaKey.slice(1)}</Text>
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                {personaKey === 'farmer' ? 'Agriculture-focused insights' : 'Personalized lifestyle insights'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* 2. Location Card */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Ionicons name="location" size={20} color="#38BDF8" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Location</Text>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {profile?.location || 'Phagwara, Punjab'}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Local weather, soil & crop data
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* 3. Your Priorities Card */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
              <Ionicons name="sparkles" size={20} color="#FBBF24" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Your Priorities</Text>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {priorityLabels}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                {personaKey === 'farmer' ? 'Important alerts for farming' : 'Tailored metrics and highlights'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* 4. Daily Routine Card */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
              <Ionicons name="alarm" size={20} color="#F97316" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Schedule & Routine</Text>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {routineDate ? `${routineDate} • ` : ''}{routineStart} – {routineEnd}
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Weather updates aligned with your schedule
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Info Callout */}
        <View style={styles.callout}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={[styles.calloutText, { color: colors.textSecondary }]}>
            You can update these anytime in Settings.
          </Text>
        </View>

        {/* Edit Preferences Button */}
        <Pressable
          style={[styles.editBtn, { backgroundColor: colors.accent }]}
          onPress={() => router.push('/preferences')}
        >
          <Text style={styles.editBtnText}>Edit Preferences</Text>
        </Pressable>
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
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    gap: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  introText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  calloutText: {
    fontSize: 12,
  },
  editBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    color: '#090D14',
    fontSize: 15,
    fontWeight: '700',
  },
});
