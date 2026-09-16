import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  SafeAreaView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMausam } from "../src/context/MausamContext";
import { SEVERITY_COLORS, sortAlerts, categorizeAlerts } from "../src/services/alerts";
import { replayAlertSound } from "../src/services/alertSound";
import { speak, isSpeechSynthesisSupported } from "../src/services/voice";
import { BackButton, GlassCard } from "../src/components/UI";

/* =========================================================
   ALERT CARD COMPONENT
========================================================= */

function AlertCard({ alert, colors, isDark, isResolved = false }) {
  const severityColors = SEVERITY_COLORS[alert.severity] ?? SEVERITY_COLORS.moderate;
  const [expanded, setExpanded] = useState(true);

  const handleListen = () => {
    // 1. Play alert audio chime
    replayAlertSound(alert.severity);

    // 2. Speak the alert text if speech synthesis is supported
    if (isSpeechSynthesisSupported()) {
      const speechText = `${alert.title}. ${alert.message}. Recommendation: ${alert.action}`;
      speak(speechText, "en");
    }
  };

  return (
    <View
      style={[
        styles.alertCard,
        {
          backgroundColor: isResolved ? "rgba(255,255,255,0.03)" : severityColors.bg,
          borderColor: isResolved ? "rgba(255,255,255,0.08)" : severityColors.border,
          opacity: isResolved ? 0.75 : 1,
        },
      ]}
    >
      {/* Top Row: Severity + Time + Speaker + Collapse */}
      <View style={styles.alertRow}>
        <View style={styles.alertRowLeft}>
          <View
            style={[
              styles.severityBadge,
              {
                borderColor: isResolved ? "rgba(255,255,255,0.2)" : severityColors.border,
                backgroundColor: isResolved ? "rgba(255,255,255,0.06)" : severityColors.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.severityText,
                { color: isResolved ? "#94A3B8" : severityColors.text },
              ]}
            >
              {isResolved ? "RESOLVED" : alert.severity?.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.alertTime, { color: colors.textSecondary }]}>{alert.time}</Text>
        </View>

        <View style={styles.alertRowRight}>
          {!isResolved && (
            <Pressable
              style={[styles.listenBtn, { borderColor: severityColors.border }]}
              onPress={handleListen}
            >
              <Ionicons name="volume-high-outline" size={15} color={severityColors.text} />
              <Text style={[styles.listenBtnText, { color: severityColors.text }]}>Listen</Text>
            </Pressable>
          )}

          <Pressable onPress={() => setExpanded((v) => !v)} style={styles.collapseBtn}>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>

      {/* Message */}
      <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>{alert.message}</Text>

      {/* Recommended Action */}
      {expanded && alert.action && (
        <View style={[styles.actionBox, { borderColor: isResolved ? "rgba(255,255,255,0.1)" : severityColors.border }]}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={isResolved ? "#94A3B8" : severityColors.text}
          />
          <Text style={[styles.actionText, { color: colors.text }]}>
            {alert.action}
          </Text>
        </View>
      )}
    </View>
  );
}

/* =========================================================
   PREFERENCE ROW COMPONENT
========================================================= */

function PrefRow({ icon, label, description, value, onChange, colors }) {
  return (
    <View style={styles.prefRow}>
      <View style={styles.prefLeft}>
        <Ionicons name={icon} size={20} color={colors.accent} />
        <View style={styles.prefTextContainer}>
          <Text style={[styles.prefLabel, { color: colors.text }]}>{label}</Text>
          {description && (
            <Text style={[styles.prefDesc, { color: colors.textSecondary }]}>{description}</Text>
          )}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "rgba(255,255,255,0.12)", true: `${colors.accent}80` }}
        thumbColor={value ? colors.accent : "rgba(255,255,255,0.4)"}
      />
    </View>
  );
}

/* =========================================================
   ALERTS CENTER SCREEN
========================================================= */

export default function Alerts() {
  const {
    alerts,
    previousAlerts,
    notifPrefs,
    updateNotifPrefs,
    weatherLoading,
    colors,
    isDark,
  } = useMausam();

  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'upcoming' | 'resolved'

  const { active, upcoming, resolved } = categorizeAlerts(alerts || [], previousAlerts || []);

  const getActiveTabCount = (tab) => {
    if (tab === "active") return active.length;
    if (tab === "upcoming") return upcoming.length;
    return resolved.length;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#090D14" : "#F6F4EE" }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top Navigation */}
        <BackButton label="Back to Home" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.accent }]}>ALERT CENTER</Text>
          <Text style={[styles.title, { color: colors.text }]}>Weather Intelligence & Alerts</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Real-time hazard notifications, severe storm warnings, and proactive precautions.
          </Text>
        </View>

        {/* Segmented Filter Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
          {[
            { id: "active", label: "Active" },
            { id: "upcoming", label: "Upcoming" },
            { id: "resolved", label: "Resolved" },
          ].map((tab) => {
            const isCurrent = activeTab === tab.id;
            const count = getActiveTabCount(tab.id);
            return (
              <Pressable
                key={tab.id}
                style={[
                  styles.tabButton,
                  isCurrent && {
                    backgroundColor: isDark ? "#1E2638" : "#FFFFFF",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                  },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    { color: isCurrent ? colors.text : colors.textSecondary, fontWeight: isCurrent ? "700" : "500" },
                  ]}
                >
                  {tab.label} ({count})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Alerts List */}
        <View style={styles.listSection}>
          {activeTab === "active" && (
            <>
              {active.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Ionicons name="checkmark-circle-outline" size={44} color="#4ADE80" />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Active Severe Alerts</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    All current meteorological parameters are within normal thresholds.
                  </Text>
                </GlassCard>
              ) : (
                active.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} colors={colors} isDark={isDark} />
                ))
              )}
            </>
          )}

          {activeTab === "upcoming" && (
            <>
              {upcoming.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Ionicons name="sunny-outline" size={44} color={colors.accent} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Upcoming Hazards</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    No sudden weather changes or storms forecast in the next 48 hours.
                  </Text>
                </GlassCard>
              ) : (
                upcoming.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} colors={colors} isDark={isDark} />
                ))
              )}
            </>
          )}

          {activeTab === "resolved" && (
            <>
              {resolved.length === 0 ? (
                <GlassCard style={styles.emptyCard}>
                  <Ionicons name="time-outline" size={44} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Resolved Alerts</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    Past weather advisories will appear here once conditions clear.
                  </Text>
                </GlassCard>
              ) : (
                resolved.map((alert, idx) => (
                  <AlertCard key={alert.id || idx} alert={alert} colors={colors} isDark={isDark} isResolved />
                ))
              )}
            </>
          )}
        </View>

        {/* Notification Preferences */}
        <Text style={[styles.prefHeading, { color: colors.text }]}>Alert Notification Channels</Text>
        <GlassCard style={styles.prefsCard}>
          <PrefRow
            icon="volume-high-outline"
            label="Audio Alert Chimes"
            description="Play distinct tones for urgent thunderstorm and severe warnings"
            value={notifPrefs?.sound ?? true}
            onChange={(v) => updateNotifPrefs({ sound: v })}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]} />

          <PrefRow
            icon="thunderstorm-outline"
            label="Thunderstorms & Severe Weather"
            description="Critical alerts for sudden lightning, heavy storms & hail"
            value={notifPrefs?.severe ?? true}
            onChange={(v) => updateNotifPrefs({ severe: v })}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]} />

          <PrefRow
            icon="rainy-outline"
            label="Rain & Precipitation"
            description="Upcoming rainfall warnings and umbrella reminders"
            value={notifPrefs?.rain ?? true}
            onChange={(v) => updateNotifPrefs({ rain: v })}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]} />

          <PrefRow
            icon="leaf-outline"
            label="Air Quality (AQI) Alerts"
            description="Notifications when AQI reaches unhealthy or hazardous levels"
            value={notifPrefs?.aqi ?? true}
            onChange={(v) => updateNotifPrefs({ aqi: v })}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]} />

          <PrefRow
            icon="sunny-outline"
            label="UV Radiation Alerts"
            description="Warnings during extreme ultraviolet midday index"
            value={notifPrefs?.uv ?? true}
            onChange={(v) => updateNotifPrefs({ uv: v })}
            colors={colors}
          />
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 16,
    paddingBottom: 40,
  },
  header: {
    marginTop: 12,
    marginBottom: 20,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  tabsContainer: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabButtonText: {
    fontSize: 13,
  },
  listSection: {
    marginBottom: 24,
    gap: 12,
  },
  alertCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  alertRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  alertRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  alertTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  listenBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  listenBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  collapseBtn: {
    padding: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  actionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  actionText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  prefHeading: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  prefsCard: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  prefLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  prefTextContainer: {
    flex: 1,
  },
  prefLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  prefDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  divider: {
    height: 1,
    width: "100%",
  },
});
