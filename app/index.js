import React from "react";
import { Redirect } from "expo-router";
import { useMausam } from "../src/context/MausamContext";

export default function Index() {
  const { profile } = useMausam();

  // Use explicit onboardingCompleted flag to route correctly
  return profile?.onboardingCompleted ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/welcome" />
  );
}