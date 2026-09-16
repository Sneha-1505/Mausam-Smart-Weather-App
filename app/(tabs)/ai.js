import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useMausam } from "../../src/context/MausamContext";
import { getWeatherInfo } from "../../src/services/weather";
import {
  buildResponse,
  detectLanguage,
  detectLocalLanguage,
  COMPULSORY_LANGUAGES,
  SUGGESTED_QUESTIONS,
  LANGUAGE_LABELS,
} from "../../src/services/chatbot";
import {
  startListening,
  stopListening,
  stopSpeaking,
  speak,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  getRecognitionLang,
} from "../../src/services/voice";
import { VoiceButton } from "../../src/components/VoiceButton";
import { getAvatarById, AvatarFigure } from "../../src/data/avatars";

/* =========================================================
   FORMAT HELPERS
========================================================= */

function formatTime12h(isoString) {
  if (!isoString) return "--";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function round(v) {
  if (v == null || isNaN(Number(v))) return "--";
  return Math.round(Number(v));
}

/* =========================================================
   MESSAGE BUBBLE
========================================================= */

function MessageBubble({ message, accent, colors, isDark, userAvatar }) {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.bubbleWrapper,
        isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperBot,
      ]}
    >
      {!isUser && (
        <View style={[styles.avatarCircle, { backgroundColor: "rgba(56, 189, 248, 0.15)", borderColor: "rgba(56, 189, 248, 0.4)" }]}>
          <Text style={{ fontSize: 16 }}>🌦️</Text>
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleBot,
          isUser
            ? { backgroundColor: "#1E3A8A", borderColor: "rgba(59, 130, 246, 0.4)" }
            : { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)" },
        ]}
      >
        <Text style={[styles.bubbleText, { color: isUser ? "#FFFFFF" : colors.text }]}>
          {message.text}
        </Text>
        <View style={styles.bubbleFooter}>
          <Text style={[styles.bubbleTime, { color: isUser ? "rgba(255,255,255,0.6)" : colors.textSecondary }]}>
            {formatTime12h(message.timestamp)}
          </Text>
          {isUser && (
            <Ionicons name="checkmark-done" size={13} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />
          )}
        </View>
      </View>

      {isUser && (
        <AvatarFigure
          id={userAvatar?.id}
          size={32}
          borderColor={accent}
        />
      )}
    </View>
  );
}

/* =========================================================
   AI TAB SCREEN
========================================================= */

export default function AI() {
  const {
    profile,
    weather,
    weatherLoading,
    personaContext,
    chatLanguage,
    setChatLanguage,
    colors,
    isDark,
  } = useMausam();

  const accent = colors.accent || "#D99A3D";
  const userAvatar = getAvatarById(profile?.avatar || "farmer");

  /* ── State ─────────────────────────────────────────────── */
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [showLangPicker, setShowLangPicker] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Weather context for chatbot ──────────────────────── */
  const currentCode = weather?.current?.weather_code;
  const weatherLabel = currentCode != null
    ? getWeatherInfo(currentCode)?.label ?? "—"
    : "—";

  const weatherData = {
    weather,
    personaContext,
    profile,
    weatherLabel,
  };

  /* ── Detected Local Language from Location ─────────────── */
  const localLangInfo = useMemo(() => {
    return detectLocalLanguage(
      profile?.location,
      profile?.region,
      profile?.country,
      profile?.latitude,
      profile?.longitude
    );
  }, [profile?.location, profile?.region, profile?.country, profile?.latitude, profile?.longitude]);

  /* ── Greeting on mount ──────────────────────────────────── */
  useEffect(() => {
    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    const greetMap = {
      en: `${greeting}${profile?.name ? `, ${profile.name}` : ""}! 🌦️ I'm Mausam AI — your intelligent weather assistant. Ask me anything in English, Hindi, or your regional language!`,
      hi: `${greeting === "Good morning" ? "सुप्रभात" : greeting === "Good afternoon" ? "नमस्ते" : "शुभ संध्या"}${profile?.name ? `, ${profile.name}` : ""}! 🌦️ मैं मौसम AI हूँ। बारिश, तापमान, बुवाई, या क्या पहनें — कुछ भी पूछें!`,
      pa: `${greeting === "Good morning" ? "ਸ਼ੁਭ ਸਵੇਰ" : greeting === "Good afternoon" ? "ਨਮਸਕਾਰ" : "ਸ਼ੁਭ ਸ਼ਾਮ"}${profile?.name ? `, ${profile.name}` : ""}! 🌦️ ਮੈਂ ਮੌਸਮ AI ਹਾਂ। ਮੌਸਮ, ਕਣਕ ਦੀ ਬਿਜਾਈ, ਜਾਂ ਸਫ਼ਰ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ!`,
      mr: `नमस्कार${profile?.name ? `, ${profile.name}` : ""}! 🌦️ मी मौसम AI आहे. हवामान, पाऊस, पेरणी आणि कपड्यांविषयी मला काहीही विचारा!`,
      bn: `নমস্কার${profile?.name ? `, ${profile.name}` : ""}! 🌦️ আমি মৌসুম AI। আবহাওয়া, বৃষ্টি, চাষাবাদ ও পোশাক সংক্রান্ত যেকোনো প্রশ্ন জিজ্ঞেস করুন!`,
      gu: `નમસ્તે${profile?.name ? `, ${profile.name}` : ""}! 🌦️ હું મૌસમ AI છું. હવામાન, વરસાદ, વાવણી કે પોશાક વિશે કંઈ પણ પૂછો!`,
      ta: `வணக்கம்${profile?.name ? `, ${profile.name}` : ""}! 🌦️ நான் மௌசம் AI. வானிலை, மழை, விவசாயம் அல்லது என்ன அணிய வேண்டும் என்பது பற்றி கேளுங்கள்!`,
      te: `నమస్కారం${profile?.name ? `, ${profile.name}` : ""}! 🌦️ నేను మౌసమ్ AI. వాతావరణం, వర్షం, విత్తనాలు నాటడం లేదా దుస్తుల గురించి నన్ను అడగండి!`,
      kn: `ನಮಸ್ಕಾರ${profile?.name ? `, ${profile.name}` : ""}! 🌦️ ನಾನು ಮೌಸಮ್ AI. ಹವಾಮಾನ, ಮಳೆ, ಕೃಷಿ ಅಥವಾ ಧರಿಸುವ ಬಟ್ಟೆಗಳ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ!`,
      ml: `നമസ്കാരം${profile?.name ? `, ${profile.name}` : ""}! 🌦️ ഞാൻ മൗസം AI ആണ്. കാലാവസ്ഥ, മഴ, കൃഷി അല്ലെങ്കിൽ യാത്രയെക്കുറിച്ച് എന്തും ചോദിക്കൂ!`,
    };

    setMessages([
      {
        id: "greeting",
        role: "bot",
        text: greetMap[chatLanguage] ?? greetMap.en,
        timestamp: new Date().toISOString(),
      },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatLanguage]);

  /* ── Scroll to bottom on new message ──────────────────── */
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isThinking]);

  /* ── Ask handler with Automatic Language Detection ─────── */
  const ask = useCallback(
    async (questionText) => {
      const q = (questionText ?? input).trim();
      if (!q) return;

      Keyboard.dismiss();
      setInput("");

      const userMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        text: q,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);
      setIsProcessing(true);

      // Detect language from user prompt to guide audio/fallback
      const autoLang = detectLanguage(q, chatLanguage);

      await new Promise((r) => setTimeout(r, 400));

      const response = buildResponse(q, weatherData, chatLanguage);

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
      setIsProcessing(false);

      // Vocalize response if speech is supported
      if (isSpeechSynthesisSupported()) {
        setIsSpeakingNow(true);
        speak(response, autoLang, () => setIsSpeakingNow(false));
      }
    },
    [input, weatherData, chatLanguage]
  );

  /* ── Voice input ──────────────────────────────────────── */
  const handleVoicePress = useCallback(() => {
    setVoiceError("");

    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setVoiceError("Voice recognition requires Chrome, Edge or Safari.");
      return;
    }

    startListening({
      lang: getRecognitionLang(chatLanguage),
      onStart: () => {
        setIsListening(true);
        setIsSpeakingNow(false);
        stopSpeaking();
      },
      onResult: (transcript) => {
        setIsListening(false);
        if (transcript) {
          setInput(transcript);
          ask(transcript);
        }
      },
      onError: (msg) => {
        setIsListening(false);
        setVoiceError(msg);
      },
      onEnd: () => setIsListening(false),
    });
  }, [isListening, chatLanguage, ask]);

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeakingNow(false);
  };

  const handleLangChange = (lang) => {
    setChatLanguage(lang);
    setShowLangPicker(false);
    stopSpeaking();
    setIsSpeakingNow(false);
  };

  // Get persona-specific suggested questions
  const activeQuestions = useMemo(() => {
    const baseList = [...(SUGGESTED_QUESTIONS[chatLanguage] ?? SUGGESTED_QUESTIONS.en)];
    const list = profile?.persona === "farmer"
      ? [
          chatLanguage === "hi"
            ? "क्या आज गेहूं बोने का सही समय है?"
            : chatLanguage === "pa"
            ? "ਕੀ ਅੱਜ ਕਣਕ ਬੀਜਣ ਦਾ ਸਹੀ ਸਮਾਂ ਹੈ?"
            : "Is today suitable for sowing wheat?",
          ...baseList,
        ]
      : baseList;
    return Array.from(new Set(list));
  }, [chatLanguage, profile?.persona]);

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: isDark ? "#090D14" : "#F6F4EE" }]}>
      {/* ─── Top Header (Panel 4 Reference UI) ───────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.botIconWrapper}>
            <Text style={{ fontSize: 24 }}>👩‍💻</Text>
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Mausam AI</Text>
            <View style={styles.onlineStatusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Language picker toggle */}
          <Pressable
            onPress={() => setShowLangPicker((v) => !v)}
            style={[styles.langButton, { borderColor: `${accent}40`, backgroundColor: `${accent}15` }]}
          >
            <Text style={{ fontSize: 13 }}>{LANGUAGE_LABELS[chatLanguage]?.flag || "🌐"}</Text>
            <Text style={[styles.langButtonText, { color: accent }]}>
              {LANGUAGE_LABELS[chatLanguage]?.short ?? "EN"}
            </Text>
            <Ionicons name={showLangPicker ? "chevron-up" : "chevron-down"} size={12} color={accent} />
          </Pressable>
        </View>
      </View>

      {/* ─── Quick Language Switcher & Local Detection Strip ──── */}
      <View style={[styles.langQuickBar, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langQuickScroll}>
          {/* Compulsory English */}
          <Pressable
            onPress={() => handleLangChange("en")}
            style={[
              styles.quickLangPill,
              chatLanguage === "en" && { backgroundColor: `${accent}25`, borderColor: accent },
              { borderColor: chatLanguage === "en" ? accent : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }
            ]}
          >
            <Text style={[styles.quickLangText, { color: chatLanguage === "en" ? accent : colors.text }]}>
              🌐 English <Text style={[styles.compulsoryBadge, { color: accent }]}>Compulsory</Text>
            </Text>
          </Pressable>

          {/* Compulsory Hindi */}
          <Pressable
            onPress={() => handleLangChange("hi")}
            style={[
              styles.quickLangPill,
              chatLanguage === "hi" && { backgroundColor: `${accent}25`, borderColor: accent },
              { borderColor: chatLanguage === "hi" ? accent : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }
            ]}
          >
            <Text style={[styles.quickLangText, { color: chatLanguage === "hi" ? accent : colors.text }]}>
              🇮🇳 हिन्दी <Text style={[styles.compulsoryBadge, { color: accent }]}>Compulsory</Text>
            </Text>
          </Pressable>

          {/* Detected Local Language (if not en or hi) */}
          {localLangInfo.lang !== "en" && localLangInfo.lang !== "hi" && (
            <Pressable
              onPress={() => handleLangChange(localLangInfo.lang)}
              style={[
                styles.quickLangPill,
                chatLanguage === localLangInfo.lang
                  ? { backgroundColor: "rgba(16, 185, 129, 0.25)", borderColor: "#10B981" }
                  : { borderColor: "rgba(16, 185, 129, 0.4)", backgroundColor: "rgba(16, 185, 129, 0.08)" }
              ]}
            >
              <Text style={[styles.quickLangText, { color: chatLanguage === localLangInfo.lang ? "#10B981" : colors.text }]}>
                {LANGUAGE_LABELS[localLangInfo.lang]?.flag || "📍"} {LANGUAGE_LABELS[localLangInfo.lang]?.native || localLangInfo.label} <Text style={{ fontSize: 10, color: "#10B981", fontWeight: "700" }}>(Local: {profile?.location || localLangInfo.regionName || "Here"})</Text>
              </Text>
            </Pressable>
          )}

          {/* More Languages Button */}
          <Pressable
            onPress={() => setShowLangPicker((v) => !v)}
            style={[styles.quickLangPill, { borderColor: `${accent}40`, backgroundColor: `${accent}10` }]}
          >
            <Text style={[styles.quickLangText, { color: accent, fontWeight: "700" }]}>
              {chatLanguage !== "en" && chatLanguage !== "hi" && chatLanguage !== localLangInfo.lang
                ? `${LANGUAGE_LABELS[chatLanguage]?.native} ✓`
                : "All Languages ▾"}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* ─── Language picker dropdown ────────────────────── */}
      {showLangPicker && (
        <View style={[styles.langPicker, { backgroundColor: isDark ? "#141C28" : "#FFFFFF" }]}>
          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={true} keyboardShouldPersistTaps="handled">
            {/* Compulsory Section */}
            <View style={styles.pickerSectionHeader}>
              <Text style={[styles.pickerSectionTitle, { color: colors.textSecondary }]}>
                ⭐ COMPULSORY (ALWAYS AVAILABLE)
              </Text>
            </View>
            {COMPULSORY_LANGUAGES.map((key) => {
              const val = LANGUAGE_LABELS[key];
              const isSelected = chatLanguage === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => handleLangChange(key)}
                  style={[
                    styles.langOption,
                    isSelected && { backgroundColor: `${accent}18` },
                  ]}
                >
                  <View style={styles.langOptionLeft}>
                    <Text style={{ fontSize: 18 }}>{val.flag}</Text>
                    <View>
                      <Text style={[styles.langOptionText, { color: colors.text }]}>
                        {val.label}
                      </Text>
                      <Text style={[styles.langOptionSub, { color: colors.textSecondary }]}>
                        Compulsory • {val.region}
                      </Text>
                    </View>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={18} color={accent} />}
                </Pressable>
              );
            })}

            {/* Detected Local Language section if not en/hi */}
            {localLangInfo.lang !== "en" && localLangInfo.lang !== "hi" && (
              <>
                <View style={styles.pickerSectionHeader}>
                  <Text style={[styles.pickerSectionTitle, { color: "#10B981" }]}>
                    📍 DETECTED LOCAL ({profile?.location?.toUpperCase() || "YOUR LOCATION"})
                  </Text>
                </View>
                {(() => {
                  const key = localLangInfo.lang;
                  const val = LANGUAGE_LABELS[key];
                  const isSelected = chatLanguage === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => handleLangChange(key)}
                      style={[
                        styles.langOption,
                        isSelected
                          ? { backgroundColor: "rgba(16, 185, 129, 0.2)" }
                          : { backgroundColor: "rgba(16, 185, 129, 0.06)" },
                      ]}
                    >
                      <View style={styles.langOptionLeft}>
                        <Text style={{ fontSize: 18 }}>{val?.flag || "📍"}</Text>
                        <View>
                          <Text style={[styles.langOptionText, { color: colors.text }]}>
                            {val?.label || key}
                          </Text>
                          <Text style={[styles.langOptionSub, { color: "#10B981" }]}>
                            Detected Local Language • {val?.region}
                          </Text>
                        </View>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={18} color="#10B981" />}
                    </Pressable>
                  );
                })()}
              </>
            )}

            {/* Other regional languages */}
            <View style={styles.pickerSectionHeader}>
              <Text style={[styles.pickerSectionTitle, { color: colors.textSecondary }]}>
                REGIONAL INDIAN LANGUAGES
              </Text>
            </View>
            {Object.entries(LANGUAGE_LABELS)
              .filter(([key]) => !COMPULSORY_LANGUAGES.includes(key) && key !== localLangInfo.lang)
              .map(([key, val]) => {
                const isSelected = chatLanguage === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => handleLangChange(key)}
                    style={[
                      styles.langOption,
                      isSelected && { backgroundColor: `${accent}18` },
                    ]}
                  >
                    <View style={styles.langOptionLeft}>
                      <Text style={{ fontSize: 18 }}>{val.flag}</Text>
                      <View>
                        <Text style={[styles.langOptionText, { color: colors.text }]}>
                          {val.label}
                        </Text>
                        <Text style={[styles.langOptionSub, { color: colors.textSecondary }]}>
                          {val.region}
                        </Text>
                      </View>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={18} color={accent} />}
                  </Pressable>
                );
              })}
          </ScrollView>
        </View>
      )}

      {/* ─── Messages List ───────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            accent={accent}
            colors={colors}
            isDark={isDark}
            userAvatar={userAvatar}
          />
        ))}

        {isThinking && (
          <View style={[styles.bubbleWrapper, styles.bubbleWrapperBot]}>
            <View style={[styles.avatarCircle, { backgroundColor: "rgba(56, 189, 248, 0.15)", borderColor: "rgba(56, 189, 248, 0.4)" }]}>
              <Text style={{ fontSize: 16 }}>🌦️</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleBot, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
              <View style={styles.thinkingDots}>
                <ActivityIndicator size="small" color={accent} />
                <Text style={[styles.thinkingText, { color: colors.textSecondary }]}>
                  Analyzing live meteorological conditions...
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ─── Suggested question chips ───────────────────── */}
      {messages.length <= 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestions}
        >
          {activeQuestions.map((q, idx) => (
            <Pressable
              key={`${q}-${idx}`}
              onPress={() => ask(q)}
              style={[styles.suggestionChip, { borderColor: `${accent}40`, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }]}
            >
              <Text style={[styles.suggestionText, { color: colors.text }]}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* ─── Voice error banner ──────────────────────────── */}
      {!!voiceError && (
        <View style={styles.voiceError}>
          <Ionicons name="warning-outline" size={14} color="#F87171" />
          <Text style={styles.voiceErrorText}>{voiceError}</Text>
          <Pressable onPress={() => setVoiceError("")}>
            <Ionicons name="close" size={14} color="rgba(255,255,255,0.5)" />
          </Pressable>
        </View>
      )}

      {/* ─── Input Bar (Panel 4 Reference UI) ───────────── */}
      <View style={[styles.inputContainer, { backgroundColor: isDark ? "#0D131D" : "#FFFFFF", borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { color: colors.text }]}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything..."
          placeholderTextColor={colors.textSecondary}
          onSubmitEditing={() => ask()}
          returnKeyType="send"
        />

        {Platform.OS === "web" && (
          <Pressable
            style={[styles.micBtn, isListening && styles.micBtnActive]}
            onPress={handleVoicePress}
          >
            <Ionicons
              name={isListening ? "mic" : "mic-outline"}
              size={20}
              color={isListening ? "#EF4444" : colors.textSecondary}
            />
          </Pressable>
        )}

        <Pressable
          style={[styles.sendBtn, { backgroundColor: input.trim() ? accent : "rgba(255,255,255,0.1)" }]}
          onPress={() => ask()}
          disabled={!input.trim()}
        >
          <Ionicons name="arrow-up" size={18} color="#090D14" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  botIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  onlineStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981",
  },
  onlineText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  langButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  langPicker: {
    position: "absolute",
    top: 65,
    right: 16,
    left: 16,
    maxWidth: 360,
    alignSelf: "flex-end",
    borderRadius: 16,
    padding: 6,
    zIndex: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerSectionHeader: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  pickerSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 1,
  },
  langOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  langOptionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  langOptionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  langQuickBar: {
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  langQuickScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  quickLangPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  quickLangText: {
    fontSize: 12,
    fontWeight: "600",
  },
  compulsoryBadge: {
    fontSize: 10,
    fontWeight: "800",
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  bubbleWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "88%",
  },
  bubbleWrapperUser: {
    alignSelf: "flex-end",
  },
  bubbleWrapperBot: {
    alignSelf: "flex-start",
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    maxWidth: "85%",
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  bubbleTime: {
    fontSize: 10,
  },
  thinkingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  thinkingText: {
    fontSize: 12,
  },
  suggestions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  voiceError: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  voiceErrorText: {
    color: "#F87171",
    fontSize: 12,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
  },
  micBtn: {
    padding: 6,
  },
  micBtnActive: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 16,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
