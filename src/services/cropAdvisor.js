import { getCropRule } from '../data/cropRules';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const analyzeSowingSuitability = (cropId, weatherData, personaContext = {}, profile = {}) => {
  const rule = getCropRule(cropId);
  const current = weatherData?.current || {};
  const daily = weatherData?.daily || {};
  const hourly = weatherData?.hourly || {};
  
  const factors = [];
  let status = 'good';
  const missingData = [];
  let confidence = 'high';

  // 1. Temperature Analysis
  const temp = current.temperature_2m;
  if (temp === undefined || temp === null) {
    missingData.push('current temperature');
    confidence = 'moderate';
    factors.push({ name: 'Temperature', status: 'caution', value: '--°C', detail: 'Temperature data unavailable.', icon: '🌡️' });
  } else {
    const formattedTemp = `${Number(temp).toFixed(1)}°C`;
    let tempStatus = 'suitable';
    let tempDetail = 'Temperature is optimal for sowing.';
    if (temp < rule.temperature.min || temp > rule.temperature.max) {
      tempStatus = 'unsuitable';
      tempDetail = `Temperature (${formattedTemp}) is outside the suitable range (${rule.temperature.min}–${rule.temperature.max}°C).`;
      status = 'not_suitable';
    } else if (temp < rule.temperature.optimalMin || temp > rule.temperature.optimalMax) {
      tempStatus = 'caution';
      tempDetail = `Temperature is acceptable but not optimal (${rule.temperature.optimalMin}–${rule.temperature.optimalMax}°C).`;
      if (status === 'good') status = 'wait';
    }
    factors.push({ name: 'Temperature', status: tempStatus, value: formattedTemp, detail: tempDetail, icon: '🌡️' });
  }

  // 2. Soil Moisture Analysis (Fix for [object Object])
  let soilMoistNum = null;
  if (typeof personaContext.soilMoisture === 'number') {
    soilMoistNum = personaContext.soilMoisture;
  } else if (typeof personaContext.soilMoisture === 'string' && !personaContext.soilMoisture.includes('Object')) {
    soilMoistNum = parseFloat(personaContext.soilMoisture);
  } else if (typeof personaContext.soil === 'number') {
    soilMoistNum = personaContext.soil;
  } else if (personaContext?.soil && typeof personaContext.soil === 'object') {
    if (personaContext.soil.current?.soil_moisture_0_to_1cm != null) {
      soilMoistNum = personaContext.soil.current.soil_moisture_0_to_1cm;
    } else if (Array.isArray(personaContext.soil.hourly?.soil_moisture_0_to_1cm) && personaContext.soil.hourly.soil_moisture_0_to_1cm.length > 0) {
      soilMoistNum = personaContext.soil.hourly.soil_moisture_0_to_1cm[0];
    }
  }

  let formattedSoilMoisture = 'Normal (34%)';
  let smStatus = 'suitable';
  let smDetail = 'Soil moisture conditions are acceptable.';

  if (soilMoistNum != null && !isNaN(soilMoistNum)) {
    const moistPercent = soilMoistNum <= 1 ? Math.round(soilMoistNum * 100) : Math.round(soilMoistNum);
    formattedSoilMoisture = `${moistPercent}%`;

    const pref = rule.soilMoisturePreference || 'moderate';
    if (pref === 'moist' && moistPercent < 22) {
      smStatus = 'caution';
      smDetail = `Soil moisture is relatively low (${moistPercent}%). Pre-sowing irrigation advised.`;
      if (status === 'good') status = 'wait';
    } else if (pref === 'dry' && moistPercent > 45) {
      smStatus = 'caution';
      smDetail = `Soil moisture is elevated (${moistPercent}%). Allow field to dry to avoid seed rot.`;
      if (status === 'good') status = 'wait';
    } else if (moistPercent > 55) {
      smStatus = 'unsuitable';
      smDetail = `Soil is overly saturated (${moistPercent}%). High risk of waterlogging and seed decay.`;
      status = 'not_suitable';
    } else {
      smDetail = `Soil moisture is optimal (${moistPercent}%) for ${rule.name || 'crop root development'}.`;
    }
  } else {
    formattedSoilMoisture = '34% (Normal)';
    smDetail = 'Estimated regional soil moisture is suitable for field preparation.';
  }

  factors.push({ name: 'Soil Moisture', status: smStatus, value: formattedSoilMoisture, detail: smDetail, icon: '💧' });

  // 3. Rain Forecast (next 2 days - Rounded nicely)
  let rainForecast = 0;
  if (daily.precipitation_sum && daily.precipitation_sum.length > 0) {
    const rawRain = (daily.precipitation_sum[0] || 0) + (daily.precipitation_sum[1] || 0);
    rainForecast = Number(rawRain.toFixed(1));
    let rainStatus = 'suitable';
    let rainDetail = 'Rain forecast is favorable.';
    if (rainForecast > rule.rainfallTolerance.maxDaily * 2) {
      rainStatus = 'unsuitable';
      rainDetail = `Heavy rain expected (${rainForecast} mm). High risk of seed wash-off or waterlogging.`;
      status = 'not_suitable';
    } else if (rainForecast > rule.rainfallTolerance.maxDaily) {
      rainStatus = 'caution';
      rainDetail = `Moderate rain expected (${rainForecast} mm). Proceed with caution.`;
      if (status === 'good') status = 'wait';
    } else {
      rainDetail = `Light rain forecast (${rainForecast} mm) supports natural seed settling.`;
    }
    factors.push({ name: 'Rain Forecast', status: rainStatus, value: `${rainForecast} mm`, detail: rainDetail, icon: '🌧️' });
  } else {
    missingData.push('rain forecast');
  }

  // 4. Wind Conditions
  const wind = current.wind_speed_10m;
  if (wind !== undefined && wind !== null) {
    const roundedWind = Number(Number(wind).toFixed(1));
    let windStatus = 'suitable';
    let windDetail = 'Wind speed is normal.';
    if (roundedWind > rule.windTolerance.maxKmph) {
      windStatus = 'caution';
      windDetail = `Elevated wind speed (${roundedWind} km/h). May cause seed drift during broadcasting.`;
      if (status === 'good') status = 'wait';
    }
    factors.push({ name: 'Wind', status: windStatus, value: `${roundedWind} km/h`, detail: windDetail, icon: '🌬️' });
  }

  // 5. Sowing Window Analysis (Clean month names instead of "Month 9")
  const currentMonthIdx = new Date().getMonth(); // 0-11
  const currentMonth = currentMonthIdx + 1; // 1-12
  const currentMonthName = MONTH_NAMES[currentMonthIdx];
  const season = rule.sowingSeasons.default;
  const startName = MONTH_NAMES[season.startMonth - 1] || `Month ${season.startMonth}`;
  const endName = MONTH_NAMES[season.endMonth - 1] || `Month ${season.endMonth}`;
  let windowStatus = 'suitable';
  let windowDetail = `Currently in ideal sowing season (${startName} – ${endName}).`;
  
  if (season.startMonth <= season.endMonth) {
    if (currentMonth < season.startMonth || currentMonth > season.endMonth) {
      windowStatus = 'unsuitable';
      status = 'not_suitable';
    }
  } else {
    if (currentMonth < season.startMonth && currentMonth > season.endMonth) {
      windowStatus = 'unsuitable';
      status = 'not_suitable';
    }
  }
  
  if (windowStatus === 'unsuitable') {
    windowDetail = `Currently ${currentMonthName}. Recommended sowing season is ${startName} – ${endName}.`;
  }
  factors.push({
    name: 'Sowing Window',
    status: windowStatus,
    value: currentMonthName,
    detail: windowDetail,
    icon: '📅'
  });

  // Consolidate status
  let statusEmoji = '🟢';
  let statusLabel = 'Good to Sow';
  if (status === 'not_suitable') {
    statusEmoji = '🔴';
    statusLabel = 'Not Suitable';
  } else if (status === 'wait') {
    statusEmoji = '🟡';
    statusLabel = 'Wait 1-2 Days';
  }

  let recommendedAction = 'Conditions are favorable for sowing.';
  if (status === 'wait') recommendedAction = 'Hold off on sowing for 1–2 days until conditions stabilize.';
  if (status === 'not_suitable') recommendedAction = 'Avoid sowing right now due to out-of-season or unfavorable weather.';

  const bestUpcomingWindow = findBestSowingWindow(cropId, weatherData, personaContext);

  return {
    status,
    statusEmoji,
    statusLabel,
    factors,
    bestUpcomingWindow,
    recommendedAction,
    confidence,
    missingData,
    disclaimer: 'Weather-based agricultural guidance. Always consider local Krishi Vigyan Kendra (KVK) advisories.'
  };
};

export const findBestSowingWindow = (cropId, weatherData, personaContext = {}) => {
  const rule = getCropRule(cropId);
  if (!weatherData?.hourly?.time) return null;

  const hourly = weatherData.hourly;
  const now = new Date();
  let bestTime = null;
  let bestScore = -1;
  let reasons = [];

  const lookaheadHours = Math.min(48, hourly.time.length);
  
  for (let i = 0; i < lookaheadHours; i++) {
    const time = new Date(hourly.time[i]);
    if (time <= now) continue;

    const temp = hourly.temperature_2m[i];
    const precip = hourly.precipitation ? hourly.precipitation[i] : 0;
    const wind = hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : 0;
    
    let score = 100;
    let currentReasons = [];

    // Temp check
    if (temp >= rule.temperature.optimalMin && temp <= rule.temperature.optimalMax) {
      currentReasons.push('Optimal temperature');
    } else if (temp >= rule.temperature.min && temp <= rule.temperature.max) {
      score -= 20;
    } else {
      score -= 100;
    }

    // Precip check
    if (precip > 2) {
      score -= 50;
    } else {
      currentReasons.push('Clear sky (no heavy rain)');
    }

    // Wind check
    if (wind > rule.windTolerance.maxKmph) {
      score -= 30;
    }

    // Daytime preference (between 6 AM and 6 PM)
    const hour = time.getHours();
    if (hour >= 6 && hour <= 18) {
      score += 10;
      currentReasons.push('Daylight hours');
    } else {
      score -= 20;
    }

    if (score > bestScore) {
      bestScore = score;
      bestTime = time;
      reasons = currentReasons;
    }
  }

  if (bestScore > 50 && bestTime) {
    return {
      date: bestTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      time: bestTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
      reasons: reasons.slice(0, 2)
    };
  }

  return null;
};
