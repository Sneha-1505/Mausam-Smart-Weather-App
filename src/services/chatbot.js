/**
 * chatbot.js
 * Intelligent Multilingual Weather AI Assistant with Persona Awareness,
 * Geographical Location-based Local Language Detection,
 * Compulsory English & Hindi Support,
 * 10 Indian Regional Languages,
 * Farmer Crop Sowing Advisor integration,
 * Strict Domain Scope Enforcement, and Zero-Hallucination Guardrails.
 *
 * Compulsory Languages:
 *   - English (en)
 *   - Hindi (hi)
 *
 * Regional Languages:
 *   - Punjabi (pa)     - Punjab, Chandigarh
 *   - Marathi (mr)     - Maharashtra
 *   - Bengali (bn)     - West Bengal, Tripura
 *   - Gujarati (gu)    - Gujarat
 *   - Tamil (ta)       - Tamil Nadu, Puducherry
 *   - Telugu (te)      - Andhra Pradesh, Telangana
 *   - Kannada (kn)     - Karnataka
 *   - Malayalam (ml)   - Kerala
 */

import { getCarryAndWearRecommendations } from "./whatToCarry";
import { analyzeSowingSuitability } from "./cropAdvisor";
import { CROP_RULES } from "../data/cropRules";

/* -------------------------------------------------------
   COMPULSORY LANGUAGES & LABELS
------------------------------------------------------- */

export const COMPULSORY_LANGUAGES = ["en", "hi"];

export const LANGUAGE_LABELS = {
  en: { label: "English", native: "English", short: "EN", compulsory: true, flag: "🌐", region: "All Locations" },
  hi: { label: "हिंदी (Hindi)", native: "हिन्दी", short: "HI", compulsory: true, flag: "🇮🇳", region: "National / North India" },
  pa: { label: "ਪੰਜਾਬੀ (Punjabi)", native: "ਪੰਜਾਬੀ", short: "PA", compulsory: false, flag: "🌾", region: "Punjab & Chandigarh" },
  mr: { label: "मराठी (Marathi)", native: "मराठी", short: "MR", compulsory: false, flag: "🚩", region: "Maharashtra" },
  bn: { label: "বাংলা (Bengali)", native: "বাংলা", short: "BN", compulsory: false, flag: "🌸", region: "West Bengal & Tripura" },
  gu: { label: "ગુજરાતી (Gujarati)", native: "ગુજરાતી", short: "GU", compulsory: false, flag: "🦁", region: "Gujarat" },
  ta: { label: "தமிழ் (Tamil)", native: "தமிழ்", short: "TA", compulsory: false, flag: "🏛️", region: "Tamil Nadu" },
  te: { label: "తెలుగు (Telugu)", native: "తెలుగు", short: "TE", compulsory: false, flag: "🌊", region: "Telangana & AP" },
  kn: { label: "ಕನ್ನಡ (Kannada)", native: "ಕನ್ನಡ", short: "KN", compulsory: false, flag: "🌿", region: "Karnataka" },
  ml: { label: "മലയാളം (Malayalam)", native: "മലയാളം", short: "ML", compulsory: false, flag: "🌴", region: "Kerala" },
};

/* -------------------------------------------------------
   GEOGRAPHICAL LOCATION TO LANGUAGE DETECTION
------------------------------------------------------- */

const CITY_STATE_LANG_MAP = {
  // Punjabi
  punjab: "pa",
  chandigarh: "pa",
  jalandhar: "pa",
  amritsar: "pa",
  phagwara: "pa",
  ludhiana: "pa",
  patiala: "pa",
  bathinda: "pa",
  hoshiarpur: "pa",
  mohali: "pa",
  gurdaspur: "pa",
  pathankot: "pa",
  kapurthala: "pa",
  moga: "pa",
  firozpur: "pa",
  sangrur: "pa",

  // Marathi
  maharashtra: "mr",
  mumbai: "mr",
  bombay: "mr",
  pune: "mr",
  nagpur: "mr",
  nashik: "mr",
  nasik: "mr",
  thane: "mr",
  aurangabad: "mr",
  chhatrapati_sambhajinagar: "mr",
  solapur: "mr",
  kolhapur: "mr",
  amravati: "mr",
  "navi mumbai": "mr",
  sangli: "mr",
  jalgaon: "mr",
  akola: "mr",
  latur: "mr",
  dhule: "mr",
  nanded: "mr",
  satara: "mr",

  // Bengali
  "west bengal": "bn",
  bengal: "bn",
  kolkata: "bn",
  calcutta: "bn",
  howrah: "bn",
  durgapur: "bn",
  asansol: "bn",
  siliguri: "bn",
  bardhaman: "bn",
  burdwan: "bn",
  tripura: "bn",
  agartala: "bn",
  kharagpur: "bn",
  haldia: "bn",
  darjeeling: "bn",
  malda: "bn",

  // Gujarati
  gujarat: "gu",
  ahmedabad: "gu",
  surat: "gu",
  vadodara: "gu",
  baroda: "gu",
  rajkot: "gu",
  bhavnagar: "gu",
  jamnagar: "gu",
  gandhinagar: "gu",
  junagadh: "gu",
  anand: "gu",
  navsari: "gu",
  morbi: "gu",
  nadiad: "gu",
  bharuch: "gu",
  porbandar: "gu",
  mehsana: "gu",

  // Tamil
  "tamil nadu": "ta",
  tamilnadu: "ta",
  chennai: "ta",
  madras: "ta",
  coimbatore: "ta",
  madurai: "ta",
  tiruchirappalli: "ta",
  trichy: "ta",
  salem: "ta",
  tirunelveli: "ta",
  tiruppur: "ta",
  vellore: "ta",
  erode: "ta",
  thoothukudi: "ta",
  dindigul: "ta",
  thanjavur: "ta",
  puducherry: "ta",
  pondicherry: "ta",

  // Telugu
  telangana: "te",
  "andhra pradesh": "te",
  andhra: "te",
  hyderabad: "te",
  secunderabad: "te",
  visakhapatnam: "te",
  vizag: "te",
  vijayawada: "te",
  guntur: "te",
  warangal: "te",
  nellore: "te",
  kurnool: "te",
  tirupati: "te",
  rajahmundry: "te",
  kakinada: "te",
  kadapa: "te",
  anantapur: "te",
  nizamabad: "te",
  karimnagar: "te",

  // Kannada
  karnataka: "kn",
  bengaluru: "kn",
  bangalore: "kn",
  mysuru: "kn",
  mysore: "kn",
  hubballi: "kn",
  hubli: "kn",
  dharwad: "kn",
  mangaluru: "kn",
  mangalore: "kn",
  belagavi: "kn",
  belgaum: "kn",
  davangere: "kn",
  ballari: "kn",
  bellary: "kn",
  kalaburagi: "kn",
  gulbarga: "kn",
  shivamogga: "kn",
  shimoga: "kn",
  tumakuru: "kn",
  tumkur: "kn",
  udupi: "kn",

  // Malayalam
  kerala: "ml",
  kochi: "ml",
  cochin: "ml",
  thiruvananthapuram: "ml",
  trivandrum: "ml",
  kozhikode: "ml",
  calicut: "ml",
  thrissur: "ml",
  kollam: "ml",
  quilon: "ml",
  palakkad: "ml",
  alappuzha: "ml",
  alleppey: "ml",
  kannur: "ml",
  kottayam: "ml",
  malappuram: "ml",

  // Hindi Belt (Compulsory Default)
  delhi: "hi",
  "new delhi": "hi",
  "uttar pradesh": "hi",
  up: "hi",
  bihar: "hi",
  rajasthan: "hi",
  "madhya pradesh": "hi",
  mp: "hi",
  haryana: "hi",
  uttarakhand: "hi",
  "himachal pradesh": "hi",
  hp: "hi",
  jharkhand: "hi",
  chhattisgarh: "hi",
  lucknow: "hi",
  kanpur: "hi",
  patna: "hi",
  jaipur: "hi",
  bhopal: "hi",
  indore: "hi",
  varanasi: "hi",
  agra: "hi",
  prayagraj: "hi",
  allahabad: "hi",
  noida: "hi",
  gurugram: "hi",
  gurgaon: "hi",
  faridabad: "hi",
  ghaziabad: "hi",
  meerut: "hi",
  dehradun: "hi",
  shimla: "hi",
  ranchi: "hi",
  raipur: "hi",
  gwalior: "hi",
  jabalpur: "hi",
  jodhpur: "hi",
  kota: "hi",
  bareilly: "hi",
  aligarh: "hi",
  moradabad: "hi",
  gorakhpur: "hi",
};

/**
 * Detect the local language for a given location, region, or coordinates.
 * English and Hindi are always compulsory and marked as such.
 */
export function detectLocalLanguage(location = "", region = "", country = "", lat = null, lon = null) {
  const combined = `${location} ${region} ${country}`.toLowerCase();

  // 1. Exact or keyword match from city / state database
  for (const [key, lang] of Object.entries(CITY_STATE_LANG_MAP)) {
    if (combined.includes(key)) {
      return {
        lang,
        isCompulsory: COMPULSORY_LANGUAGES.includes(lang),
        detectedFrom: key,
        label: LANGUAGE_LABELS[lang]?.label || lang,
        native: LANGUAGE_LABELS[lang]?.native || lang,
        compulsoryOptions: COMPULSORY_LANGUAGES,
      };
    }
  }

  // 2. Coordinate Bounding Box fallback if lat / lon provided
  if (lat != null && lon != null) {
    const nLat = Number(lat);
    const nLon = Number(lon);

    // Punjab / Chandigarh: lat 29.5 - 32.5, lon 73.8 - 77.2
    if (nLat >= 29.5 && nLat <= 32.5 && nLon >= 73.8 && nLon <= 77.2) {
      return { lang: "pa", isCompulsory: false, detectedFrom: "GPS Punjab", label: LANGUAGE_LABELS.pa.label, native: LANGUAGE_LABELS.pa.native, compulsoryOptions: COMPULSORY_LANGUAGES };
    }
    // Maharashtra: lat 15.6 - 22.1, lon 72.5 - 80.9
    if (nLat >= 15.6 && nLat <= 22.1 && nLon >= 72.5 && nLon <= 80.9) {
      return { lang: "mr", isCompulsory: false, detectedFrom: "GPS Maharashtra", label: LANGUAGE_LABELS.mr.label, native: LANGUAGE_LABELS.mr.native, compulsoryOptions: COMPULSORY_LANGUAGES };
    }
    // West Bengal: lat 21.5 - 27.3, lon 85.8 - 89.9
    if (nLat >= 21.5 && nLat <= 27.3 && nLon >= 85.8 && nLon <= 89.9) {
      return { lang: "bn", isCompulsory: false, detectedFrom: "GPS West Bengal", label: LANGUAGE_LABELS.bn.label, native: LANGUAGE_LABELS.bn.native, compulsoryOptions: COMPULSORY_LANGUAGES };
    }
    // Gujarat: lat 20.0 - 24.7, lon 68.1 - 74.5
    if (nLat >= 20.0 && nLat <= 24.7 && nLon >= 68.1 && nLon <= 74.5) {
      return { lang: "gu", isCompulsory: false, detectedFrom: "GPS Gujarat", label: LANGUAGE_LABELS.gu.label, native: LANGUAGE_LABELS.gu.native, compulsoryOptions: COMPULSORY_LANGUAGES };
    }
    // Tamil Nadu: lat 8.0 - 13.6, lon 76.2 - 80.4
    if (nLat >= 8.0 && nLat <= 13.6 && nLon >= 76.2 && nLon <= 80.4) {
      return { lang: "ta", isCompulsory: false, detectedFrom: "GPS Tamil Nadu", label: LANGUAGE_LABELS.ta.label, native: LANGUAGE_LABELS.ta.native, compulsoryOptions: COMPULSORY_LANGUAGES };
    }
    // Karnataka: lat 11.5 - 18.5, lon 74.0 - 78.6
    if (nLat >= 11.5 && nLat <= 18.5 && nLon >= 74.0 && nLon <= 78.6) {
      return { lang: "kn", isCompulsory: false, detectedFrom: "GPS Karnataka", label: LANGUAGE_LABELS.kn.label, native: LANGUAGE_LABELS.kn.native, compulsoryOptions: COMPULSORY_LANGUAGES };
    }
    // Andhra / Telangana: lat 12.6 - 19.9, lon 76.8 - 84.8
    if (nLat >= 12.6 && nLat <= 19.9 && nLon >= 76.8 && nLon <= 84.8) {
      return { lang: "te", isCompulsory: false, detectedFrom: "GPS Telugu Region", label: LANGUAGE_LABELS.te.label, native: LANGUAGE_LABELS.te.native, compulsoryOptions: COMPULSORY_LANGUAGES };
    }
    // Kerala: lat 8.3 - 12.8, lon 74.8 - 77.4
    if (nLat >= 8.3 && nLat <= 12.8 && nLon >= 74.8 && nLon <= 77.4) {
      return { lang: "ml", isCompulsory: false, detectedFrom: "GPS Kerala", label: LANGUAGE_LABELS.ml.label, native: LANGUAGE_LABELS.ml.native, compulsoryOptions: COMPULSORY_LANGUAGES };
    }
  }

  // 3. If within India but unmapped -> default to compulsory Hindi
  if (combined.includes("india") || combined.includes("bharat")) {
    return {
      lang: "hi",
      isCompulsory: true,
      detectedFrom: "India",
      label: LANGUAGE_LABELS.hi.label,
      native: LANGUAGE_LABELS.hi.native,
      compulsoryOptions: COMPULSORY_LANGUAGES,
    };
  }

  // 4. Default -> Compulsory English
  return {
    lang: "en",
    isCompulsory: true,
    detectedFrom: "Global",
    label: LANGUAGE_LABELS.en.label,
    native: LANGUAGE_LABELS.en.native,
    compulsoryOptions: COMPULSORY_LANGUAGES,
  };
}

/* -------------------------------------------------------
   SCRIPT & TEXT LANGUAGE DETECTION (AUTOMATIC)
------------------------------------------------------- */

const GURMUKHI_REGEX = /[\u0A00-\u0A7F]/;   // Punjabi
const BENGALI_REGEX = /[\u0980-\u09FF]/;    // Bengali
const GUJARATI_REGEX = /[\u0A80-\u0AFF]/;   // Gujarati
const TAMIL_REGEX = /[\u0B80-\u0BFF]/;      // Tamil
const TELUGU_REGEX = /[\u0C00-\u0C7F]/;     // Telugu
const KANNADA_REGEX = /[\u0C80-\u0CFF]/;    // Kannada
const MALAYALAM_REGEX = /[\u0D00-\u0D7F]/;  // Malayalam
const DEVANAGARI_REGEX = /[\u0900-\u097F]/; // Hindi & Marathi

// Marathi lexical markers inside Devanagari script
const MARATHI_DEVANAGARI_REGEX = /(आहे|नाही|पाऊस|कसा|कशी|हवामान|तापमान|काय|कधी|शेती|पेरणी|छत्री|करायचे|होणार|सांगा|नमस्कार|वार|पडला|पडेल)/;

// Romanized keywords for Indian regional languages
const PUNJABI_ROMAN = /\b(ajj|meenh|painaa|pavenga|pauga|kinna|kinni|kadon|kanak|beejan|jhona|tuhada|tuhade|kive|kiven|havva)\b/i;
const MARATHI_ROMAN = /\b(paus|havaman|kasa|kashi|ahe|nahi|chhatri|perani|sheti|garmi|thandi|udya|aaj|kadhi|kiti)\b/i;
const BENGALI_ROMAN = /\b(brishti|abohawa|kemon|chata|gorom|thanda|ajke|kal|bhalo|koro|khete|chash)\b/i;
const GUJARATI_ROMAN = /\b(varsad|havaaman|kevu|chhatri|garmi|thandi|aaje|kaale|khedut|vavani)\b/i;
const TAMIL_ROMAN = /\b(malai|vanilai|epadi|kudai|kulir|veyil|inru|nalai|mazhai|vivasaayi)\b/i;
const TELUGU_ROMAN = /\b(varsham|vatavaranam|ela|godugu|chali|enda|eeroju|repu|rythu|pantalu)\b/i;
const KANNADA_ROMAN = /\b(male|havaamana|hege|kode|thandi|bisilu|ivathu|naale|raitha|krishi)\b/i;
const MALAYALAM_ROMAN = /\b(mazha|kaalavastha|enganeyundu|kuda|thanal|choodu|inunnu|naale|krishi)\b/i;
const HINGLISH_ROMAN = /\b(aaj|kal|baarish|barish|hogi|kya|mausam|kesa|kaisa|kaisi|hai|hain|garmi|sardi|thand|tapman|chhaata|chhatri|gehun|bone|bowai|kisan|fasal|paani|pani|mitti|dhoop|bahar|pehan|kapde|hawa)\b/i;

export function detectLanguage(text, fallback = "en") {
  if (!text || typeof text !== "string") return fallback;
  const trimmed = text.trim();

  // 1. Script checks (Exact Unicode blocks)
  if (GURMUKHI_REGEX.test(trimmed)) return "pa";
  if (BENGALI_REGEX.test(trimmed)) return "bn";
  if (GUJARATI_REGEX.test(trimmed)) return "gu";
  if (TAMIL_REGEX.test(trimmed)) return "ta";
  if (TELUGU_REGEX.test(trimmed)) return "te";
  if (KANNADA_REGEX.test(trimmed)) return "kn";
  if (MALAYALAM_REGEX.test(trimmed)) return "ml";

  // Devanagari script: Disambiguate between Marathi and Hindi
  if (DEVANAGARI_REGEX.test(trimmed)) {
    if (MARATHI_DEVANAGARI_REGEX.test(trimmed)) return "mr";
    return "hi";
  }

  // 2. Romanized keyword checks
  if (PUNJABI_ROMAN.test(trimmed)) return "pa";
  if (MARATHI_ROMAN.test(trimmed)) return "mr";
  if (BENGALI_ROMAN.test(trimmed)) return "bn";
  if (GUJARATI_ROMAN.test(trimmed)) return "gu";
  if (TAMIL_ROMAN.test(trimmed)) return "ta";
  if (TELUGU_ROMAN.test(trimmed)) return "te";
  if (KANNADA_ROMAN.test(trimmed)) return "kn";
  if (MALAYALAM_ROMAN.test(trimmed)) return "ml";
  if (HINGLISH_ROMAN.test(trimmed)) return "hi";

  // 3. Fallback
  return fallback;
}

/* -------------------------------------------------------
   SCOPE & SAFETY DETECTION
------------------------------------------------------- */

const OFF_TOPIC_PATTERNS = [
  /poem/i, /story/i, /song/i, /joke/i, /code/i, /python/i, /javascript/i,
  /recipe/i, /cook/i, /movie/i, /game/i, /essay/i, /homework/i, /lyrics/i,
  /who is the president/i, /who won/i, /capital of/i, /philosophy/i,
];

const SECURITY_PATTERNS = [
  /hack/i, /crack/i, /steal/i, /bypass/i, /exploit/i, /phish/i,
  /password/i, /ddos/i, /trojan/i, /malware/i, /infiltrate/i,
];

const INAPPROPRIATE_PATTERNS = [
  /inappropriate/i, /curse/i, /abuse/i, /kill/i, /weapon/i, /bomb/i,
  /suicide/i, /sex/i, /nude/i, /porn/i,
];

export function checkScope(text) {
  const t = text.trim();
  if (SECURITY_PATTERNS.some((p) => p.test(t))) return "security";
  if (INAPPROPRIATE_PATTERNS.some((p) => p.test(t))) return "inappropriate";
  if (OFF_TOPIC_PATTERNS.some((p) => p.test(t))) return "offtopic";
  return null;
}

/* -------------------------------------------------------
   INTENT DETECTION
------------------------------------------------------- */

const INTENT_PATTERNS = {
  sowing_farming: [
    /sow/i, /sowing/i, /bone ka/i, /bowaai/i, /bowai/i, /beejan/i, /crop/i,
    /fasal/i, /kheti/i, /farmer/i, /gehun/i, /wheat/i, /rice/i, /chawal/i,
    /jhona/i, /kanak/i, /cotton/i, /kapas/i, /mustard/i, /sarson/i, /maize/i,
    /makki/i, /potato/i, /aalu/i, /sugarcane/i, /ganna/i, /pulses/i, /daal/i,
  ],
  running: [
    /run/i, /running/i, /jog/i, /jogging/i, /workout/i, /exercise/i,
    /gym/i, /cycle/i, /cycling/i, /kasrat/i, /daud/i, /doud/i,
  ],
  travel_query: [
    /should i travel/i, /travel to/i, /going to/i, /trip to/i,
    /pack for/i, /weather in/i, /weather at/i, /manali/i, /delhi/i,
    /chandigarh/i, /mumbai/i, /safar/i, /yatra/i,
  ],
  picnic_outdoor: [
    /picnic/i, /can i go outside/i, /go outside/i, /outside this evening/i,
    /bahar ja/i, /outdoor plans/i, /ghoomne/i,
  ],
  umbrella_rain: [
    /umbrella/i, /need umbrella/i, /carry umbrella/i, /chhaata/i, /chhatri/i,
    /rain/i, /raining/i, /precipitation/i, /barish/i, /baarish/i, /meenh/i,
  ],
  temperature: [
    /how hot/i, /how cold/i, /feel like/i, /temperature/i, /feels like/i,
    /temp/i, /garmi/i, /thanda/i, /tapman/i, /sardi/i,
  ],
  wear: [
    /wear/i, /clothes/i, /outfit/i, /jacket/i, /kya pahnu/i, /kapde/i,
  ],
  carry: [
    /carry/i, /pack/i, /bring/i, /bag/i, /kya le jao/i, /saamaan/i,
  ],
  aqi: [
    /aqi/i, /air quality/i, /pollution/i, /pm2\.?5/i, /pm10/i, /smog/i,
    /pradushan/i, /vayu/i, /hawa ki quality/i,
  ],
  uv: [
    /uv/i, /sun/i, /sunscreen/i, /ultraviolet/i, /sunlight/i, /dhoop/i,
  ],
  wind: [
    /wind/i, /windy/i, /breeze/i, /gust/i, /hawa/i,
  ],
  visibility: [
    /fog/i, /visibility/i, /mist/i, /kohra/i, /dhund/i,
  ],
  sunrise_sunset: [
    /sunrise/i, /sunset/i, /dawn/i, /dusk/i, /suryodaya/i, /surya asta/i,
  ],
  forecast: [
    /tomorrow/i, /forecast/i, /this week/i, /next few days/i, /kal/i,
  ],
  general: [
    /weather/i, /how is/i, /what is the/i, /mausam/i, /overview/i,
  ],
};

export function detectIntent(text) {
  const t = text.trim();
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some((p) => p.test(t))) return intent;
  }
  return "general";
}

function detectCropInQuery(query) {
  const q = query.toLowerCase();
  // Wheat
  if (q.includes("gehun") || q.includes("wheat") || q.includes("kanak") || q.includes("ਗੇਹੂੰ") || q.includes("ਕਣਕ") || q.includes("गहू") || q.includes("গম") || q.includes("ઘઉં") || q.includes("கோதுமை") || q.includes("గోధుమ") || q.includes("ಗೋಧಿ") || q.includes("ഗോതമ്പ്")) return "wheat";
  // Rice
  if (q.includes("rice") || q.includes("chawal") || q.includes("jhona") || q.includes("ਚਾਵਲ") || q.includes("ਝੋਨਾ") || q.includes("भात") || q.includes("तांदूळ") || q.includes("ধান") || q.includes("ડાંગર") || q.includes("ನೆಲ್") || q.includes("வரி") || q.includes("వరి") || q.includes("ಭತ್ತ") || q.includes("നെല്ല്")) return "rice";
  // Cotton
  if (q.includes("cotton") || q.includes("kapas") || q.includes("narma") || q.includes("ਕਪਾਹ") || q.includes("कापूस") || q.includes("তুলা") || q.includes("કપાસ") || q.includes("பருத்தி") || q.includes("పత్తి") || q.includes("ಹತ್ತಿ") || q.includes("പരുത്തി")) return "cotton";
  // Mustard
  if (q.includes("mustard") || q.includes("sarson") || q.includes("sarhon") || q.includes("ਸਰ੍ਹੋਂ") || q.includes("मोहरी") || q.includes("সরিষা") || q.includes("રાઈ") || q.includes("கடுகு") || q.includes("ఆవాలు") || q.includes("ಸಾಸಿವೆ") || q.includes("കടുക്")) return "mustard";
  // Maize
  if (q.includes("maize") || q.includes("makka") || q.includes("makki") || q.includes("ਮੱਕੀ") || q.includes("मका") || q.includes("ভুট্টা") || q.includes("મકાઈ") || q.includes("மக்காச்சோளம்") || q.includes("మొక్కజొన్న") || q.includes("ಮೆಕ್ಕೆಜೋಳ") || q.includes("ചോളം")) return "maize";
  // Potato
  if (q.includes("potato") || q.includes("aalu") || q.includes("aloo") || q.includes("ਆਲੂ") || q.includes("बटाटा") || q.includes("আলু") || q.includes("બટાકા") || q.includes("உருளை") || q.includes("బంగాళాదుంప") || q.includes("ಆಲೂಗಡ್ಡೆ") || q.includes("ഉരുളക്കിഴങ്ങ്")) return "potato";
  // Sugarcane
  if (q.includes("sugarcane") || q.includes("ganna") || q.includes("ਗੰਨਾ") || q.includes("ऊस") || q.includes("আখ") || q.includes("શેરડી") || q.includes("கரும்பு") || q.includes("చెరకు") || q.includes("ಕಬ್ಬು") || q.includes("കരിമ്പ്")) return "sugarcane";
  // Pulses
  if (q.includes("pulses") || q.includes("daal") || q.includes("dal") || q.includes("ਦਾਲਾਂ") || q.includes("डाळी") || q.includes("ডাল") || q.includes("કઠોળ") || q.includes("பருப்பு") || q.includes("పప్పు") || q.includes("ಬೇಳೆ") || q.includes("പയർ")) return "pulses";
  return "wheat"; // Default crop for farmer queries if unmentioned
}

/* -------------------------------------------------------
   SCOPE REFUSAL RESPONSES (10 REGIONAL LANGUAGES)
------------------------------------------------------- */

const SCOPE_RESPONSES = {
  offtopic: {
    en: "I’m Mausam AI 🌦️ I’m here to help with weather, air quality, travel conditions and weather-based recommendations. Ask me anything about the weather!",
    hi: "मैं मौसम AI 🌦️ हूँ। मैं मौसम, वायु गुणवत्ता, यात्रा की स्थिति और मौसम आधारित सलाह के लिए यहाँ हूँ। कृपया मौसम से जुड़ा सवाल पूछें।",
    pa: "ਮੈਂ ਮੌਸਮ AI 🌦️ ਹਾਂ। ਮੈਂ ਮੌਸਮ, ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ, ਸਫ਼ਰ ਅਤੇ ਖੇਤੀਬਾੜੀ ਸਲਾਹ ਲਈ ਹਾਂ। ਕਿਰਪਾ ਕਰਕੇ ਮੌਸਮ ਬਾਰੇ ਪੁੱਛੋ।",
    mr: "मी मौसम AI 🌦️ आहे. मी हवामान, वायू गुणवत्ता, प्रवास आणि शेती सल्ला देण्यासाठी उपलब्ध आहे. कृपया हवामानाशी संबंधित प्रश्न विचारा.",
    bn: "আমি মৌসুম AI 🌦️। আবহাওয়া, বায়ুর মান, ভ্রমণ পরিস্থিতি ও চাষাবাদের পরামর্শের জন্য আমি এখানে আছি। আবহাওয়া সম্পর্কিত প্রশ্ন করুন।",
    gu: "હું મૌસમ AI 🌦️ છું. હું હવામાન, વાયુ ગુણવત્તા, મુસાફરી અને કૃષિ સલાહ માટે અહીં છું. કૃપા કરીને હવામાન સંબંધિત પ્રશ્ન પૂછો.",
    ta: "நான் மௌசம் AI 🌦️. வானிலை, காற்றின் தரம், பயணம் மற்றும் விவசாய ஆலோசனை வழங்க நான் தயாராக உள்ளேன். வானிலை பற்றி கேளுங்கள்.",
    te: "నేను మౌసమ్ AI 🌦️. వాతావరణం, గాలి నాణ్యత, ప్రయాణం మరియు వ్యవసాయ సలహాల కోసం నేను ఇక్కడ ఉన్నాను. దయచేసి వాతావరణం గురించి అడగండి.",
    kn: "ನಾನು ಮೌಸಮ್ AI 🌦️. ಹವಾಮಾನ, ವಾಯು ಗುಣಮಟ್ಟ, ಪ್ರಯಾಣ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಾಗಿ ಇಲ್ಲಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಹವಾಮಾನ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.",
    ml: "ഞാൻ മൗസം AI 🌦️ ആണ്. കാലാവസ്ഥ, വായു ഗുണനിലവാരം, യാത്ര, കാർഷിക നിർദ്ദേശങ്ങൾ എന്നിവയ്ക്കായി ഞാൻ ഇവിടെയുണ്ട്. ദയവായി കാലാവസ്ഥയെക്കുറിച്ച് ചോദിക്കൂ.",
  },
  security: {
    en: "I can only help with weather-related questions and planning.",
    hi: "मैं केवल मौसम और योजना से जुड़े सवालों में ही मदद कर सकता हूँ।",
    pa: "ਮੈਂ ਸਿਰਫ਼ ਮੌਸਮ ਅਤੇ ਯੋਜਨਾਬੰਦੀ ਨਾਲ ਸੰਬੰਧਿਤ ਸਵਾਲਾਂ ਵਿੱਚ ਹੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।",
    mr: "मी फक्त हवामान आणि नियोजनाशी संबंधित प्रश्नांमध्ये मदत करू शकतो.",
    bn: "আমি কেবল আবহাওয়া এবং পরিকল্পনা সম্পর্কিত প্রশ্নে সহায়তা করতে পারি।",
    gu: "હું ફક્ત હવામાન અને આયોજન સંબંધિત પ્રશ્નોમાં જ મદદ કરી શકું છું.",
    ta: "நான் வானிலை மற்றும் திட்டமிடல் தொடர்பான கேள்விகளுக்கு மட்டுமே உதவ முடியும்.",
    te: "నేను వాతావరణం మరియు ప్రణాళిక సంబంధిత ప్రశ్నలలో మాత్రమే సహాయం చేయగలను.",
    kn: "ನಾನು ಹವಾಮಾನ ಮತ್ತು ಯೋಜನೆಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳಲ್ಲಿ ಮಾತ್ರ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
    ml: "കാലാവസ്ഥയുമായി ബന്ധപ്പെട്ട ചോദ്യങ്ങളിലും ആസൂത്രണത്തിലും മാത്രമേ എനിക്ക് സഹായിക്കാനാകൂ.",
  },
  inappropriate: {
    en: "Let's keep it weather-related 😊. I can help with forecasts, AQI, travel weather or what to carry.",
    hi: "आइए मौसम से जुड़ी बातें ही करें 😊। मैं पूर्वानुमान, AQI, यात्रा के मौसम या क्या ले जाएं में मदद कर सकता हूँ।",
    pa: "ਆਓ ਮੌਸਮ ਨਾਲ ਸੰਬੰਧਿਤ ਗੱਲ ਹੀ ਕਰੀਏ 😊। ਮੈਂ ਪੂਰਵ-ਅਨੁਮਾਨ, AQI, ਸਫ਼ਰ ਜਾਂ ਸਮਾਨ ਬਾਰੇ ਦੱਸ ਸਕਦਾ ਹਾਂ।",
    mr: "कृपया हवामानाशी संबंधित संवादच ठेवूया 😊. मी अंदाज, AQI, प्रवास किंवा काय सोबत घ्यावे याबद्दल सांगू शकतो.",
    bn: "আসুন আবহাওয়া সংক্রান্ত আলোচনাতেই সীমাবদ্ধ থাকি 😊। আমি পূর্বাভাস, AQI বা কী সাথে নেবেন তা জানাতে পারি।",
    gu: "ચાલો હવામાન સંબંધિત જ વાત કરીએ 😊. હું આગાહી, AQI, મુસાફરી અથવા શું સાથે રાખવું તે જણાવી શકું છું.",
    ta: "வானிலை தொடர்பான தகவல்களை மட்டுமே பேசுவோம் 😊. முன்னறிவிப்பு, AQI அல்லது என்ன எடுத்துச் செல்ல வேண்டும் என்பதில் நான் உதவலாம்.",
    te: "వాతావరణ సంబంధిత అంశాలకే పరిమితమవుదాం 😊. సూచనలు, AQI లేదా ఏమి తీసుకువెళ్లాలో నేను చెప్పగలను.",
    kn: "ಹವಾಮಾನ ಸಂಬಂಧಿತ ವಿಷಯಗಳ ಬಗ್ಗೆ ಮಾತ್ರ ಮಾತನಾಡೋಣ 😊. ಮುನ್ಸೂಚನೆ, AQI ಅಥವಾ ಏನು ಕೊಂಡೊಯ್ಯಬೇಕೆಂದು ನಾನು ಹೇಳಬಲ್ಲೆ.",
    ml: "കാലാവസ്ഥയുമായി ബന്ധപ്പെട്ട കാര്യങ്ങൾ മാത്രം സംസാരിക്കാം 😊. മുന്നറിയിപ്പുകൾ, AQI അല്ലെങ്കിൽ എന്ത് കരുതണം എന്നതിൽ സഹായിക്കാം.",
  },
};

/* -------------------------------------------------------
   RESPONSE BUILDER
------------------------------------------------------- */

function round(v) {
  if (v == null || isNaN(Number(v))) return null;
  return Math.round(Number(v));
}

function formatTime12h(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

export function buildResponse(query, weatherContext, preferredLanguage = "en") {
  // AUTOMATIC LANGUAGE DETECTION: Takes priority over preset if detected
  const language = detectLanguage(query, preferredLanguage);

  const scopeViolation = checkScope(query);
  if (scopeViolation) {
    const table = SCOPE_RESPONSES[scopeViolation] || SCOPE_RESPONSES.offtopic;
    return table[language] || table.hi || table.en;
  }

  const { weather, personaContext, profile } = weatherContext || {};
  const persona = (profile?.persona || "traveler").toLowerCase().replace("-", "_");

  // Zero-Hallucination Guardrail
  if (!weather?.current) {
    const noInfo = {
      en: "I don't have enough live weather information for this location right now. Please check your connection or refresh.",
      hi: "सटीक उत्तर देने के लिए मेरे पास अभी पर्याप्त मौसम जानकारी उपलब्ध नहीं है। कृपया रिफ्रेश करें।",
      pa: "ਸਹੀ ਜਵਾਬ ਦੇਣ ਲਈ ਮੇਰੇ ਕੋਲ ਇਸ ਵੇਲੇ ਲੋੜੀਂਦੀ ਮੌਸਮ ਜਾਣਕਾਰੀ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ।",
      mr: "अचूक उत्तर देण्यासाठी सध्या थेट हवामानाची पुरेशी माहिती उपलब्ध नाही. कृपया रिफ्रेश करा.",
      bn: "সঠিক উত্তর দেওয়ার জন্য এই মুহূর্তে পর্যাপ্ত লাইভ আবহাওয়া তথ্য নেই। অনুগ্রহ করে রিফ্রেশ করুন।",
      gu: "ચોક્કસ જવાબ આપવા માટે હાલમાં પૂરતી લાઇવ હવામાન માહિતી ઉપલબ્ધ નથી. કૃપા કરીને રિફ્રેશ કરો.",
      ta: "துல்லியமான பதில் அளிக்க இப்போது போதிய நேரலை வானிலை தகவல் இல்லை. தயவுசெய்து புதுப்பிக்கவும்.",
      te: "ఖచ్చితమైన సమాధానం ఇవ్వడానికి ప్రస్తుతం ప్రత్యక్ష వాతావరణ సమాచారం అందుబాటులో లేదు. దయచేసి రీఫ్రెష్ చేయండి.",
      kn: "ನಿಖರವಾದ ಉತ್ತರ ನೀಡಲು ಪ್ರಸ್ತುತ ಲೈವ್ ಹವಾಮಾನ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ರಿಫ್ರೆಶ್ ಮಾಡಿ.",
      ml: "കൃത്യമായ മറുപടി നൽകാൻ ആവശ്യമായ തത്സമയ കാലാവസ്ഥാ വിവരങ്ങൾ ഇപ്പോൾ ലഭ്യമല്ല. ദയവായി പുതുക്കുക.",
    };
    return noInfo[language] || noInfo.hi || noInfo.en;
  }

  const current = weather.current;
  const daily = weather.daily || {};
  const locName = profile?.location || "your location";

  const temp = round(current.temperature_2m);
  const feelsLike = round(current.apparent_temperature);
  const humidity = round(current.relative_humidity_2m);
  const wind = round(current.wind_speed_10m);
  const uv = round(current.uv_index);
  const visibility = current.visibility != null ? (current.visibility / 1000).toFixed(1) : null;
  const rainProb = daily.precipitation_probability_max?.[0] ?? 0;
  const aqi = round(personaContext?.air?.current?.us_aqi);
  const maxTemp = round(daily.temperature_2m_max?.[0]);
  const minTemp = round(daily.temperature_2m_min?.[0]);
  const sunrise = daily.sunrise?.[0] ? formatTime12h(daily.sunrise[0]) : null;
  const sunset = daily.sunset?.[0] ? formatTime12h(daily.sunset[0]) : null;

  const intent = detectIntent(query);

  // 1. CROP SOWING / FARMING ADVISOR INTEGRATION
  if (intent === "sowing_farming") {
    const cropId = detectCropInQuery(query);
    const cropRule = CROP_RULES[cropId] || CROP_RULES.wheat;
    const cropName = cropRule.name;
    const analysis = analyzeSowingSuitability(cropId, weather, personaContext, profile);

    if (language === "hi") {
      if (analysis.status === "good") {
        return `🌾 ${cropName} बोने के लिए आज परिस्थितियां अनुकूल हैं (${analysis.statusEmoji} ${analysis.statusLabel})!\n\n• तापमान: ${temp}°C (उपयुक्त)\n• बारिश की संभावना: ${rainProb}%\n• हवा: ${wind} km/h\n\nसलाह: ${analysis.recommendedAction}\n\n⚠️ नोट: यह मौसम-आधारित विश्लेषण है, क्षेत्रीय कृषि परामर्श का भी ध्यान रखें।`;
      } else if (analysis.status === "wait") {
        return `🌾 आज ${cropName} की बुवाई के लिए इंतज़ार करना बेहतर रहेगा (${analysis.statusEmoji} ${analysis.statusLabel})।\n\n• वर्तमान तापमान: ${temp}°C\n• बारिश का अनुमान: ${rainProb}%\n• कारण: ${analysis.recommendedAction}\n\nसलाह: अनुकूल स्थिति बनने पर ही बुवाई करें।`;
      } else {
        return `🌾 आज ${cropName} बोने के लिए मौसम अनुकूल नहीं है (${analysis.statusEmoji} ${analysis.statusLabel})।\n\n• तापमान: ${temp}°C\n• बारिश: ${rainProb}%\n• मुख्य कारण: ${analysis.factors.find((f) => f.status === "unsuitable")?.detail || "प्रतिकूल मौसम"}\n\nसलाह: बुवाई टालें और मौसम सामान्य होने का इंतज़ार करें।`;
      }
    }

    if (language === "pa") {
      if (analysis.status === "good") {
        return `🌾 ${cropName} ਬੀਜਣ ਲਈ ਅੱਜ ਮੌਸਮ ਅਨੁਕੂਲ ਹੈ (${analysis.statusEmoji} ${analysis.statusLabel})!\n\n• ਤਾਪਮਾਨ: ${temp}°C\n• ਮੀਂਹ ਦਾ ਖ਼ਤਰਾ: ${rainProb}%\n• ਹਵਾ: ${wind} km/h\n\nਸਲਾਹ: ${analysis.recommendedAction}\n\n⚠️ ਨੋਟ: ਇਹ ਮੌਸਮ ਆਧਾਰਿਤ ਸਲਾਹ ਹੈ, ਖੇਤੀ ਮਾਹਿਰਾਂ ਦੀ ਰਾਇ ਵੀ ਲਵੋ।`;
      } else {
        return `🌾 ${cropName} ਬੀਜਣ ਲਈ ਹਾਲੇ ਇੰਤਜ਼ਾਰ ਕਰਨਾ ਚੰਗਾ ਰਹੇਗਾ (${analysis.statusEmoji} ${analysis.statusLabel})।\n\n• ਤਾਪਮਾਨ: ${temp}°C\n• ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ: ${rainProb}%\n• ਕਾਰਨ: ${analysis.recommendedAction}\n\nਸਲਾਹ: ਮੌਸਮ ਸਾਫ਼ ਹੋਣ 'ਤੇ ਦੁਬਾਰਾ ਜਾਂਚ ਕਰੋ।`;
      }
    }

    if (language === "mr") {
      if (analysis.status === "good") {
        return `🌾 ${cropName} पेरणीसाठी आज अनुकूल हवामान आहे (${analysis.statusEmoji} ${analysis.statusLabel})!\n\n• तापमान: ${temp}°C\n• पावसाची शक्यता: ${rainProb}%\n• वारा: ${wind} km/h\n\nसल्ला: ${analysis.recommendedAction}\n\n⚠️ सूचना: हा हवामान-आधारित सल्ला आहे.`;
      } else {
        return `🌾 आज ${cropName} पेरणीसाठी थोडे थांबा (${analysis.statusEmoji} ${analysis.statusLabel})।\n\n• तापमान: ${temp}°C\n• पाऊस: ${rainProb}%\n• कारण: ${analysis.recommendedAction}`;
      }
    }

    if (language === "bn") {
      return `🌾 ${cropName} বপন সংক্রান্ত পরামর্শ (${analysis.statusEmoji} ${analysis.statusLabel}):\n\n• বর্তমান তাপমাত্রা: ${temp}°C\n• বৃষ্টির সম্ভাবনা: ${rainProb}%\n• বাতাস: ${wind} km/h\n\nপরামর্শ: ${analysis.recommendedAction}\n\n⚠️ এটি আবহাওয়া-ভিত্তিক পরামর্শ।`;
    }

    if (language === "gu") {
      return `🌾 ${cropName} વાવણી સલાહ (${analysis.statusEmoji} ${analysis.statusLabel}):\n\n• તાપમાન: ${temp}°C\n• વરસાદની શક્યતા: ${rainProb}%\n• પવન: ${wind} km/h\n\nસલાહ: ${analysis.recommendedAction}\n\n⚠️ સ્થાનિક કૃષિ સલાહ પણ ધ્યાનમાં લો.`;
    }

    if (language === "ta") {
      return `🌾 ${cropName} விதைப்பு வழிகாட்டுதல் (${analysis.statusEmoji} ${analysis.statusLabel}):\n\n• வெப்பநிலை: ${temp}°C\n• மழை வாய்ப்பு: ${rainProb}%\n• காற்று: ${wind} km/h\n\nஆலோசனை: ${analysis.recommendedAction}\n\n⚠️ இது வானிலை அடிப்படையிலான வழிகாட்டல்.`;
    }

    if (language === "te") {
      return `🌾 ${cropName} విత్తనాల సూచన (${analysis.statusEmoji} ${analysis.statusLabel}):\n\n• ఉష్ణోగ్రత: ${temp}°C\n• వర్ష సూచన: ${rainProb}%\n• గాలి: ${wind} km/h\n\nసలహా: ${analysis.recommendedAction}\n\n⚠️ ఇది వాతావరణ ఆధారిత సలహా.`;
    }

    if (language === "kn") {
      return `🌾 ${cropName} ಬಿತ್ತನೆ ಮಾರ್ಗದರ್ಶಿ (${analysis.statusEmoji} ${analysis.statusLabel}):\n\n• ತಾಪಮಾನ: ${temp}°C\n• ಮಳೆ ಸಾಧ್ಯತೆ: ${rainProb}%\n• ಗಾಳಿ: ${wind} km/h\n\nಸಲಹೆ: ${analysis.recommendedAction}\n\n⚠️ ಸ್ಥಳೀಯ ಕೃಷಿ ಸಲಹೆಯನ್ನು ಗಮನಿಸಿ.`;
    }

    if (language === "ml") {
      return `🌾 ${cropName} വിതയ്ക്കൽ നിർദ്ദേശം (${analysis.statusEmoji} ${analysis.statusLabel}):\n\n• താപനില: ${temp}°C\n• മഴ സാധ്യത: ${rainProb}%\n• കാറ്റ്: ${wind} km/h\n\nനിർദ്ദേശം: ${analysis.recommendedAction}\n\n⚠️ ഇത് കാലാവസ്ഥാ അടിസ്ഥാനത്തിലുള്ള ഉപദേശമാണ്.`;
    }

    // Default English
    return `🌾 Sowing Advisor for ${cropName}:\nStatus: ${analysis.statusEmoji} ${analysis.statusLabel}\n\n• Current Temperature: ${temp}°C (optimal: ${cropRule.temperature.optimalMin}-${cropRule.temperature.optimalMax}°C)\n• Rain Probability: ${rainProb}%\n• Wind: ${wind} km/h\n\nGuidance: ${analysis.recommendedAction}\n\n${analysis.bestUpcomingWindow ? `🌱 Potential Window: ${analysis.bestUpcomingWindow.date} at ${analysis.bestUpcomingWindow.time}\n` : ""}⚠️ ${analysis.disclaimer}`;
  }

  // 2. RUNNING / WORKOUT PLANNING (PERSONA-AWARE)
  if (intent === "running") {
    const isUnhealthyAir = aqi != null && aqi > 150;
    const isHot = temp != null && temp >= 34;
    const isRainy = rainProb >= 60;

    if (language === "hi") {
      if (isUnhealthyAir) return `😷 अभी बाहर दौड़ना ठीक नहीं है।\n• AQI: ${aqi} (खराब हवा)\nसलाह: आज इनडोर वर्कआउट बेहतर रहेगा।`;
      if (isHot) return `🥵 अभी तेज धूप व गर्मी है (${temp}°C, महसूस ${feelsLike}°C)।\nसलाह: सुबह या शाम 6:30 बजे के बाद दौड़ें। खूब पानी पिएं।`;
      if (isRainy) return `🌧️ बारिश की संभावना ${rainProb}% है।\nसलाह: फिसलन हो सकती है, वाटरप्रूफ जूते पहनें।`;
      return `🏃 दौड़ने के लिए अनुकूल स्थिति है!\n• तापमान: ${temp}°C (महसूस ${feelsLike}°C)\n• हवा की गुणवत्ता: AQI ${aqi ?? "सामान्य"}\n• बारिश का खतरा: ${rainProb}%`;
    }
    if (language === "pa") {
      if (isUnhealthyAir) return `😷 ਹੁਣੇ ਦੌੜਨਾ ਸੁਰੱਖਿਅਤ ਨਹੀਂ ਹੈ। AQI: ${aqi} (ਮਾੜੀ ਹਵਾ)।`;
      return `🏃 ਦੌੜਨ ਲਈ ਚੰਗਾ ਮੌਸਮ ਹੈ!\n• ਤਾਪਮਾਨ: ${temp}°C (ਮਹਿਸੂਸ ${feelsLike}°C)\n• ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ: ${rainProb}%`;
    }
    if (language === "mr") {
      if (isUnhealthyAir) return `😷 आता बाहेर धावणे योग्य नाही (AQI: ${aqi})। इनडोअर व्यायाम करा.`;
      return `🏃 धावण्यासाठी छान हवामान आहे!\n• तापमान: ${temp}°C\n• पाऊस: ${rainProb}%`;
    }
    if (language === "bn") {
      return `🏃 দৌড়ানোর জন্য আবহাওয়া:\n• তাপমাত্রা: ${temp}°C (অনুভূত ${feelsLike}°C)\n• বৃষ্টির সম্ভাবনা: ${rainProb}%\n• AQI: ${aqi ?? "স্বাভাবিক"}`;
    }
    if (language === "gu") {
      return `🏃 દોડવા માટે સ્થિતિ:\n• તાપમાન: ${temp}°C\n• વરસાદની શક્યતા: ${rainProb}%\n• AQI: ${aqi ?? "સામાન્ય"}`;
    }
    if (language === "ta") {
      return `🏃 ஓட்டப் பயிற்சிக்கான நிலவரம்:\n• வெப்பநிலை: ${temp}°C\n• மழை வாய்ப்பு: ${rainProb}%\n• காற்றின் தரம்: AQI ${aqi ?? "மிதமானது"}`;
    }
    if (language === "te") {
      return `🏃 పరుగు కోసం వాతావరణం:\n• ఉష్ణోగ్రత: ${temp}°C\n• వర్ష సూచన: ${rainProb}%\n• గాలి నాణ్యత: AQI ${aqi ?? "సాధారణం"}`;
    }
    if (language === "kn") {
      return `🏃 ಓಟಕ್ಕೆ ಪರಿಸ್ಥಿತಿ:\n• ತಾಪಮಾನ: ${temp}°C\n• ಮಳೆ ಸಾಧ್ಯತೆ: ${rainProb}%\n• AQI: ${aqi ?? "ಸಾಮಾನ್ಯ"}`;
    }
    if (language === "ml") {
      return `🏃 വ്യായാമത്തിനായുള്ള കാലാവസ്ഥ:\n• താപനില: ${temp}°C\n• മഴ സാധ്യത: ${rainProb}%\n• AQI: ${aqi ?? "സാധാരണം"}`;
    }
    if (isUnhealthyAir) return `😷 Not recommended for outdoor running right now.\n• AQI: ${aqi} (Unhealthy air)\n• Temperature: ${temp}°C\nRecommendation: Move your cardio or training indoors today.`;
    if (isHot) return `🥵 High heat index (${temp}°C, feels like ${feelsLike}°C).\nRecommendation: Shift running to early morning (before 8 AM) or evening after sunset.`;
    if (isRainy) return `🌧️ Rain is likely (${rainProb}% probability).\nRecommendation: Watch for slippery pavement or opt for treadmill running.`;
    return `🏃 Great conditions for running!\n• Temperature: ${temp}°C (feels like ${feelsLike}°C)\n• AQI: ${aqi != null ? aqi : "Moderate"}\n• Rain chance: ${rainProb}%\n• Wind: ${wind} km/h`;
  }

  // 3. TRAVEL PLANNING / DESTINATIONS
  if (intent === "travel_query") {
    if (language === "hi") {
      return `✈️ यात्रा मौसम विश्लेषण (${locName}):\n• तापमान: ${temp}°C, बारिश का खतरा ${rainProb}%\n• दृश्यता: ${visibility ? `${visibility} km` : "सामान्य"}\n• हवा: ${wind} km/h\nसलाह: ${rainProb >= 50 ? "छाता व वाटरप्रूफ बैग साथ रखें।" : "सफर के लिए अनुकूल स्थिति है।"}`;
    }
    if (language === "pa") {
      return `✈️ ਸਫ਼ਰ ਮੌਸਮ ਅਪਡੇਟ (${locName}):\n• ਤਾਪਮਾਨ: ${temp}°C, ਮੀਂਹ: ${rainProb}%\n• ਦਿੱਖ: ${visibility ? `${visibility} km` : "ਸਧਾਰਨ"}\nਸਲਾਹ: ${rainProb >= 50 ? "ਛੱਤਰੀ ਨਾਲ ਰੱਖੋ।" : "ਸਫ਼ਰ ਲਈ ਮੌਸਮ ਠੀਕ ਹੈ।"}`;
    }
    if (language === "mr") {
      return `✈️ प्रवास हवामान विश्लेषण (${locName}):\n• तापमान: ${temp}°C, पाऊस: ${rainProb}%\n• वारा: ${wind} km/h\nसलाह: ${rainProb >= 50 ? "छत्री सोबत ठेवा." : "प्रवासासाठी उत्तम दिवस आहे."}`;
    }
    if (language === "bn") {
      return `✈️ ভ্রমণ আবহাওয়া রিপোর্ট (${locName}):\n• তাপমাত্রা: ${temp}°C, বৃষ্টির ঝুঁকি: ${rainProb}%\n• দৃশ্যমানতা: ${visibility ? `${visibility} km` : "স্বাভাবিক"}`;
    }
    if (language === "gu") {
      return `✈️ મુસાફરી હવામાન રિપોર્ટ (${locName}):\n• તાપમાન: ${temp}°C, વરસાદની શક્યતા: ${rainProb}%\n• પવન: ${wind} km/h`;
    }
    if (language === "ta") {
      return `✈️ பயண வானிலை மதிப்பீடு (${locName}):\n• வெப்பநிலை: ${temp}°C, மழை வாய்ப்பு: ${rainProb}%\n• காற்று: ${wind} km/h`;
    }
    if (language === "te") {
      return `✈️ ప్రయాణ వాతావరణ సమాచారం (${locName}):\n• ఉష్ణోగ్రత: ${temp}°C, వర్ష సూచన: ${rainProb}%\n• గాలి: ${wind} km/h`;
    }
    if (language === "kn") {
      return `✈️ ಪ್ರಯಾಣ ಹವಾಮಾನ ವರದಿ (${locName}):\n• ತಾಪಮಾನ: ${temp}°C, ಮಳೆ ಸಾಧ್ಯತೆ: ${rainProb}%\n• ಗಾಳಿ: ${wind} km/h`;
    }
    if (language === "ml") {
      return `✈️ യാത്രാ കാലാവസ്ഥ റിപ്പോർട്ട് (${locName}):\n• താപനില: ${temp}°C, മഴ സാധ്യത: ${rainProb}%\n• കാറ്റ്: ${wind} km/h`;
    }
    return `✈️ Travel Weather Assessment for ${locName}:\n• Temperature: ${temp}°C (High ${maxTemp}°C / Low ${minTemp}°C)\n• Rain probability: ${rainProb}%\n• Road visibility: ${visibility ? `${visibility} km` : "Clear"}\n• Wind speed: ${wind} km/h\nRecommendation: ${rainProb >= 50 ? "Carry waterproof bags and keep an umbrella handy." : "Favorable travel conditions."}`;
  }

  // 4. UMBRELLA & RAIN
  if (intent === "umbrella_rain") {
    if (language === "hi") {
      return rainProb >= 50
        ? `जी, आज बारिश की संभावना है (${rainProb}%)। दोपहर या शाम के समय बारिश हो सकती है। कृपया छाता ज़रूर साथ रखें। ☔`
        : `✅ आज बारिश की संभावना कम है (${rainProb}%)। छाता ले जाने की आवश्यकता नहीं है।`;
    }
    if (language === "pa") {
      return rainProb >= 50
        ? `ਹਾਂ, ਅੱਜ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਹੈ (${rainProb}%)। ਦੁਪਹਿਰ ਜਾਂ ਸ਼ਾਮ ਵੇਲੇ ਮੀਂਹ ਪੈ ਸਕਦਾ ਹੈ, ਇਸ ਲਈ ਛੱਤਰੀ ਜ਼ਰੂਰ ਨਾਲ ਰੱਖੋ। ☔`
        : `✅ ਅੱਜ ਮੀਂਹ ਦਾ ਖ਼ਤਰਾ ਬਹੁਤ ਘੱਟ ਹੈ (${rainProb}%)। ਛੱਤਰੀ ਦੀ ਲੋੜ ਨਹੀਂ।`;
    }
    if (language === "mr") {
      return rainProb >= 50
        ? `हो, आज पाऊस पडण्याची शक्यता आहे (${rainProb}%)। बाहेर जाताना छत्री सोबत ठेवा. ☔`
        : `✅ आज पाऊस पडण्याची शक्यता कमी आहे (${rainProb}%)। छत्री नेण्याची गरज नाही.`;
    }
    if (language === "bn") {
      return rainProb >= 50
        ? `হ্যাঁ, আজ বৃষ্টির সম্ভাবনা রয়েছে (${rainProb}%)। বাইরে বেরোনোর সময় ছাতা সঙ্গে রাখুন। ☔`
        : `✅ আজ বৃষ্টির সম্ভাবনা কম (${rainProb}%)। ছাতা নেওয়ার প্রয়োজন নেই।`;
    }
    if (language === "gu") {
      return rainProb >= 50
        ? `હા, આજે વરસાદ પડવાની શક્યતા છે (${rainProb}%)। બહાર જતી વખતે છત્રી સાથે રાખવી. ☔`
        : `✅ આજે વરસાદની શક્યતા ઓછી છે (${rainProb}%)। છત્રી લઈ જવાની જરૂર નથી.`;
    }
    if (language === "ta") {
      return rainProb >= 50
        ? `ஆம், இன்று மழை பெய்ய வாய்ப்புள்ளது (${rainProb}%)। வெளியே செல்லும் போது குடை எடுத்துச் செல்லுங்கள். ☔`
        : `✅ இன்று மழை பெய்ய வாய்ப்பு குறைவு (${rainProb}%)। குடை தேவையில்லை.`;
    }
    if (language === "te") {
      return rainProb >= 50
        ? `అవును, ఈ రోజు వర్షం పడే అవకాశం ఉంది (${rainProb}%)। దయచేసి గొడుగు వెంట ఉంచుకోండి. ☔`
        : `✅ ఈ రోజు వర్షం పడే అవకాశం తక్కువ (${rainProb}%)। గొడుగు అవసరం లేదు.`;
    }
    if (language === "kn") {
      return rainProb >= 50
        ? `ಹೌದು, ಇಂದು ಮಳೆ ಬರುವ ಸಾಧ್ಯತೆಯಿದೆ (${rainProb}%)। ದಯವಿಟ್ಟು ಛತ್ರಿ ಜೊತೆಗೆ ಇಟ್ಟುಕೊಳ್ಳಿ. ☔`
        : `✅ ಇಂದು ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ಕಡಿಮೆ (${rainProb}%)। ಛತ್ರಿ ಅಗತ್ಯವಿಲ್ಲ.`;
    }
    if (language === "ml") {
      return rainProb >= 50
        ? `അതെ, ഇന്ന് മഴയ്ക്ക് സാധ്യതയുണ്ട് (${rainProb}%)। പുറത്തിറങ്ങുമ്പോൾ കുട കരുതുക. ☔`
        : `✅ ഇന്ന് മഴയ്ക്ക് സാധ്യത കുറവാണ് (${rainProb}%)। കുട ആവശ്യമില്ല.`;
    }
    return rainProb >= 50
      ? `Yes, there is a chance of rain today (${rainProb}% probability). I recommend carrying an umbrella, especially this afternoon. ☔`
      : `No, rain is unlikely today (${rainProb}% probability). You probably won't need an umbrella.`;
  }

  // 5. TEMPERATURE & FEELS LIKE
  if (intent === "temperature") {
    if (language === "hi") {
      return `🌡️ अभी तापमान ${temp}°C है।\n• महसूस होता है: ${feelsLike}°C जैसे\n• आज का दायरा: ${minTemp}°C से ${maxTemp}°C\n• नमी: ${humidity}%`;
    }
    if (language === "pa") {
      return `🌡️ ਇਸ ਵੇਲੇ ਤਾਪਮਾਨ ${temp}°C ਹੈ।\n• ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ: ${feelsLike}°C\n• ਅੱਜ ਵੱਧ ਤੋਂ ਵੱਧ: ${maxTemp}°C | ਘੱਟ ਤੋਂ ਘੱਟ: ${minTemp}°C\n• ਨਮੀ: ${humidity}%`;
    }
    if (language === "mr") {
      return `🌡️ सध्याचे तापमान ${temp}°C आहे.\n• भासणारे तापमान: ${feelsLike}°C\n• कमाल / किमान: ${maxTemp}°C / ${minTemp}°C\n• हवेतील आर्द्रता: ${humidity}%`;
    }
    if (language === "bn") {
      return `🌡️ বর্তমান তাপমাত্রা ${temp}°C।\n• অনুভূত তাপমাত্রা: ${feelsLike}°C\n• সর্বোচ্চ / সর্বনিম্ন: ${maxTemp}°C / ${minTemp}°C\n• আর্দ্রতা: ${humidity}%`;
    }
    if (language === "gu") {
      return `🌡️ વર્તમાન તાપમાન ${temp}°C છે.\n• અનુભવાતું તાપમાન: ${feelsLike}°C\n• આજની શ્રેણી: ${minTemp}°C થી ${maxTemp}°C\n• ભેજ: ${humidity}%`;
    }
    if (language === "ta") {
      return `🌡️ தற்போதைய வெப்பநிலை ${temp}°C.\n• உணரப்படும் வெப்பநிலை: ${feelsLike}°C\n• இன்றைய வரம்பு: ${minTemp}°C முதல் ${maxTemp}°C\n• ஈரப்பதம்: ${humidity}%`;
    }
    if (language === "te") {
      return `🌡️ ప్రస్తుత ఉష్ణోగ్రత ${temp}°C.\n• అనిపించే ఉష్ణోగ్రత: ${feelsLike}°C\n• నేటి గరిష్ట/కనిష్ట: ${maxTemp}°C / ${minTemp}°C\n• తేమ: ${humidity}%`;
    }
    if (language === "kn") {
      return `🌡️ ಪ್ರಸ್ತುತ ತಾಪಮಾನ ${temp}°C.\n• ಅನುಭವಕ್ಕೆ ಬರುವುದು: ${feelsLike}°C\n• ಗರಿಷ್ಠ / ಕನಿಷ್ಠ: ${maxTemp}°C / ${minTemp}°C\n• ತೇವಾಂಶ: ${humidity}%`;
    }
    if (language === "ml") {
      return `🌡️ ഇപ്പോഴത്തെ താപനില ${temp}°C ആണ്.\n• അനുഭവപ്പെടുന്നത്: ${feelsLike}°C\n• കൂടിയ / കുറഞ്ഞ താപനില: ${maxTemp}°C / ${minTemp}°C\n• ഈർപ്പം: ${humidity}%`;
    }
    return `🌡️ Current Temperature: ${temp}°C\n• Feels like: ${feelsLike}°C\n• Today's range: ${minTemp}°C to ${maxTemp}°C\n• Relative humidity: ${humidity}%`;
  }

  // 6. PICNIC & OUTDOOR ACTIVITIES
  if (intent === "picnic_outdoor") {
    const isGood = rainProb < 40 && (temp != null && temp >= 18 && temp <= 32) && (aqi == null || aqi < 150);
    if (language === "hi") {
      return isGood
        ? `🌤️ पिकनिक या बाहर घूमने के लिए आज का दिन बढ़िया है!\n• तापमान: ${temp}°C\n• बारिश: केवल ${rainProb}%\n• हवा: ${wind} km/h`
        : `⚠️ बाहर जाने से पहले ध्यान दें:\n• बारिश का खतरा: ${rainProb}%\n• तापमान: ${temp}°C\nसलाह: बैकअप इनडोर प्लान रखें।`;
    }
    if (language === "pa") {
      return isGood
        ? `🌤️ ਬਾਹਰ ਘੁੰਮਣ ਜਾਂ ਪਿਕਨਿਕ ਲਈ ਵਧੀਆ ਦਿਨ ਹੈ!\n• ਤਾਪਮਾਨ: ${temp}°C\n• ਮੀਂਹ: ${rainProb}%`
        : `⚠️ ਬਾਹਰ ਜਾਣ ਵੇਲੇ ਸਾਵਧਾਨੀ ਵਰਤੋ:\n• ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ: ${rainProb}%\n• ਤਾਪਮਾਨ: ${temp}°C`;
    }
    if (language === "mr") {
      return isGood
        ? `🌤️ सहल किंवा बाहेर फिरण्यासाठी आजचा दिवस उत्तम आहे!\n• तापमान: ${temp}°C\n• पाऊस: ${rainProb}%`
        : `⚠️ बाहेर पडताना खबरदारी घ्या:\n• पावसाचा अंदाज: ${rainProb}%\n• तापमान: ${temp}°C`;
    }
    return isGood
      ? `🌤️ Great conditions for outdoor plans & picnics!\n• Temperature: ${temp}°C (Comfortable)\n• Rain probability: ${rainProb}%\n• Wind: ${wind} km/h`
      : `⚠️ Outdoor conditions require caution:\n• Rain probability: ${rainProb}%\n• Temperature: ${temp}°C (feels ${feelsLike}°C)\nRecommendation: Have a shaded or indoor backup option ready.`;
  }

  // 7. WHAT TO WEAR & WHAT TO CARRY
  if (intent === "wear" || intent === "carry") {
    const recs = getCarryAndWearRecommendations({ persona, weather, personaContext });
    const carryList = recs.carry.map((c) => `• ${c.icon} ${c.text}`).join("\n");
    const wearList = recs.wear.map((w) => `• ${w.icon} ${w.text}`).join("\n");

    if (language === "hi") {
      return intent === "wear"
        ? `👗 आज के लिए अनुशंसित पोशाक (वर्तमान तापमान ${temp}°C):\n${wearList}`
        : `🎒 आज साथ ले जाने वाली ज़रूरी वस्तुएं:\n${carryList}`;
    }
    if (language === "pa") {
      return intent === "wear"
        ? `👗 ਅੱਜ ਪਹਿਨਣ ਲਈ ਕੱਪੜੇ (${temp}°C ਤਾਪਮਾਨ ਅਨੁਸਾਰ):\n${wearList}`
        : `🎒 ਅੱਜ ਨਾਲ ਲੈ ਜਾਣ ਵਾਲੀਆਂ ਚੀਜ਼ਾਂ:\n${carryList}`;
    }
    if (language === "mr") {
      return intent === "wear"
        ? `👗 आज घालण्यासाठी कपडे (${temp}°C तापमानानुसार):\n${wearList}`
        : `🎒 आज सोबत ठेवण्याच्या गोष्टी:\n${carryList}`;
    }
    if (language === "bn") {
      return intent === "wear"
        ? `👗 আজ কী পোশাক পরবেন (${temp}°C):\n${wearList}`
        : `🎒 আজ সঙ্গে কী রাখবেন:\n${carryList}`;
    }
    if (language === "gu") {
      return intent === "wear"
        ? `👗 આજે પહેરવા માટે કપડાં (${temp}°C):\n${wearList}`
        : `🎒 સાથે રાખવા જેવી ચીજો:\n${carryList}`;
    }
    if (language === "ta") {
      return intent === "wear"
        ? `👗 இன்று அணிய வேண்டிய ஆடை (${temp}°C):\n${wearList}`
        : `🎒 உடன் கொண்டு செல்ல வேண்டியவை:\n${carryList}`;
    }
    if (language === "te") {
      return intent === "wear"
        ? `👗 నేడు ధరించాల్సిన దుస్తులు (${temp}°C):\n${wearList}`
        : `🎒 వెంట ఉంచుకోవలసిన వస్తువులు:\n${carryList}`;
    }
    if (language === "kn") {
      return intent === "wear"
        ? `👗 ಇಂದು ಧರಿಸಬೇಕಾದ ಬಟ್ಟೆಗಳು (${temp}°C):\n${wearList}`
        : `🎒 ಜೊತೆಗೆ ತೆಗೆದುಕೊಂಡು ಹೋಗಬೇಕಾದ ವಸ್ತುಗಳು:\n${carryList}`;
    }
    if (language === "ml") {
      return intent === "wear"
        ? `👗 ഇന്ന് ധരിക്കേണ്ട വസ്ത്രങ്ങൾ (${temp}°C):\n${wearList}`
        : `🎒 കൂടെ കരുതേണ്ട സാധനങ്ങൾ:\n${carryList}`;
    }
    return intent === "wear"
      ? `👗 What to wear today (${temp}°C with high of ${maxTemp}°C):\n${wearList}`
      : `🎒 What to carry today:\n${carryList}`;
  }

  // 8. AQI & AIR QUALITY
  if (intent === "aqi") {
    if (aqi == null) {
      const naMap = {
        hi: "वर्तमान स्थान के लिए वायु गुणवत्ता (AQI) डेटा उपलब्ध नहीं है।",
        pa: "ਇਸ ਖੇਤਰ ਲਈ ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਦਾ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
        mr: "हवेची गुणवत्ता डेटा सध्या उपलब्ध नाही.",
        bn: "বায়ুর মানের তথ্য এই মুহূর্তে পাওয়া যায়নি।",
        gu: "વાયુ ગુણવત્તા ડેટા હાલ ઉપલબ્ધ નથી.",
        ta: "காற்றின் தரம் பற்றிய தகவல் கிடைக்கவில்லை.",
        te: "గాలి నాణ్యత సమాచారం అందుబాటులో లేదు.",
        kn: "ವಾಯು ಗುಣಮಟ್ಟದ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.",
        ml: "വായു ഗുണനിലവാര ഡാറ്റ ഇപ്പോൾ ലഭ്യമല്ല.",
        en: "Air quality data is currently unavailable for these coordinates.",
      };
      return naMap[language] || naMap.en;
    }

    const safe = aqi <= 100;
    if (language === "hi") {
      return `😷 वायु गुणवत्ता सूचकांक (AQI): ${aqi}\n• स्थिति: ${safe ? "सुरक्षित / सामान्य" : "अस्वस्थ"}\nसलाह: ${safe ? "हवा सामान्य गतिविधियों के लिए ठीक है।" : "मास्क पहनें और लंबी आउटडोर गतिविधियों से बचें।"}`;
    }
    if (language === "pa") {
      return `😷 ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ (AQI): ${aqi}\n• ਸਥਿਤੀ: ${safe ? "ਸੁਰੱਖਿਅਤ" : "ਮਾੜੀ"}\nਸਲਾਹ: ${safe ? "ਸਧਾਰਨ ਗਤੀਵਿਧੀਆਂ ਜਾਰੀ ਰੱਖੋ।" : "ਬਾਹਰ ਮਾਸਕ ਪਾ ਕੇ ਨਿਕਲੋ।"}`;
    }
    if (language === "mr") {
      return `😷 हवेची गुणवत्ता (AQI): ${aqi}\n• स्थिती: ${safe ? "सुरक्षित" : "अस्वस्थकारक"}\nसल्ला: ${safe ? "बाहेरील कामांसाठी हवा ठीक आहे." : "मास्कचा वापर करा."}`;
    }
    if (language === "bn") {
      return `😷 বায়ুর মান সূচক (AQI): ${aqi}\n• অবস্থা: ${safe ? "সন্তোষজনক" : "অস্বাস্থ্যকর"}`;
    }
    if (language === "gu") {
      return `😷 વાયુ ગુણવત્તા (AQI): ${aqi}\n• સ્થિતિ: ${safe ? "સારી / સામાન્ય" : "બિનઆરોગ્યપ્રદ"}`;
    }
    if (language === "ta") {
      return `😷 காற்றின் தரக் குறியீடு (AQI): ${aqi}\n• நிலை: ${safe ? "பாதுகாப்பானது" : "ஆரோக்கியமற்றது"}`;
    }
    if (language === "te") {
      return `😷 గాలి నాణ్యత సూచిక (AQI): ${aqi}\n• పరిస్థితి: ${safe ? "సురక్షితం" : "అనారోగ్యకరం"}`;
    }
    if (language === "kn") {
      return `😷 ವಾಯು ಗುಣಮಟ್ಟ ಸೂಚ್ಯಂಕ (AQI): ${aqi}\n• ಸ್ಥಿತಿ: ${safe ? "ಸುರಕ್ಷಿತ" : "ಅನಾರೋಗ್ಯಕರ"}`;
    }
    if (language === "ml") {
      return `😷 വായു ഗുണനിലവാര സൂചിക (AQI): ${aqi}\n• അവസ്ഥ: ${safe ? "സുരക്ഷിതം" : "അനാരോഗ്യകരം"}`;
    }
    return `😷 Air Quality Index (AQI): ${aqi}\n• Status: ${aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : aqi <= 200 ? "Unhealthy" : "Hazardous"}\nRecommendation: ${safe ? "Air is suitable for outdoor activity." : "Wear an N95 mask outdoors and minimize heavy outdoor cardio."}`;
  }

  // 9. UV INDEX
  if (intent === "uv") {
    if (uv == null) {
      return "UV index data is not available right now.";
    }
    if (language === "hi") {
      return `☀️ UV इंडेक्स: ${uv}\n• स्तर: ${uv >= 8 ? "अत्यधिक तेज" : uv >= 5 ? "मध्यम" : "सुरक्षित"}\nसलाह: ${uv >= 5 ? "सनस्क्रीन SPF 30+ लगाएं और धूप का चश्मा पहनें।" : "विशेष सुरक्षा की आवश्यकता नहीं है।"}`;
    }
    if (language === "pa") {
      return `☀️ UV ਇੰਡੈਕਸ: ${uv}\n• ਪੱਧਰ: ${uv >= 8 ? "ਬਹੁਤ ਤੇਜ਼" : uv >= 5 ? "ਦਰਮਿਆਨਾ" : "ਸੁਰੱਖਿਅਤ"}`;
    }
    if (language === "mr") {
      return `☀️ UV इंडेक्स: ${uv}\n• पातळी: ${uv >= 8 ? "अत्यंत तीव्र" : uv >= 5 ? "मध्यम" : "सुरक्षित"}`;
    }
    return `☀️ Solar UV Index: ${uv}\n• Level: ${uv >= 11 ? "Extreme" : uv >= 8 ? "Very High" : uv >= 5 ? "Moderate" : "Low"}\nRecommendation: ${uv >= 5 ? "Apply SPF 30+ sunscreen, wear UV sunglasses, and avoid peak sun." : "Minimal sun protection required."}`;
  }

  // 10. SUNRISE & SUNSET
  if (intent === "sunrise_sunset") {
    if (!sunrise && !sunset) {
      return "Solar timing data is not available right now.";
    }
    if (language === "hi") {
      return `🌅 सूर्योदय: ${sunrise || "--"}\n🌇 सूर्यास्त: ${sunset || "--"}`;
    }
    if (language === "pa") {
      return `🌅 ਸੂਰਜ ਚੜ੍ਹਨਾ: ${sunrise || "--"}\n🌇 ਸੂਰਜ ਡੁੱਬਣਾ: ${sunset || "--"}`;
    }
    if (language === "mr") return `🌅 सूर्योदय: ${sunrise || "--"}\n🌇 सूर्यास्त: ${sunset || "--"}`;
    if (language === "bn") return `🌅 সূর্যোদয়: ${sunrise || "--"}\n🌇 সূর্যাস্ত: ${sunset || "--"}`;
    if (language === "gu") return `🌅 સૂર્યોદય: ${sunrise || "--"}\n🌇 સૂર્યાસ્ત: ${sunset || "--"}`;
    if (language === "ta") return `🌅 சூரிய உதயம்: ${sunrise || "--"}\n🌇 சூரிய அஸ்தமனம்: ${sunset || "--"}`;
    if (language === "te") return `🌅 సూర్యోదయం: ${sunrise || "--"}\n🌇 సూర్యాస్తమయం: ${sunset || "--"}`;
    if (language === "kn") return `🌅 ಸೂರ್ಯೋದಯ: ${sunrise || "--"}\n🌇 ಸೂರ್ಯಾಸ್ತ: ${sunset || "--"}`;
    if (language === "ml") return `🌅 സൂര്യോദയം: ${sunrise || "--"}\n🌇 സൂര്യാസ്തമയം: ${sunset || "--"}`;
    return `🌅 Sunrise: ${sunrise || "--"}\n🌇 Sunset: ${sunset || "--"}`;
  }

  // 11. GENERAL WEATHER SUMMARY
  if (language === "hi") {
    return `🌤️ ${locName} का मौसम:\n• तापमान: ${temp}°C (महसूस ${feelsLike}°C)\n• आज का दायरा: ${minTemp}°C से ${maxTemp}°C\n• बारिश का खतरा: ${rainProb}%\n• हवा: ${wind} km/h | नमी: ${humidity}%\n• AQI: ${aqi ?? "उपलब्ध नहीं"}`;
  }
  if (language === "pa") {
    return `🌤️ ${locName} ਦਾ ਮੌਸਮ:\n• ਤਾਪਮਾਨ: ${temp}°C (ਮਹਿਸੂਸ ${feelsLike}°C)\n• ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ: ${rainProb}%\n• ਹਵਾ: ${wind} km/h | ਨਮੀ: ${humidity}%`;
  }
  if (language === "mr") {
    return `🌤️ ${locName} येथील हवामान:\n• तापमान: ${temp}°C (भासणारे ${feelsLike}°C)\n• कमाल / किमान: ${maxTemp}°C / ${minTemp}°C\n• पावसाची शक्यता: ${rainProb}%\n• वारा: ${wind} km/h | AQI: ${aqi ?? "उपलब्ध नाही"}`;
  }
  if (language === "bn") {
    return `🌤️ ${locName}-এর আবহাওয়া:\n• তাপমাত্রা: ${temp}°C (অনুভূত ${feelsLike}°C)\n• সর্বোচ্চ / সর্বনিম্ন: ${maxTemp}°C / ${minTemp}°C\n• বৃষ্টির সম্ভাবনা: ${rainProb}%\n• বাতাস: ${wind} km/h | AQI: ${aqi ?? "তথ্য নেই"}`;
  }
  if (language === "gu") {
    return `🌤️ ${locName}નું હવામાન:\n• તાપમાન: ${temp}°C (અનુભવાતું ${feelsLike}°C)\n• શ્રેણી: ${minTemp}°C થી ${maxTemp}°C\n• વરસાદની શક્યતા: ${rainProb}%\n• પવન: ${wind} km/h | AQI: ${aqi ?? "ઉપલબ્ધ નથી"}`;
  }
  if (language === "ta") {
    return `🌤️ ${locName} வானிலை நிலவரம்:\n• வெப்பநிலை: ${temp}°C (உணரப்படுவது ${feelsLike}°C)\n• இன்றைய வரம்பு: ${minTemp}°C - ${maxTemp}°C\n• மழை வாய்ப்பு: ${rainProb}%\n• காற்று: ${wind} km/h | AQI: ${aqi ?? "கிடைக்கவில்லை"}`;
  }
  if (language === "te") {
    return `🌤️ ${locName} వాతావరణ వివరాలు:\n• ఉష్ణోగ్రత: ${temp}°C (అనిపించేది ${feelsLike}°C)\n• గరిష్ట / కనిష్ట: ${maxTemp}°C / ${minTemp}°C\n• వర్ష సూచన: ${rainProb}%\n• గాలి: ${wind} km/h | AQI: ${aqi ?? "లభ్యం కాలేదు"}`;
  }
  if (language === "kn") {
    return `🌤️ ${locName} ಹವಾಮಾನ ಸ್ಥಿತಿ:\n• ತಾಪಮಾನ: ${temp}°C (ಅನುಭವಕ್ಕೆ ಬರುವುದು ${feelsLike}°C)\n• ಗರಿಷ್ಠ / ಕನಿಷ್ಠ: ${maxTemp}°C / ${minTemp}°C\n• ಮಳೆ ಸಂಭವನೀಯತೆ: ${rainProb}%\n• ಗಾಳಿ: ${wind} km/h | AQI: ${aqi ?? "ಲಭ್ಯವಿಲ್ಲ"}`;
  }
  if (language === "ml") {
    return `🌤️ ${locName} കാലാവസ്ഥ വിവരങ്ങൾ:\n• താപനില: ${temp}°C (അനുഭവപ്പെടുന്നത് ${feelsLike}°C)\n• കൂടിയ / കുറഞ്ഞ: ${maxTemp}°C / ${minTemp}°C\n• മഴ സാധ്യത: ${rainProb}%\n• കാറ്റ്: ${wind} km/h | AQI: ${aqi ?? "ലഭ്യമല്ല"}`;
  }
  return `🌤️ Current Weather for ${locName}:\n• Temperature: ${temp}°C (feels like ${feelsLike}°C)\n• High / Low: ${maxTemp}°C / ${minTemp}°C\n• Rain probability: ${rainProb}%\n• Air Quality: ${aqi != null ? `AQI ${aqi}` : "Stable"}\n• Wind: ${wind} km/h`;
}

export const SUGGESTED_QUESTIONS = {
  en: [
    "Will it rain today?",
    "What should I wear today?",
    "Is today suitable for sowing wheat?",
    "Should I go running now?",
    "What should I carry?",
    "Is the AQI safe?",
  ],
  hi: [
    "क्या आज बारिश होगी?",
    "आज क्या पहनूं?",
    "क्या आज गेहूं बोने का सही समय है?",
    "क्या मैं अभी दौड़ने जा सकता हूँ?",
    "साथ में क्या ले जाऊं?",
    "क्या AQI सुरक्षित है?",
  ],
  pa: [
    "ਕੀ ਅੱਜ ਮੀਂਹ ਪਵੇਗਾ?",
    "ਕੀ ਅੱਜ ਕਣਕ ਬੀਜਣ ਦਾ ਸਹੀ ਸਮਾਂ ਹੈ?",
    "ਅੱਜ ਕੀ ਪਾਵਾਂ?",
    "ਨਾਲ ਕੀ ਲੈ ਕੇ ਜਾਵਾਂ?",
    "ਕੀ ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਠੀਕ ਹੈ?",
  ],
  mr: [
    "आज पाऊस पडेल का?",
    "आज काय कपडे घालावे?",
    "आज गहू पेरणीसाठी योग्य दिवस आहे का?",
    "मी आता धावायला जाऊ शकतो का?",
    "सोबत काय घ्यावे?",
    "हवेची गुणवत्ता (AQI) कशी आहे?",
  ],
  bn: [
    "আজ কি বৃষ্টি হবে?",
    "আজ কী পোশাক পরা উচিত?",
    "আজ কি গম বপনের উপযুক্ত সময়?",
    "এখন কি দৌড়াতে যাওয়া যাবে?",
    "সঙ্গে কী ছাতা রাখা প্রয়োজন?",
    "বায়ুর মান (AQI) কেমন?",
  ],
  gu: [
    "શું આજે વરસાદ પડશે?",
    "આજે શું પહેરવું?",
    "શું આજે ઘઉં વાવવા માટે યોગ્ય સમય છે?",
    "શું હું અત્યારે દોડવા જઈ શકું?",
    "સાથે શું લઈ જવું?",
    "હવા ગુણવત્તા (AQI) કેવી છે?",
  ],
  ta: [
    "இன்று மழை பெய்யுமா?",
    "இன்று என்ன ஆடை அணிய வேண்டும்?",
    "இன்று கோதுமை விதைக்க ஏற்ற நாளா?",
    "நான் இப்போது ஓடலாமா?",
    "உடன் என்ன எடுத்துச் செல்ல வேண்டும்?",
    "காற்றின் தரம் (AQI) எப்படி உள்ளது?",
  ],
  te: [
    "ఈ రోజు వర్షం పడుతుందా?",
    "ఈ రోజు ఏ దుస్తులు ధరించాలి?",
    "గోధుమ విత్తనాలు నాటడానికి ఈ రోజు సరైన సమయమా?",
    "నేను ఇప్పుడు పరుగుకు వెళ్లవచ్చా?",
    "వెంట ఏమి తీసుకువెళ్లాలి?",
    "గాలి నాణ్యత (AQI) ఎలా ఉంది?",
  ],
  kn: [
    "ಇಂದು ಮಳೆ ಬರುತ್ತದೆಯೇ?",
    "ಇಂದು ಯಾವ ಬಟ್ಟೆ ಧರಿಸಬೇಕು?",
    "ಇಂದು ಗೋಧಿ ಬಿತ್ತನೆಗೆ ಸೂಕ್ತ ಸಮಯವೇ?",
    "ನಾನು ಈಗ ಓಡಲು ಹೋಗಬಹುದೇ?",
    "ಜೊತೆಗೆ ಏನು ಕೊಂಡೊಯ್ಯಬೇಕು?",
    "ವಾಯು ಗುಣಮಟ್ಟ (AQI) ಹೇಗಿದೆ?",
  ],
  ml: [
    "ഇന്ന് മഴ പെയ്യുമോ?",
    "ഇന്ന് ഏത് വസ്ത്രം ധരിക്കണം?",
    "ഇന്ന് ഗോതമ്പ് വിതയ്ക്കാൻ അനുയോജ്യമായ സമയമാണോ?",
    "എനിക്ക് ഇപ്പോൾ ഓടാൻ പോകാൻ കഴിയുമോ?",
    "കൂടെ എന്താണ് കരുതേണ്ടത്?",
    "വായു ഗുണനിലവാരം (AQI) എങ്ങനെയുണ്ട്?",
  ],
};
