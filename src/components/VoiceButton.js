/**
 * VoiceButton.js
 * Premium Voice Assistant Control with 4 Distinct Operational States:
 * 1. 🎙 Tap to speak (Idle)
 * 2. 🔴 Listening... (Active capture with pulse waves)
 * 3. 💬 Processing... (Speech transcribed, AI thinking)
 * 4. 🔊 Speaking... (Vocalizing weather response with tap-to-stop)
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function VoiceButton({
  isListening = false,
  isProcessing = false,
  isSpeaking = false,
  onPress,
  onStopSpeaking,
  accent = "#D99A3D",
  disabled = false,
  language = "en",
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const speakPulse = useRef(new Animated.Value(1)).current;

  // Pulse animation for Listening state
  useEffect(() => {
    if (isListening) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.35,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 650,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulse.setValue(1);
    }
  }, [isListening, pulse]);

  // Speaking waveform pulse
  useEffect(() => {
    if (isSpeaking) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(speakPulse, {
            toValue: 1.2,
            duration: 380,
            useNativeDriver: true,
          }),
          Animated.timing(speakPulse, {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      speakPulse.setValue(1);
    }
  }, [isSpeaking, speakPulse]);

  // Multilingual labels for each state
  const labels = {
    en: {
      tap: "Tap to speak",
      listening: "Listening...",
      processing: "Processing...",
      speaking: "Speaking...",
      stop: "Tap to stop",
    },
    hi: {
      tap: "बोलने के लिए टैप करें",
      listening: "सुन रहे हैं...",
      processing: "सोच रहे हैं...",
      speaking: "बोल रहे हैं...",
      stop: "रोकने के लिए टैप करें",
    },
    pa: {
      tap: "ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ",
      listening: "ਸੁਣ ਰਿਹਾ ਹਾਂ...",
      processing: "ਸੋਚ ਰਿਹਾ ਹਾਂ...",
      speaking: "ਬੋਲ ਰਿਹਾ ਹਾਂ...",
      stop: "ਰੋਕਣ ਲਈ ਟੈਪ ਕਰੋ",
    },
  };

  const l = labels[language] || labels.en;

  if (Platform.OS !== "web") {
    return null;
  }

  // Determine current active status
  let stateIcon = "mic-outline";
  let stateLabel = l.tap;
  let statusColor = "#FFFFFF";

  if (isSpeaking) {
    stateIcon = "volume-high";
    stateLabel = `🔊 ${l.speaking}`;
    statusColor = accent;
  } else if (isProcessing) {
    stateIcon = "hourglass-outline";
    stateLabel = `💬 ${l.processing}`;
    statusColor = "#38BDF8";
  } else if (isListening) {
    stateIcon = "mic";
    stateLabel = `🔴 ${l.listening}`;
    statusColor = "#F87171";
  }

  return (
    <View style={styles.container}>
      {/* Speaking Active Banner (tap-to-stop) */}
      {isSpeaking && (
        <Pressable
          onPress={onStopSpeaking}
          hitSlop={8}
          style={[styles.stopBanner, { borderColor: `${accent}50` }]}
        >
          <Animated.View
            style={[
              styles.speakingDot,
              { backgroundColor: accent, transform: [{ scale: speakPulse }] },
            ]}
          />
          <Text style={[styles.stopBannerText, { color: accent }]}>
            {l.speaking} ({l.stop})
          </Text>
          <Ionicons name="close-circle" size={16} color={accent} />
        </Pressable>
      )}

      {/* Main Interactive Mic Button */}
      <View style={styles.buttonWrapper}>
        <Pressable
          onPress={isSpeaking ? onStopSpeaking : onPress}
          disabled={disabled || isProcessing}
          style={({ pressed }) => [
            styles.micButton,
            {
              backgroundColor: isListening
                ? "rgba(239, 68, 68, 0.20)"
                : isProcessing
                ? "rgba(56, 189, 248, 0.15)"
                : isSpeaking
                ? `${accent}25`
                : "rgba(255, 255, 255, 0.08)",
              borderColor: isListening
                ? "#F87171"
                : isProcessing
                ? "#38BDF8"
                : isSpeaking
                ? accent
                : "rgba(255, 255, 255, 0.18)",
              opacity: pressed ? 0.75 : disabled ? 0.4 : 1,
            },
          ]}
        >
          {/* Animated pulse ring for listening */}
          {isListening && (
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  borderColor: "rgba(239, 68, 68, 0.5)",
                  transform: [{ scale: pulse }],
                },
              ]}
            />
          )}

          <Ionicons name={stateIcon} size={21} color={statusColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pulseRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  stopBanner: {
    position: "absolute",
    bottom: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(11, 16, 24, 0.95)",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  speakingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  stopBannerText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
