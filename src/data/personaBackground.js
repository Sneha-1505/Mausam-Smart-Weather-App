/**
 * personaBackground.js
 * Intelligent Personalization Engine:
 * Combines Persona + Weather Code + Time of Day + Theme Mode
 * to compute the visual environment, background image, gradient styling,
 * overlay contrast, and atmospheric metadata without reducing text readability.
 */

export const BASE_ASSETS = {
  traveler: require("../../assets/traveller.png"),
  farmer: require("../../assets/farmer.png"),
  fitness: require("../../assets/fitness.png"),
  health: require("../../assets/onboarding-bg.png"),
  family: require("../../assets/family.png"),
  beachgoer: require("../../assets/beach.png"),
  commuter: require("../../assets/commuter.png"),
  event_planner: require("../../assets/planner.png"),
  student: require("../../assets/student.png"),
  outdoor_worker: require("../../assets/outdoor.png"),
};

export function getTimeOfDay(hour) {
  const h = hour !== undefined ? hour : new Date().getHours();
  if (h >= 5 && h < 8) return "dawn";
  if (h >= 8 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 20) return "evening";
  return "night";
}

export function getWeatherMood(code) {
  if (code === 0 || code === 1) return "clear";
  if (code === 2 || code === 3) return "clouds";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "clear";
}

export function getPersonaEnvironment({ persona, weatherCode, hour, isDark = true }) {
  const normPersona = (persona || "traveler").toLowerCase().replace("-", "_");
  const time = getTimeOfDay(hour);
  const mood = getWeatherMood(weatherCode ?? 0);

  const imageSource = BASE_ASSETS[normPersona] || BASE_ASSETS.traveler;

  // Compute atmosphere accent and ambient color based on Persona
  let personaAccent = "#D99A3D";
  let personaName = "Traveler";

  switch (normPersona) {
    case "traveler":
      personaAccent = "#38BDF8";
      personaName = "Traveler";
      break;
    case "farmer":
      personaAccent = "#4ADE80";
      personaName = "Farmer";
      break;
    case "fitness":
      personaAccent = "#FB923C";
      personaName = "Fitness";
      break;
    case "health":
      personaAccent = "#34D399";
      personaName = "Health";
      break;
    case "family":
      personaAccent = "#F472B6";
      personaName = "Family";
      break;
    case "beachgoer":
      personaAccent = "#38BDF8";
      personaName = "Beachgoer";
      break;
    case "commuter":
      personaAccent = "#FBBF24";
      personaName = "Commuter";
      break;
    case "event_planner":
      personaAccent = "#A78BFA";
      personaName = "Event Planner";
      break;
    case "student":
      personaAccent = "#60A5FA";
      personaName = "Student";
      break;
    case "outdoor_worker":
      personaAccent = "#F59E0B";
      personaName = "Outdoor Worker";
      break;
  }

  // Atmospheric title based on (Persona + Weather + Time)
  let atmosphereText = `${personaName} Environment`;
  if (mood === "storm") {
    atmosphereText = `${personaName} · Dramatic Weather Environment`;
  } else if (mood === "rain") {
    atmosphereText = `${personaName} · Rainy Atmosphere`;
  } else if (mood === "fog") {
    atmosphereText = `${personaName} · Misty Horizon`;
  } else if (time === "night") {
    atmosphereText = `${personaName} · Evening Calm`;
  } else if (time === "dawn" || time === "morning") {
    atmosphereText = `${personaName} · Morning Light`;
  } else {
    atmosphereText = `${personaName} · Daylight Window`;
  }

  // Dynamic overlays ensuring cards and numbers remain 100% accessible and high contrast
  let overlayColor = "rgba(11, 16, 24, 0.76)";
  let topGradient = "rgba(11, 16, 24, 0.85)";
  let bottomGradient = "rgba(11, 16, 24, 0.96)";

  if (time === "night") {
    overlayColor = "rgba(5, 8, 15, 0.86)";
    topGradient = "rgba(5, 8, 15, 0.88)";
    bottomGradient = "rgba(4, 6, 12, 0.98)";
  } else if (mood === "storm") {
    overlayColor = "rgba(12, 14, 25, 0.85)";
    topGradient = "rgba(20, 24, 40, 0.88)";
    bottomGradient = "rgba(8, 10, 18, 0.98)";
  } else if (mood === "rain") {
    overlayColor = "rgba(13, 22, 33, 0.80)";
    topGradient = "rgba(18, 30, 44, 0.85)";
    bottomGradient = "rgba(8, 14, 22, 0.96)";
  } else if (time === "dawn" || time === "morning") {
    overlayColor = isDark ? "rgba(12, 18, 28, 0.72)" : "rgba(245, 242, 234, 0.78)";
    topGradient = isDark ? "rgba(18, 25, 38, 0.75)" : "rgba(255, 255, 255, 0.80)";
    bottomGradient = isDark ? "rgba(11, 16, 24, 0.94)" : "rgba(240, 235, 225, 0.95)";
  }

  return {
    image: imageSource,
    personaAccent,
    personaName,
    timeOfDay: time,
    weatherMood: mood,
    atmosphereText,
    overlayColor,
    topGradient,
    bottomGradient,
  };
}