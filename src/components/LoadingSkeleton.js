import React, { createContext, useContext, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { MausamContext } from "../context/MausamContext";

/* =========================================================
   SKELETON CONTEXT (Synchronizes animations & theme)
========================================================= */
const SkeletonContext = createContext(null);

/* =========================================================
   PULSE ANIMATION HOOK
   Pulses opacity between 0.3 and 0.7 using React Native's
   built-in Animated API.
========================================================= */
export function useSkeletonPulse(duration = 900) {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.7,
          duration,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse, duration]);

  return pulse;
}

/* =========================================================
   1. SKELETON BOX
   Props: width, height, borderRadius (default 8), style,
   isDark (optional override), animatedValue (optional).
========================================================= */
export function SkeletonBox({
  width,
  height,
  borderRadius = 8,
  style,
  isDark: isDarkProp,
  animatedValue,
  ...rest
}) {
  const mausam = useContext(MausamContext);
  const skeletonCtx = useContext(SkeletonContext);

  const localPulse = useRef(new Animated.Value(0.3)).current;
  const hasExternalPulse = !!(animatedValue || skeletonCtx?.pulse);

  useEffect(() => {
    if (hasExternalPulse) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(localPulse, {
          toValue: 0.7,
          duration: 900,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(localPulse, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [hasExternalPulse, localPulse]);

  const activePulse = animatedValue || skeletonCtx?.pulse || localPulse;
  const isDark =
    isDarkProp !== undefined
      ? isDarkProp
      : skeletonCtx?.isDark !== undefined
      ? skeletonCtx.isDark
      : (mausam?.isDark ?? true);

  const backgroundColor = isDark
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(0, 0, 0, 0.06)";

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          opacity: activePulse,
        },
        style,
      ]}
      {...rest}
    />
  );
}

/* =========================================================
   INTERNAL SKELETON CARD (Matching GlassCard styling)
========================================================= */
function SkeletonCard({ children, style, isDark }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? "rgba(18, 25, 38, 0.68)"
            : "rgba(255, 255, 255, 0.78)",
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.10)"
            : "rgba(0, 0, 0, 0.08)",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* =========================================================
   2. HOME LOADING SKELETON
   Matches Home Screen layout:
   - Top section (380px) with temp, condition, location
   - Summary card skeleton
   - Row of 4 small need-item skeletons
   - 2x2 grid of highlight card skeletons
   - Horizontal row of 6 hourly forecast skeletons
========================================================= */
export function HomeLoadingSkeleton({
  isDark: isDarkProp,
  scrollable = true,
  style,
  ...rest
}) {
  const mausam = useContext(MausamContext);
  const isDark = isDarkProp !== undefined ? isDarkProp : (mausam?.isDark ?? true);
  const pulse = useSkeletonPulse();

  const ContainerComponent = scrollable ? ScrollView : View;
  const containerProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: styles.homeScrollContent,
      }
    : {};

  return (
    <SkeletonContext.Provider value={{ pulse, isDark }}>
      <ContainerComponent
        style={[
          styles.container,
          { backgroundColor: isDark ? "#090D14" : "#F6F4EE" },
          style,
        ]}
        {...containerProps}
        {...rest}
      >
        {/* 1. TOP SECTION (380px) */}
        <View
          style={[
            styles.topSection,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(0, 0, 0, 0.02)",
              borderBottomColor: isDark
                ? "rgba(255, 255, 255, 0.06)"
                : "rgba(0, 0, 0, 0.05)",
            },
          ]}
        >
          {/* Status Row: Persona Badge + Location + Bell Icon */}
          <View style={styles.topNavRow}>
            <View style={styles.row}>
              <SkeletonBox width={72} height={24} borderRadius={12} />
              <SkeletonBox
                width={120}
                height={18}
                borderRadius={6}
                style={{ marginLeft: 10 }}
              />
            </View>
            <SkeletonBox width={36} height={36} borderRadius={18} />
          </View>

          {/* Greeting Block */}
          <View style={styles.greetingBlock}>
            <SkeletonBox width={180} height={26} borderRadius={6} />
            <SkeletonBox
              width={240}
              height={14}
              borderRadius={4}
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Hero Weather Numbers */}
          <View style={styles.heroWeatherBlock}>
            <View style={styles.heroTempRow}>
              <SkeletonBox width={120} height={68} borderRadius={14} />
              <SkeletonBox
                width={48}
                height={48}
                borderRadius={24}
                style={{ marginLeft: 16 }}
              />
            </View>
            <SkeletonBox
              width={140}
              height={22}
              borderRadius={6}
              style={{ marginTop: 12 }}
            />
            <SkeletonBox
              width={210}
              height={14}
              borderRadius={4}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>

        {/* 2. LOWER CONTENT */}
        <View style={styles.lowerContainer}>
          {/* Summary Card Skeleton */}
          <SkeletonCard isDark={isDark} style={styles.summaryCard}>
            <View style={styles.summaryHeaderRow}>
              <SkeletonBox width={18} height={18} borderRadius={4} />
              <SkeletonBox
                width={110}
                height={16}
                borderRadius={4}
                style={{ marginLeft: 8 }}
              />
            </View>
            <SkeletonBox
              width="100%"
              height={14}
              borderRadius={4}
              style={{ marginTop: 12 }}
            />
            <SkeletonBox
              width="78%"
              height={14}
              borderRadius={4}
              style={{ marginTop: 8 }}
            />
          </SkeletonCard>

          {/* Section: What You Need Today */}
          <View style={styles.sectionHeaderRow}>
            <SkeletonBox width={160} height={18} borderRadius={4} />
            <SkeletonBox width={55} height={14} borderRadius={4} />
          </View>

          {/* Row of 4 small need-item skeletons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.needScroll}
          >
            {[0, 1, 2, 3].map((index) => (
              <SkeletonCard
                key={`need-${index}`}
                isDark={isDark}
                style={styles.needMiniCard}
              >
                <SkeletonBox width={38} height={38} borderRadius={19} />
                <SkeletonBox
                  width={50}
                  height={10}
                  borderRadius={4}
                  style={{ marginTop: 8 }}
                />
              </SkeletonCard>
            ))}
          </ScrollView>

          {/* Section: Today's Highlights */}
          <View style={styles.sectionHeaderRow}>
            <SkeletonBox width={140} height={18} borderRadius={4} />
          </View>

          {/* 2x2 grid of highlight card skeletons */}
          <View style={styles.highlightsGrid}>
            {[0, 1, 2, 3].map((index) => (
              <SkeletonCard
                key={`highlight-${index}`}
                isDark={isDark}
                style={styles.highlightCard}
              >
                <View style={styles.row}>
                  <SkeletonBox width={18} height={18} borderRadius={4} />
                  <SkeletonBox
                    width={70}
                    height={12}
                    borderRadius={4}
                    style={{ marginLeft: 6 }}
                  />
                </View>
                <SkeletonBox
                  width={85}
                  height={18}
                  borderRadius={4}
                  style={{ marginTop: 12 }}
                />
              </SkeletonCard>
            ))}
          </View>

          {/* Section: Hourly Forecast */}
          <View style={styles.sectionHeaderRow}>
            <SkeletonBox width={130} height={18} borderRadius={4} />
          </View>

          {/* Horizontal row of 6 hourly forecast skeletons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourlyScroll}
          >
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <SkeletonCard
                key={`hourly-${index}`}
                isDark={isDark}
                style={styles.hourlyCard}
              >
                <SkeletonBox width={36} height={12} borderRadius={4} />
                <SkeletonBox
                  width={26}
                  height={26}
                  borderRadius={13}
                  style={{ marginVertical: 8 }}
                />
                <SkeletonBox width={32} height={14} borderRadius={4} />
              </SkeletonCard>
            ))}
          </ScrollView>
        </View>
      </ContainerComponent>
    </SkeletonContext.Provider>
  );
}

/* =========================================================
   3. EARTH LOADING SKELETON
   Matches Air & Environment Screen layout:
   - AQI hero card skeleton
   - 4 pollutant card skeletons (2x2 grid)
   - Environmental diagnostics cards
========================================================= */
export function EarthLoadingSkeleton({
  isDark: isDarkProp,
  scrollable = true,
  style,
  ...rest
}) {
  const mausam = useContext(MausamContext);
  const isDark = isDarkProp !== undefined ? isDarkProp : (mausam?.isDark ?? true);
  const pulse = useSkeletonPulse();

  const ContainerComponent = scrollable ? ScrollView : View;
  const containerProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: styles.earthScrollContent,
      }
    : {};

  return (
    <SkeletonContext.Provider value={{ pulse, isDark }}>
      <ContainerComponent
        style={[
          styles.container,
          { backgroundColor: isDark ? "#090D14" : "#F6F4EE" },
          style,
        ]}
        {...containerProps}
        {...rest}
      >
        {/* Header */}
        <View style={styles.earthHeader}>
          <SkeletonBox width={140} height={12} borderRadius={4} />
          <SkeletonBox
            width={180}
            height={26}
            borderRadius={6}
            style={{ marginTop: 6 }}
          />
          <SkeletonBox
            width="92%"
            height={14}
            borderRadius={4}
            style={{ marginTop: 8 }}
          />
          <SkeletonBox
            width="68%"
            height={14}
            borderRadius={4}
            style={{ marginTop: 6 }}
          />
        </View>

        {/* AQI Hero Card Skeleton */}
        <SkeletonCard isDark={isDark} style={styles.heroAqiCard}>
          <View style={styles.aqiTopRow}>
            <View>
              <SkeletonBox width={160} height={12} borderRadius={4} />
              <View style={styles.aqiScoreRow}>
                <SkeletonBox width={65} height={42} borderRadius={8} />
                <SkeletonBox
                  width={80}
                  height={24}
                  borderRadius={12}
                  style={{ marginLeft: 12 }}
                />
              </View>
            </View>
            <SkeletonBox width={50} height={50} borderRadius={25} />
          </View>

          {/* Advice Lines */}
          <SkeletonBox
            width="100%"
            height={14}
            borderRadius={4}
            style={{ marginTop: 16 }}
          />
          <SkeletonBox
            width="75%"
            height={14}
            borderRadius={4}
            style={{ marginTop: 6 }}
          />

          {/* Activity Guidance Box */}
          <SkeletonBox
            width="100%"
            height={38}
            borderRadius={10}
            style={{ marginTop: 14 }}
          />
        </SkeletonCard>

        {/* Particulate & Pollutant Levels Header */}
        <View style={styles.sectionHeaderRow}>
          <SkeletonBox width={200} height={18} borderRadius={4} />
        </View>

        {/* 4 Pollutant Card Skeletons (2x2 grid) */}
        <View style={styles.twoColumnGrid}>
          {[0, 1, 2, 3].map((index) => (
            <SkeletonCard
              key={`pollutant-${index}`}
              isDark={isDark}
              style={styles.gridCard}
            >
              <SkeletonBox width="80%" height={12} borderRadius={4} />
              <SkeletonBox
                width={60}
                height={20}
                borderRadius={6}
                style={{ marginTop: 8 }}
              />
              <SkeletonBox
                width={45}
                height={14}
                borderRadius={4}
                style={{ marginTop: 6 }}
              />
            </SkeletonCard>
          ))}
        </View>

        {/* Environmental Diagnostics Header */}
        <View style={styles.sectionHeaderRow}>
          <SkeletonBox width={190} height={18} borderRadius={4} />
        </View>

        {/* Environmental Diagnostics Cards (2x2 grid) */}
        <View style={styles.twoColumnGrid}>
          {[0, 1, 2, 3].map((index) => (
            <SkeletonCard
              key={`diag-${index}`}
              isDark={isDark}
              style={styles.gridCard}
            >
              <View style={styles.row}>
                <SkeletonBox width={20} height={20} borderRadius={4} />
                <SkeletonBox
                  width={60}
                  height={14}
                  borderRadius={4}
                  style={{ marginLeft: 6 }}
                />
              </View>
              <SkeletonBox
                width={50}
                height={22}
                borderRadius={6}
                style={{ marginTop: 8 }}
              />
              <SkeletonBox
                width={80}
                height={12}
                borderRadius={4}
                style={{ marginTop: 6 }}
              />
            </SkeletonCard>
          ))}
        </View>

        {/* Outdoor Health Safety Card */}
        <SkeletonCard isDark={isDark} style={styles.safetyCard}>
          <View style={styles.row}>
            <SkeletonBox width={20} height={20} borderRadius={4} />
            <SkeletonBox
              width={150}
              height={16}
              borderRadius={4}
              style={{ marginLeft: 8 }}
            />
          </View>
          <SkeletonBox
            width="95%"
            height={12}
            borderRadius={4}
            style={{ marginTop: 12 }}
          />
          <SkeletonBox
            width="85%"
            height={12}
            borderRadius={4}
            style={{ marginTop: 6 }}
          />
          <SkeletonBox
            width="75%"
            height={12}
            borderRadius={4}
            style={{ marginTop: 6 }}
          />
        </SkeletonCard>
      </ContainerComponent>
    </SkeletonContext.Provider>
  );
}

/* =========================================================
   4. CHAT LOADING SKELETON
   Simple 3 message bubble skeletons for AI chat:
   - Bot message (left)
   - User message (right)
   - Bot message (left)
========================================================= */
export function ChatLoadingSkeleton({
  isDark: isDarkProp,
  style,
  ...rest
}) {
  const mausam = useContext(MausamContext);
  const isDark = isDarkProp !== undefined ? isDarkProp : (mausam?.isDark ?? true);
  const pulse = useSkeletonPulse();

  return (
    <SkeletonContext.Provider value={{ pulse, isDark }}>
      <View style={[styles.chatContainer, style]} {...rest}>
        {/* Message 1: Bot (Left) */}
        <View style={styles.chatRowBot}>
          <SkeletonBox width={32} height={32} borderRadius={16} />
          <View
            style={[
              styles.chatBubbleBot,
              {
                backgroundColor: isDark
                  ? "rgba(18, 25, 38, 0.68)"
                  : "rgba(255, 255, 255, 0.78)",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.10)"
                  : "rgba(0, 0, 0, 0.08)",
              },
            ]}
          >
            <SkeletonBox width={190} height={14} borderRadius={4} />
            <SkeletonBox
              width={140}
              height={14}
              borderRadius={4}
              style={{ marginTop: 8 }}
            />
            <SkeletonBox
              width={40}
              height={10}
              borderRadius={3}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>

        {/* Message 2: User (Right) */}
        <View style={styles.chatRowUser}>
          <View
            style={[
              styles.chatBubbleUser,
              {
                backgroundColor: isDark
                  ? "rgba(30, 58, 138, 0.35)"
                  : "rgba(30, 58, 138, 0.15)",
                borderColor: isDark
                  ? "rgba(59, 130, 246, 0.25)"
                  : "rgba(59, 130, 246, 0.20)",
              },
            ]}
          >
            <SkeletonBox width={160} height={14} borderRadius={4} />
            <SkeletonBox
              width={40}
              height={10}
              borderRadius={3}
              style={{ marginTop: 10, alignSelf: "flex-end" }}
            />
          </View>
          <SkeletonBox width={32} height={32} borderRadius={16} />
        </View>

        {/* Message 3: Bot (Left) */}
        <View style={styles.chatRowBot}>
          <SkeletonBox width={32} height={32} borderRadius={16} />
          <View
            style={[
              styles.chatBubbleBot,
              {
                backgroundColor: isDark
                  ? "rgba(18, 25, 38, 0.68)"
                  : "rgba(255, 255, 255, 0.78)",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.10)"
                  : "rgba(0, 0, 0, 0.08)",
              },
            ]}
          >
            <SkeletonBox width={220} height={14} borderRadius={4} />
            <SkeletonBox
              width={170}
              height={14}
              borderRadius={4}
              style={{ marginTop: 8 }}
            />
            <SkeletonBox
              width={100}
              height={14}
              borderRadius={4}
              style={{ marginTop: 8 }}
            />
            <SkeletonBox
              width={40}
              height={10}
              borderRadius={3}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </View>
    </SkeletonContext.Provider>
  );
}

/* =========================================================
   STYLES
========================================================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homeScrollContent: {
    paddingBottom: 36,
  },
  earthScrollContent: {
    paddingBottom: 36,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },

  /* Top Section (380px) */
  topSection: {
    height: 380,
    paddingTop: Platform.OS === "ios" ? 54 : 44,
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  topNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greetingBlock: {
    marginTop: 10,
  },
  heroWeatherBlock: {
    marginBottom: 8,
  },
  heroTempRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* Lower Container */
  lowerContainer: {
    paddingTop: 16,
  },
  summaryCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
  },
  summaryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },

  /* Need items */
  needScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  needMiniCard: {
    width: 76,
    height: 86,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  /* Highlights 2x2 */
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  highlightCard: {
    width: "48%",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },

  /* Hourly forecast */
  hourlyScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  hourlyCard: {
    width: 68,
    height: 102,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 10,
  },

  /* Earth Screen styles */
  earthHeader: {
    paddingTop: Platform.OS === "ios" ? 54 : 44,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  heroAqiCard: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 18,
    marginBottom: 8,
  },
  aqiTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  aqiScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  gridCard: {
    width: "48%",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  safetyCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },

  /* Chat Screen styles */
  chatContainer: {
    padding: 16,
    gap: 16,
  },
  chatRowBot: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  chatRowUser: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  chatBubbleBot: {
    maxWidth: "75%",
    padding: 14,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginLeft: 10,
    borderWidth: 1,
  },
  chatBubbleUser: {
    maxWidth: "75%",
    padding: 14,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    marginRight: 10,
    borderWidth: 1,
  },
});

/* Default export object containing all components */
export default {
  SkeletonBox,
  HomeLoadingSkeleton,
  EarthLoadingSkeleton,
  ChatLoadingSkeleton,
  useSkeletonPulse,
};
