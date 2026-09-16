import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMausam } from "../../src/context/MausamContext";

const ICONS = {
  index: ["home-outline", "home"],
  requirements: ["bag-handle-outline", "bag-handle"],
  ai: ["sparkles-outline", "sparkles"],
  profile: ["person-outline", "person"],
};

export default function Layout() {
  const { colors, isDark } = useMausam();
  const accent = colors.accent || "#D99A3D";

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: isDark ? "#0A0E17" : "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
        },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: isDark ? "#717C91" : "#8E99A8",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.3,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const pair = ICONS[route.name] || ["cloud-outline", "cloud"];
          return (
            <Ionicons
              name={focused ? pair[1] : pair[0]}
              size={21}
              color={color}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="requirements" options={{ title: "Requirements" }} />
      <Tabs.Screen name="ai" options={{ title: "Mausam AI" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />

      {/* Kept as secondary accessible routes without occupying bottom bar slots */}
      <Tabs.Screen name="earth" options={{ href: null, title: "Air & Environment" }} />
      <Tabs.Screen name="planner" options={{ href: null, title: "Planner" }} />
    </Tabs>
  );
}
