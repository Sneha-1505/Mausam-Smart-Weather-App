import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMausam } from "../context/MausamContext";

export function BackButton({ onPress, label = "Back", style }) {
  const { colors } = useMausam();
  const handlePress = onPress || (() => router.back());

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.backButton,
        {
          backgroundColor: colors.surfaceSoft || "rgba(255,255,255,0.08)",
          borderColor: colors.border,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <Ionicons name="arrow-back" size={18} color={colors.text} />
      <Text style={[styles.backButtonText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function GlassCard({ children, style, accentBorder = false, accentColor }) {
  const { isDark, colors } = useMausam();
  return (
    <View
      style={[
        styles.glassCard,
        {
          backgroundColor: isDark ? "rgba(18, 25, 38, 0.68)" : "rgba(255, 255, 255, 0.78)",
          borderColor: accentBorder && accentColor
            ? `${accentColor}50`
            : isDark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.08)",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Card({ children, style }) {
  const { colors } = useMausam();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function AlertBanner({
  title,
  message,
  severity = "high",
  time,
  action,
  onPress,
}) {
  const bgMap = {
    critical: "rgba(239, 68, 68, 0.16)",
    high: "rgba(249, 115, 22, 0.16)",
    moderate: "rgba(234, 179, 8, 0.16)",
    low: "rgba(34, 197, 94, 0.14)",
  };

  const borderMap = {
    critical: "rgba(239, 68, 68, 0.50)",
    high: "rgba(249, 115, 22, 0.50)",
    moderate: "rgba(234, 179, 8, 0.50)",
    low: "rgba(34, 197, 94, 0.40)",
  };

  const textMap = {
    critical: "#F87171",
    high: "#FB923C",
    moderate: "#FACC15",
    low: "#4ADE80",
  };

  const iconMap = {
    critical: "warning",
    high: "alert-circle",
    moderate: "information-circle",
    low: "checkmark-circle",
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.alertBanner,
        {
          backgroundColor: bgMap[severity] || bgMap.moderate,
          borderColor: borderMap[severity] || borderMap.moderate,
        },
      ]}
    >
      <View style={styles.alertTopRow}>
        <View style={styles.alertIconTitle}>
          <Ionicons
            name={iconMap[severity] || "alert-circle"}
            size={19}
            color={textMap[severity] || "#FB923C"}
          />
          <Text style={[styles.alertTitle, { color: textMap[severity] || "#FB923C" }]}>
            {title}
          </Text>
        </View>
        {time && <Text style={styles.alertTime}>{time}</Text>}
      </View>

      {message && <Text style={styles.alertMessage}>{message}</Text>}

      {action && (
        <View style={styles.alertActionRow}>
          <Ionicons name="shield-checkmark-outline" size={13} color={textMap[severity]} />
          <Text style={[styles.alertActionText, { color: textMap[severity] }]}>{action}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Section({
  title,
  kicker,
  action,
  onAction,
}) {
  const { colors } = useMausam();

  return (
    <View style={styles.section}>
      <View>
        {kicker && (
          <Text style={[styles.kicker, { color: colors.accent }]}>
            {kicker}
          </Text>
        )}

        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      </View>

      {action && (
        <Pressable onPress={onAction}>
          <Text style={[styles.action, { color: colors.accent }]}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function Metric({
  icon,
  label,
  value,
  sub,
}) {
  const { colors } = useMausam();

  return (
    <View
      style={[
        styles.metric,
        {
          backgroundColor: colors.surfaceSoft,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.metricIcon, { color: colors.accent }]}>
        {icon}
      </Text>

      <Text
        style={[
          styles.metricLabel,
          { color: colors.textMuted },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.metricValue,
          { color: colors.text },
        ]}
      >
        {value}
      </Text>

      {sub && (
        <Text
          style={[
            styles.metricSub,
            { color: colors.textMuted },
          ]}
        >
          {sub}
        </Text>
      )}
    </View>
  );
}

export function Button({
  children,
  onPress,
  secondary = false,
  icon,
}) {
  const { colors } = useMausam();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary
            ? "transparent"
            : colors.accent,
          borderColor: secondary
            ? colors.border
            : colors.accent,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: secondary
              ? colors.text
              : "#171717",
          },
        ]}
      >
        {children}
      </Text>

      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={
            secondary
              ? colors.text
              : "#171717"
          }
        />
      )}
    </Pressable>
  );
}

export function Chip({
  children,
  active,
  onPress,
}) {
  const { colors } = useMausam();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active
            ? colors.accentSoft
            : colors.surfaceSoft,
          borderColor: active
            ? colors.accent
            : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: active
              ? colors.accent
              : colors.textSecondary,
            fontWeight: active ? "700" : "500",
          },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function Header({
  title = "MAUSAM",
  right,
}) {
  const { colors } = useMausam();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text
        style={[
          styles.brand,
          { color: colors.text },
        ]}
      >
        {title}
      </Text>

      {right}
    </View>
  );
}

export function Photo({
  uri,
  children,
  style,
}) {
  return (
    <View
      style={[
        styles.photo,
        style,
      ]}
    >
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  glassCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    backdropFilter: "blur(20px)",
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
  },
  alertBanner: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 16,
    gap: 7,
  },
  alertTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alertIconTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  alertTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  alertMessage: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
  },
  alertActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  alertActionText: {
    fontSize: 11,
    fontWeight: "700",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },

  kicker: {
    fontSize: 9,
    letterSpacing: 1.7,
    textTransform: "uppercase",
    fontWeight: "700",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 3,
  },

  action: {
    fontSize: 12,
    fontWeight: "600",
  },

  metric: {
    width: "24%",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
  },

  metricIcon: {
    fontSize: 15,
    marginBottom: 6,
  },

  metricLabel: {
    fontSize: 9,
  },

  metricValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 3,
  },

  metricSub: {
    fontSize: 8,
    marginTop: 2,
  },

  button: {
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: "800",
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },

  chipText: {
    fontSize: 11,
  },

  header: {
    height: 58,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    fontSize: 13,
    letterSpacing: 3.2,
    fontWeight: "800",
  },

  photo: {
    overflow: "hidden",
  },
});

export {
  SkeletonBox,
  HomeLoadingSkeleton,
  EarthLoadingSkeleton,
  ChatLoadingSkeleton,
} from "./LoadingSkeleton";