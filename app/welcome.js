import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useMausam } from "../src/context/MausamContext";

import {
  getCurrentDeviceLocation,
  getWeather,
  getWeatherInfo,
} from "../src/services/weather";

// Dark, realistic atmospheric mountain background
const hero =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=90";

export default function Welcome() {
  const {
    colors,
    isDark,
    setUserLocation,
  } = useMausam();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        setLoading(true);

        const location =
          await getCurrentDeviceLocation();

        if (cancelled) return;

        setUserLocation(location);

        const data = await getWeather(
          location.latitude,
          location.longitude
        );

        if (cancelled) return;

        const current = data.current;

        const weatherInfo =
          getWeatherInfo(current.weather_code);

        setWeather({
          location: location.name,
          temperature: Math.round(
            current.temperature_2m
          ),
          feelsLike: Math.round(
            current.apparent_temperature
          ),
          condition: weatherInfo.label,
          icon: weatherInfo.icon,
        });
      } catch (error) {
        console.log(
          "Unable to load weather:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ImageBackground
        source={{ uri: hero }}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        {/* Dark overlay */}
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: isDark
                ? "rgba(4,8,12,0.62)"
                : "rgba(5,10,14,0.38)",
            },
          ]}
        />

        {/* ================= TOP ================= */}

        <View style={styles.top}>
          <Text style={styles.logo}>
            M A U S A M
          </Text>

          <Text style={styles.welcome}>
            WELCOME
          </Text>
        </View>

        {/* ================= WEATHER ================= */}

        <View style={styles.weatherCard}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.loadingText}>
                Detecting your weather...
              </Text>
            </View>
          ) : weather ? (
            <>
              <View style={styles.weatherInfo}>
                <Text style={styles.location}>
                  {weather.location?.toUpperCase()} · TODAY
                </Text>

                <View style={styles.weatherMain}>
                  <Text style={styles.temperature}>
                    {weather.temperature}°
                  </Text>

                  <View style={styles.conditionBox}>
                    <Text style={styles.condition}>
                      {weather.condition}
                    </Text>

                    <Text style={styles.feels}>
                      Feels like {weather.feelsLike}°
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.weatherIcon}>
                <Ionicons
                  name={weather.icon}
                  size={29}
                  color="#FFFFFF"
                />
              </View>
            </>
          ) : (
            <View style={styles.fallback}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#E0A64B"
              />

              <View>
                <Text style={styles.fallbackTitle}>
                  LOCATION WEATHER
                </Text>

                <Text style={styles.fallbackText}>
                  Allow location access for live weather.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ================= MAIN ================= */}

        <View style={styles.content}>
          <Text style={styles.kicker}>
            WEATHER · INTERPRETED FOR YOU
          </Text>

          <Text style={styles.title}>
            Weather that{"\n"}
            understands{" "}
            <Text style={styles.gold}>
              your
            </Text>
            {"\n"}
            <Text style={styles.gold}>
              day.
            </Text>
          </Text>

          <Text style={styles.description}>
            Real-time weather, intelligent insights
            and recommendations shaped around your
            routine.
          </Text>

          {/* ================= BUTTON ================= */}

          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: colors.accent,
              },
            ]}
            onPress={() =>
              router.push("/onboarding")
            }
          >
            <Text style={styles.buttonText}>
              Get Started
            </Text>

            <Ionicons
              name="arrow-forward"
              size={21}
              color="#111111"
            />
          </Pressable>

          <Text style={styles.bottomText}>
            Personalized weather in under a minute.
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  backgroundImage: {
    resizeMode: "cover",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  /* TOP */

  top: {
    height: 70,
    paddingHorizontal: 32,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: "800",
  },

  welcome: {
    color: "#FFFFFF",
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: "800",
  },

  /* WEATHER CARD */

  weatherCard: {
    position: "absolute",
    top: 142,
    left: 32,
    right: 32,

    minHeight: 102,

    borderRadius: 25,

    paddingHorizontal: 18,
    paddingVertical: 16,

    backgroundColor:
      "rgba(20,28,34,0.48)",

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.25)",
  },

  weatherInfo: {
    flex: 1,
  },

  location: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: "800",
  },

  weatherMain: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  temperature: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 40,
    fontWeight: "300",
    letterSpacing: -1.5,
  },

  conditionBox: {
    marginLeft: 10,
  },

  condition: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  feels: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 8,
    marginTop: 3,
  },

  weatherIcon: {
    position: "absolute",
    right: 18,
    top: 25,

    width: 48,
    height: 48,

    borderRadius: 16,

    backgroundColor:
      "rgba(255,255,255,0.10)",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.15)",
  },

  loadingRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  loadingText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 10,
  },

  fallback: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  fallbackTitle: {
    color: "#FFFFFF",
    fontSize: 8,
    letterSpacing: 1.3,
    fontWeight: "800",
  },

  fallbackText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 9,
    marginTop: 4,
  },

  /* MAIN CONTENT */

  content: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 38,
  },

  kicker: {
    color: "#E0A64B",
    fontSize: 9,
    letterSpacing: 1.8,
    fontWeight: "800",
    marginBottom: 18,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 43,
    lineHeight: 43,
    fontWeight: "800",
    letterSpacing: -1.7,
  },

  gold: {
    color: "#E0A64B",
  },

  description: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 18,
    maxWidth: 330,
  },

  /* BUTTON */

  button: {
    height: 58,
    borderRadius: 18,

    marginTop: 27,

    paddingHorizontal: 23,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  buttonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "800",
  },

  bottomText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 9,
    textAlign: "center",
    marginTop: 11,
  },
});