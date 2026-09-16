/**
 * personaPriorities.js
 * Automatic weather priorities and profiles defined per user persona.
 * Based on Section 6 & 7 of the Mausam Personalization Architecture.
 */

export const PERSONA_PRIORITIES = {
  traveler: {
    profileTitle: "✈️ Your Traveler Weather Profile",
    subtitle: "Mausam will focus on the weather information that matters most for your journeys.",
    priorities: [
      { id: "travel_conditions", label: "Travel Conditions", icon: "✈️" },
      { id: "rain_risk", label: "Rain & Storm Risk", icon: "☔" },
      { id: "temperature", label: "Temperature & Feels-like", icon: "🌡️" },
      { id: "visibility", label: "Visibility & Fog", icon: "🌫️" },
      { id: "aqi", label: "Air Quality (AQI)", icon: "😷" },
      { id: "carry", label: "Travel Requirements & Gear", icon: "🎒" },
      { id: "best_time", label: "Best Travel Time", icon: "🕐" },
    ],
    primaryMetrics: ["visibility", "rain", "temperature", "aqi", "wind"],
  },

  farmer: {
    profileTitle: "🌾 Your Agriculture & Farm Weather Profile",
    subtitle: "Mausam will prioritize precipitation, soil moisture, humidity and multi-day field outlook.",
    priorities: [
      { id: "rain", label: "Rainfall & Showers", icon: "🌧️" },
      { id: "precipitation", label: "Precipitation Probability", icon: "☔" },
      { id: "temperature", label: "Temperature Min/Max", icon: "🌡️" },
      { id: "humidity", label: "Humidity & Moisture", icon: "💧" },
      { id: "wind", label: "Wind & Gusts", icon: "💨" },
      { id: "severe", label: "Severe Weather Alerts", icon: "⚠️" },
      { id: "forecast", label: "7-Day Farm Forecast", icon: "📅" },
      { id: "changes", label: "Sudden Weather Shifts", icon: "🔄" },
    ],
    primaryMetrics: ["rain", "humidity", "temperature", "wind", "uv"],
  },

  fitness: {
    profileTitle: "🏃 Your Fitness & Training Weather Profile",
    subtitle: "Mausam will track outdoor training windows, heat stress, AQI and hydration needs.",
    priorities: [
      { id: "temperature", label: "Temperature & Feels-like", icon: "🌡️" },
      { id: "aqi", label: "Air Quality (AQI)", icon: "😷" },
      { id: "uv", label: "UV Index & Sun Protection", icon: "☀️" },
      { id: "humidity", label: "Humidity & Heat Index", icon: "💧" },
      { id: "wind", label: "Wind Conditions", icon: "💨" },
      { id: "rain", label: "Rain Interruption Risk", icon: "☔" },
      { id: "best_time", label: "Best Workout Window", icon: "🏃" },
    ],
    primaryMetrics: ["temperature", "aqi", "uv", "humidity", "wind"],
  },

  health: {
    profileTitle: "🍃 Your Health & Wellness Weather Profile",
    subtitle: "Mausam will highlight air quality, allergens, extreme exposure and safe breathing conditions.",
    priorities: [
      { id: "aqi", label: "Air Quality & PM2.5", icon: "😷" },
      { id: "uv", label: "UV Index & Sun Safety", icon: "☀️" },
      { id: "humidity", label: "Humidity & Breathability", icon: "💧" },
      { id: "temperature", label: "Extreme Temperature Warnings", icon: "🌡️" },
      { id: "severe", label: "Extreme Weather Advisories", icon: "⚠️" },
      { id: "air_conditions", label: "Outdoor Exposure Safety", icon: "🍃" },
    ],
    primaryMetrics: ["aqi", "uv", "temperature", "humidity", "visibility"],
  },

  family: {
    profileTitle: "👨‍👩‍👧 Your Family Weather Profile",
    subtitle: "Mausam will keep family outings, school commutes, and children's weather comfort safe.",
    priorities: [
      { id: "temperature", label: "Comfortable Temperature", icon: "🌡️" },
      { id: "rain", label: "Rain & Thunderstorm Timing", icon: "☔" },
      { id: "aqi", label: "Air Quality for Kids & Seniors", icon: "😷" },
      { id: "uv", label: "Sun & UV Protection", icon: "☀️" },
      { id: "severe", label: "Severe Weather Alerts", icon: "⚠️" },
      { id: "outdoor_period", label: "Comfortable Outdoor Periods", icon: "🎠" },
    ],
    primaryMetrics: ["temperature", "rain", "aqi", "uv", "wind"],
  },

  beachgoer: {
    profileTitle: "🏖️ Your Beach & Coastal Weather Profile",
    subtitle: "Mausam will track sunshine, UV levels, coastal winds, and optimal swimming hours.",
    priorities: [
      { id: "temperature", label: "Ambient & Water Temperature", icon: "🌡️" },
      { id: "uv", label: "UV Index & Sunscreen Window", icon: "☀️" },
      { id: "wind", label: "Coastal Wind & Breeze", icon: "💨" },
      { id: "rain", label: "Rain & Cloud Cover", icon: "☔" },
      { id: "humidity", label: "Humidity & Warmth", icon: "💧" },
      { id: "best_time", label: "Best Beach & Sun Window", icon: "🏖️" },
    ],
    primaryMetrics: ["uv", "temperature", "wind", "humidity", "rain"],
  },

  commuter: {
    profileTitle: "🚶 Your Daily Commuter Weather Profile",
    subtitle: "Mausam will prioritize transit conditions, rain timing, road visibility, and commute windows.",
    priorities: [
      { id: "rain", label: "Rain Timing & Downpour Risk", icon: "☔" },
      { id: "wind", label: "Wind & Gust Disruptions", icon: "💨" },
      { id: "visibility", label: "Visibility & Morning Fog", icon: "🌫️" },
      { id: "temperature", label: "Transit Temperature", icon: "🌡️" },
      { id: "severe", label: "Transit-impacting Weather", icon: "⚠️" },
      { id: "current", label: "Real-time Conditions & Timing", icon: "🚗" },
    ],
    primaryMetrics: ["visibility", "rain", "wind", "temperature", "aqi"],
  },

  event_planner: {
    profileTitle: "🎪 Your Event Planner Weather Profile",
    subtitle: "Mausam will monitor outdoor venue risks, storm probabilities, wind gusts and setup safety.",
    priorities: [
      { id: "rain", label: "Rain & Precipitation Risk", icon: "☔" },
      { id: "temperature", label: "Guest Comfort Temperature", icon: "🌡️" },
      { id: "wind", label: "Wind & Canopy Safety", icon: "💨" },
      { id: "severe", label: "Thunderstorm & Lightning Alerts", icon: "⛈️" },
      { id: "forecast", label: "Hourly Event Window Forecast", icon: "📅" },
      { id: "risks", label: "Weather Disruption Risks", icon: "⚠️" },
    ],
    primaryMetrics: ["rain", "wind", "temperature", "uv", "visibility"],
  },

  student: {
    profileTitle: "🎓 Your Student Weather Profile",
    subtitle: "Mausam will monitor campus transit, rain between classes, and daily study gear.",
    priorities: [
      { id: "rain", label: "Rain During Class Commutes", icon: "☔" },
      { id: "temperature", label: "Campus Temperature", icon: "🌡️" },
      { id: "visibility", label: "Morning Commute Visibility", icon: "🌫️" },
      { id: "uv", label: "Afternoon Sun Exposure", icon: "☀️" },
      { id: "carry", label: "What to Pack in Your Bag", icon: "🎒" },
    ],
    primaryMetrics: ["rain", "temperature", "visibility", "uv", "wind"],
  },

  outdoor_worker: {
    profileTitle: "🦺 Your Outdoor Work Weather Profile",
    subtitle: "Mausam will track heat stress, thunderstorm risk, hydration requirements, and shift safety.",
    priorities: [
      { id: "temperature", label: "Heat & Cold Stress Limits", icon: "🌡️" },
      { id: "rain", label: "Work-interrupting Rain", icon: "🌧️" },
      { id: "uv", label: "All-day UV Exposure", icon: "☀️" },
      { id: "wind", label: "High Wind Work Hazard", icon: "💨" },
      { id: "aqi", label: "Outdoor Air Quality", icon: "😷" },
      { id: "severe", label: "Storm & Lightning Alerts", icon: "⚠️" },
    ],
    primaryMetrics: ["temperature", "rain", "uv", "wind", "aqi"],
  },
};

export function getPersonaPriorities(personaId) {
  const norm = (personaId || "traveler").toLowerCase().replace("-", "_");
  return PERSONA_PRIORITIES[norm] || PERSONA_PRIORITIES.traveler;
}
