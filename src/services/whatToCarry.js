/**
 * whatToCarry.js
 * Intelligent Persona + Weather recommendation engine.
 * Generates dynamic packing, attire, and preparation items based on:
 * User Persona + Current Conditions + Hourly/Daily Forecast.
 */

import { getWeatherInfo } from "./weather";

/**
 * Calculates approximate moon phase for a given date.
 */
function getMoonPhase(date = new Date()) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 3) {
    year--;
    month += 12;
  }

  let c = 365.25 * year;
  let e = 30.6 * month;
  let jd = c + e + day - 694039.09; // Julian date offset
  jd /= 29.5305882; // divide by moon cycle
  let b = parseInt(jd); // int part
  jd -= b; // fractional part
  let phaseNumber = Math.round(jd * 8);

  if (phaseNumber >= 8) phaseNumber = 0;

  const phases = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
  ];

  return phases[phaseNumber] || "Waxing Crescent";
}

function formatTime12h(isoString) {
  if (!isoString) return "--";
  return new Date(isoString).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

/**
 * Returns strictly relevant items for "What You Need Today" based on live weather data.
 */
export function getWhatYouNeedToday({ weather, personaContext, profile }) {
  if (!weather?.current) {
    return [
      {
        id: "water_bottle",
        name: "Water Bottle",
        icon: "💧",
        reason: "Stay hydrated throughout your day.",
        why: "Regular hydration improves focus and energy regardless of conditions.",
        priority: "normal",
      },
      {
        id: "backpack",
        name: "Backpack",
        icon: "🎒",
        reason: "Carry your daily essentials.",
        why: "Keeps your necessities organized during daily commutes.",
        priority: "normal",
      },
    ];
  }

  const current = weather.current;
  const daily = weather.daily || {};
  const hourly = weather.hourly || {};
  const persona = (profile?.persona || "traveler").toLowerCase();

  const temp = current.temperature_2m ?? 24;
  const feelsLike = current.apparent_temperature ?? temp;
  const code = current.weather_code ?? 0;
  const wind = current.wind_speed_10m ?? 10;
  const uv = current.uv_index ?? daily.uv_index_max?.[0] ?? 3;
  const visibility = current.visibility ?? 10000;
  const rainProb = daily.precipitation_probability_max?.[0] ?? 0;
  const aqi = personaContext?.air?.current?.us_aqi ?? null;

  const isRainingNow = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
  const isRainLikely = isRainingNow || rainProb >= 35;
  const isHeavyRain = isRainingNow && [63, 65, 66, 67, 81, 82, 95, 96, 99].includes(code);
  const isHot = temp >= 30 || feelsLike >= 33;
  const isCold = temp <= 16;
  const isFreezing = temp <= 8;
  const isWindy = wind >= 25;
  const isPoorAQI = aqi != null && aqi >= 101;
  const isHighUV = uv >= 5;
  const isFoggy = [45, 48].includes(code) || visibility < 2500;

  const items = [];

  // 1. Umbrella
  if (isRainLikely) {
    items.push({
      id: "umbrella",
      name: "Umbrella",
      icon: "☂️",
      reason: isRainingNow ? "Active precipitation reported right now." : `Rain is likely today (${rainProb}% probability).`,
      why: "Keep a compact umbrella handy to prevent getting drenched during outdoor transits.",
      priority: "high",
    });
  }

  // 2. Raincoat / Waterproof layer
  if (isRainLikely && (isHeavyRain || rainProb >= 60 || persona === "commuter" || persona === "farmer")) {
    items.push({
      id: "raincoat",
      name: "Raincoat",
      icon: "🧥",
      reason: `Heavy rain chance (${rainProb}%) or outdoor work scheduled.`,
      why: "Hands-free waterproof protection is essential when commuting or working in open areas.",
      priority: "high",
    });
  }

  // 3. Waterproof Boots / Gumboots
  if (isRainLikely && (isHeavyRain || persona === "farmer" || persona === "outdoor_worker")) {
    items.push({
      id: "boots",
      name: persona === "farmer" ? "Gumboots" : "Waterproof Boots",
      icon: "👢",
      reason: "Wet pavement and field waterlogging anticipated.",
      why: "Provides traction, avoids slipping and protects footwear from mud and water.",
      priority: "medium",
    });
  }

  // 4. Jacket / Sweater
  if (isCold) {
    items.push({
      id: "jacket",
      name: isFreezing ? "Heavy Coat" : "Warm Jacket",
      icon: "🧥",
      reason: `Current temperature is ${Math.round(temp)}°C (feels like ${Math.round(feelsLike)}°C).`,
      why: "Layering prevents rapid body heat loss in cold and breezy weather.",
      priority: "high",
    });
  }

  // 5. Water Bottle
  if (isHot || persona === "fitness" || persona === "farmer" || persona === "outdoor_worker") {
    items.push({
      id: "water_bottle",
      name: "Water Bottle",
      icon: "💧",
      reason: isHot ? `Feels like ${Math.round(feelsLike)}°C with elevated dehydration risk.` : "Essential hydration for outdoor activities.",
      why: "Maintaining hydration supports stamina and prevents heat exhaustion.",
      priority: isHot ? "high" : "normal",
    });
  }

  // 6. Sunglasses
  if (isHighUV || (!isRainLikely && temp >= 22)) {
    items.push({
      id: "sunglasses",
      name: "Sunglasses",
      icon: "🕶️",
      reason: isHighUV ? `UV index is elevated at ${Math.round(uv)}.` : "Bright daylight conditions.",
      why: "UV400 lenses protect your eyes from harmful ultraviolet radiation and glare.",
      priority: isHighUV ? "high" : "normal",
    });
  }

  // 7. Sunscreen
  if (isHighUV) {
    items.push({
      id: "sunscreen",
      name: "Sunscreen",
      icon: "🧴",
      reason: `UV index is ${Math.round(uv)} (sun protection recommended).`,
      why: "Apply SPF 30+ to exposed skin to prevent sunburn and UV damage during midday hours.",
      priority: "high",
    });
  }

  // 8. Hat / Cap
  if ((isHighUV && !isRainLikely) || (isHot && persona !== "student")) {
    items.push({
      id: "hat",
      name: "Cap / Hat",
      icon: "🧢",
      reason: isHot ? "Shade for direct midday solar exposure." : `UV index is ${Math.round(uv)}.`,
      why: "Wide-brim hats or caps reduce direct heat to the scalp and protect your face.",
      priority: "normal",
    });
  }

  // 9. Mask
  if (isPoorAQI || isFoggy) {
    items.push({
      id: "mask",
      name: "Face Mask",
      icon: "😷",
      reason: isPoorAQI ? `Air Quality is unhealthy (AQI ${Math.round(aqi)}).` : "Low visibility and morning mist.",
      why: "An N95 mask filters fine particulate matter (PM2.5) that can penetrate deep into lungs.",
      priority: "high",
    });
  }

  // 10. Backpack / Daypack
  if (persona === "traveler" || persona === "student" || persona === "commuter") {
    items.push({
      id: "backpack",
      name: "Backpack",
      icon: "🎒",
      reason: "Organize daily items and weather gear securely.",
      why: "Keeps your hands free while carrying water, extra layers, and essentials.",
      priority: "normal",
    });
  }

  // 11. Power Bank (for travelers, commuters)
  if (persona === "traveler" || persona === "commuter" || persona === "event_planner") {
    items.push({
      id: "power_bank",
      name: "Power Bank",
      icon: "🔋",
      reason: "Extended travel or transit duration planned.",
      why: "Ensures your mobile device stays charged for maps, updates, and navigation.",
      priority: "normal",
    });
  }

  // 12. Farmer Seeds / Field Equipment
  if (persona === "farmer") {
    if (!isRainLikely && temp >= 15 && temp <= 30) {
      items.push({
        id: "seeds",
        name: "Crop Seeds",
        icon: "🌱",
        reason: "Mild weather suitable for field prep and sowing.",
        why: "Clear skies and moderate temperatures provide good working conditions.",
        priority: "normal",
      });
    } else if (isRainLikely) {
      items.push({
        id: "drainage_gear",
        name: "Field Gear",
        icon: "🚜",
        reason: "Rain expected; check drainage and protect equipment.",
        why: "Inspect irrigation channels before heavy precipitation hits the fields.",
        priority: "high",
      });
    }
  }

  // Deduplicate and cap at 8 most relevant items
  const uniqueItems = [];
  const seen = new Set();
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      uniqueItems.push(item);
    }
  }

  return uniqueItems.slice(0, 8);
}

/**
 * Returns the "Other Useful Info" metrics matching Section 8 of the design.
 */
export function getOtherUsefulInfo({ weather, personaContext }) {
  if (!weather?.current) return null;

  const current = weather.current;
  const daily = weather.daily || {};

  const uv = Math.round(current.uv_index ?? daily.uv_index_max?.[0] ?? 0);
  const aqi = Math.round(personaContext?.air?.current?.us_aqi ?? 0);
  const humidity = Math.round(current.relative_humidity_2m ?? 0);
  const visibility = current.visibility != null ? `${(current.visibility / 1000).toFixed(0)} km` : "10 km";
  const sunrise = daily.sunrise?.[0] ? formatTime12h(daily.sunrise[0]) : "6:12 AM";
  const sunset = daily.sunset?.[0] ? formatTime12h(daily.sunset[0]) : "6:28 PM";
  const moonPhase = getMoonPhase(new Date());

  // Interpretations
  const uvLabel = uv >= 11 ? "Extreme" : uv >= 8 ? "Very High" : uv >= 6 ? "High" : uv >= 3 ? "Moderate" : "Low";
  const uvAdvice = uv >= 6 ? "Use sunscreen" : "Minimal protection needed";

  const aqiLabel = aqi === 0 ? "Good (AQI 42)" : aqi <= 50 ? `Good (AQI ${aqi})` : aqi <= 100 ? `Moderate (AQI ${aqi})` : `Poor (AQI ${aqi})`;
  const aqiAdvice = aqi <= 50 ? "Safe for outdoor activities" : aqi <= 100 ? "Acceptable air quality" : "Limit outdoor exposure";

  const humidityAdvice = humidity >= 70 ? "Might feel slightly humid" : humidity <= 30 ? "Dry air" : "Comfortable";
  const visibilityAdvice = (current.visibility ?? 10000) >= 8000 ? "Good" : "Reduced";

  return {
    uv: { label: `${uvLabel} (${uv})`, advice: uvAdvice },
    aqi: { label: aqiLabel, advice: aqiAdvice },
    humidity: { label: `${humidity}%`, advice: humidityAdvice },
    visibility: { label: visibility, advice: visibilityAdvice },
    sun: { label: `${sunrise} / ${sunset}` },
    moon: { label: moonPhase },
  };
}

/**
 * Legacy support for screens that import getCarryAndWearRecommendations.
 */
export function getCarryAndWearRecommendations({ persona, weather, personaContext }) {
  const whatYouNeed = getWhatYouNeedToday({ weather, personaContext, profile: { persona } });
  
  const carry = whatYouNeed.map((item) => ({
    icon: item.icon,
    text: `${item.name} (${item.reason})`,
    priority: item.priority,
  }));

  const temp = weather?.current?.temperature_2m ?? 24;
  const wear = [];
  if (temp >= 30) {
    wear.push({ icon: "👕", text: "Light breathable clothes" });
    wear.push({ icon: "🕶️", text: "Sunglasses" });
  } else if (temp <= 16) {
    wear.push({ icon: "🧥", text: "Warm jacket or hoodie" });
    wear.push({ icon: "🧣", text: "Comfortable warm layers" });
  } else {
    wear.push({ icon: "👕", text: "Comfortable standard attire" });
  }

  return {
    carry: carry.slice(0, 5),
    wear: wear.slice(0, 3),
    precautions: [],
  };
}

/**
 * Intelligent Weather & Persona Clothing Recommendation Engine.
 * Recommends top, bottom, footwear, outerwear/accessories, and optimal fabrics.
 */
export function getClothingRecommendations({ weather, personaContext, profile }) {
  const current = weather?.current || {};
  const daily = weather?.daily || {};
  const persona = (profile?.persona || "traveler").toLowerCase();

  const temp = current.temperature_2m ?? 26;
  const feelsLike = current.apparent_temperature ?? temp;
  const code = current.weather_code ?? 0;
  const wind = current.wind_speed_10m ?? 10;
  const uv = current.uv_index ?? daily.uv_index_max?.[0] ?? 3;
  const humidity = current.relative_humidity_2m ?? 50;
  const rainProb = daily.precipitation_probability_max?.[0] ?? 0;

  const isRaining = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code) || rainProb >= 40;
  const isExtremeCold = temp <= 8;
  const isCold = temp > 8 && temp <= 16;
  const isMild = temp > 16 && temp <= 22;
  const isWarm = temp > 22 && temp < 30;
  const isHot = temp >= 30 || feelsLike >= 33;
  const isHighUV = uv >= 6;
  const isHighWind = wind >= 25;

  let category = "Casual & Comfortable";
  let summary = "Balanced layers suitable for mild temperatures today.";
  let badgeColor = "#38BDF8";
  let fabrics = ["Cotton Blend", "Denim", "Jersey Cotton", "Linen"];
  let tips = [];

  if (isRaining) {
    category = "Rain-Ready & Water Resistant";
    summary = `Rain probability is ${rainProb}%. Wear water-repellent outer fabrics and avoid absorbent shoes.`;
    badgeColor = "#60A5FA";
    fabrics = ["Waterproof DWR Nylon", "Quick-Dry Polyester", "Rubber / GORE-TEX", "Treated Canvas"];
    tips = [
      "Avoid raw denim or heavy cotton pants as they absorb water and take hours to dry.",
      "Opt for hooded rain jackets or coats with sealed seams.",
    ];
  } else if (isExtremeCold) {
    category = "Thermal Defense & Heavy Insulation";
    summary = `Freezing conditions (${temp}°C). Multi-layered thermal insulation and wind protection required.`;
    badgeColor = "#93C5FD";
    fabrics = ["Merino Wool", "Thermal Fleece", "Down Insulation", "Windproof Softshell"];
    tips = [
      "Follow the 3-layer rule: thermal base layer, insulating fleece middle, windproof outer coat.",
      "Keep extremities protected with woolen socks and insulated gloves.",
    ];
  } else if (isCold) {
    category = "Chilly Weather Layering";
    summary = `Crisp and chilly (${temp}°C). A cozy sweater, hoodie, or lined jacket is ideal.`;
    badgeColor = "#A78BFA";
    fabrics = ["Fleece", "Merino Wool", "Cotton Knit", "Lined Denim"];
    tips = [
      "Layer a cardigan or hoodie over your t-shirt for easy adjustment as day warms up.",
      "Choose closed-toe leather or cushioned sneakers.",
    ];
  } else if (isHot) {
    category = "Heat & Sun Defense Attire";
    summary = `High heat index (feels like ${Math.round(feelsLike)}°C). Wear loose, airy cotton or linen clothes in light shades.`;
    badgeColor = "#F59E0B";
    fabrics = ["100% Breathable Cotton", "Pure Linen", "Chambray", "Moisture-Wicking Tech"];
    tips = [
      "Light-colored clothing reflects solar radiation, keeping you cooler than dark tones.",
      "Avoid tight-fitting polyester or synthetics that trap sweat against skin.",
    ];
  } else if (isWarm) {
    category = "Warm & Airy Attire";
    summary = `Pleasant warmth (${temp}°C). Light t-shirts, casual shirts, and comfortable bottoms recommended.`;
    badgeColor = "#34D399";
    fabrics = ["Lightweight Cotton", "Linen Blends", "Modal", "Poplin"];
    tips = [
      "Short sleeves and airy trousers or chinos will keep you comfortable all day.",
      isHighUV ? "Wear UV-protective sunglasses and carry a light cap." : "Great conditions for outdoor walks.",
    ];
  } else {
    category = "Mild & Balanced Attire";
    summary = `Comfortable ${temp}°C conditions. Standard everyday attire with a light backup layer.`;
    badgeColor = "#38BDF8";
    fabrics = ["Cotton", "Chino Twill", "Light Denim", "Knitwear"];
    tips = [
      "A versatile outfit with a light jacket or overshirt prepares you for morning or evening breezes.",
    ];
  }

  // Generate 4 detailed layers
  const layers = [];

  // 1. TOP LAYER
  if (isHot) {
    layers.push({
      type: "Top / Upper Layer",
      icon: "👕",
      title: "Loose Cotton T-Shirt or Linen Shirt",
      description: "Airy, relaxed-fit tops that maximize ventilation and reflect direct sunlight.",
      tag: "Cooling & Breathable",
    });
  } else if (isRaining) {
    layers.push({
      type: "Top / Upper Layer",
      icon: "🧥",
      title: "Water-Repellent Rain Jacket or Shell",
      description: "Lightweight waterproof membrane with a hood to stay dry during commutes.",
      tag: "Water-Repellent",
    });
  } else if (isExtremeCold) {
    layers.push({
      type: "Top / Upper Layer",
      icon: "🧥",
      title: "Heavy Parka or Down Jacket + Thermal Inner",
      description: "Insulated winter coat layered over a long-sleeve thermal base.",
      tag: "Maximum Warmth",
    });
  } else if (isCold) {
    layers.push({
      type: "Top / Upper Layer",
      icon: "🧶",
      title: "Fleece Pullover, Hoodie, or Warm Sweater",
      description: "Mid-weight layer to maintain core body temperature against morning chill.",
      tag: "Warm Layer",
    });
  } else {
    layers.push({
      type: "Top / Upper Layer",
      icon: "👔",
      title: "Casual Cotton Shirt or Long-Sleeve Tee",
      description: "Comfortable standard top suited for moderate indoor and outdoor temps.",
      tag: "All-Day Comfort",
    });
  }

  // 2. BOTTOM LAYER
  if (isHot) {
    layers.push({
      type: "Bottom / Lower Layer",
      icon: "🩳",
      title: "Lightweight Chinos, Linen Trousers, or Shorts",
      description: "Breathable lower garments preventing sweat buildup and irritation in heat.",
      tag: "Airy Fit",
    });
  } else if (isRaining) {
    layers.push({
      type: "Bottom / Lower Layer",
      icon: "👖",
      title: "Quick-Dry Trousers or Dark Jeans",
      description: "Fast-drying synthetic or treated pants that resist mud splatters.",
      tag: "Quick-Dry",
    });
  } else if (isExtremeCold || isCold) {
    layers.push({
      type: "Bottom / Lower Layer",
      icon: "👖",
      title: "Heavy Denim Jeans or Fleece-Lined Trousers",
      description: "Sturdy fabric blocking wind chill and keeping legs warm.",
      tag: "Insulated",
    });
  } else {
    layers.push({
      type: "Bottom / Lower Layer",
      icon: "👖",
      title: "Standard Jeans, Chinos, or Joggers",
      description: "Flexible, comfortable trousers ideal for daily activity.",
      tag: "Versatile",
    });
  }

  // 3. FOOTWEAR
  if (isRaining) {
    layers.push({
      type: "Footwear",
      icon: "🥾",
      title: "Waterproof Shoes or Non-Slip Boots",
      description: "Rubberized or waterproof treated footwear with good traction on wet tiles and roads.",
      tag: "Slip-Resistant",
    });
  } else if (persona === "farmer") {
    layers.push({
      type: "Footwear",
      icon: "👢",
      title: "Durable Gumboots or Work Field Boots",
      description: "Tough mud-resistant footwear designed for field movement and crop inspection.",
      tag: "Field Grade",
    });
  } else if (persona === "fitness") {
    layers.push({
      type: "Footwear",
      icon: "👟",
      title: "Cushioned Running Sneakers & Anti-Blister Socks",
      description: "Breathable athletic shoes providing arch support and shock absorption.",
      tag: "High Performance",
    });
  } else if (isHot) {
    layers.push({
      type: "Footwear",
      icon: "👟",
      title: "Breathable Mesh Sneakers or Casual Loafers",
      description: "Perforated or canvas footwear allowing air circulation to keep feet dry.",
      tag: "Ventilated",
    });
  } else if (isExtremeCold) {
    layers.push({
      type: "Footwear",
      icon: "🥾",
      title: "Insulated Winter Boots with Thick Wool Socks",
      description: "Thermal lined boots keeping feet warm against cold ground and frost.",
      tag: "Thermal Guard",
    });
  } else {
    layers.push({
      type: "Footwear",
      icon: "👟",
      title: "Comfortable Sneakers or Walking Shoes",
      description: "Supportive footwear suitable for daily commutes and walking.",
      tag: "Comfort First",
    });
  }

  // 4. ACCESSORIES & OUTERWEAR
  if (isHighUV || (isHot && !isRaining)) {
    layers.push({
      type: "Headwear & Sun Gear",
      icon: "🧢",
      title: "UV Sunglasses & Breathable Sun Cap",
      description: "Protects eyesight from intense glare and shades facial skin from UV rays.",
      tag: "Sun Protection",
    });
  } else if (isHighWind && !isRaining) {
    layers.push({
      type: "Outer Layer",
      icon: "🌬️",
      title: "Windbreaker or Fitted Jacket",
      description: "Blocks gusty winds (25+ km/h) to maintain body warmth and comfort.",
      tag: "Wind Shield",
    });
  } else if (isExtremeCold) {
    layers.push({
      type: "Winter Essentials",
      icon: "🧣",
      title: "Woolen Scarf, Beanie & Thermal Gloves",
      description: "Blocks heat loss from neck, head, and hands in sub-10°C weather.",
      tag: "Essential Defense",
    });
  } else if (isRaining) {
    layers.push({
      type: "Rain Gear",
      icon: "☂️",
      title: "Waterproof Cap or Packable Poncho",
      description: "Compact head protection keeping hair and glasses dry in showers.",
      tag: "Weather Shield",
    });
  } else {
    layers.push({
      type: "Layering Piece",
      icon: "🧥",
      title: "Light Cardigan or Overshirt",
      description: "Packable second layer ready for cooler indoor air-conditioning or evening breeze.",
      tag: "Versatile Layer",
    });
  }

  return {
    category,
    summary,
    badgeColor,
    fabrics,
    tips,
    layers,
  };
}

