# Mausam — Personalized Weather Frontend

Expo + React Native + Expo Router frontend for SIH Problem Statement 76.

## Run

```bash
npm install
npx expo start --web
```

The web preview is intentionally constrained to a portrait mobile-width frame. The app uses realistic mock weather data and a reusable profile/personalization state. No weather API, backend, database or AI API is connected yet.

## Routes

- `/welcome` — immersive first-time welcome
- `/onboarding` — name, location, persona, adaptive routine and weather priorities
- `/(tabs)` — personalized Home
- `/(tabs)/earth` — 3D weather placeholder
- `/(tabs)/ai` — Mausam AI interaction
- `/(tabs)/planner` — weather-aware daily planner
- `/(tabs)/profile` — editable personalization
- `/alerts` — personalized alerts
