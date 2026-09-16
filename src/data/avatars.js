import React from "react";
import { View, Image, StyleSheet } from "react-native";

export const AVATAR_IMAGES = {
  farmer: require("../../assets/avatars/avatar_farmer.jpg"),
  traveler: require("../../assets/avatars/avatar_traveler.jpg"),
  fitness: require("../../assets/avatars/avatar_fitness.jpg"),
  professional: require("../../assets/avatars/avatar_commuter.jpg"),
  commuter: require("../../assets/avatars/avatar_commuter.jpg"),
  health: require("../../assets/avatars/avatar_health.jpg"),
  nature: require("../../assets/avatars/avatar_health.jpg"),
  beachgoer: require("../../assets/avatars/avatar_beachgoer.jpg"),
  family: require("../../assets/avatars/avatar_family.jpg"),
  student: require("../../assets/avatars/avatar_student.jpg"),
  event_planner: require("../../assets/avatars/avatar_planner.jpg"),
  planner: require("../../assets/avatars/avatar_planner.jpg"),
  outdoor_worker: require("../../assets/avatars/avatar_outdoor.jpg"),
  early_bird: require("../../assets/avatars/avatar_outdoor.jpg"),
  cosmic: require("../../assets/avatars/avatar_planner.jpg"),
};

export const AVATARS = [
  {
    id: "farmer",
    name: "Farmer",
    role: "Agriculture & Fields",
    emoji: "🌾",
    image: AVATAR_IMAGES.farmer,
    description: "Friendly farming & harvest steward",
    tags: ["farmer"],
  },
  {
    id: "traveler",
    name: "Traveler",
    role: "Explorer & Nomad",
    emoji: "✈️",
    image: AVATAR_IMAGES.traveler,
    description: "Adventurous wanderer exploring new horizons",
    tags: ["traveler"],
  },
  {
    id: "fitness",
    name: "Fitness Pro",
    role: "Athlete & Runner",
    emoji: "🏃",
    image: AVATAR_IMAGES.fitness,
    description: "Energetic outdoor runner and athlete",
    tags: ["fitness"],
  },
  {
    id: "commuter",
    name: "Commuter",
    role: "Urban Transit",
    emoji: "🚗",
    image: AVATAR_IMAGES.commuter,
    description: "Smart daily transit commuter & professional",
    tags: ["commuter", "professional"],
  },
  {
    id: "health",
    name: "Health & Vitality",
    role: "Clean Air & Wellness",
    emoji: "🌿",
    image: AVATAR_IMAGES.health,
    description: "Gentle wellness and botanical air advocate",
    tags: ["health", "nature"],
  },
  {
    id: "beachgoer",
    name: "Beachgoer",
    role: "Coast & Sunlight",
    emoji: "🏖️",
    image: AVATAR_IMAGES.beachgoer,
    description: "Sun-kissed coastal and seaside explorer",
    tags: ["beachgoer"],
  },
  {
    id: "family",
    name: "Family Guardian",
    role: "Care & Outdoors",
    emoji: "🏡",
    image: AVATAR_IMAGES.family,
    description: "Caring guardian for children & family outings",
    tags: ["family", "parent"],
  },
  {
    id: "student",
    name: "Student",
    role: "Campus & Books",
    emoji: "📚",
    image: AVATAR_IMAGES.student,
    description: "Curious scholar on campus study journeys",
    tags: ["student"],
  },
  {
    id: "event_planner",
    name: "Event Planner",
    role: "Celebrations & Parties",
    emoji: "🎉",
    image: AVATAR_IMAGES.event_planner,
    description: "Chic celebration and gathering coordinator",
    tags: ["event_planner", "planner", "cosmic"],
  },
  {
    id: "early_bird",
    name: "Sunrise Explorer",
    role: "Field & Sunrise",
    emoji: "🌅",
    image: AVATAR_IMAGES.early_bird,
    description: "Dedicated early morning outdoor expeditionist",
    tags: ["outdoor_worker", "early_bird"],
  },
];

export function getDefaultAvatar(persona) {
  if (!persona) return AVATARS[0];
  const p = persona.toLowerCase();
  const matching = AVATARS.find((a) => a.tags.includes(p) || a.id === p);
  return matching || AVATARS[0];
}

export function getAvatarById(id) {
  if (!id) return AVATARS[0];
  const normalized = id.toLowerCase();
  return (
    AVATARS.find((a) => a.id === normalized || a.tags.includes(normalized)) ||
    AVATARS[0]
  );
}

/**
 * Reusable Aesthetic Cartoon Human Figure Component
 */
export function AvatarFigure({
  id,
  size = 48,
  style,
  borderColor,
  showBorder = true,
}) {
  const avatar = getAvatarById(id);
  const imgSource = avatar?.image || AVATAR_IMAGES[id] || AVATAR_IMAGES.farmer;

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: showBorder ? Math.max(2, Math.round(size / 30)) : 0,
          borderColor: borderColor || "rgba(255, 255, 255, 0.25)",
        },
        style,
      ]}
    >
      <Image
        source={imgSource}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    overflow: "hidden",
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
});
