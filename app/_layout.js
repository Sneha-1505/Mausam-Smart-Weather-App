import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MausamProvider } from "../src/context/MausamContext";
import Frame from "../src/components/Frame";

export default function Layout() {
  return (
    <MausamProvider>
      <StatusBar style="light" />
      <Frame>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#070A11" },
          }}
        />
      </Frame>
    </MausamProvider>
  );
}
