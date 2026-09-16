import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMausam } from "../../src/context/MausamContext";
import { AVATARS, getAvatarById, AvatarFigure } from "../../src/data/avatars";
import { PERSONAS } from "../../src/data/mock";
import { GlassCard } from "../../src/components/UI";

export default function Profile() {
  const router = useRouter();
  const {
    profile,
    updateProfile,
    resetProfile,
    colors,
    isDark,
  } = useMausam();

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);

  const accent = colors.accent || "#D99A3D";
  const currentAvatarId = profile?.avatar || "farmer";
  const currentAvatar = getAvatarById(currentAvatarId);

  // Avatar carousel index
  const currentIndex = AVATARS.findIndex((a) => a.id === currentAvatarId);

  const handlePrevAvatar = () => {
    const nextIdx = (currentIndex - 1 + AVATARS.length) % AVATARS.length;
    updateProfile({ avatar: AVATARS[nextIdx].id });
  };

  const handleNextAvatar = () => {
    const nextIdx = (currentIndex + 1) % AVATARS.length;
    updateProfile({ avatar: AVATARS[nextIdx].id });
  };

  const currentPersonaObj = PERSONAS.find(
    (p) => p.id === (profile?.persona || "traveler")
  );

  const handleBackToWelcome = () => {
    if (Platform.OS === "web") {
      const confirmReset = window.confirm(
        "Do you want to return to the Welcome Page and start onboarding fresh?"
      );
      if (confirmReset) {
        updateProfile({ onboardingCompleted: false });
        router.replace("/welcome");
      }
    } else {
      Alert.alert(
        "Return to Welcome",
        "Would you like to start onboarding fresh?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start Fresh",
            style: "destructive",
            onPress: () => {
              updateProfile({ onboardingCompleted: false });
              router.replace("/welcome");
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? "#090D14" : "#F6F4EE" }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>

      {/* INTERACTIVE AVATAR SECTION */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCarousel}>
          <Pressable
            style={[styles.arrowBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}
            onPress={handlePrevAvatar}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>

          <AvatarFigure id={currentAvatar.id} size={108} borderColor={accent} />

          <Pressable
            style={[styles.arrowBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}
            onPress={handleNextAvatar}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Text style={[styles.userName, { color: colors.text }]}>
          {profile?.name || "Sneha"}
        </Text>
        <Text style={[styles.userBio, { color: colors.textSecondary }]}>
          {currentAvatar.name} • {currentPersonaObj?.title || "Explorer"}
        </Text>

        <Pressable
          style={[styles.changeAvatarBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", borderColor: accent }]}
          onPress={() => setShowAvatarPicker(true)}
        >
          <Text style={[styles.changeAvatarText, { color: colors.text }]}>Change Avatar</Text>
        </Pressable>
      </View>

      {/* MENU NAVIGATION LIST */}
      <GlassCard style={styles.menuCard}>
        {/* Personal Information */}
        <Pressable
          style={styles.menuRow}
          onPress={() => router.push("/personalization")}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="person-outline" size={18} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>Personal Information</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>

        <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]} />

        {/* My Persona */}
        <Pressable
          style={styles.menuRow}
          onPress={() => setShowPersonaPicker(true)}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="briefcase-outline" size={18} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>My Persona</Text>
          </View>
          <View style={styles.menuRight}>
            <Text style={[styles.menuValue, { color: accent }]}>
              {currentPersonaObj?.title || "Farmer"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]} />

        {/* My Preferences */}
        <Pressable
          style={styles.menuRow}
          onPress={() => router.push("/preferences")}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="settings-outline" size={18} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>My Preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>

        <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]} />

        {/* Notification Settings */}
        <Pressable
          style={styles.menuRow}
          onPress={() => router.push("/alerts")}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="notifications-outline" size={18} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>Notification Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>

        <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]} />

        {/* Language */}
        <Pressable
          style={styles.menuRow}
          onPress={() => router.push("/preferences")}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="globe-outline" size={18} color={colors.text} />
            <Text style={[styles.menuLabel, { color: colors.text }]}>Language</Text>
          </View>
          <View style={styles.menuRight}>
            <Text style={[styles.menuValue, { color: accent }]}>Auto-detect</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </View>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }]} />

        {/* Back to Welcome Page */}
        <Pressable
          style={styles.menuRow}
          onPress={handleBackToWelcome}
        >
          <View style={styles.menuLeft}>
            <Ionicons name="log-out-outline" size={18} color="#F87171" />
            <Text style={[styles.menuLabel, { color: "#F87171", fontWeight: "700" }]}>Back to Welcome Page</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#F87171" />
        </Pressable>
      </GlassCard>

      {/* AVATAR PICKER MODAL */}
      <Modal visible={showAvatarPicker} transparent animationType="fade" onRequestClose={() => setShowAvatarPicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAvatarPicker(false)}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? "#141A24" : "#FFFFFF" }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Your Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((av) => (
                <Pressable
                  key={av.id}
                  style={[
                    styles.avatarGridItem,
                    currentAvatarId === av.id && { borderColor: accent, backgroundColor: `${accent}22` },
                  ]}
                  onPress={() => {
                    updateProfile({ avatar: av.id });
                    setShowAvatarPicker(false);
                  }}
                >
                  <AvatarFigure
                    id={av.id}
                    size={56}
                    borderColor={currentAvatarId === av.id ? accent : "rgba(255,255,255,0.15)"}
                  />
                  <Text style={[styles.avatarGridName, { color: colors.text }]}>{av.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* PERSONA PICKER MODAL */}
      <Modal visible={showPersonaPicker} transparent animationType="fade" onRequestClose={() => setShowPersonaPicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPersonaPicker(false)}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? "#141A24" : "#FFFFFF" }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Lifestyle Persona</Text>
            <ScrollView style={{ maxHeight: 340 }}>
              {PERSONAS.map((p) => (
                <Pressable
                  key={p.id}
                  style={[
                    styles.personaOption,
                    profile?.persona === p.id && { backgroundColor: `${accent}22` },
                  ]}
                  onPress={() => {
                    updateProfile({ persona: p.id });
                    setShowPersonaPicker(false);
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 10 }}>{p.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personaOptionTitle, { color: colors.text }]}>{p.title}</Text>
                    <Text style={[styles.personaOptionSub, { color: colors.textSecondary }]}>{p.sub}</Text>
                  </View>
                  {profile?.persona === p.id && (
                    <Ionicons name="checkmark-circle" size={20} color={accent} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 44 : 24,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarCarousel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 14,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    marginBottom: 12,
  },
  changeAvatarBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  changeAvatarText: {
    fontSize: 12,
    fontWeight: "600",
  },
  menuCard: {
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 22,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 12,
  },
  avatarGridItem: {
    width: "28%",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  avatarGridName: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  personaOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  personaOptionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  personaOptionSub: {
    fontSize: 11,
    marginTop: 2,
  },
});