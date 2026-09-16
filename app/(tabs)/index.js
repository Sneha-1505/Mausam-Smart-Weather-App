import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useMausam } from "../../src/context/MausamContext";
import { getWeatherInfo } from "../../src/services/weather";
import { getPersonaEnvironment } from "../../src/data/personaBackground";
import { getWhatYouNeedToday } from "../../src/services/whatToCarry";
import { GlassCard } from "../../src/components/UI";
import { sortAlerts } from "../../src/services/alerts";
import { replayAlertSound } from "../../src/services/alertSound";
import { speak, isSpeechSynthesisSupported } from "../../src/services/voice";
import CropSowingAdvisor from "../../src/components/CropSowingAdvisor";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TOP_HALF_HEIGHT = Math.max(500, Math.min(SCREEN_HEIGHT * 0.58, 540));

function round(v) {
  if (v == null || isNaN(Number(v))) return "--";
  return Math.round(Number(v));
}

// 3 Dynamic Action Chips for Hero (Persona-specific)
function getPersonaHeroChips(persona) {
  const norm = (persona || "farmer").toLowerCase().replace("-", "_");
  switch (norm) {
    case "farmer":
      return [
        { id: "sowing", icon: "leaf-outline", label: "Sowing Advisor", route: "crop_advisor" },
        { id: "soil", icon: "water-outline", label: "Soil Moisture", route: "earth" },
        { id: "rain", icon: "rainy-outline", label: "Rain Forecast", route: "hourly" },
      ];
    case "traveler":
      return [
        { id: "trip", icon: "airplane-outline", label: "Trip Feasibility", route: "ai" },
        { id: "packing", icon: "bag-handle-outline", label: "Pack Checklist", route: "requirements" },
        { id: "best_time", icon: "sunny-outline", label: "Best Sightseeing", route: "hourly" },
      ];
    case "fitness":
      return [
        { id: "workout", icon: "fitness-outline", label: "Workout Window", route: "hourly" },
        { id: "air", icon: "leaf-outline", label: "Clean Air Timing", route: "earth" },
        { id: "hydration", icon: "water-outline", label: "Hydration Target", route: "requirements" },
      ];
    case "health":
      return [
        { id: "aqi", icon: "medical-outline", label: "AQI & PM2.5", route: "earth" },
        { id: "uv", icon: "shield-checkmark-outline", label: "UV Protection", route: "requirements" },
        { id: "wellness", icon: "heart-outline", label: "Respiratory Care", route: "ai" },
      ];
    case "beachgoer":
      return [
        { id: "beach", icon: "sunny-outline", label: "Beach Suitability", route: "hourly" },
        { id: "waves", icon: "water-outline", label: "Waves & Wind", route: "earth" },
        { id: "uv", icon: "glasses-outline", label: "UV Protection", route: "requirements" },
      ];
    case "family":
      return [
        { id: "park", icon: "home-outline", label: "Park & Playground", route: "hourly" },
        { id: "child_sun", icon: "happy-outline", label: "Child Sun Safety", route: "requirements" },
        { id: "rain_backup", icon: "umbrella-outline", label: "Rain Backup", route: "ai" },
      ];
    case "commuter":
      return [
        { id: "route", icon: "car-outline", label: "Transit Route Risk", route: "hourly" },
        { id: "visibility", icon: "eye-outline", label: "Road Visibility", route: "earth" },
        { id: "slick", icon: "rainy-outline", label: "Rain & Slick Roads", route: "requirements" },
      ];
    case "event_planner":
    default:
      return [
        { id: "good_weather", icon: "sunny-outline", label: "Good Weather", route: "hourly" },
        { id: "better_events", icon: "sparkles-outline", label: "Better Events", route: "ai" },
        { id: "happier_gatherings", icon: "heart-outline", label: "Happier Gatherings", route: "requirements" },
      ];
  }
}

// 5 Sleek Metric Cards for Horizontal Grid (Persona-specific)
function getPersonaMetricCards({
  persona,
  temp,
  feelsLike,
  wind,
  humidity,
  visibility,
  rainProb,
  aqi,
  uv,
  personaContext,
}) {
  const norm = (persona || "farmer").toLowerCase().replace("-", "_");
  switch (norm) {
    case "farmer": {
      const soilMoist =
        personaContext?.soil?.current?.soil_moisture_0_to_1cm != null
          ? `${Math.round(personaContext.soil.current.soil_moisture_0_to_1cm * 100)}%`
          : Array.isArray(personaContext?.soil?.hourly?.soil_moisture_0_to_1cm) &&
            personaContext.soil.hourly.soil_moisture_0_to_1cm.length > 0
          ? `${Math.round(personaContext.soil.hourly.soil_moisture_0_to_1cm[0] * 100)}%`
          : "34%";
      return [
        { id: "sowing", icon: "leaf", iconColor: "#4ADE80", value: "Suitable", label: "Sowing" },
        { id: "soil", icon: "water", iconColor: "#38BDF8", value: soilMoist, label: "Soil Moist." },
        { id: "rain", icon: "rainy", iconColor: "#60A5FA", value: `${rainProb}%`, label: "Rain Prob" },
        { id: "temp", icon: "thermometer", iconColor: "#FBBF24", value: `${temp}°`, label: "Temp" },
        { id: "wind", icon: "speedometer", iconColor: "#2DD4BF", value: `${wind} km/h`, label: "Wind" },
      ];
    }
    case "traveler":
      return [
        { id: "travel_idx", icon: "airplane", iconColor: "#FBBF24", value: "9/10", label: "Trip Index" },
        { id: "vis", icon: "eye", iconColor: "#38BDF8", value: `${visibility} km`, label: "Visibility" },
        { id: "rain", icon: "rainy", iconColor: "#60A5FA", value: `${rainProb}%`, label: "Rain Risk" },
        { id: "temp", icon: "thermometer", iconColor: "#F87171", value: `${temp}°`, label: "Temp" },
        { id: "uv", icon: "sunny", iconColor: "#FB923C", value: `${uv}`, label: "UV Index" },
      ];
    case "fitness":
      return [
        { id: "cardio", icon: "fitness", iconColor: "#4ADE80", value: "Optimal", label: "Cardio" },
        { id: "aqi", icon: "leaf", iconColor: "#2DD4BF", value: `${aqi ?? 42}`, label: "AQI" },
        { id: "heat", icon: "flame", iconColor: "#FB923C", value: `${feelsLike}°`, label: "Heat Index" },
        { id: "uv", icon: "sunny", iconColor: "#FBBF24", value: `${uv}`, label: "UV Index" },
        { id: "humidity", icon: "water", iconColor: "#60A5FA", value: `${humidity}%`, label: "Humidity" },
      ];
    case "health": {
      const pm25 =
        personaContext?.air?.current?.pm2_5 != null
          ? `${Math.round(personaContext.air.current.pm2_5)} µg`
          : "18 µg";
      return [
        { id: "aqi", icon: "medical", iconColor: "#2DD4BF", value: `${aqi ?? 42}`, label: "AQI" },
        { id: "pm25", icon: "shield-checkmark", iconColor: "#4ADE80", value: pm25, label: "PM2.5" },
        { id: "uv", icon: "sunny", iconColor: "#FBBF24", value: `${uv}`, label: "UV Index" },
        { id: "humidity", icon: "water", iconColor: "#60A5FA", value: `${humidity}%`, label: "Humidity" },
        { id: "temp", icon: "thermometer", iconColor: "#F87171", value: `${temp}°`, label: "Temp" },
      ];
    }
    case "beachgoer":
      return [
        { id: "beach", icon: "sunny", iconColor: "#FBBF24", value: "8.5/10", label: "Beach Index" },
        { id: "uv", icon: "glasses", iconColor: "#FB923C", value: `${uv}`, label: "UV Index" },
        { id: "wind", icon: "speedometer", iconColor: "#2DD4BF", value: `${wind} km/h`, label: "Wind" },
        { id: "temp", icon: "thermometer", iconColor: "#F87171", value: `${temp}°`, label: "Temp" },
        { id: "rain", icon: "rainy", iconColor: "#60A5FA", value: `${rainProb}%`, label: "Rain Prob" },
      ];
    case "family":
      return [
        { id: "safety", icon: "happy", iconColor: "#4ADE80", value: "Safe", label: "Safety" },
        { id: "uv", icon: "sunny", iconColor: "#FBBF24", value: `${uv}`, label: "UV Index" },
        { id: "aqi", icon: "leaf", iconColor: "#2DD4BF", value: `${aqi ?? 42}`, label: "AQI Level" },
        { id: "rain", icon: "rainy", iconColor: "#60A5FA", value: `${rainProb}%`, label: "Rain Prob" },
        { id: "temp", icon: "thermometer", iconColor: "#F87171", value: `${temp}°`, label: "Comfort" },
      ];
    case "commuter":
      return [
        { id: "transit", icon: "car", iconColor: "#4ADE80", value: "Low Risk", label: "Transit" },
        { id: "vis", icon: "eye", iconColor: "#38BDF8", value: `${visibility} km`, label: "Visibility" },
        { id: "rain", icon: "rainy", iconColor: "#60A5FA", value: `${rainProb}%`, label: "Rain Prob" },
        { id: "wind", icon: "speedometer", iconColor: "#2DD4BF", value: `${wind} km/h`, label: "Wind" },
        { id: "temp", icon: "thermometer", iconColor: "#FBBF24", value: `${temp}°`, label: "Temp" },
      ];
    case "event_planner":
    default:
      return [
        { id: "temp", icon: "thermometer", iconColor: "#F87171", value: `${temp}°`, label: "Temperature" },
        { id: "feels", icon: "water", iconColor: "#38BDF8", value: `${feelsLike}°`, label: "Feels Like" },
        { id: "wind", icon: "speedometer", iconColor: "#2DD4BF", value: `${wind} km/h`, label: "Wind" },
        { id: "humidity", icon: "water", iconColor: "#60A5FA", value: `${humidity}%`, label: "Humidity" },
        { id: "vis", icon: "eye", iconColor: "#38BDF8", value: `${visibility} km`, label: "Visibility" },
      ];
  }
}

// 2-3 Tailored Intelligence lines per persona
function getPersonaSmartSummary({
  persona,
  temp,
  feelsLike,
  rainProb,
  aqi,
  wind,
  humidity,
  visibility,
  maxTemp,
  minTemp,
  uv,
}) {
  const norm = (persona || "farmer").toLowerCase().replace("-", "_");
  switch (norm) {
    case "traveler":
      return [
        rainProb >= 40
          ? `🌧️ ${rainProb}% rain probability — expect wet highways and potential transit delays.`
          : `✨ Clear skies and ${visibility} km visibility — optimal conditions for road trips and sightseeing.`,
        temp >= 30
          ? `☀️ Peak heat (${temp}°C, feels like ${feelsLike}°C) midday. Best sightseeing window is early morning or after 4:00 PM.`
          : `🏞️ Pleasant ${temp}°C conditions ideal for all-day outdoor exploration and scenic walks.`,
        uv >= 6
          ? `🕶️ High UV index (${uv}). Wear sunglasses, carry water, and keep a backup power bank on the go.`
          : `🎒 Pack light layers; evening temperatures will drop toward ${minTemp}°C.`,
      ];
    case "farmer":
      return [
        rainProb >= 40
          ? `🌧️ Rain expected (${rainProb}%). Natural soil watering likely; monitor drainage channels to avoid waterlogging.`
          : `💧 Low precipitation today (${rainProb}%) with ${humidity}% humidity. Supplemental irrigation advised before 10 AM.`,
        wind >= 20
          ? `⚠️ Elevated wind speeds (${wind} km/h). Postpone foliar spraying to prevent spray drift loss.`
          : `🌾 Gentle breezes (${wind} km/h) and moderate warmth (${temp}°C) — ideal for crop inspection and routine field work.`,
        `📅 Weekly outlook shows favorable conditions. Check the Crop Sowing Advisor below for crop-specific advice.`,
      ];
    case "fitness":
      return [
        temp >= 30
          ? `🏃 High heat index (${feelsLike}°C). Optimal outdoor cardio window is early morning (before 8:30 AM) or after 6:30 PM.`
          : rainProb >= 50
          ? `🌧️ Slick pavement (${rainProb}% rain chance). Indoor gym training or treadmill workout is recommended.`
          : `🏃 Prime running weather (${temp}°C) with gentle ${wind} km/h breezes supporting sustained cardio.`,
        humidity >= 65 || temp >= 30
          ? `💧 High sweat rate anticipated. Pre-hydrate with electrolytes and drink at least 500ml per 45 min of workout.`
          : `💪 Moderate hydration required; stable temperature profile supports endurance training.`,
        aqi != null && aqi > 100
          ? `😷 Sensitive AQI (${aqi}). Limit vigorous outdoor interval training to protect lung capacity.`
          : `🍃 Air quality is clean and suitable for deep aerobic outdoor training today.`,
      ];
    case "commuter":
      return [
        rainProb >= 40
          ? `🚗 ${rainProb}% rain forecast. Roads will be slick with splash risk; allow 10-15 extra travel minutes.`
          : `🚗 Clear transit routes and smooth road conditions expected for daily work commutes.`,
        `⏱️ Morning transit (${temp}°C) will feel comfortable; afternoon commute will peak near ${maxTemp}°C.`,
        rainProb >= 40
          ? `☂️ Keep a compact umbrella in your vehicle or daily commuter bag.`
          : `🎒 Smooth commute expected across local roads, bus routes, and transit hubs.`,
      ];
    case "health":
      return [
        aqi != null && aqi > 100
          ? `😷 Sensitive air quality (AQI ${aqi}). Sensitive groups should wear an N95 mask and keep windows closed.`
          : `🌿 Clean air quality index (AQI ${aqi ?? 38}) provides healthy outdoor breathing and wellness conditions.`,
        temp >= 32
          ? `☀️ High heat index (${feelsLike}°C). Avoid prolonged midday sun exposure to prevent thermal exhaustion.`
          : `🍃 Pleasant thermal comfort (${temp}°C) promotes natural vitamin D synthesis and circulation.`,
        `💧 Wellness target: Drink 2.5–3 liters of water to stay well-hydrated under ${humidity}% ambient humidity.`,
      ];
    case "beachgoer":
      return [
        uv >= 6
          ? `🏖️ UV index is elevated at ${uv} (High). Reapply water-resistant sunscreen every 90 minutes.`
          : `🏖️ Sunny coastal weather (${temp}°C). Great conditions for beach walks and relaxing by the water.`,
        wind >= 22
          ? `💨 Strong coastal breeze (${wind} km/h). Anchor umbrellas securely and watch for choppier surf.`
          : `🌊 Gentle breezes (${wind} km/h) and warm waters make for comfortable beachside relaxation.`,
        `🕐 Optimal beach hours are before 11:30 AM or after 3:30 PM to avoid intense midday heat.`,
      ];
    case "family":
      return [
        rainProb >= 40
          ? `🏡 Showers likely (${rainProb}%). Plan indoor family entertainment, board games, or museum visits.`
          : `🎠 Comfortable ${temp}°C outdoor temperatures. Great day for neighborhood playground and park visits.`,
        `⏰ Most comfortable family outdoor hours: 8:30 AM – 11:00 AM and 4:30 PM – 6:30 PM.`,
        uv >= 5
          ? `🧴 Apply child-friendly sunscreen (SPF 30+) and carry light snacks and water bottles.`
          : `🧺 Pack light snacks and stay hydrated for enjoyable family outdoor activities.`,
      ];
    case "event_planner":
    default:
      return [
        wind >= 20
          ? `⚠️ Wind gusts up to ${wind} km/h. Secure event canopies, banners, and temporary outdoor structures.`
          : rainProb >= 40
          ? `🌧️ ${rainProb}% rain chance. Ensure covered backup spaces and tent sidewalls are prepared.`
          : `🎪 Stable weather conditions. Safe for open-air stage setups and outdoor event arrangements.`,
        temp >= 31
          ? `🍹 High heat index (${feelsLike}°C). Provide shaded guest lounges, misting fans, and chilled beverages.`
          : `🌤️ Comfortable temperatures (${temp}°C) will keep attendees happy throughout the program.`,
        `📅 Evening schedule feasibility is high; sunset at cooler temperatures will offer a great ambiance.`,
      ];
  }
}

export default function Home() {
  const router = useRouter();
  const {
    profile,
    weather,
    weatherLoading,
    weatherError,
    loadWeather,
    personaContext,
    alerts,
    colors,
    isDark,
  } = useMausam();

  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWeather(profile?.latitude, profile?.longitude, true);
    setRefreshing(false);
  }, [loadWeather, profile?.latitude, profile?.longitude]);

  const current = weather?.current || {};
  const daily = weather?.daily || {};
  const hourly = weather?.hourly || {};

  const currentCode = current.weather_code ?? 0;
  const weatherInfo = getWeatherInfo(currentCode);
  const persona = (profile?.persona || "farmer").toLowerCase();

  // Dynamic Persona + Weather + Time Environment (persona-specific image)
  const env = useMemo(() => {
    return getPersonaEnvironment({
      persona,
      weatherCode: currentCode,
      hour: currentTime.getHours(),
      isDark,
    });
  }, [persona, currentCode, currentTime, isDark]);

  const temp = round(current.temperature_2m);
  const feelsLike = round(current.apparent_temperature ?? temp);
  const humidity = round(current.relative_humidity_2m);
  const wind = round(current.wind_speed_10m);
  const uv = round(current.uv_index ?? daily.uv_index_max?.[0] ?? 0);
  const visibility =
    current.visibility != null ? (current.visibility / 1000).toFixed(0) : "10";
  const rainProb = daily.precipitation_probability_max?.[0] ?? 0;
  const maxTemp = round(daily.temperature_2m_max?.[0]);
  const minTemp = round(daily.temperature_2m_min?.[0]);
  const aqi = round(personaContext?.air?.current?.us_aqi);

  // Requirements / "What You Need Today" items
  const needItems = useMemo(() => {
    return getWhatYouNeedToday({
      weather,
      personaContext,
      profile,
    });
  }, [weather, personaContext, profile]);

  // Hourly items (next 24 hours)
  const hourlyItems = useMemo(() => {
    if (!hourly.time) return [];
    return hourly.time.slice(0, 24).map((t, i) => {
      const d = new Date(t);
      const isNow = i === 0;
      const timeStr = isNow
        ? "Now"
        : d.toLocaleTimeString([], { hour: "numeric", hour12: true });
      const hTemp = round(hourly.temperature_2m?.[i]);
      const hProb = hourly.precipitation_probability?.[i] ?? 0;
      const hCode = hourly.weather_code?.[i] ?? 0;
      const hInfo = getWeatherInfo(hCode);
      return { timeStr, hTemp, hProb, hCode, hInfo };
    });
  }, [hourly]);

  // 7-day forecast items
  const dailyItems = useMemo(() => {
    if (!daily.time) return [];
    return daily.time.slice(0, 7).map((t, i) => {
      const d = new Date(t);
      const dayName =
        i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString([], { weekday: "short" });
      const dMax = round(daily.temperature_2m_max?.[i]);
      const dMin = round(daily.temperature_2m_min?.[i]);
      const dProb = daily.precipitation_probability_max?.[i] ?? 0;
      const dCode = daily.weather_code?.[i] ?? 0;
      const dInfo = getWeatherInfo(dCode);
      return { dayName, dMax, dMin, dProb, dCode, dInfo };
    });
  }, [daily]);

  // Real-time Hazard Alert Calculation
  const sortedAlerts = useMemo(() => sortAlerts(alerts || []), [alerts]);
  const topAlert = sortedAlerts[0] || null;

  // Active Alert Display: genuine forecast alert or smart contextual advisory
  const activeAlert = useMemo(() => {
    if (topAlert) {
      return {
        title: topAlert.title,
        icon: "⛈️",
        time: topAlert.time || "2:00 pm",
        message: `${topAlert.message} ${topAlert.action}`,
        severity: topAlert.severity || "high",
        isGenuine: true,
      };
    }
    // High heat advisory
    if (Number(temp) >= 32) {
      return {
        title: "High Heat Advisory",
        icon: "☀️",
        time: "Midday",
        message: `Peak temperature is ${temp}°C (feels like ${feelsLike}°C). Seek shaded indoor areas and maintain constant hydration.`,
        severity: "moderate",
        isGenuine: false,
      };
    }
    // Rain advisory
    if (rainProb >= 40) {
      return {
        title: "Rain & Slick Road Advisory",
        icon: "🌧️",
        time: "Today",
        message: `${rainProb}% rain probability expected. Roadways may experience sudden slickness and localized ponding.`,
        severity: "moderate",
        isGenuine: false,
      };
    }
    // Default contextual advisory matching reference design
    return {
      title:
        persona === "farmer"
          ? "Agricultural Weather Advisory"
          : persona === "event_planner"
          ? "Event Conditions Advisory"
          : "Daily Weather Advisory",
      icon: persona === "farmer" ? "🌾" : persona === "event_planner" ? "🎪" : "☀️",
      time: currentTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }),
      message:
        "Stable weather conditions across your area. Always monitor live radar before scheduling extended outdoor tasks.",
      severity: "moderate",
      isGenuine: false,
    };
  }, [topAlert, temp, feelsLike, rainProb, persona, currentTime]);

  const handleListenAlert = (alertObj) => {
    if (!alertObj) return;
    replayAlertSound(alertObj.severity);
    if (isSpeechSynthesisSupported()) {
      speak(`${alertObj.title}. ${alertObj.message}`, "en");
    }
  };

  // Greeting & Subtitle
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const personaSubtitle = useMemo(() => {
    switch (persona) {
      case "farmer":
        return "Here's your farming weather update 🌱";
      case "traveler":
        return "Perfect day for an adventure! ⛰️";
      case "fitness":
        return "Optimal outdoor training window ahead 🏃";
      case "health":
        return "Clean air & wellness environmental report 🌿";
      case "beachgoer":
        return "Coastal conditions & sunny skies 🏖️";
      case "commuter":
        return "Transit routes & road visibility report 🚗";
      case "family":
        return "Family-safe outdoor recreation outlook 🏡";
      case "event_planner":
      default:
        return "Your personalized day-ahead forecast ✨";
    }
  }, [persona]);

  // Clean Display Name (e.g. "A", "Sneha", "Adi")
  const rawName = (profile?.name || "").trim();
  const displayName = rawName
    ? rawName.length === 1
      ? rawName.toUpperCase()
      : rawName.charAt(0).toUpperCase() + rawName.slice(1)
    : "Explorer";

  // Dynamic 3 Quick Action Chips for Hero
  const heroChips = useMemo(() => getPersonaHeroChips(persona), [persona]);

  // Dynamic 5 Metric Cards
  const metricCards = useMemo(
    () =>
      getPersonaMetricCards({
        persona,
        temp,
        feelsLike,
        wind,
        humidity,
        visibility,
        rainProb,
        aqi,
        uv,
        personaContext,
      }),
    [persona, temp, feelsLike, wind, humidity, visibility, rainProb, aqi, uv, personaContext]
  );

  // Smart summary lines
  const smartSummaryLines = useMemo(() => {
    if (!weather?.current) {
      return ["Gathering local meteorological data..."];
    }
    return getPersonaSmartSummary({
      persona,
      temp,
      feelsLike,
      rainProb,
      aqi,
      wind,
      humidity,
      visibility,
      maxTemp,
      minTemp,
      uv,
    });
  }, [weather, persona, temp, feelsLike, rainProb, aqi, wind, humidity, visibility, maxTemp, minTemp, uv]);

  const handleChipPress = (chip) => {
    if (!chip) return;
    if (chip.route === "crop_advisor" || chip.route === "hourly") {
      return;
    }
    if (chip.route === "earth") {
      router.push("/earth");
    } else if (chip.route === "ai") {
      router.push("/ai");
    } else if (chip.route === "requirements") {
      router.push("/requirements");
    }
  };

  // Loading state
  if (weatherLoading && !weather?.current) {
    return (
      <View style={[styles.root, { backgroundColor: isDark ? "#090D14" : "#F6F4EE" }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Fetching weather data...
          </Text>
          <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
            Getting the latest conditions for {profile?.location || "your location"}
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (weatherError && !weather?.current) {
    return (
      <View style={[styles.root, { backgroundColor: isDark ? "#090D14" : "#F6F4EE" }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={56} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Unable to Load Weather
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {weatherError || "Check your connection and try again."}
          </Text>
          <Pressable
            style={[styles.retryBtn, { backgroundColor: colors.accent }]}
            onPress={() => loadWeather(profile?.latitude, profile?.longitude, true)}
          >
            <Ionicons name="refresh" size={16} color="#090D14" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: isDark ? "#090D14" : "#F6F4EE" }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.pageInnerContainer}>
          {/* ========================================================
              TOP HALF: PERSONA BACKGROUND IMAGE (CLEARLY VISIBLE)
          ======================================================== */}
          <View style={styles.topHalfContainer}>
            <ImageBackground
              source={env.image}
              style={styles.topBackgroundImage}
              resizeMode="cover"
            >
              {/* Subtle tint so text is readable while image remains bright and clear */}
              <View
                style={[
                  styles.gradientOverlay,
                  {
                    backgroundColor: isDark
                      ? "rgba(9, 13, 20, 0.28)"
                      : "rgba(246, 244, 238, 0.20)",
                  },
                ]}
              />

              {/* Gentle bottom edge fade into lower half */}
              <View
                style={[
                  styles.bottomEdgeFade,
                  { backgroundColor: isDark ? "#090D14" : "#F6F4EE" },
                ]}
              />

              {/* Top Half Content */}
              <View style={styles.topContentContainer}>
                {/* Top Nav Bar: Persona Capsule + Location + Bell */}
                <View style={styles.topNavRow}>
                  <View style={styles.badgeAndLocation}>
                    <View
                      style={[
                        styles.personaPill,
                        {
                          backgroundColor:
                            persona === "farmer"
                              ? "rgba(74, 222, 128, 0.25)"
                              : persona === "event_planner"
                              ? "rgba(217, 154, 61, 0.28)"
                              : "rgba(56, 189, 248, 0.25)",
                          borderColor:
                            persona === "farmer"
                              ? "#4ADE80"
                              : persona === "event_planner"
                              ? "#D99A3D"
                              : "#38BDF8",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.personaPillText,
                          {
                            color:
                              persona === "farmer"
                                ? "#4ADE80"
                                : persona === "event_planner"
                                ? "#E0A64B"
                                : "#38BDF8",
                          },
                        ]}
                      >
                        {persona.replace("_", " ").toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.locationWrap}>
                      <Ionicons name="location" size={15} color="#D99A3D" />
                      <Text
                        style={[
                          styles.topLocationText,
                          { color: isDark ? "#FFFFFF" : "#1E293B" },
                        ]}
                        numberOfLines={1}
                      >
                        {profile?.location || "Phagwara"}
                      </Text>
                    </View>
                  </View>

                  {/* Bell with Unread Badge */}
                  <Pressable
                    style={[
                      styles.bellBtn,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.22)"
                          : "rgba(0,0,0,0.10)",
                      },
                    ]}
                    onPress={() => router.push("/alerts")}
                  >
                    <Ionicons
                      name="notifications-outline"
                      size={20}
                      color={isDark ? "#FFFFFF" : "#1E293B"}
                    />
                    {sortedAlerts.length > 0 && (
                      <View style={styles.bellBadge}>
                        <Text style={styles.bellBadgeText}>
                          {sortedAlerts.length}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>

                {/* Hero Section: Left 3 Glass Chips + Right Script Greeting */}
                <View style={styles.heroSplitRow}>
                  {/* Left Column: 3 Stacked Glass Action Chips */}
                  <View style={styles.heroLeftChipsCol}>
                    {heroChips.map((chip) => (
                      <Pressable
                        key={chip.id}
                        style={styles.heroActionChip}
                        onPress={() => handleChipPress(chip)}
                      >
                        <View style={styles.heroChipInner}>
                          <Ionicons
                            name={chip.icon}
                            size={14}
                            color="#FFFFFF"
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.heroChipLabel}>{chip.label}</Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={12}
                          color="rgba(255,255,255,0.8)"
                        />
                      </Pressable>
                    ))}
                  </View>

                  {/* Right Column: Elegant Script Greeting */}
                  <View style={styles.heroRightGreetingCol}>
                    <Text
                      style={[
                        styles.heroGreetingScript,
                        { color: isDark ? "#FFFFFF" : "#0F172A" },
                      ]}
                    >
                      {greeting}, {displayName}
                    </Text>
                    <Text
                      style={[
                        styles.heroGreetingSubtitle,
                        { color: isDark ? "#E2E8F0" : "#334155" },
                      ]}
                    >
                      {personaSubtitle}
                    </Text>
                  </View>
                </View>

                {/* Hero Weather Numbers Block */}
                <View style={styles.heroWeatherBlock}>
                  <Text
                    style={[
                      styles.heroLargeTemp,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    {temp}°
                  </Text>

                  <View style={styles.heroConditionRow}>
                    <Ionicons
                      name={weatherInfo.icon}
                      size={22}
                      color={
                        currentCode === 0 || currentCode === 1
                          ? "#FBBF24"
                          : colors.accent
                      }
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.heroConditionLabel,
                        { color: isDark ? "#FFFFFF" : "#1E293B" },
                      ]}
                    >
                      {weatherInfo.label}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.heroFeelsLikeRange,
                      { color: isDark ? "#CBD5E1" : "#475569" },
                    ]}
                  >
                    Feels like {feelsLike}°  |  H {maxTemp}°  L {minTemp}°
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* ========================================================
              LOWER HALF: NO BACKGROUND IMAGE (CLEAN THEME BACKGROUND)
          ======================================================== */}
          <View style={styles.lowerContainer}>
            {/* ALERT CARD (2D Crimson Glass Card matching reference) */}
            {activeAlert && (
              <View
                style={[
                  styles.alertBox,
                  {
                    backgroundColor: "rgba(38, 12, 18, 0.88)",
                    borderColor: "rgba(239, 68, 68, 0.45)",
                  },
                ]}
              >
                <View style={styles.alertHeaderRow}>
                  <View style={styles.alertHeaderLeft}>
                    <Text style={styles.alertHeaderIcon}>⚠️</Text>
                    <Text style={styles.alertEmoji}>{activeAlert.icon}</Text>
                    <Text style={styles.alertHeaderTitle}>
                      {activeAlert.title}
                    </Text>
                  </View>
                  <Text style={styles.alertHeaderTime}>
                    {activeAlert.time}
                  </Text>
                </View>

                <Text style={styles.alertBodyMessage}>
                  {activeAlert.message}
                </Text>

                <Pressable
                  style={styles.listenAlertBtn}
                  onPress={() => handleListenAlert(activeAlert)}
                >
                  <Ionicons name="volume-high" size={14} color="#F87171" />
                  <Text style={styles.listenAlertText}>Listen Alert ➔</Text>
                </Pressable>
              </View>
            )}

            {/* INTELLIGENCE SUMMARY CARD (2D Emerald Glass Card) */}
            <Pressable
              style={[
                styles.summaryCard,
                {
                  backgroundColor: "rgba(6, 38, 28, 0.88)",
                  borderColor: "rgba(16, 185, 129, 0.40)",
                },
              ]}
              onPress={() => router.push("/ai")}
            >
              <View style={styles.summaryHeader}>
                <View style={styles.summaryTitleWrap}>
                  <Ionicons name="sparkles" size={16} color="#10B981" />
                  <Text style={styles.summaryTitle}>
                    {persona.replace("_", " ").toUpperCase()} INTELLIGENCE SUMMARY
                  </Text>
                </View>
                <View style={styles.summaryLiveBadge}>
                  <Text style={styles.summaryLiveBadgeText}>LIVE ADVISORY</Text>
                </View>
              </View>

              <View style={styles.summaryContentRow}>
                <Text style={styles.summaryLeadingEmoji}>
                  {persona === "farmer"
                    ? "🌾"
                    : persona === "fitness"
                    ? "🏃"
                    : persona === "commuter"
                    ? "🚗"
                    : rainProb >= 40
                    ? "🌧️"
                    : "🌤️"}
                </Text>
                <Text style={styles.summaryLeadText}>
                  {smartSummaryLines[0] ||
                    "Optimal atmospheric parameters detected for your daily activities."}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="rgba(16, 185, 129, 0.7)"
                  style={{ marginLeft: 6 }}
                />
              </View>

              {smartSummaryLines.length > 1 && (
                <View style={styles.summaryExtraLines}>
                  {smartSummaryLines.slice(1).map((line, idx) => (
                    <View key={idx} style={styles.summarySubLineRow}>
                      <Text style={styles.summarySubCheck}>✓</Text>
                      <Text style={styles.summarySubLineText}>{line}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>

            {/* 5-COLUMN SLEEK WEATHER METRICS ROW */}
            <View style={styles.metricsRow}>
              {metricCards.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: isDark
                        ? "rgba(18, 24, 38, 0.85)"
                        : "rgba(255, 255, 255, 0.90)",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(0, 0, 0, 0.08)",
                    },
                  ]}
                >
                  <Ionicons
                    name={m.icon}
                    size={17}
                    color={m.iconColor || colors.accent}
                    style={{ marginBottom: 6 }}
                  />
                  <Text
                    style={[
                      styles.metricValue,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                    numberOfLines={1}
                  >
                    {m.value}
                  </Text>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                    numberOfLines={1}
                  >
                    {m.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* PERSONA-SPECIFIC MAIN FEATURE SECTION */}
            {persona === "farmer" ? (
              <CropSowingAdvisor />
            ) : (
              <GlassCard style={styles.personaFeatureCard}>
                <View style={styles.personaFeatureHeader}>
                  <Ionicons
                    name={
                      persona === "fitness"
                        ? "fitness-outline"
                        : persona === "traveler"
                        ? "airplane-outline"
                        : persona === "health"
                        ? "medical-outline"
                        : persona === "beachgoer"
                        ? "sunny-outline"
                        : persona === "family"
                        ? "people-outline"
                        : persona === "commuter"
                        ? "car-outline"
                        : "sparkles-outline"
                    }
                    size={18}
                    color={colors.accent}
                  />
                  <Text style={[styles.personaFeatureTitle, { color: colors.text }]}>
                    {persona === "fitness"
                      ? "Workout Window & Cardio Advisor"
                      : persona === "traveler"
                      ? "Travel & Sightseeing Conditions"
                      : persona === "health"
                      ? "Environmental Health & AQI Report"
                      : persona === "beachgoer"
                      ? "Coastal Comfort & Safe Sun Window"
                      : persona === "family"
                      ? "Family Outing & Park Safety"
                      : persona === "commuter"
                      ? "Peak Commute Weather Impact"
                      : "Outdoor Event Ambiance & Contingency"}
                  </Text>
                </View>

                <View style={styles.personaFeatureItems}>
                  {persona === "fitness" && (
                    <>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🏃</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Optimal Running Hours: </Text>
                          6:00 AM – 8:30 AM or after 6:30 PM (Cooler air & low UV index).
                        </Text>
                      </View>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>💧</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Hydration Protocol: </Text>
                          Drink at least 500ml water per 45 min workout in {temp}°C heat.
                        </Text>
                      </View>
                    </>
                  )}

                  {persona === "traveler" && (
                    <>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🛣️</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Transit Conditions: </Text>
                          {visibility} km visibility with dry highway conditions for smooth driving.
                        </Text>
                      </View>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🎒</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Packing Note: </Text>
                          Carry sunglasses, hydration bottle, and lightweight breathable clothing.
                        </Text>
                      </View>
                    </>
                  )}

                  {persona === "health" && (
                    <>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🫁</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Respiratory Safety: </Text>
                          AQI is {aqi ?? 42}. Outdoor air is safe for deep breathing and aerobic walks.
                        </Text>
                      </View>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>☀️</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>UV Exposure: </Text>
                          UV Index {uv}. Apply SPF 30+ sunscreen if staying in direct sun for over 30 mins.
                        </Text>
                      </View>
                    </>
                  )}

                  {persona === "beachgoer" && (
                    <>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🌊</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Breeze & Swell: </Text>
                          {wind} km/h onshore wind. Great conditions for seaside relaxation.
                        </Text>
                      </View>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🕶️</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Sunscreen Schedule: </Text>
                          Reapply water-resistant SPF 50+ every 90 minutes.
                        </Text>
                      </View>
                    </>
                  )}

                  {persona === "family" && (
                    <>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🎠</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Park & Play Hours: </Text>
                          Best park window: 9:00 AM – 11:30 AM and 4:30 PM – 6:30 PM.
                        </Text>
                      </View>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>👶</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Children Protection: </Text>
                          Sun hats and light snacks recommended for outdoor afternoon play.
                        </Text>
                      </View>
                    </>
                  )}

                  {persona === "commuter" && (
                    <>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🚗</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Commute Window: </Text>
                          Morning and evening traffic routes face low weather risk ({rainProb}% rain chance).
                        </Text>
                      </View>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🌫️</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Road Visibility: </Text>
                          Excellent road clarity at {visibility} km across key arterials.
                        </Text>
                      </View>
                    </>
                  )}

                  {persona === "event_planner" && (
                    <>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🎪</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Canopy & Stage Wind: </Text>
                          Wind speeds at {wind} km/h — safe for standard gazebo and banner installations.
                        </Text>
                      </View>
                      <View style={styles.featureItemRow}>
                        <Text style={styles.featureBullet}>🌅</Text>
                        <Text style={[styles.featureText, { color: colors.text }]}>
                          <Text style={{ fontWeight: "700" }}>Evening Lighting & Sunset: </Text>
                          Pleasant twilight cooling will create ideal gathering ambiance.
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </GlassCard>
            )}

            {/* HOURLY FORECAST (Next 24 Hours) */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                Hourly Forecast
              </Text>
              <Text style={[styles.sectionSubtitleTag, { color: colors.textSecondary }]}>
                Next 24h
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyScroll}
            >
              {hourlyItems.map((h, idx) => (
                <GlassCard key={idx} style={styles.hourlyCard}>
                  <Text style={[styles.hourlyTime, { color: colors.textSecondary }]}>
                    {h.timeStr}
                  </Text>
                  <Ionicons
                    name={h.hInfo.icon}
                    size={22}
                    color={
                      h.hCode === 0 || h.hCode === 1 ? "#FBBF24" : colors.accent
                    }
                    style={{ marginVertical: 6 }}
                  />
                  <Text style={[styles.hourlyTemp, { color: colors.text }]}>
                    {h.hTemp}°
                  </Text>
                  {h.hProb > 0 ? (
                    <Text style={styles.hourlyProb}>{h.hProb}%</Text>
                  ) : (
                    <Text style={[styles.hourlyProbPlaceholder, { color: colors.textSecondary }]}>
                      --
                    </Text>
                  )}
                </GlassCard>
              ))}
            </ScrollView>

            {/* WHAT YOU NEED TODAY SECTION (Preview with link to Requirements) */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                What You Need Today
              </Text>
              <Pressable onPress={() => router.push("/requirements")}>
                <Text style={[styles.seeAllText, { color: colors.accent }]}>
                  See all ➔
                </Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.needScroll}
            >
              {needItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.needMiniCard,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                      borderColor: isDark
                        ? "rgba(255,255,255,0.14)"
                        : "rgba(0,0,0,0.08)",
                    },
                  ]}
                  onPress={() => router.push("/requirements")}
                >
                  <View style={styles.needIconCircle}>
                    <Text style={styles.needEmoji}>{item.icon}</Text>
                  </View>
                  <Text
                    style={[styles.needName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* 7-DAY FORECAST */}
            <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 20 }]}>
              7-Day Forecast
            </Text>
            <GlassCard style={styles.dailyContainer}>
              {dailyItems.map((d, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dailyRow,
                    idx < dailyItems.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                >
                  <Text style={[styles.dailyDay, { color: colors.text }]}>
                    {d.dayName}
                  </Text>
                  <View style={styles.dailyMiddle}>
                    <Ionicons
                      name={d.dInfo.icon}
                      size={18}
                      color={
                        d.dCode === 0 || d.dCode === 1
                          ? "#FBBF24"
                          : colors.accent
                      }
                    />
                    {d.dProb > 0 && (
                      <Text style={styles.dailyProb}>{d.dProb}%</Text>
                    )}
                  </View>
                  <View style={styles.dailyTempRange}>
                    <Text style={[styles.dailyMax, { color: colors.text }]}>
                      {d.dMax}°
                    </Text>
                    <Text style={[styles.dailyMin, { color: colors.textSecondary }]}>
                      {d.dMin}°
                    </Text>
                  </View>
                </View>
              ))}
            </GlassCard>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 44,
  },
  pageInnerContainer: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
  },
  /* Loading & Error States */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 19,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 20,
  },
  retryBtnText: {
    color: "#090D14",
    fontSize: 14,
    fontWeight: "700",
  },
  /* Top Half Container (Shows Persona Image) */
  topHalfContainer: {
    height: TOP_HALF_HEIGHT,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  topBackgroundImage: {
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomEdgeFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 0,
    opacity: 0.95,
  },
  topContentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 44 : 32,
    justifyContent: "space-between",
    paddingBottom: 14,
  },
  /* Top Navigation Bar */
  topNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeAndLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  personaPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
  },
  personaPillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  locationWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topLocationText: {
    fontSize: 14,
    fontWeight: "700",
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: 3,
    right: 3,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  /* Hero Split Row */
  heroSplitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 4,
  },
  heroLeftChipsCol: {
    gap: 8,
    width: "48%",
  },
  heroActionChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  heroChipInner: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  heroChipLabel: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "600",
  },
  heroRightGreetingCol: {
    width: "48%",
    alignItems: "flex-end",
    paddingTop: 4,
  },
  heroGreetingScript: {
    fontSize: 22,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "right",
    letterSpacing: -0.3,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroGreetingSubtitle: {
    fontSize: 11.5,
    fontWeight: "500",
    textAlign: "right",
    marginTop: 4,
    lineHeight: 15,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  /* Hero Weather Block */
  heroWeatherBlock: {
    marginTop: 6,
    marginBottom: 4,
  },
  heroLargeTemp: {
    fontSize: 66,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: 70,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  heroConditionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  heroConditionLabel: {
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroFeelsLikeRange: {
    fontSize: 12.5,
    fontWeight: "500",
    marginTop: 5,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  /* Lower Container (Clean Theme Background Without Image) */
  lowerContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  /* Alert Box (Crimson Glass) */
  alertBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    marginBottom: 14,
  },
  alertHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  alertHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  alertHeaderIcon: {
    fontSize: 15,
  },
  alertEmoji: {
    fontSize: 15,
  },
  alertHeaderTitle: {
    color: "#F87171",
    fontSize: 14,
    fontWeight: "800",
  },
  alertHeaderTime: {
    color: "#94A3B8",
    fontSize: 11.5,
    fontWeight: "600",
  },
  alertBodyMessage: {
    color: "#F1F5F9",
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 11,
  },
  listenAlertBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.45)",
    backgroundColor: "rgba(248, 113, 113, 0.12)",
  },
  listenAlertText: {
    color: "#F87171",
    fontSize: 11.5,
    fontWeight: "700",
  },
  /* Summary Card (Emerald Glass) */
  summaryCard: {
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  summaryTitle: {
    color: "#10B981",
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  summaryLiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.40)",
  },
  summaryLiveBadgeText: {
    color: "#10B981",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  summaryContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryLeadingEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  summaryLeadText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
    flex: 1,
  },
  summaryExtraLines: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 185, 129, 0.15)",
    gap: 6,
  },
  summarySubLineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  summarySubCheck: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 16,
  },
  summarySubLineText: {
    color: "#E2E8F0",
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "500",
    flex: 1,
  },
  /* 5-Column Metrics Row */
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "600",
  },
  /* Persona Feature Card */
  personaFeatureCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
  },
  personaFeatureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  personaFeatureTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  personaFeatureItems: {
    gap: 10,
  },
  featureItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  featureBullet: {
    fontSize: 14,
    lineHeight: 18,
  },
  featureText: {
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
  },
  /* Section Headers */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionSubtitleTag: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
  },
  /* Need Items */
  needScroll: {
    gap: 10,
    paddingRight: 10,
  },
  needMiniCard: {
    width: 78,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  needIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  needEmoji: {
    fontSize: 19,
  },
  needName: {
    fontSize: 10.5,
    fontWeight: "600",
    textAlign: "center",
  },
  /* Hourly Forecast */
  hourlyScroll: {
    gap: 8,
    paddingRight: 10,
    marginBottom: 14,
  },
  hourlyCard: {
    width: 66,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 16,
  },
  hourlyTime: {
    fontSize: 10.5,
    fontWeight: "500",
  },
  hourlyTemp: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  hourlyProb: {
    fontSize: 10,
    color: "#38BDF8",
    fontWeight: "700",
    marginTop: 2,
  },
  hourlyProbPlaceholder: {
    fontSize: 10,
    marginTop: 2,
    opacity: 0.3,
  },
  /* 7-Day Forecast */
  dailyContainer: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 8,
  },
  dailyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  dailyDay: {
    fontSize: 13.5,
    fontWeight: "600",
    width: 75,
  },
  dailyMiddle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dailyProb: {
    fontSize: 11,
    color: "#38BDF8",
    fontWeight: "700",
  },
  dailyTempRange: {
    flexDirection: "row",
    gap: 10,
    width: 60,
    justifyContent: "flex-end",
  },
  dailyMax: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  dailyMin: {
    fontSize: 13.5,
  },
});