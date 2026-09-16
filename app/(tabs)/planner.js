import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMausam } from "../../src/context/MausamContext";
import {
  searchLocations,
  getWeather,
  getWeatherInfo,
} from "../../src/services/weather";
import { getCarryAndWearRecommendations } from "../../src/services/whatToCarry";
import { GlassCard } from "../../src/components/UI";

function round(v) {
  if (v == null || isNaN(Number(v))) return "--";
  return Math.round(Number(v));
}

function formatTime12h(isoString) {
  if (!isoString) return "--";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function aqiLabel(aqi) {
  if (aqi == null) return null;
  if (aqi <= 50) return { label: "Good", color: "#4ADE80" };
  if (aqi <= 100) return { label: "Moderate", color: "#FACC15" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "#FB923C" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#F87171" };
  return { label: "Very Unhealthy", color: "#C084FC" };
}

function uvLabel(uv) {
  if (uv == null) return "—";
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

/* =========================================================
   TRAVEL RESULT CARD
========================================================= */

function TravelResult({ result, persona }) {
  const { destinationName, weather, aqi, dayOffset = 0 } = result;
  const daily = weather?.daily || {};
  const code = daily?.weather_code?.[dayOffset] ?? 0;
  const info = getWeatherInfo(code);

  const rainProb = daily?.precipitation_probability_max?.[dayOffset] ?? 0;
  const maxTemp = daily?.temperature_2m_max?.[dayOffset];
  const minTemp = daily?.temperature_2m_min?.[dayOffset];
  const maxUV = daily?.uv_index_max?.[dayOffset];
  const maxWind = daily?.wind_speed_10m_max?.[dayOffset];
  const sunrise = daily?.sunrise?.[dayOffset];
  const sunset = daily?.sunset?.[dayOffset];

  // Dynamic persona + destination weather packing
  const recs = getCarryAndWearRecommendations({
    persona,
    weather: {
      current: {
        temperature_2m: maxTemp,
        apparent_temperature: maxTemp,
        weather_code: code,
        wind_speed_10m: maxWind,
        uv_index: maxUV,
      },
      daily,
    },
    personaContext: { air: { current: { us_aqi: aqi } } },
  });

  const aqiInfo = aqi != null ? aqiLabel(aqi) : null;

  // Weather Risks & Disruptions
  const risks = [];
  if (rainProb >= 60) risks.push("🌧️ High rain likelihood: Keep flexible itinerary and waterproof bags.");
  if (maxTemp != null && maxTemp >= 38) risks.push("🌡️ Intense heat wave: Stay hydrated and avoid outdoor exertion between 12:00 PM and 4:00 PM.");
  if (minTemp != null && minTemp <= 6) risks.push("🥶 Frost / severe cold: Pack heavy winter thermal insulation.");
  if (maxUV != null && maxUV >= 8) risks.push("☀️ Dangerous UV levels: High sunburn risk in open areas.");
  if (maxWind != null && maxWind >= 45) risks.push("💨 Strong winds: Potential flight/road connection delays.");
  if ([95, 96, 99].includes(code)) risks.push("⛈️ Thunderstorm active: Keep indoor options ready.");
  if (aqi != null && aqi >= 151) risks.push("😷 Elevated air pollution: Carry certified N95 respirators.");

  return (
    <GlassCard style={styles.resultCard}>
      {/* Header */}
      <View style={styles.resultHeader}>
        <View style={styles.resultIconBox}>
          <Ionicons name={info.icon} size={30} color="#38BDF8" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.resultCity}>{destinationName}</Text>
          <Text style={styles.resultCondition}>{info.label}</Text>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.resultMetrics}>
        <View style={styles.resultMetric}>
          <Ionicons name="thermometer-outline" size={16} color="#FB923C" />
          <Text style={styles.resultMetricText}>
            {round(maxTemp)}° / {round(minTemp)}°C
          </Text>
          <Text style={styles.resultMetricLabel}>High / Low</Text>
        </View>
        <View style={styles.resultMetric}>
          <Ionicons name="rainy-outline" size={16} color="#38BDF8" />
          <Text style={styles.resultMetricText}>{round(rainProb)}%</Text>
          <Text style={styles.resultMetricLabel}>Rain Prob</Text>
        </View>
        <View style={styles.resultMetric}>
          <Ionicons name="sunny-outline" size={16} color="#FACC15" />
          <Text style={styles.resultMetricText}>{round(maxUV)} ({uvLabel(maxUV)})</Text>
          <Text style={styles.resultMetricLabel}>UV Level</Text>
        </View>
        <View style={styles.resultMetric}>
          <Ionicons name="navigate-outline" size={16} color="#34D399" />
          <Text style={styles.resultMetricText}>{round(maxWind)} km/h</Text>
          <Text style={styles.resultMetricLabel}>Max Wind</Text>
        </View>
      </View>

      {/* AQI Pill */}
      {aqiInfo && (
        <View style={[styles.aqiRow, { borderColor: `${aqiInfo.color}40`, backgroundColor: `${aqiInfo.color}10` }]}>
          <Text style={[styles.aqiDot, { color: aqiInfo.color }]}>●</Text>
          <Text style={styles.aqiText}>
            Air Quality: <Text style={{ color: aqiInfo.color, fontWeight: "700" }}>{aqiInfo.label}</Text>
            {aqi != null ? ` (AQI ${round(aqi)})` : ""}
          </Text>
        </View>
      )}

      {/* Sunrise / Sunset */}
      {(sunrise || sunset) && (
        <View style={styles.sunRow}>
          <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.sunText}>
            Sunrise: {sunrise ? formatTime12h(sunrise) : "--"}  ·  Sunset: {sunset ? formatTime12h(sunset) : "--"}
          </Text>
        </View>
      )}

      {/* What to wear */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeading}>👗 Recommended Clothing</Text>
        {recs.wear.map((item, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.listIcon}>{item.icon}</Text>
            <Text style={styles.listText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* What to carry */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeading}>🎒 What to Pack & Carry</Text>
        {recs.carry.map((item, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.listIcon}>{item.icon}</Text>
            <Text style={styles.listText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Risks & Precautions */}
      {risks.length > 0 && (
        <View style={styles.riskBlock}>
          <Text style={styles.riskHeading}>⚠️ Weather Risks & Precautions</Text>
          {risks.map((risk, i) => (
            <Text key={i} style={styles.riskText}>{risk}</Text>
          ))}
        </View>
      )}

      {/* Best Outdoor Time */}
      <View style={styles.bestTimeBlock}>
        <Text style={styles.bestTimeTitle}>🌤️ Optimal Outdoor Travel Window</Text>
        <Text style={styles.bestTimeDesc}>
          {rainProb >= 60
            ? "High precipitation expected: Prefer morning sightseeing (8:30 AM – 11:30 AM) before afternoon downpours."
            : maxUV != null && maxUV >= 8
            ? "High UV radiation: Best windows are early morning (7:00 AM – 10:30 AM) and late afternoon after 4:30 PM."
            : "Comfortable atmospheric conditions for daytime travel and outdoor exploration."}
        </Text>
      </View>
    </GlassCard>
  );
}

/* =========================================================
   PLANNER TAB
========================================================= */

const INITIAL_PLAN = [
  ["8:30 AM", "Morning Departure", "Comfortable window", "🌤️"],
  ["11:00 AM", "Travel / Sightseeing", "Check UV levels", "☀️"],
  ["1:30 PM", "Lunch & Shaded Rest", "Peak temperature", "🥤"],
  ["4:45 PM", "Afternoon Exploration", "Pleasant breeze", "🌤️"],
  ["7:30 PM", "Evening Return", "Stable conditions", "🌙"],
];

const DATE_OPTIONS = [
  { label: "Today", offset: 0 },
  { label: "Tomorrow", offset: 1 },
  { label: "In 2 Days", offset: 2 },
  { label: "In 3 Days", offset: 3 },
  { label: "This Weekend", offset: 4 },
];

export default function Planner() {
  const { profile, colors, isDark } = useMausam();
  const accent = colors.accent || "#D99A3D";

  /* ── Travel planner state ──────────────────────────── */
  const [destination, setDestination] = useState("");
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingTravel, setIsLoadingTravel] = useState(false);
  const [travelResult, setTravelResult] = useState(null);
  const [travelError, setTravelError] = useState("");

  /* ── Day planner state ─────────────────────────────── */
  const [items, setItems] = useState(INITIAL_PLAN);
  const [showAdd, setShowAdd] = useState(false);
  const [newActivity, setNewActivity] = useState("");
  const [newTime, setNewTime] = useState("3:00 PM");

  /* ── Search locations ──────────────────────────────── */
  const handleDestinationChange = useCallback(async (text) => {
    setDestination(text);
    setSelectedLocation(null);
    setTravelResult(null);
    setTravelError("");

    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      setIsSearching(true);
      const results = await searchLocations(text);
      setSuggestions(results.slice(0, 5));
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const selectLocation = (loc) => {
    setSelectedLocation(loc);
    setDestination(`${loc.name}${loc.region ? `, ${loc.region}` : ""}${loc.country ? `, ${loc.country}` : ""}`);
    setSuggestions([]);
  };

  /* ── Search travel weather ─────────────────────────── */
  const handleSearchTravel = useCallback(async () => {
    if (!selectedLocation) {
      setTravelError("Please search and select a destination from the list.");
      return;
    }
    try {
      setIsLoadingTravel(true);
      setTravelError("");
      setTravelResult(null);

      const [weatherData, aqiData] = await Promise.allSettled([
        getWeather(selectedLocation.latitude, selectedLocation.longitude),
        fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality` +
          `?latitude=${selectedLocation.latitude}&longitude=${selectedLocation.longitude}` +
          `&current=us_aqi&timezone=auto`
        ).then((r) => r.json()),
      ]);

      const weather = weatherData.status === "fulfilled" ? weatherData.value : null;
      const aqi = aqiData.status === "fulfilled" ? aqiData.value?.current?.us_aqi ?? null : null;

      if (!weather) throw new Error("Unable to fetch forecast data for this destination.");

      setTravelResult({
        destinationName: selectedLocation.name,
        weather,
        aqi,
        dayOffset: selectedDayOffset,
      });
    } catch (err) {
      setTravelError(err.message || "Unable to fetch destination weather.");
    } finally {
      setIsLoadingTravel(false);
    }
  }, [selectedLocation, selectedDayOffset]);

  const addActivity = () => {
    if (!newActivity.trim()) return;
    setItems((prev) => [...prev, [newTime || "3:00 PM", newActivity, "Weather-aware", "🌤️"]]);
    setNewActivity("");
    setShowAdd(false);
  };

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: isDark ? "#090D14" : "#F6F4EE" }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: accent }]}>TRAVEL & DAY PLANNER</Text>
        <Text style={[styles.h1, { color: colors.text }]}>Intelligent Travel Planner</Text>
        <Text style={[styles.copy, { color: colors.textSecondary }]}>
          Forecasts, what to pack, precautions, and outdoor timing for your journeys.
        </Text>
      </View>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TRAVEL DESTINATION WEATHER SEARCH
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <GlassCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="airplane-outline" size={18} color="#38BDF8" />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Destination Weather & Packing</Text>
        </View>

        {/* Input */}
        <View style={styles.inputRow}>
          <Ionicons name="search-outline" size={18} color={accent} />
          <TextInput
            value={destination}
            onChangeText={handleDestinationChange}
            placeholder="Search destination (e.g. Manali, Chandigarh, Delhi)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.textInput}
          />
          {isSearching && <ActivityIndicator size="small" color={accent} />}
        </View>

        {/* Autocomplete suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            {suggestions.map((loc, i) => (
              <Pressable
                key={i}
                onPress={() => selectLocation(loc)}
                style={[styles.suggestionRow, i < suggestions.length - 1 && styles.suggestionDivider]}
              >
                <Ionicons name="location-outline" size={15} color={accent} />
                <Text style={styles.suggestionText}>
                  {loc.name}
                  {loc.region ? `, ${loc.region}` : ""}
                  {loc.country ? ` (${loc.country})` : ""}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Travel Date Pills */}
        <Text style={[styles.datePickerLabel, { color: colors.textSecondary }]}>Select Travel Window</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datePills}>
          {DATE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.offset}
              onPress={() => setSelectedDayOffset(opt.offset)}
              style={[
                styles.datePill,
                {
                  backgroundColor: selectedDayOffset === opt.offset
                    ? `${accent}30`
                    : "rgba(255,255,255,0.05)",
                  borderColor: selectedDayOffset === opt.offset ? accent : "rgba(255,255,255,0.1)",
                },
              ]}
            >
              <Text
                style={[
                  styles.datePillText,
                  { color: selectedDayOffset === opt.offset ? accent : colors.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search Submit Button */}
        <Pressable
          onPress={handleSearchTravel}
          disabled={!selectedLocation || isLoadingTravel}
          style={[
            styles.searchButton,
            {
              backgroundColor: selectedLocation ? accent : "rgba(255,255,255,0.08)",
              opacity: isLoadingTravel ? 0.6 : 1,
            },
          ]}
        >
          {isLoadingTravel ? (
            <ActivityIndicator size="small" color="#090D14" />
          ) : (
            <>
              <Ionicons
                name="compass-outline"
                size={18}
                color={selectedLocation ? "#090D14" : "rgba(255,255,255,0.4)"}
              />
              <Text
                style={[
                  styles.searchButtonText,
                  { color: selectedLocation ? "#090D14" : "rgba(255,255,255,0.4)" },
                ]}
              >
                Analyze Travel Conditions
              </Text>
            </>
          )}
        </Pressable>
      </GlassCard>

      {/* Error display */}
      {!!travelError && (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={16} color="#F87171" />
          <Text style={styles.errorText}>{travelError}</Text>
        </View>
      )}

      {/* Detailed Travel Results Card */}
      {travelResult && <TravelResult result={travelResult} persona={profile?.persona} />}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TODAY'S SCHEDULE & WEATHER WINDOWS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <View style={{ marginTop: 24, marginBottom: 12 }}>
        <View style={styles.scheduleHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule & Windows</Text>
          <Pressable
            onPress={() => setShowAdd((v) => !v)}
            style={[styles.addBtn, { borderColor: `${accent}50` }]}
          >
            <Ionicons name="add" size={16} color={accent} />
            <Text style={[styles.addBtnText, { color: accent }]}>Add</Text>
          </Pressable>
        </View>

        {showAdd && (
          <GlassCard style={{ marginBottom: 12, gap: 8 }}>
            <TextInput
              value={newTime}
              onChangeText={setNewTime}
              placeholder="Time (e.g. 2:30 PM)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={styles.addInput}
            />
            <TextInput
              value={newActivity}
              onChangeText={setNewActivity}
              placeholder="Activity name (e.g. Evening walk in park)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={styles.addInput}
              onSubmitEditing={addActivity}
            />
            <Pressable onPress={addActivity} style={[styles.searchButton, { backgroundColor: accent, height: 42 }]}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#090D14" }}>Save Activity</Text>
            </Pressable>
          </GlassCard>
        )}

        {items.map((item, i) => (
          <View key={i} style={styles.timelineItem}>
            <Text style={[styles.timelineTimeText, { color: accent }]}>{item[0]}</Text>
            <View style={styles.timelineBar}>
              <View style={[styles.timelineDot, { backgroundColor: accent }]} />
              {i < items.length - 1 && <View style={[styles.timelineLine, { backgroundColor: `${accent}35` }]} />}
            </View>
            <GlassCard style={styles.timelineContentCard}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>{item[1]}</Text>
                <Text style={[styles.activitySub, { color: colors.textSecondary }]}>{item[2]}</Text>
              </View>
              <Text style={{ fontSize: 20 }}>{item[3]}</Text>
            </GlassCard>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: 20, paddingTop: 48, paddingBottom: 40 },
  header: { marginBottom: 20 },
  kicker: { fontSize: 10, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  h1: { fontSize: 28, fontWeight: "900", letterSpacing: -0.6 },
  copy: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  sectionCard: { marginBottom: 18, padding: 18 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  textInput: { flex: 1, color: "#FFFFFF", fontSize: 13 },
  suggestionsBox: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: "#141C26",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  suggestionText: { color: "rgba(255,255,255,0.85)", fontSize: 13, flex: 1 },
  datePickerLabel: { fontSize: 11, fontWeight: "700", marginTop: 14, marginBottom: 8 },
  datePills: { flexDirection: "row", gap: 8, marginBottom: 14 },
  datePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  datePillText: { fontSize: 12, fontWeight: "700" },
  searchButton: {
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  searchButtonText: { fontSize: 14, fontWeight: "800" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.35)",
  },
  errorText: { flex: 1, color: "#F87171", fontSize: 12 },
  resultCard: { marginBottom: 20, padding: 18, gap: 14 },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  resultIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(56,189,248,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultCity: { fontSize: 20, fontWeight: "900", color: "#FFFFFF" },
  resultCondition: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  resultMetrics: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  resultMetric: {
    flex: 1,
    minWidth: 70,
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    gap: 4,
  },
  resultMetricText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  resultMetricLabel: { color: "rgba(255,255,255,0.45)", fontSize: 9 },
  aqiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  aqiDot: { fontSize: 12 },
  aqiText: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  sunRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sunText: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  sectionBlock: { gap: 6 },
  sectionHeading: { fontSize: 13, fontWeight: "800", color: "#FFFFFF", marginBottom: 2 },
  listItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  listIcon: { fontSize: 15 },
  listText: { color: "rgba(255,255,255,0.85)", fontSize: 12, flex: 1 },
  riskBlock: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(251,146,60,0.12)",
    borderWidth: 1,
    borderColor: "rgba(251,146,60,0.35)",
    gap: 6,
  },
  riskHeading: { fontSize: 12, fontWeight: "800", color: "#FB923C" },
  riskText: { fontSize: 11, color: "rgba(255,255,255,0.85)", lineHeight: 16 },
  bestTimeBlock: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(56,189,248,0.10)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
    gap: 4,
  },
  bestTimeTitle: { fontSize: 12, fontWeight: "800", color: "#38BDF8" },
  bestTimeDesc: { fontSize: 11, color: "rgba(255,255,255,0.8)", lineHeight: 16 },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  addBtnText: { fontSize: 12, fontWeight: "700" },
  addInput: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    color: "#FFFFFF",
    fontSize: 13,
  },
  timelineItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  timelineTimeText: { width: 68, fontSize: 11, fontWeight: "800" },
  timelineBar: { alignItems: "center", width: 20, height: 50, justifyContent: "center" },
  timelineDot: { width: 8, height: 8, borderRadius: 4 },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },
  timelineContentCard: { flex: 1, flexDirection: "row", alignItems: "center", padding: 12 },
  activityTitle: { fontSize: 13, fontWeight: "750" },
  activitySub: { fontSize: 11, marginTop: 2 },
});
