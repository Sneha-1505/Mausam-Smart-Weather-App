export const lightColors = {
  background: "#F6F4EE",
  surface: "rgba(255, 255, 255, 0.90)",
  surfaceSoft: "rgba(240, 237, 230, 0.70)",
  glass: "rgba(255, 255, 255, 0.75)",
  glassBorder: "rgba(255, 255, 255, 0.50)",

  text: "#12151B",
  textSecondary: "#525A68",
  textMuted: "#88909E",

  accent: "#D99A3D",
  accentSoft: "#FDE68A",

  border: "rgba(0, 0, 0, 0.08)",
  shadow: "#000000",

  overlay: "rgba(246, 244, 238, 0.82)",
};

export const darkColors = {
  background: "#090D14",
  surface: "rgba(18, 24, 34, 0.78)",
  surfaceSoft: "rgba(26, 34, 48, 0.55)",
  glass: "rgba(255, 255, 255, 0.06)",
  glassBorder: "rgba(255, 255, 255, 0.12)",

  text: "#F1F4F9",
  textSecondary: "#9AA5B8",
  textMuted: "#6B778D",

  accent: "#E0A64B",
  accentSoft: "rgba(224, 166, 75, 0.20)",

  border: "rgba(255, 255, 255, 0.09)",
  shadow: "#000000",

  overlay: "rgba(9, 13, 20, 0.85)",
};

// Legacy compatibility for existing screens
export const C = {
  bg: darkColors.background,
  surface: darkColors.surface,
  text: darkColors.text,
  muted: darkColors.textSecondary,
  line: darkColors.border,
  gold: darkColors.accent,
  gold2: darkColors.accent,
};

export const glass = {
  backgroundColor: "rgba(255, 255, 255, 0.06)",
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.10)",
  borderRadius: 22,
};

export default {
  light: lightColors,
  dark: darkColors,
  primary: "#D99A3D",
};