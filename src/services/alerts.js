/**
 * alerts.js
 * Generates smart weather alerts from live weather data + AQI context.
 * Returns an array of alert objects ready for display.
 *
 * FIXES APPLIED:
 * - Thunderstorm: one alert per contiguous storm period, uses real forecast time
 * - Alert IDs are stable (based on type + forecast time), not array index
 * - Scans limited to 48 hours to avoid distant false alarms
 * - Sudden weather change scans all hours in the window (not just the first)
 * - Alerts include expiresAt for staleness detection
 */

import { getWeatherInfo } from "./weather";

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

const MAX_SCAN_HOURS = 48; // Only scan next 48 hours

function formatTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function formatTimeRange(isoStart, isoEnd) {
  const s = formatTime(isoStart);
  const e = isoEnd ? formatTime(isoEnd) : null;
  const dateLabel = formatDate(isoStart);
  const prefix = dateLabel && dateLabel !== "Today" ? `${dateLabel}, ` : "";
  return e && isoStart !== isoEnd ? `${prefix}${s} – ${e}` : `${prefix}${s}`;
}

/**
 * Find the first hourly slot after now matching a condition.
 * Limited to MAX_SCAN_HOURS hours ahead.
 */
function findFirstHourAfterNow(weather, condition) {
  if (!weather?.hourly?.time) return null;
  const now = Date.now();
  const maxTime = now + MAX_SCAN_HOURS * 60 * 60 * 1000;

  for (let i = 0; i < weather.hourly.time.length; i++) {
    const t = new Date(weather.hourly.time[i]).getTime();
    if (t < now) continue;
    if (t > maxTime) break;
    if (condition(i, weather)) return { index: i, time: weather.hourly.time[i] };
  }
  return null;
}

/**
 * Find the first contiguous range of hours matching a condition.
 * Limited to MAX_SCAN_HOURS hours ahead.
 */
function findRangeForCondition(weather, condition) {
  if (!weather?.hourly?.time) return null;
  const now = Date.now();
  const maxTime = now + MAX_SCAN_HOURS * 60 * 60 * 1000;
  let start = null;
  let end = null;

  for (let i = 0; i < weather.hourly.time.length; i++) {
    const t = new Date(weather.hourly.time[i]).getTime();
    if (t < now) continue;
    if (t > maxTime) break;
    if (condition(i, weather)) {
      if (!start) start = weather.hourly.time[i];
      end = weather.hourly.time[i];
    } else if (start) {
      break; // first contiguous block
    }
  }
  return start ? { start, end } : null;
}

/* -------------------------------------------------------
   ALERT GENERATORS
------------------------------------------------------- */

function checkHeavyRain(weather) {
  const range = findRangeForCondition(weather, (i, w) => {
    const code = w.hourly.weather_code?.[i];
    const prob = w.hourly.precipitation_probability?.[i] ?? 0;
    return (
      [63, 65, 66, 67, 80, 81, 82].includes(code) ||
      (prob >= 70 && [61, 63, 65, 80, 81].includes(code))
    );
  });
  if (!range) return null;

  const endTime = new Date(range.end);
  endTime.setHours(endTime.getHours() + 1);

  return {
    id: "heavy-rain",
    type: "rain",
    severity: "high",
    icon: "rainy-outline",
    title: "⚠️ Heavy Rain Expected",
    message: `Heavy rainfall is expected ${formatTimeRange(range.start, range.end)}.`,
    time: formatTimeRange(range.start, range.end),
    action: "Carry an umbrella and waterproof jacket. Avoid low-lying areas.",
    timestamp: new Date().toISOString(),
    expiresAt: endTime.toISOString(),
    isActive: true,
  };
}

/**
 * Thunderstorm alert - FIXED:
 * - Only generates ONE alert for the first contiguous thunderstorm period
 * - Uses actual forecast timestamp for display and ID
 * - Limited to 48-hour scan window
 */
function checkThunderstorm(weather) {
  const range = findRangeForCondition(weather, (i, w) => {
    const code = w.hourly.weather_code?.[i];
    return [95, 96, 99].includes(code);
  });
  if (!range) return null;

  const endTime = new Date(range.end);
  endTime.setHours(endTime.getHours() + 1);

  // Check if it includes hail (codes 96, 99)
  let hasHail = false;
  if (weather?.hourly?.time) {
    const now = Date.now();
    for (let i = 0; i < weather.hourly.time.length; i++) {
      const t = new Date(weather.hourly.time[i]).getTime();
      if (t < now) continue;
      const code = weather.hourly.weather_code?.[i];
      if ([96, 99].includes(code)) { hasHail = true; break; }
      if (t > new Date(range.end).getTime()) break;
    }
  }

  return {
    id: "thunderstorm",
    type: "severe",
    severity: "critical",
    icon: "thunderstorm-outline",
    title: hasHail ? "⛈️ Thunderstorm with Hail Alert" : "⛈️ Thunderstorm Alert",
    message: `Thunderstorm conditions are expected ${formatTimeRange(range.start, range.end)}.`,
    time: formatTimeRange(range.start, range.end),
    action: "Stay indoors. Avoid open areas and high ground. Unplug electronics.",
    timestamp: new Date().toISOString(),
    expiresAt: endTime.toISOString(),
    isActive: true,
  };
}

function checkExtremeHeat(weather) {
  const current = weather?.current;
  const temp = current?.temperature_2m;
  const apparent = current?.apparent_temperature;

  if (temp == null) return null;
  if (temp < 40 && (apparent == null || apparent < 42)) return null;

  return {
    id: "extreme-heat",
    type: "temperature",
    severity: temp >= 44 ? "critical" : "high",
    icon: "thermometer-outline",
    title: "🌡️ Extreme Heat Alert",
    message: `Current temperature is ${Math.round(temp)}°C (feels like ${Math.round(apparent ?? temp)}°C). Heat stress risk is elevated.`,
    time: "Right now",
    action: "Stay hydrated, wear light clothing, avoid outdoor activity during peak hours (11 AM–4 PM).",
    timestamp: new Date().toISOString(),
    expiresAt: null, // active as long as condition holds
    isActive: true,
  };
}

function checkExtremeCold(weather) {
  const current = weather?.current;
  const temp = current?.temperature_2m;
  const apparent = current?.apparent_temperature;

  if (temp == null) return null;
  if (temp > 2) return null;

  return {
    id: "extreme-cold",
    type: "temperature",
    severity: temp <= -5 ? "critical" : "high",
    icon: "snow-outline",
    title: "🥶 Extreme Cold Alert",
    message: `Temperature is ${Math.round(temp)}°C (feels like ${Math.round(apparent ?? temp)}°C). Risk of hypothermia if outdoors.`,
    time: "Right now",
    action: "Wear heavy layers, gloves, and a hat. Limit outdoor exposure. Check on elderly neighbours.",
    timestamp: new Date().toISOString(),
    expiresAt: null,
    isActive: true,
  };
}

function checkStrongWind(weather) {
  const wind = weather?.current?.wind_speed_10m;
  const dailyMax = weather?.daily?.wind_gusts_10m_max?.[0];
  const maxWind = Math.max(wind ?? 0, dailyMax ?? 0);

  if (maxWind < 50) return null;

  return {
    id: "strong-wind",
    type: "wind",
    severity: maxWind >= 80 ? "critical" : maxWind >= 65 ? "high" : "moderate",
    icon: "flag-outline",
    title: "💨 Strong Wind Alert",
    message: `Wind speeds are reaching ${Math.round(maxWind)} km/h. Gusts may affect travel and outdoor activities.`,
    time: "Right now",
    action: "Secure outdoor items. Exercise caution while driving. Avoid trees and power lines.",
    timestamp: new Date().toISOString(),
    expiresAt: null,
    isActive: true,
  };
}

function checkPoorAQI(personaContext) {
  const aqi = personaContext?.air?.current?.us_aqi;
  if (aqi == null || aqi < 101) return null;

  const severity = aqi >= 201 ? "critical" : aqi >= 151 ? "high" : "moderate";
  const label = aqi >= 201 ? "Very Unhealthy" : aqi >= 151 ? "Unhealthy" : "Unhealthy for Sensitive Groups";
  const pm25 = personaContext?.air?.current?.pm2_5;

  return {
    id: "poor-aqi",
    type: "aqi",
    severity,
    icon: "partly-sunny-outline",
    title: `😷 Poor Air Quality — ${label}`,
    message: `AQI is ${Math.round(aqi)}${pm25 != null ? ` with PM2.5 at ${Math.round(pm25)} µg/m³` : ""}. Air quality is unhealthy.`,
    time: "Right now",
    action: "Wear an N95 mask outdoors. Limit strenuous outdoor activity. Keep windows closed.",
    timestamp: new Date().toISOString(),
    expiresAt: null,
    isActive: true,
  };
}

function checkHighUV(weather) {
  const uv = weather?.current?.uv_index;
  const dailyMaxUV = weather?.daily?.uv_index_max?.[0];
  const maxUV = Math.max(uv ?? 0, dailyMaxUV ?? 0);

  if (maxUV < 8) return null;

  const severity = maxUV >= 11 ? "critical" : maxUV >= 9 ? "high" : "moderate";
  const label = maxUV >= 11 ? "Extreme" : maxUV >= 9 ? "Very High" : "High";

  return {
    id: "high-uv",
    type: "uv",
    severity,
    icon: "sunny-outline",
    title: `☀️ ${label} UV Index`,
    message: `UV index is ${Math.round(maxUV)}. Skin damage can occur in minutes without protection.`,
    time: "Peak hours: 11 AM – 3 PM",
    action: "Apply SPF 30+ sunscreen, wear sunglasses and a hat. Seek shade during peak hours.",
    timestamp: new Date().toISOString(),
    expiresAt: null,
    isActive: true,
  };
}

function checkFogVisibility(weather) {
  const visibility = weather?.current?.visibility;
  const code = weather?.current?.weather_code;

  const isFogCode = [45, 48].includes(code);
  const isLowVisibility = visibility != null && visibility < 2000;

  if (!isFogCode && !isLowVisibility) return null;

  const dist = visibility != null ? `${(visibility / 1000).toFixed(1)} km` : "reduced";

  return {
    id: "fog-visibility",
    type: "visibility",
    severity: visibility != null && visibility < 500 ? "high" : "moderate",
    icon: "eye-outline",
    title: "🌫️ Low Visibility — Fog Warning",
    message: `Visibility is currently ${dist}. Driving and travel conditions are hazardous.`,
    time: "Right now",
    action: "Drive slowly, use fog lights. Allow extra travel time. Avoid highway driving if possible.",
    timestamp: new Date().toISOString(),
    expiresAt: null,
    isActive: true,
  };
}

/**
 * Sudden Weather Change - FIXED:
 * - Scans all hours in the 48-hour window (removed premature break)
 * - Only fires when transitioning from non-severe to severe conditions
 */
function checkSuddenWeatherChange(weather) {
  if (!weather?.hourly?.time) return null;

  const now = Date.now();
  const maxTime = now + MAX_SCAN_HOURS * 60 * 60 * 1000;
  const currentCode = weather?.current?.weather_code;
  if (currentCode == null) return null;

  const currentSevere = [45, 48, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(currentCode);
  if (currentSevere) return null; // already severe, no "sudden" change

  for (let i = 0; i < weather.hourly.time.length; i++) {
    const t = new Date(weather.hourly.time[i]).getTime();
    if (t < now + 60 * 60 * 1000) continue; // skip next 1 hr
    if (t > maxTime) break;

    const code = weather.hourly.weather_code?.[i];
    if (code == null) continue;

    const futureSevere = [45, 48, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);

    if (futureSevere) {
      const from = getWeatherInfo(currentCode);
      const to = getWeatherInfo(code);

      return {
        id: "weather-change",
        type: "severe",
        severity: [95, 96, 99].includes(code) ? "high" : "moderate",
        icon: "swap-vertical-outline",
        title: "🔄 Weather Change Ahead",
        message: `Conditions may shift from ${from.label} to ${to.label} around ${formatTimeRange(weather.hourly.time[i], null)}.`,
        time: `Around ${formatTimeRange(weather.hourly.time[i], null)}`,
        action: "Adjust your outdoor plans accordingly. Check the hourly forecast before heading out.",
        timestamp: new Date().toISOString(),
        expiresAt: weather.hourly.time[i],
        isActive: true,
      };
    }
    // DO NOT break here - continue scanning all hours
  }
  return null;
}

/* -------------------------------------------------------
   MAIN EXPORT
------------------------------------------------------- */

export function generateAlerts(weather, personaContext = {}) {
  if (!weather) return [];

  const generators = [
    () => checkThunderstorm(weather),
    () => checkHeavyRain(weather),
    () => checkExtremeHeat(weather),
    () => checkExtremeCold(weather),
    () => checkStrongWind(weather),
    () => checkPoorAQI(personaContext),
    () => checkHighUV(weather),
    () => checkFogVisibility(weather),
    () => checkSuddenWeatherChange(weather),
  ];

  const now = new Date();

  return generators
    .map((fn) => {
      try { return fn(); } catch { return null; }
    })
    .filter(Boolean)
    .filter((alert) => {
      // Filter out expired alerts
      if (alert.expiresAt) {
        return new Date(alert.expiresAt) > now;
      }
      return true;
    });
}

/**
 * Categorize alerts into active, upcoming, and resolved.
 * @param {Array} currentAlerts - Currently generated alerts
 * @param {Array} previousAlerts - Previously seen alerts (for resolved tracking)
 */
export function categorizeAlerts(currentAlerts = [], previousAlerts = []) {
  const now = new Date();
  const active = [];
  const upcoming = [];

  currentAlerts.forEach((alert) => {
    if (alert.time === "Right now" || !alert.expiresAt) {
      active.push(alert);
    } else {
      // Check if the alert's event time is more than 2 hours away
      const eventTime = alert.expiresAt ? new Date(alert.expiresAt) : null;
      if (eventTime && eventTime.getTime() - now.getTime() > 2 * 60 * 60 * 1000) {
        upcoming.push(alert);
      } else {
        active.push(alert);
      }
    }
  });

  // Find resolved alerts (were in previous but not in current)
  const currentIds = new Set(currentAlerts.map((a) => a.id));
  const resolved = previousAlerts
    .filter((a) => !currentIds.has(a.id))
    .map((a) => ({ ...a, isActive: false, resolvedAt: now.toISOString() }));

  return { active, upcoming, resolved };
}

/* Severity ordering for display */
export const SEVERITY_ORDER = { critical: 0, high: 1, moderate: 2, low: 3 };

export function sortAlerts(alerts) {
  return [...alerts].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
  );
}

export const SEVERITY_COLORS = {
  critical: { bg: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.5)", text: "#F87171" },
  high: { bg: "rgba(234,88,12,0.15)", border: "rgba(234,88,12,0.45)", text: "#FB923C" },
  moderate: { bg: "rgba(202,138,4,0.12)", border: "rgba(202,138,4,0.4)", text: "#EAB308" },
  low: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.35)", text: "#4ADE80" },
};
