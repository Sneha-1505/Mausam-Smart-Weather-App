import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMausam } from "../../src/context/MausamContext";
import { GlassCard } from "../../src/components/UI";

function getAqiDetails(aqi) {
  if (aqi == null) {
    return {
      label: "Unavailable",
      color: "#94A3B8",
      bgColor: "rgba(148, 163, 184, 0.12)",
      advice: "Air quality data is currently unavailable for your location.",
      activityLevel: "Monitor local advice",
    };
  }
  if (aqi <= 50) {
    return {
      label: "Good",
      color: "#4ADE80",
      bgColor: "rgba(74, 222, 128, 0.12)",
      advice: "Air quality is satisfactory and poses little or no risk. Outdoor activities are generally suitable.",
      activityLevel: "Suitable for all outdoor activities",
    };
  }
  if (aqi <= 100) {
    return {
      label: "Moderate",
      color: "#FBBF24",
      bgColor: "rgba(251, 191, 36, 0.12)",
      advice: "Air quality is acceptable. Extremely sensitive individuals should consider limiting prolonged outdoor exertion.",
      activityLevel: "Normal outdoor activity",
    };
  }
  if (aqi <= 150) {
    return {
      label: "Unhealthy for Sensitive Groups",
      color: "#FB923C",
      bgColor: "rgba(251, 146, 60, 0.12)",
      advice: "Members of sensitive groups may experience health effects. Limit prolonged outdoor exertion.",
      activityLevel: "Reduce heavy exertion outdoors",
    };
  }
  if (aqi <= 200) {
    return {
      label: "Unhealthy",
      color: "#F87171",
      bgColor: "rgba(248, 113, 113, 0.15)",
      advice: "Everyone may begin to experience health effects. Wear an N95 mask and keep windows closed.",
      activityLevel: "Move workouts indoors",
    };
  }
  return {
    label: "Very Unhealthy / Hazardous",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.2)",
    advice: "Health alert: serious risk for the entire population. Avoid all outdoor physical activity.",
    activityLevel: "Stay strictly indoors",
  };
}

export default function Earth() {
  const {
    weather,
    personaContext,
    profile,
    colors,
    isDark,
    weatherLoading,
    weatherError,
    loadWeather,
  } = useMausam();

  const current = weather?.current || {};
  const temp = Math.round(current.temperature_2m ?? 24);
  const feelsLike = Math.round(current.apparent_temperature ?? temp);
  const humidity = Math.round(current.relative_humidity_2m ?? 50);
  const windSpeed = Math.round(current.wind_speed_10m ?? 12);
  const uv = Math.round(current.uv_index ?? 3);
  const visibility = current.visibility != null ? (current.visibility / 1000).toFixed(1) : "10.0";

  const airCurrent = personaContext?.air?.current || {};
  const aqi = airCurrent.us_aqi != null ? Math.round(airCurrent.us_aqi) : null;
  const pm25 = airCurrent.pm2_5 != null ? Math.round(airCurrent.pm2_5) : null;
  const pm10 = airCurrent.pm10 != null ? Math.round(airCurrent.pm10) : null;
  const ozone = airCurrent.ozone != null ? Math.round(airCurrent.ozone) : null;
  const no2 = airCurrent.nitrogen_dioxide != null ? Math.round(airCurrent.nitrogen_dioxide) : null;

  const aqiDetails = getAqiDetails(aqi);

  // Loading state
  if (weatherLoading && !weather?.current) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#090D14' : '#F6F4EE' }]}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.stateTitle, { color: colors.text }]}>Loading Air Quality Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (weatherError && !weather?.current) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#090D14' : '#F6F4EE' }]}>
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.stateTitle, { color: colors.text }]}>Unable to Load Data</Text>
          <Text style={[styles.stateMessage, { color: colors.textSecondary }]}>
            {weatherError || 'Check your connection and try again.'}
          </Text>
          <Pressable
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            onPress={() => loadWeather(null, null, true)}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#090D14" : "#F6F4EE" }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.accent }]}>ATMOSPHERIC HEALTH</Text>
          <Text style={[styles.title, { color: colors.text }]}>Air & Environment</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Real-time environmental diagnostics & outdoor safety recommendations for {profile?.location || "your location"}.
          </Text>
        </View>

        {/* Hero AQI Card */}
        <GlassCard style={[styles.heroCard, { borderColor: aqiDetails.color + "40" }]}>
          <View style={styles.aqiTopRow}>
            <View>
              <Text style={[styles.aqiKicker, { color: colors.textSecondary }]}>AIR QUALITY INDEX (US AQI)</Text>
              <View style={styles.aqiScoreRow}>
                <Text style={[styles.aqiScore, { color: aqiDetails.color }]}>{aqi ?? "--"}</Text>
                <View style={[styles.aqiBadge, { backgroundColor: aqiDetails.bgColor, borderColor: aqiDetails.color }]}>
                  <Text style={[styles.aqiBadgeText, { color: aqiDetails.color }]}>{aqiDetails.label}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.aqiIconCircle, { backgroundColor: aqiDetails.bgColor }]}>
              <Ionicons name="leaf" size={28} color={aqiDetails.color} />
            </View>
          </View>

          <Text style={[styles.aqiAdvice, { color: colors.text }]}>{aqiDetails.advice}</Text>

          <View style={[styles.activityBox, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }]}>
            <Ionicons name="fitness-outline" size={16} color={colors.accent} />
            <Text style={[styles.activityText, { color: colors.text }]}>
              Activity Guidance: <Text style={{ fontWeight: "700" }}>{aqiDetails.activityLevel}</Text>
            </Text>
          </View>
        </GlassCard>

        {/* Pollutants Breakdown */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Particulate & Pollutant Levels</Text>
        <View style={styles.pollutantsGrid}>
          <GlassCard style={styles.pollutantCard}>
            <Text style={[styles.pollutantLabel, { color: colors.textSecondary }]}>PM2.5 (Fine Particles)</Text>
            <Text style={[styles.pollutantValue, { color: colors.text }]}>{pm25 != null ? `${pm25} µg/m³` : "--"}</Text>
            <Text style={[styles.pollutantStatus, { color: pm25 != null && pm25 <= 35 ? "#4ADE80" : "#F87171" }]}>
              {pm25 != null ? (pm25 <= 35 ? "Good" : pm25 <= 55 ? "Moderate" : "Elevated") : "Unknown"}
            </Text>
          </GlassCard>

          <GlassCard style={styles.pollutantCard}>
            <Text style={[styles.pollutantLabel, { color: colors.textSecondary }]}>PM10 (Coarse Dust)</Text>
            <Text style={[styles.pollutantValue, { color: colors.text }]}>{pm10 != null ? `${pm10} µg/m³` : "--"}</Text>
            <Text style={[styles.pollutantStatus, { color: pm10 != null && pm10 <= 50 ? "#4ADE80" : "#F87171" }]}>
              {pm10 != null ? (pm10 <= 50 ? "Good" : pm10 <= 100 ? "Moderate" : "Elevated") : "Unknown"}
            </Text>
          </GlassCard>

          <GlassCard style={styles.pollutantCard}>
            <Text style={[styles.pollutantLabel, { color: colors.textSecondary }]}>Ozone (O₃)</Text>
            <Text style={[styles.pollutantValue, { color: colors.text }]}>{ozone != null ? `${ozone} µg/m³` : "--"}</Text>
            <Text style={[styles.pollutantStatus, { color: ozone != null && ozone <= 100 ? "#4ADE80" : "#FBBF24" }]}>
              {ozone != null ? (ozone <= 100 ? "Acceptable" : "Elevated") : "Unknown"}
            </Text>
          </GlassCard>

          <GlassCard style={styles.pollutantCard}>
            <Text style={[styles.pollutantLabel, { color: colors.textSecondary }]}>Nitrogen Dioxide</Text>
            <Text style={[styles.pollutantValue, { color: colors.text }]}>{no2 != null ? `${no2} µg/m³` : "--"}</Text>
            <Text style={[styles.pollutantStatus, { color: no2 != null && no2 <= 40 ? "#4ADE80" : "#FBBF24" }]}>
              {no2 != null ? (no2 <= 40 ? "Safe" : "Moderate") : "Unknown"}
            </Text>
          </GlassCard>
        </View>

        {/* Environmental Indicators */}
        <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 12 }]}>Environmental Diagnostics</Text>
        <View style={styles.metricsGrid}>
          {/* Humidity */}
          <GlassCard style={styles.metricTile}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>💧</Text>
              <Text style={[styles.metricName, { color: colors.textSecondary }]}>Humidity</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{humidity}%</Text>
            <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
              {humidity >= 70 ? "Humid air" : humidity <= 30 ? "Dry atmosphere" : "Comfortable range"}
            </Text>
          </GlassCard>

          {/* Visibility */}
          <GlassCard style={styles.metricTile}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>👁️</Text>
              <Text style={[styles.metricName, { color: colors.textSecondary }]}>Visibility</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{visibility} km</Text>
            <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
              {parseFloat(visibility) >= 9 ? "Clear atmospheric horizon" : "Hazy / reduced"}
            </Text>
          </GlassCard>

          {/* UV Index */}
          <GlassCard style={styles.metricTile}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>☀️</Text>
              <Text style={[styles.metricName, { color: colors.textSecondary }]}>Solar UV</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{uv}</Text>
            <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
              {uv >= 8 ? "Very high — skin protection required" : uv >= 5 ? "Moderate sunlight" : "Low exposure"}
            </Text>
          </GlassCard>

          {/* Wind Speed */}
          <GlassCard style={styles.metricTile}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>🌬️</Text>
              <Text style={[styles.metricName, { color: colors.textSecondary }]}>Surface Wind</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{windSpeed} km/h</Text>
            <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
              {windSpeed >= 35 ? "Gusty & strong" : windSpeed >= 15 ? "Moderate breeze" : "Light wind"}
            </Text>
          </GlassCard>
        </View>

        {/* Outdoor Health Safety Card */}
        <GlassCard style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={[styles.safetyTitle, { color: colors.text }]}>Outdoor Health Safety</Text>
          </View>
          <Text style={[styles.safetyText, { color: colors.textSecondary }]}>
            • Sensitive groups: {aqi != null && aqi > 100 ? "Limit long outdoor walks or heavy workouts." : "Conditions are safe for general recreation."}
            {"\n"}
            • Eye & skin health: {uv >= 6 ? "Wear UV400 sunglasses and apply SPF 30+." : "Standard protection sufficient."}
            {"\n"}
            • Ventilation: {aqi != null && aqi <= 100 ? "Natural room ventilation recommended." : "Keep indoor windows closed during peak traffic hours."}
          </Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroCard: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 24,
  },
  aqiTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  aqiKicker: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  aqiScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aqiScore: {
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1,
  },
  aqiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  aqiBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  aqiIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  aqiAdvice: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  activityBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  activityText: {
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  pollutantsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  pollutantCard: {
    width: "48%",
    padding: 14,
    borderRadius: 16,
  },
  pollutantLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  pollutantValue: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  pollutantStatus: {
    fontSize: 11,
    fontWeight: "700",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  metricTile: {
    width: "48%",
    padding: 14,
    borderRadius: 16,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  metricIcon: {
    fontSize: 16,
  },
  metricName: {
    fontSize: 12,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 11,
    lineHeight: 14,
  },
  safetyCard: {
    padding: 16,
    borderRadius: 18,
    marginTop: 6,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  safetyText: {
    fontSize: 12,
    lineHeight: 18,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  stateMessage: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  retryBtnText: {
    color: '#090D14',
    fontSize: 14,
    fontWeight: '700',
  },
});
