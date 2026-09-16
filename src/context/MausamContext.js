import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Platform, useColorScheme } from "react-native";

import { lightColors, darkColors } from "../theme/colors";
import { getWeather } from "../services/weather";
import { generateAlerts } from "../services/alerts";
import { sendWeatherNotification } from "../services/notifications";
import { playAlertSound } from "../services/alertSound";

export const MausamContext = createContext(null);

const defaultProfile = {
  name: "",
  location: "",
  latitude: null,
  longitude: null,
  country: "",
  region: "",
  persona: "farmer",
  routine: { date: "Today", start: "08:30", end: "18:00", commute: "Walking" },
  activities: [],
  priorities: [],
  alerts: true,
  unit: "C",
  onboardingCompleted: false,
  avatar: "farmer",
  selectedCrop: "wheat",
};

const defaultNotifPrefs = {
  rain: true,
  temperature: true,
  aqi: true,
  uv: true,
  severe: true,
  wind: true,
  sound: true,
};

export function MausamProvider({ children }) {
  const systemScheme = useColorScheme();

  /* ── Profile ─────────────────────────────────────────── */
  const [profile, setProfile] = useState(defaultProfile);
  const [themeMode, setThemeMode] = useState("dark"); // Dark theme by default per new visual design

  /* ── Notification preferences ───────────────────────── */
  const [notifPrefs, setNotifPrefs] = useState(defaultNotifPrefs);

  /* ── Chat language ──────────────────────────────────── */
  const [chatLanguage, setChatLanguage] = useState("en"); // 'en' | 'hi' | 'pa'

  /* ── Centralized weather data ───────────────────────── */
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [personaContext, setPersonaContext] = useState({});
  const [contextLoading, setContextLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [previousAlerts, setPreviousAlerts] = useState([]);

  /* Prevent stale closure in loadWeather */
  const latRef = useRef(profile?.latitude);
  const lonRef = useRef(profile?.longitude);
  latRef.current = profile?.latitude;
  lonRef.current = profile?.longitude;

  /* ── LOAD SAVED DATA ─────────────────────────────────── */
  useEffect(() => {
    if (Platform.OS !== "web") return;
    try {
      const savedProfile = localStorage.getItem("mausam-profile");
      const savedTheme = localStorage.getItem("mausam-theme");
      const savedNotif = localStorage.getItem("mausam-notif-prefs");
      const savedLang = localStorage.getItem("mausam-chat-lang");

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile((prev) => ({ ...prev, ...parsed }));
      }
      if (savedTheme) setThemeMode(savedTheme);
      if (savedNotif) setNotifPrefs({ ...defaultNotifPrefs, ...JSON.parse(savedNotif) });
      if (savedLang) setChatLanguage(savedLang);
    } catch {
      /* silent */
    }
  }, []);

  /* ── PERSIST PROFILE ─────────────────────────────────── */
  useEffect(() => {
    if (Platform.OS !== "web") return;
    try {
      localStorage.setItem("mausam-profile", JSON.stringify(profile));
    } catch { /* silent */ }
  }, [profile]);

  /* ── PERSIST THEME ───────────────────────────────────── */
  useEffect(() => {
    if (Platform.OS !== "web") return;
    try {
      localStorage.setItem("mausam-theme", themeMode);
    } catch { /* silent */ }
  }, [themeMode]);

  /* ── PERSIST NOTIF PREFS ─────────────────────────────── */
  useEffect(() => {
    if (Platform.OS !== "web") return;
    try {
      localStorage.setItem("mausam-notif-prefs", JSON.stringify(notifPrefs));
    } catch { /* silent */ }
  }, [notifPrefs]);

  /* ── PERSIST CHAT LANGUAGE ───────────────────────────── */
  useEffect(() => {
    if (Platform.OS !== "web") return;
    try {
      localStorage.setItem("mausam-chat-lang", chatLanguage);
    } catch { /* silent */ }
  }, [chatLanguage]);

  /* ── LOAD PERSONA CONTEXT (AQI, soil, marine) ────────── */
  const loadPersonaContext = useCallback(async (latitude, longitude) => {
    if (latitude == null || longitude == null) return;
    try {
      setContextLoading(true);
      const airUrl =
        `https://air-quality-api.open-meteo.com/v1/air-quality` +
        `?latitude=${latitude}&longitude=${longitude}` +
        `&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide` +
        `&timezone=auto`;

      const soilUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}&longitude=${longitude}` +
        `&hourly=soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm` +
        `&forecast_days=2&timezone=auto`;

      const marineUrl =
        `https://marine-api.open-meteo.com/v1/marine` +
        `?latitude=${latitude}&longitude=${longitude}` +
        `&current=wave_height,wave_direction,wave_period,sea_surface_temperature` +
        `&timezone=auto`;

      const [airResult, soilResult, marineResult] = await Promise.allSettled([
        fetch(airUrl),
        fetch(soilUrl),
        fetch(marineUrl),
      ]);

      const ctx = {};
      if (airResult.status === "fulfilled" && airResult.value.ok) {
        try { ctx.air = await airResult.value.json(); } catch { /* silent */ }
      }
      if (soilResult.status === "fulfilled" && soilResult.value.ok) {
        try { ctx.soil = await soilResult.value.json(); } catch { /* silent */ }
      }
      if (marineResult.status === "fulfilled" && marineResult.value.ok) {
        try { ctx.marine = await marineResult.value.json(); } catch { /* silent */ }
      }
      setPersonaContext(ctx);
    } catch { /* silent */ } finally {
      setContextLoading(false);
    }
  }, []);

  /* ── LOAD WEATHER ────────────────────────────────────── */
  const loadWeather = useCallback(async (lat, lon, silent = false) => {
    const latitude = lat ?? latRef.current;
    const longitude = lon ?? lonRef.current;

    if (latitude == null || longitude == null) {
      setWeatherLoading(false);
      setWeatherError("Location is required to show live weather.");
      return;
    }

    try {
      if (!silent) setWeatherLoading(true);
      setWeatherError("");
      const data = await getWeather(latitude, longitude);
      setWeather(data);
      // Compute alerts from fresh data
      const computed = generateAlerts(data, personaContext);
      setAlerts((prev) => {
        if (prev && prev.length > 0) {
          setPreviousAlerts(prev);
        }
        return computed;
      });
      // Load context in parallel
      loadPersonaContext(latitude, longitude);
    } catch (err) {
      console.error("Weather loading error:", err);
      setWeatherError("Unable to load live weather right now.");
    } finally {
      setWeatherLoading(false);
    }
  }, [personaContext, loadPersonaContext]);

  /* ── RE-COMPUTE ALERTS when context arrives ─────────── */
  useEffect(() => {
    if (weather) {
      const computed = generateAlerts(weather, personaContext);
      setAlerts((prev) => {
        if (prev && prev.length > 0) {
          const prevIds = new Set(prev.map((a) => a.id));
          const currentIds = new Set(computed.map((a) => a.id));
          const hasChanged = prev.length !== computed.length || computed.some((a) => !prevIds.has(a.id));
          if (hasChanged) {
            setPreviousAlerts((p) => [...prev.filter((a) => !currentIds.has(a.id)), ...p].slice(0, 10));
          }
        }
        return computed;
      });
    }
  }, [weather, personaContext]);

  /* ── DEDUPLICATED SMART NOTIFICATION & SOUND DISPATCH ─ */
  const notifiedAlertsRef = useRef(new Set());

  useEffect(() => {
    if (!profile?.alerts || !alerts?.length) return;
    alerts.forEach((alert) => {
      const isAllowed =
        (alert.type === "rain" && (notifPrefs?.rain ?? true)) ||
        (alert.type === "temperature" && (notifPrefs?.temperature ?? true)) ||
        (alert.type === "aqi" && (notifPrefs?.aqi ?? true)) ||
        (alert.type === "uv" && (notifPrefs?.uv ?? true)) ||
        (alert.type === "severe" && (notifPrefs?.severe ?? true)) ||
        (alert.type === "wind" && (notifPrefs?.wind ?? true));

      if (isAllowed && !notifiedAlertsRef.current.has(alert.id)) {
        notifiedAlertsRef.current.add(alert.id);
        
        // Dispatch local notification
        sendWeatherNotification(alert).catch(() => {});

        // Play sound if enabled
        if (notifPrefs?.sound ?? true) {
          playAlertSound(alert.id, alert.severity);
        }
      }
    });
  }, [alerts, profile?.alerts, notifPrefs]);

  /* ── AUTO-LOAD when location changes ────────────────── */
  useEffect(() => {
    if (profile?.latitude != null && profile?.longitude != null) {
      loadWeather(profile.latitude, profile.longitude);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.latitude, profile?.longitude]);

  /* ── THEME ───────────────────────────────────────────── */
  const activeTheme =
    themeMode === "system"
      ? systemScheme === "dark" ? "dark" : "light"
      : themeMode;

  const colors = activeTheme === "dark" ? darkColors : lightColors;

  /* ── PROFILE HELPERS ─────────────────────────────────── */
  const updateProfile = (updates) => {
    setProfile((current) => ({ ...current, ...updates }));
  };

  const complete = (profileData) => {
    setProfile((current) => ({
      ...current,
      ...profileData,
      onboardingCompleted: true,
    }));
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem("mausam-profile");
      } catch { /* silent */ }
    }
  };

  const setUserLocation = (locationData) => {
    setProfile((current) => ({
      ...current,
      location: locationData?.name || "",
      latitude: locationData?.latitude ?? null,
      longitude: locationData?.longitude ?? null,
      country: locationData?.country || "",
      region: locationData?.region || "",
    }));
  };

  const updateNotifPrefs = (updates) => {
    setNotifPrefs((current) => ({ ...current, ...updates }));
  };

  /* ── CONTEXT VALUE ───────────────────────────────────── */
  const value = useMemo(
    () => ({
      /* Profile */
      profile,
      setProfile,
      updateProfile,
      complete,
      resetProfile,
      setUserLocation,

      /* Theme */
      themeMode,
      setThemeMode,
      activeTheme,
      isDark: activeTheme === "dark",
      colors,

      /* Weather (centralized) */
      weather,
      weatherLoading,
      weatherError,
      loadWeather,
      personaContext,
      contextLoading,

      /* Alerts */
      alerts,
      previousAlerts,

      /* Notification preferences */
      notifPrefs,
      updateNotifPrefs,

      /* Chat language */
      chatLanguage,
      setChatLanguage,
    }),
    [
      profile,
      themeMode,
      activeTheme,
      colors,
      weather,
      weatherLoading,
      weatherError,
      loadWeather,
      personaContext,
      contextLoading,
      alerts,
      previousAlerts,
      notifPrefs,
      chatLanguage,
    ]
  );

  return (
    <MausamContext.Provider value={value}>
      {children}
    </MausamContext.Provider>
  );
}

/* ── HOOK ────────────────────────────────────────────────── */
export function useMausam() {
  const context = useContext(MausamContext);
  if (!context) {
    throw new Error("useMausam must be used inside MausamProvider");
  }
  return context;
}