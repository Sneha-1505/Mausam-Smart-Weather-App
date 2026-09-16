/**
 * voice.js
 * Browser-native Speech Recognition and Speech Synthesis wrapper.
 * Gracefully handles unsupported browsers and permission errors.
 */

/* -------------------------------------------------------
   SPEECH RECOGNITION
------------------------------------------------------- */

let recognition = null;

export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function startListening({ lang = "en-US", onResult, onError, onStart, onEnd }) {
  if (!isSpeechRecognitionSupported()) {
    onError?.("Speech recognition is not supported in this browser. Try Chrome.");
    return null;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => {
    onStart?.();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript ?? "";
    onResult?.(transcript);
  };

  recognition.onerror = (event) => {
    let message = "Microphone error.";
    if (event.error === "not-allowed") {
      message = "Microphone access was denied. Please allow microphone permissions in your browser settings.";
    } else if (event.error === "no-speech") {
      message = "No speech detected. Please try again.";
    } else if (event.error === "network") {
      message = "Network error during speech recognition.";
    }
    onError?.(message);
  };

  recognition.onend = () => {
    onEnd?.();
    recognition = null;
  };

  try {
    recognition.start();
  } catch {
    onError?.("Could not start microphone. Please check permissions.");
  }

  return recognition;
}

export function stopListening() {
  if (recognition) {
    try { recognition.stop(); } catch { /* silent */ }
    recognition = null;
  }
}

/* -------------------------------------------------------
   SPEECH SYNTHESIS
------------------------------------------------------- */

export function isSpeechSynthesisSupported() {
  if (typeof window === "undefined") return false;
  return !!window.speechSynthesis;
}

const LANG_CODES = {
  en: "en-IN",
  hi: "hi-IN",
  pa: "pa-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  ta: "ta-IN",
  te: "te-IN",
  kn: "kn-IN",
  ml: "ml-IN",
};

const RECOGNITION_LANG_CODES = {
  en: "en-IN",
  hi: "hi-IN",
  pa: "pa-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  ta: "ta-IN",
  te: "te-IN",
  kn: "kn-IN",
  ml: "ml-IN",
};

export function getRecognitionLang(lang) {
  return RECOGNITION_LANG_CODES[lang] ?? "en-IN";
}

export function speak(text, lang = "en", onEnd) {
  if (!isSpeechSynthesisSupported()) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip emoji from text for cleaner speech
  const cleanText = text.replace(/[\u{1F600}-\u{1F9FF}]/gu, "").trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = LANG_CODES[lang] ?? "en-IN";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to find a voice that matches the language
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(
    (v) => v.lang.startsWith(utterance.lang.split("-")[0])
  );
  if (matchingVoice) utterance.voice = matchingVoice;

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking() {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}
