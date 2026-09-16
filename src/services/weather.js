const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search";

const REVERSE_GEOCODING_URL =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

/* -------------------------------------------------------
   LOCATION SEARCH
------------------------------------------------------- */

export async function searchLocations(query) {
  if (!query?.trim()) return [];

  const response = await fetch(
    `${GEOCODING_URL}?name=${encodeURIComponent(
      query.trim()
    )}&count=8&language=en&format=json`
  );

  if (!response.ok) {
    throw new Error("Unable to search locations");
  }

  const data = await response.json();

  return (data.results || []).map((place) => ({
    name: place.name,
    region: place.admin1 || "",
    country: place.country || "",
    latitude: place.latitude,
    longitude: place.longitude,
  }));
}

/* -------------------------------------------------------
   WEATHER
------------------------------------------------------- */

export async function getWeather(latitude, longitude) {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    throw new Error("Location coordinates are required");
  }

  const url =
    `${WEATHER_URL}?latitude=${latitude}` +
    `&longitude=${longitude}` +

    // Current conditions
    `&current=` +
    `temperature_2m,` +
    `relative_humidity_2m,` +
    `apparent_temperature,` +
    `weather_code,` +
    `wind_speed_10m,` +
    `wind_direction_10m,` +
    `uv_index,` +
    `precipitation,` +
    `rain,` +
    `showers,` +
    `snowfall,` +
    `visibility` +

    // Hourly conditions
    `&hourly=` +
    `temperature_2m,` +
    `apparent_temperature,` +
    `relative_humidity_2m,` +
    `weather_code,` +
    `precipitation_probability,` +
    `precipitation,` +
    `rain,` +
    `showers,` +
    `snowfall,` +
    `wind_speed_10m,` +
    `wind_direction_10m,` +
    `uv_index,` +
    `visibility` +

    // Daily information
    `&daily=` +
    `temperature_2m_max,` +
    `temperature_2m_min,` +
    `apparent_temperature_max,` +
    `apparent_temperature_min,` +
    `sunrise,` +
    `sunset,` +
    `daylight_duration,` +
    `sunshine_duration,` +
    `precipitation_sum,` +
    `precipitation_probability_max,` +
    `rain_sum,` +
    `showers_sum,` +
    `snowfall_sum,` +
    `wind_speed_10m_max,` +
    `wind_gusts_10m_max,` +
    `uv_index_max` +

    `&forecast_days=7` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to fetch weather");
  }

  return response.json();
}

/* -------------------------------------------------------
   REVERSE GEOCODING
------------------------------------------------------- */

export async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `${REVERSE_GEOCODING_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  );

  if (!response.ok) {
    throw new Error("Unable to identify location");
  }

  const data = await response.json();

  return {
    name:
      data.city ||
      data.locality ||
      data.principalSubdivision ||
      "Current location",

    region: data.principalSubdivision || "",

    country: data.countryName || "",

    latitude,
    longitude,
  };
}

/* -------------------------------------------------------
   CURRENT DEVICE LOCATION
------------------------------------------------------- */

export async function getCurrentDeviceLocation() {
  return new Promise((resolve, reject) => {
    if (
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      reject(
        new Error(
          "Location is not supported by this device"
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const place = await reverseGeocode(
            latitude,
            longitude
          );

          resolve(place);
        } catch (error) {
          reject(error);
        }
      },

      (error) => {
        reject(error);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  });
}

/* -------------------------------------------------------
   WEATHER CODE → HUMAN INFORMATION
------------------------------------------------------- */

export function getWeatherInfo(code) {
  if (code === 0) {
    return {
      label: "Clear Sky",
      icon: "sunny-outline",
      severity: "normal",
    };
  }

  if ([1, 2].includes(code)) {
    return {
      label: "Partly Cloudy",
      icon: "partly-sunny-outline",
      severity: "normal",
    };
  }

  if (code === 3) {
    return {
      label: "Overcast",
      icon: "cloud-outline",
      severity: "normal",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      label: "Fog",
      icon: "cloud-outline",
      severity: "caution",
    };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      label: "Drizzle",
      icon: "rainy-outline",
      severity: "caution",
    };
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return {
      label: "Rain",
      icon: "rainy-outline",
      severity: "caution",
    };
  }

  if ([71, 73, 75, 77].includes(code)) {
    return {
      label: "Snow",
      icon: "snow-outline",
      severity: "caution",
    };
  }

  if ([80, 81, 82].includes(code)) {
    return {
      label: "Rain Showers",
      icon: "rainy-outline",
      severity: "caution",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      label: "Thunderstorm",
      icon: "thunderstorm-outline",
      severity: "danger",
    };
  }

  return {
    label: "Unknown",
    icon: "cloud-outline",
    severity: "normal",
  };
}

/* -------------------------------------------------------
   HELPER FUNCTIONS
------------------------------------------------------- */

export function getHourlyWeather(weather, index) {
  if (!weather?.hourly) return null;

  return {
    time: weather.hourly.time?.[index],
    temperature:
      weather.hourly.temperature_2m?.[index],
    apparentTemperature:
      weather.hourly.apparent_temperature?.[index],
    humidity:
      weather.hourly.relative_humidity_2m?.[index],
    weatherCode:
      weather.hourly.weather_code?.[index],
    precipitationProbability:
      weather.hourly
        .precipitation_probability?.[index],
    precipitation:
      weather.hourly.precipitation?.[index],
    rain:
      weather.hourly.rain?.[index],
    showers:
      weather.hourly.showers?.[index],
    snowfall:
      weather.hourly.snowfall?.[index],
    windSpeed:
      weather.hourly.wind_speed_10m?.[index],
    windDirection:
      weather.hourly.wind_direction_10m?.[index],
    uvIndex:
      weather.hourly.uv_index?.[index],
    visibility:
      weather.hourly.visibility?.[index],
  };
}

export function getDailyWeather(weather, index = 0) {
  if (!weather?.daily) return null;

  return {
    date: weather.daily.time?.[index],

    maxTemperature:
      weather.daily.temperature_2m_max?.[index],

    minTemperature:
      weather.daily.temperature_2m_min?.[index],

    maxApparentTemperature:
      weather.daily.apparent_temperature_max?.[index],

    minApparentTemperature:
      weather.daily.apparent_temperature_min?.[index],

    sunrise:
      weather.daily.sunrise?.[index],

    sunset:
      weather.daily.sunset?.[index],

    daylightDuration:
      weather.daily.daylight_duration?.[index],

    sunshineDuration:
      weather.daily.sunshine_duration?.[index],

    precipitation:
      weather.daily.precipitation_sum?.[index],

    rain:
      weather.daily.rain_sum?.[index],

    showers:
      weather.daily.showers_sum?.[index],

    snowfall:
      weather.daily.snowfall_sum?.[index],

    precipitationProbability:
      weather.daily
        .precipitation_probability_max?.[index],

    maxWind:
      weather.daily.wind_speed_10m_max?.[index],

    maxWindGust:
      weather.daily.wind_gusts_10m_max?.[index],

    maxUV:
      weather.daily.uv_index_max?.[index],
  };
}

/* -------------------------------------------------------
   FIND NEXT WEATHER CHANGE
------------------------------------------------------- */

export function findNextWeatherChange(weather) {
  if (!weather?.hourly?.time) return null;

  const now = Date.now();

  for (let i = 0; i < weather.hourly.time.length; i++) {
    const time =
      new Date(weather.hourly.time[i]).getTime();

    if (time <= now) continue;

    const probability =
      weather.hourly.precipitation_probability?.[i] ??
      0;

    const code =
      weather.hourly.weather_code?.[i];

    if (
      probability >= 50 ||
      [45, 48, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(
        code
      )
    ) {
      return {
        index: i,
        time: weather.hourly.time[i],
        precipitationProbability: probability,
        weatherCode: code,
        info: getWeatherInfo(code),
      };
    }
  }

  return null;
}

/* -------------------------------------------------------
   FIND BEST OUTDOOR WINDOW
------------------------------------------------------- */

export function calculateBestWindow(weather) {
  if (!weather?.hourly?.time) return null;

  const now = Date.now();

  let best = null;

  for (let i = 0; i < weather.hourly.time.length; i++) {
    const time =
      new Date(weather.hourly.time[i]).getTime();

    if (time < now) continue;

    const temperature =
      weather.hourly.temperature_2m?.[i];

    const rainProbability =
      weather.hourly
        .precipitation_probability?.[i] ?? 0;

    const wind =
      weather.hourly.wind_speed_10m?.[i] ?? 0;

    const uv =
      weather.hourly.uv_index?.[i] ?? 0;

    const code =
      weather.hourly.weather_code?.[i];

    let score = 100;

    // Rain penalty
    score -= rainProbability * 0.55;

    // Strong wind penalty
    if (wind > 30) {
      score -= 25;
    } else if (wind > 20) {
      score -= 12;
    }

    // Temperature penalty
    if (temperature > 35) {
      score -= 30;
    } else if (temperature > 32) {
      score -= 15;
    }

    if (temperature < 8) {
      score -= 20;
    }

    // UV penalty
    if (uv >= 9) {
      score -= 15;
    }

    // Severe weather penalty
    if ([95, 96, 99].includes(code)) {
      score -= 60;
    }

    score = Math.max(
      0,
      Math.round(score)
    );

    if (!best || score > best.score) {
      best = {
        index: i,
        time: weather.hourly.time[i],
        score,
        temperature,
        rainProbability,
        wind,
        uv,
        weatherCode: code,
        info: getWeatherInfo(code),
      };
    }
  }

  return best;
}

/* -------------------------------------------------------
   PERSONA DECISION ENGINE
------------------------------------------------------- */

export function getPersonaInsight({
  persona,
  weather,
  current,
}) {
  if (!weather || !current) {
    return null;
  }

  const temperature =
    current.temperature_2m;

  const apparent =
    current.apparent_temperature;

  const humidity =
    current.relative_humidity_2m;

  const wind =
    current.wind_speed_10m;

  const uv =
    current.uv_index;

  const precipitation =
    current.precipitation;

  const visibility =
    current.visibility;

  const code =
    current.weather_code;

  const rainProbability =
    weather.daily
      ?.precipitation_probability_max?.[0] ?? 0;

  const info = getWeatherInfo(code);

  switch (persona) {
    case "student":
      if (rainProbability >= 50) {
        return {
          title: "Plan your return journey",
          message:
            "Rain is likely later. Keep your return commute flexible.",
          type: "rain",
        };
      }

      return {
        title: "Good campus conditions",
        message:
          "Conditions look suitable for your campus day.",
        type: "normal",
      };

    case "fitness":
      if (uv >= 8) {
        return {
          title: "Choose a cooler workout window",
          message:
            "UV is high right now. An early or later session may be more comfortable.",
          type: "uv",
        };
      }

      if (temperature >= 32) {
        return {
          title: "Heat is building",
          message:
            "Consider reducing workout intensity or moving it to a cooler window.",
          type: "heat",
        };
      }

      if (rainProbability >= 50) {
        return {
          title: "Rain may affect your workout",
          message:
            "Check the next few hours for a drier training window.",
          type: "rain",
        };
      }

      return {
        title: "Good time to get moving",
        message:
          "Current temperature and conditions look favorable for outdoor activity.",
        type: "normal",
      };

    case "farmer":
      if (rainProbability >= 60) {
        return {
          title: "Rain is likely",
          message:
            "Rain probability is elevated. Plan field work around the expected change.",
          type: "rain",
        };
      }

      if (wind >= 30) {
        return {
          title: "Wind is picking up",
          message:
            "Strong winds are currently forecast. Consider wind-sensitive field work carefully.",
          type: "wind",
        };
      }

      return {
        title: "Field conditions",
        message:
          `${info.label} with ${Math.round(
            humidity ?? 0
          )}% humidity right now.`,
        type: "normal",
      };

    case "traveler":
      if (rainProbability >= 60) {
        return {
          title: "Weather may affect plans",
          message:
            "Rain probability is elevated. Keep outdoor plans flexible.",
          type: "rain",
        };
      }

      if (visibility !== undefined && visibility < 3000) {
        return {
          title: "Visibility is reduced",
          message:
            "Current visibility is lower than usual. Allow extra travel time.",
          type: "visibility",
        };
      }

      return {
        title: "Travel conditions look stable",
        message:
          "Current weather does not indicate a major outdoor disruption.",
        type: "normal",
      };

    case "family":
      if (rainProbability >= 50) {
        return {
          title: "Plan around the rain",
          message:
            "Rain may affect the day. Keep school and family travel flexible.",
          type: "rain",
        };
      }

      return {
        title: "Family day looks comfortable",
        message:
          "No major weather disruption is currently indicated.",
        type: "normal",
      };

    case "commuter":
      if (visibility !== undefined && visibility < 3000) {
        return {
          title: "Visibility is reduced",
          message:
            "Reduced visibility can make the commute slower. Allow extra time.",
          type: "visibility",
        };
      }

      if (rainProbability >= 50) {
        return {
          title: "Rain may affect your commute",
          message:
            "Check the next few hours before leaving.",
          type: "rain",
        };
      }

      return {
        title: "Commute looks stable",
        message:
          "Current conditions do not show a major weather disruption.",
        type: "normal",
      };

    case "event_planner":
      if (rainProbability >= 50) {
        return {
          title: "Weather risk for your event",
          message:
            "Rain probability is elevated. Keep a backup plan ready.",
          type: "rain",
        };
      }

      if (wind >= 30) {
        return {
          title: "Wind may affect the setup",
          message:
            "Strong winds are possible. Check outdoor structures and setup plans.",
          type: "wind",
        };
      }

      return {
        title: "Event conditions look stable",
        message:
          "Current weather conditions look suitable for outdoor planning.",
        type: "normal",
      };

    case "outdoor_worker":
      if (temperature >= 35) {
        return {
          title: "Heat risk is rising",
          message:
            "Outdoor conditions are becoming hot. Plan breaks and cooler work periods.",
          type: "heat",
        };
      }

      if (rainProbability >= 50) {
        return {
          title: "Rain may interrupt work",
          message:
            "Rain probability is elevated. Plan weather-sensitive work accordingly.",
          type: "rain",
        };
      }

      return {
        title: "Work conditions are stable",
        message:
          "No major weather disruption is currently indicated.",
        type: "normal",
      };

    case "nature":
      if (rainProbability >= 60) {
        return {
          title: "Outdoor plans may change",
          message:
            "Rain is becoming more likely. Check for a better outdoor window.",
          type: "rain",
        };
      }

      return {
        title: "A good time to explore",
        message:
          "Current conditions look suitable for outdoor activity.",
        type: "normal",
      };

    default:
      if ([95, 96, 99].includes(code)) {
        return {
          title: "Thunderstorm conditions",
          message:
            "Consider moving outdoor plans indoors while conditions are active.",
          type: "danger",
        };
      }

      if (rainProbability >= 50) {
        return {
          title: "Rain may be on the way",
          message:
            "Keep your plans flexible and check the next weather change.",
          type: "rain",
        };
      }

      return {
        title: "Conditions look stable",
        message:
          `Currently ${Math.round(
            temperature ?? 0
          )}° with ${info.label.toLowerCase()}.`,
        type: "normal",
      };
  }
}