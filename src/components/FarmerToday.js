import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMausam } from '../context/MausamContext';
import { GlassCard } from './UI';
import { analyzeSowingSuitability } from '../services/cropAdvisor';

export default function FarmerToday({ onPress }) {
  const { weather, profile, personaContext } = useMausam();
  const theme = {
    card: 'rgba(30, 41, 59, 0.7)',
    text: '#F8FAFC',
    textDim: '#94A3B8',
    border: 'rgba(255,255,255,0.1)'
  };
  
  const selectedCrop = profile?.selectedCrop || null;
  const currentTemp = weather?.current?.temperature || '--';
  const windSpeed = weather?.current?.windspeed || '--';
  const rainChance = weather?.daily?.precipitation_probability_max?.[0] || 0;
  const soilMoisture = personaContext?.soil || 'Normal';
  
  let suitability = null;
  let adviceText = 'Select a crop to see sowing advice.';
  
  if (selectedCrop && weather) {
    const analysis = analyzeSowingSuitability(selectedCrop, weather);
    if (analysis) {
      if (analysis.status === 'optimal') {
        suitability = '🟢';
        adviceText = analysis.recommendation || 'Conditions are optimal for sowing.';
      } else if (analysis.status === 'marginal') {
        suitability = '🟡';
        adviceText = analysis.recommendation || 'Conditions are marginal.';
      } else {
        suitability = '🔴';
        adviceText = analysis.recommendation || 'Wait for better conditions.';
      }
    }
  }

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>🌾 FARMER'S TODAY</Text>
          {suitability && <Text style={styles.suitability}>{suitability}</Text>}
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="water-outline" size={16} color="#60A5FA" />
            <Text style={[styles.statText, { color: theme.text }]}>{rainChance}% Rain</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="leaf-outline" size={16} color="#34D399" />
            <Text style={[styles.statText, { color: theme.text }]}>{soilMoisture}</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
           <View style={styles.statItem}>
            <Ionicons name="thermometer-outline" size={16} color="#F87171" />
            <Text style={[styles.statText, { color: theme.text }]}>{currentTemp}°C</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="speedometer-outline" size={16} color="#A78BFA" />
            <Text style={[styles.statText, { color: theme.text }]}>{windSpeed} km/h</Text>
          </View>
        </View>
        
        <View style={[styles.adviceContainer, { borderTopColor: theme.border }]}>
          <Text style={[styles.adviceText, { color: theme.textDim }]} numberOfLines={2}>
            {adviceText}
          </Text>
        </View>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  card: {
    padding: 16,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  suitability: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
  },
  adviceContainer: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  adviceText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
