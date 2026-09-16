import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { C } from "../src/theme/colors";

import {
  PERSONAS,
  PRIORITIES,
} from "../src/data/mock";

import { useMausam } from "../src/context/MausamContext";
import { createUser } from "../server/services/api";

import {
  getCurrentDeviceLocation,
  searchLocations,
} from "../src/services/weather";
import { getPersonaPriorities } from "../src/data/personaPriorities";


const TOTAL = 5;

const BACKGROUND_IMAGE =
  require("../assets/onboarding-bg.png");


export default function Onboarding() {

  const {
    updateProfile,
    setUserLocation,
  } = useMausam();


  /* =====================================================
     STATE
  ===================================================== */

  const [step, setStep] = useState(0);

  const [name, setName] = useState("");

  const [location, setLocation] =
    useState(null);

  const [locationQuery, setLocationQuery] =
    useState("");

  const [locationResults, setLocationResults] =
    useState([]);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [persona, setPersona] =
    useState(
      PERSONAS?.[0]?.id || "student"
    );

  const [customLife, setCustomLife] =
    useState("");

  const [activities, setActivities] =
    useState([]);

  const [priorities, setPriorities] =
    useState([
      "rain",
      "temperature",
      "humidity",
      "uv",
    ]);

  const [showCustomizePriorities, setShowCustomizePriorities] =
    useState(false);

  const [routine, setRoutine] =
    useState({
      date: "Today",
      start: "08:30",
      end: "18:00",
      commute: "Walking",
    });


  const personaData = useMemo(
    () =>
      PERSONAS?.find(
        (item) =>
          item.id === persona
      ),
    [persona]
  );


  /* =====================================================
     CURRENT LOCATION
  ===================================================== */

  const useCurrentLocation = async () => {

    try {

      setLocationLoading(true);
      setLocationError("");

      const current =
        await getCurrentDeviceLocation();

      setLocation(current);

      setUserLocation(current);

      setLocationQuery(
        `${current.name}${
          current.region
            ? `, ${current.region}`
            : ""
        }`
      );

    } catch (error) {

      console.log(
        "Current location error:",
        error
      );

      setLocationError(
        "Couldn't detect your location. Please search for your city."
      );

    } finally {

      setLocationLoading(false);

    }
  };


  /* =====================================================
     SEARCH LOCATION
  ===================================================== */

  const searchPlace = async (text) => {

    setLocationQuery(text);
    setLocationError("");

    if (
      text.trim().length < 2
    ) {

      setLocationResults([]);

      return;
    }

    try {

      setLocationLoading(true);

      const results =
        await searchLocations(text);

      setLocationResults(
        results || []
      );

    } catch (error) {

      console.log(
        "Location search error:",
        error
      );

      setLocationResults([]);

      setLocationError(
        "Unable to search locations right now."
      );

    } finally {

      setLocationLoading(false);

    }
  };


  /* =====================================================
     SELECT LOCATION
  ===================================================== */

  const selectLocation = (place) => {

    setLocation(place);

    setUserLocation(place);

    setLocationQuery(
      `${place.name}${
        place.region
          ? `, ${place.region}`
          : ""
      }`
    );

    setLocationResults([]);

    setLocationError("");
  };


  /* =====================================================
     PRIORITY
  ===================================================== */

  const togglePriority = (id) => {

    setPriorities((current) => {

      if (
        current.includes(id)
      ) {

        return current.filter(
          (item) =>
            item !== id
        );

      }

      return [
        ...current,
        id,
      ];

    });
  };


  /* =====================================================
     BACK BUTTON
  ===================================================== */

  const handleBack = () => {

    console.log(
      "BACK CLICKED",
      step
    );

    if (step > 0) {

      setStep(
        (current) =>
          current - 1
      );

      return;
    }

    router.replace(
      "/welcome"
    );
  };


  /* =====================================================
     CONTINUE BUTTON
  ===================================================== */

const handleContinue = async () => {
    console.log(
      "CONTINUE CLICKED",
      step
    );


    /* STEP 1 */

    if (step === 0) {

      if (!name.trim()) {

        Alert.alert(
          "One small thing",
          "Tell Mausam what we should call you."
        );

        return;
      }

      setStep(1);

      return;
    }


    /* STEP 2 */

    if (step === 1) {

      if (!location) {

        Alert.alert(
          "Choose your location",
          "Use your current location or search for your city."
        );

        return;
      }

      setStep(2);

      return;
    }


    /* STEP 3 */

    if (step === 2) {

      if (
        persona === "other" &&
        !customLife.trim()
      ) {

        Alert.alert(
          "Tell Mausam a little more",
          "Describe what your normal day looks like."
        );

        return;
      }

      setStep(3);

      return;
    }


    /* STEP 4 */

    if (step === 3) {

      setStep(4);

      return;
    }


    /* STEP 5 */

    if (step === 4) {

      if (!location) {

        setStep(1);

        return;
      }


      updateProfile({

        name:
          name.trim(),

        location:
          location.name,

        latitude:
          location.latitude,

        longitude:
          location.longitude,

        country:
          location.country || "",

        region:
          location.region || "",

        persona,

        avatar:
          persona || "farmer",

        customLife:
          customLife.trim(),

        routine,

        activities,

        priorities,

        onboardingCompleted: true,

      });


      router.replace(
        "/(tabs)"
      );

    }

  };


  /* =====================================================
     FIRST SCREEN
  ===================================================== */

  if (step === 0) {

    return (

      <View
        style={styles.firstScreen}
      >

        {/* BACKGROUND */}

        <ImageBackground
          source={BACKGROUND_IMAGE}
          resizeMode="cover"
          style={
            StyleSheet.absoluteFillObject
          }
          pointerEvents="none"
        />


        {/* BACKGROUND DARK GLASS */}

        <View
          pointerEvents="none"
          style={
            styles.backgroundOverlay
          }
        />


        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={styles.firstHeader}
        >

          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={styles.firstBack}
          >

            <Ionicons
              name="arrow-back"
              size={21}
              color="#FFFFFF"
            />

          </Pressable>


          <View
            style={styles.brandContainer}
          >

            <Text
              style={styles.logo}
            >
              M A U S A M
            </Text>


            <Text
              style={styles.logoSub}
            >
              WEATHER INTELLIGENCE
            </Text>

          </View>


          <Text
            style={styles.counter}
          >
            01 / 05
          </Text>

        </View>


        {/* =================================================
            PROGRESS
        ================================================= */}

        <View
          style={styles.firstProgress}
        >

          <View
            style={
              styles.firstProgressFill
            }
          />

        </View>


        {/* =================================================
            HERO
        ================================================= */}

        <View
          style={styles.hero}
          pointerEvents="none"
        >

          <Text
            style={styles.heroKicker}
          >
            YOUR WEATHER.
          </Text>


          <Text
            style={styles.heroTitle}
          >
            Starts with{"\n"}

            <Text
              style={styles.heroAccent}
            >
              you.
            </Text>

          </Text>


          <Text
            style={styles.heroText}
          >
            Mausam learns what matters
            to you and turns changing
            weather into useful decisions
            for your day.
          </Text>


          <View
            style={styles.heroLine}
          />


          <Text
            style={styles.heroSmall}
          >
            PERSONALIZED WEATHER
            INTELLIGENCE
          </Text>

        </View>


        {/* =================================================
            NAME GLASS PANEL
        ================================================= */}

        <View
          style={styles.namePanel}
        >

          <Text
            style={styles.nameKicker}
          >
            FIRST THINGS FIRST
          </Text>


          <Text
            style={styles.nameTitle}
          >
            What should I call you?
          </Text>


          <Text
            style={styles.nameDescription}
          >
            Your name helps Mausam create
            a more personal experience.
          </Text>


          {/* NAME INPUT */}

          <View
            style={styles.nameInput}
          >

            <Ionicons
              name="person-outline"
              size={20}
              color="#29A9FF"
            />


            <View
              style={styles.inputDivider}
            />


            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your first name"
              placeholderTextColor={
                "rgba(255,255,255,0.50)"
              }
              style={
                styles.nameTextInput
              }
              autoCapitalize="words"
            />

          </View>


          {/* BLUE CONTINUE */}

          <Pressable
            onPress={handleContinue}
            hitSlop={10}
            style={({ pressed }) => [
              styles.blueButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >

            <Text
              style={
                styles.blueButtonText
              }
            >
              Continue
            </Text>


            <View
              style={
                styles.arrowCircle
              }
            >

              <Ionicons
                name="arrow-forward"
                size={21}
                color="#08243A"
              />

            </View>

          </Pressable>


          {/* PRIVACY */}

          <View
            style={styles.privateRow}
          >

            <Ionicons
              name="lock-closed-outline"
              size={13}
              color="#29A9FF"
            />

            <Text
              style={styles.privateText}
            >
              Your information stays private.
            </Text>

          </View>

        </View>

      </View>

    );
  }


  /* =====================================================
     ALL OTHER ONBOARDING SCREENS
  ===================================================== */

  return (

    <View
      style={styles.otherScreen}
    >

      {/* SAME BACKGROUND */}

      <ImageBackground
        source={BACKGROUND_IMAGE}
        resizeMode="cover"
        style={
          StyleSheet.absoluteFillObject
        }
        pointerEvents="none"
      />


      {/* DARK OVERLAY */}

      <View
        pointerEvents="none"
        style={
          styles.otherBackgroundOverlay
        }
      />


      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={styles.otherHeader}
      >

        <Pressable
          onPress={handleBack}
          hitSlop={12}
          style={styles.otherBack}
        >

          <Ionicons
            name="arrow-back"
            size={20}
            color="#FFFFFF"
          />

        </Pressable>


        <View
          style={styles.otherBrand}
        >

          <Text
            style={styles.otherLogo}
          >
            M A U S A M
          </Text>


          <Text
            style={styles.otherLogoSub}
          >
            WEATHER INTELLIGENCE
          </Text>

        </View>


        <Text
          style={styles.otherCounter}
        >
          0{step + 1} / 05
        </Text>

      </View>


      {/* =================================================
          PROGRESS
      ================================================= */}

      <View
        style={styles.otherProgress}
      >

        <View
          style={[
            styles.otherProgressFill,
            {
              width:
                `${((step + 1) / TOTAL) * 100}%`,
            },
          ]}
        />

      </View>


      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        style={styles.otherScroll}
        contentContainerStyle={
          styles.otherContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >


        {/* =================================================
            LOCATION
        ================================================= */}

        {step === 1 && (

          <>

            <View
              style={styles.glassIcon}
            >

              <Ionicons
                name="location-outline"
                size={21}
                color="#29A9FF"
              />

            </View>


            <Text
              style={styles.kickerLight}
            >
              YOUR HOME BASE
            </Text>


            <Text
              style={styles.headingLight}
            >
              Where does your{"\n"}
              day begin?
            </Text>


            <Text
              style={styles.descriptionLight}
            >
              Your location gives Mausam
              the weather context it needs
              to understand your day.
            </Text>


            {/* CURRENT LOCATION */}

            <Pressable
              onPress={
                useCurrentLocation
              }
              style={({ pressed }) => [
                styles.locationButtonGlass,
                pressed &&
                  styles.buttonPressed,
              ]}
            >

              <View
                style={
                  styles.locationIconGlass
                }
              >

                <Ionicons
                  name="navigate"
                  size={18}
                  color="#29A9FF"
                />

              </View>


              <View
                style={{
                  flex: 1,
                }}
              >

                <Text
                  style={
                    styles.locationTitleLight
                  }
                >
                  Use current location
                </Text>


                <Text
                  style={
                    styles.locationSubLight
                  }
                >
                  Detect automatically
                </Text>

              </View>


              <Ionicons
                name="arrow-forward"
                size={18}
                color="rgba(255,255,255,0.75)"
              />

            </Pressable>


            {/* OR SEARCH */}

            <View
              style={styles.orRow}
            >

              <View
                style={styles.orLineLight}
              />

              <Text
                style={styles.orTextLight}
              >
                OR SEARCH
              </Text>

              <View
                style={styles.orLineLight}
              />

            </View>


            {/* SEARCH */}

            <View
              style={styles.searchBoxGlass}
            >

              <Ionicons
                name="search-outline"
                size={19}
                color="rgba(255,255,255,0.75)"
              />


              <TextInput
                value={
                  locationQuery
                }
                onChangeText={
                  searchPlace
                }
                placeholder={
                  "City, town or place"
                }
                placeholderTextColor={
                  "rgba(255,255,255,0.48)"
                }
                style={
                  styles.searchInputLight
                }
              />


              {locationLoading && (

                <Text
                  style={
                    styles.loadingLight
                  }
                >
                  ...
                </Text>

              )}

            </View>


            {/* RESULTS */}

            {locationResults.length >
              0 && (

              <View
                style={
                  styles.resultsGlass
                }
              >

                {locationResults.map(
                  (
                    place,
                    index
                  ) => (

                    <Pressable
                      key={`${place.latitude}-${place.longitude}-${index}`}
                      onPress={() =>
                        selectLocation(
                          place
                        )
                      }
                      style={
                        styles.resultGlass
                      }
                    >

                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#29A9FF"
                      />


                      <View
                        style={{
                          flex: 1,
                        }}
                      >

                        <Text
                          style={
                            styles.resultNameLight
                          }
                        >
                          {place.name}
                        </Text>


                        <Text
                          style={
                            styles.resultSubLight
                          }
                        >
                          {[
                            place.region,
                            place.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </Text>

                      </View>

                    </Pressable>

                  )
                )}

              </View>

            )}


            {/* SELECTED LOCATION */}

            {location && (

              <View
                style={
                  styles.selectedLocationGlass
                }
              >

                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#29A9FF"
                />


                <View
                  style={{
                    flex: 1,
                  }}
                >

                  <Text
                    style={
                      styles.selectedNameLight
                    }
                  >
                    {location.name}
                  </Text>


                  <Text
                    style={
                      styles.selectedSubLight
                    }
                  >
                    {[
                      location.region,
                      location.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>

                </View>

              </View>

            )}


            {locationError && (

              <Text
                style={styles.errorLight}
              >
                {locationError}
              </Text>

            )}

          </>

        )}


        {/* =================================================
            LIFE MODE
        ================================================= */}

        {step === 2 && (

          <>

            <View
              style={styles.glassIcon}
            >

              <Ionicons
                name="sparkles-outline"
                size={21}
                color="#29A9FF"
              />

            </View>


            <Text
              style={styles.kickerLight}
            >
              YOUR LIFE MODE
            </Text>


            <Text
              style={styles.headingLight}
            >
              What does your{"\n"}
              day look like?
            </Text>


            <Text
              style={styles.descriptionLight}
            >
              The same weather can mean
              different things to different
              people. Tell Mausam your world.
            </Text>


            <View
              style={styles.lifeModes}
            >

              {PERSONAS.map(
                (item) => {

                  const selected =
                    persona ===
                    item.id;

                  return (

                    <Pressable
                      key={item.id}
                      onPress={() =>
                        setPersona(
                          item.id
                        )
                      }
                      style={[
                        styles.lifeModeGlass,
                        selected &&
                          styles.lifeModeGlassSelected,
                      ]}
                    >

                      <View
                        style={[
                          styles.modeIconGlass,
                          selected &&
                            styles.modeIconGlassSelected,
                        ]}
                      >

                        <Text
                          style={
                            styles.modeEmoji
                          }
                        >
                          {item.icon}
                        </Text>

                      </View>


                      <View
                        style={
                          styles.modeContent
                        }
                      >

                        <Text
                          style={
                            styles.modeTitleLight
                          }
                        >
                          {item.title}
                        </Text>


                        <Text
                          style={
                            styles.modeSubLight
                          }
                        >
                          {item.sub}
                        </Text>

                      </View>


                      <View
                        style={[
                          styles.radioLight,
                          selected &&
                            styles.radioLightSelected,
                        ]}
                      >

                        {selected && (

                          <View
                            style={
                              styles.radioDotBlue
                            }
                          />

                        )}

                      </View>

                    </Pressable>

                  );

                }
              )}

            </View>


            {persona ===
              "other" && (

              <View
                style={
                  styles.customBoxGlass
                }
              >

                <Text
                  style={
                    styles.customTitleLight
                  }
                >
                  Tell Mausam about your day
                </Text>


                <TextInput
                  value={customLife}
                  onChangeText={
                    setCustomLife
                  }
                  placeholder={
                    "Describe your usual day..."
                  }
                  placeholderTextColor={
                    "rgba(255,255,255,0.45)"
                  }
                  multiline
                  textAlignVertical="top"
                  style={
                    styles.customInputGlass
                  }
                />

              </View>

            )}


            <View
              style={styles.infoGlass}
            >

              <Ionicons
                name="sparkles-outline"
                size={18}
                color="#29A9FF"
              />


              <View
                style={{
                  flex: 1,
                }}
              >

                <Text
                  style={
                    styles.infoTitleLight
                  }
                >
                  Your weather will adapt
                </Text>


                <Text
                  style={
                    styles.infoTextLight
                  }
                >
                  Mausam will change the
                  information hierarchy based
                  on your selected life mode.
                </Text>

              </View>

            </View>

          </>

        )}


        {/* =================================================
            ROUTINE
        ================================================= */}

        {step === 3 && (

          <>

            <View
              style={styles.glassIcon}
            >

              <Ionicons
                name="time-outline"
                size={21}
                color="#29A9FF"
              />

            </View>


            <Text
              style={styles.kickerLight}
            >
              YOUR SCHEDULE & RHYTHM
            </Text>

            <Text
              style={styles.headingLight}
            >
              When does your{"\n"}
              day happen?
            </Text>

            <Text
              style={styles.descriptionLight}
            >
              Setting your date and daily routine helps Mausam connect accurate weather updates with your real schedule.
            </Text>

            {/* DATE SECTION */}
            <Text
              style={styles.labelLight}
            >
              SCHEDULE DATE
            </Text>

            <View style={styles.chips}>
              {["Today", "Tomorrow", "Next 7 Days", "Everyday"].map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setRoutine((curr) => ({ ...curr, date: d }))}
                  style={[
                    styles.chipGlass,
                    routine.date === d && styles.chipGlassActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipTextLight,
                      routine.date === d && styles.chipTextBlue,
                    ]}
                  >
                    {d === "Today" ? "📅 Today" : d === "Tomorrow" ? "🌅 Tomorrow" : d === "Next 7 Days" ? "🗓️ 7-Day Window" : "🔄 Everyday"}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.inputWithIconRow}>
              <Ionicons name="calendar-outline" size={18} color="#29A9FF" style={{ marginRight: 10 }} />
              <TextInput
                value={routine.date}
                onChangeText={(value) =>
                  setRoutine((current) => ({
                    ...current,
                    date: value,
                  }))
                }
                placeholder="e.g. Today, Tomorrow, or 2026-09-16"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={styles.inputWithIcon}
              />
            </View>

            {/* TIME SECTION (START & END TIME SIDE BY SIDE) */}
            <Text
              style={[styles.labelLight, { marginTop: 20 }]}
            >
              ACTIVE HOURS (START & END TIME)
            </Text>

            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                <Text style={styles.subLabelLight}>START TIME</Text>
                <View style={styles.inputWithIconRow}>
                  <Ionicons name="sunny-outline" size={16} color="#FBBF24" style={{ marginRight: 8 }} />
                  <TextInput
                    value={routine.start}
                    onChangeText={(value) =>
                      setRoutine((current) => ({
                        ...current,
                        start: value,
                      }))
                    }
                    placeholder="08:30"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    style={styles.inputWithIcon}
                  />
                </View>
              </View>

              <View style={styles.timeCol}>
                <Text style={styles.subLabelLight}>END TIME</Text>
                <View style={styles.inputWithIconRow}>
                  <Ionicons name="moon-outline" size={16} color="#A78BFA" style={{ marginRight: 8 }} />
                  <TextInput
                    value={routine.end}
                    onChangeText={(value) =>
                      setRoutine((current) => ({
                        ...current,
                        end: value,
                      }))
                    }
                    placeholder="18:00"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    style={styles.inputWithIcon}
                  />
                </View>
              </View>
            </View>

            {/* TIME PRESETS CHIPS */}
            <View style={[styles.chips, { marginTop: 8 }]}>
              {[
                { label: "Standard (8:30 - 18:00)", start: "08:30", end: "18:00" },
                { label: "Early (6:00 - 14:00)", start: "06:00", end: "14:00" },
                { label: "Evening (14:00 - 22:00)", start: "14:00", end: "22:00" },
              ].map((p) => {
                const isSelected = routine.start === p.start && routine.end === p.end;
                return (
                  <Pressable
                    key={p.label}
                    onPress={() => setRoutine((curr) => ({ ...curr, start: p.start, end: p.end }))}
                    style={[styles.chipGlass, isSelected && styles.chipGlassActive]}
                  >
                    <Text style={[styles.chipTextLight, isSelected && styles.chipTextBlue]}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* HOW DO YOU MOVE? */}
            <Text
              style={[styles.labelLight, { marginTop: 20 }]}
            >
              HOW DO YOU MOVE?
            </Text>

            <View
              style={styles.chips}
            >
              {[
                { id: "Walking", icon: "🚶", label: "Walking" },
                { id: "Bus", icon: "🚌", label: "Bus" },
                { id: "Metro", icon: "🚇", label: "Metro" },
                { id: "Bike", icon: "🏍️", label: "Bike" },
                { id: "Car", icon: "🚗", label: "Car" },
                { id: "Cycling", icon: "🚴", label: "Cycling" },
              ].map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    setRoutine((current) => ({
                      ...current,
                      commute: item.id,
                    }))
                  }
                  style={[
                    styles.chipGlass,
                    routine.commute === item.id &&
                      styles.chipGlassActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipTextLight,
                      routine.commute === item.id &&
                        styles.chipTextBlue,
                    ]}
                  >
                    {item.icon} {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

          </>

        )}


        {/* =================================================
            AUTOMATIC PERSONALIZED PRIORITIES (Step 4)
        ================================================= */}

        {step === 4 && (() => {
          const autoProfile = getPersonaPriorities(persona);
          return (
            <>
              <View style={styles.glassIcon}>
                <Ionicons
                  name="sparkles-outline"
                  size={21}
                  color="#29A9FF"
                />
              </View>

              <Text style={styles.kickerLight}>
                AUTOMATIC PERSONALIZATION
              </Text>

              <Text style={styles.headingLight}>
                We've personalized{"\n"}
                Mausam for you.
              </Text>

              <Text style={styles.descriptionLight}>
                Based on your profile, Mausam will automatically focus on the weather information that matters most to you.
              </Text>

              {/* AUTOMATIC PROFILE CARD */}
              <View style={styles.autoProfileCard}>
                <View style={styles.autoProfileHeader}>
                  <View style={styles.autoProfileBadge}>
                    <Text style={styles.autoProfileBadgeText}>
                      {(persona || "TRAVELER").toUpperCase()} INTELLIGENCE
                    </Text>
                  </View>
                  <Text style={styles.autoProfileTitle}>
                    {autoProfile.profileTitle}
                  </Text>
                  <Text style={styles.autoProfileSubtitle}>
                    {autoProfile.subtitle}
                  </Text>
                </View>

                <View style={styles.autoProfileDivider} />

                <Text style={styles.autoPrioritiesHeader}>
                  PRIORITIZED WEATHER METRICS
                </Text>

                <View style={styles.autoPrioritiesList}>
                  {autoProfile.priorities.map((item) => (
                    <View key={item.id} style={styles.autoPriorityRow}>
                      <View style={styles.autoPriorityIconCircle}>
                        <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                      </View>
                      <Text style={styles.autoPriorityLabel} numberOfLines={1}>
                        {item.label}
                      </Text>
                      <View style={styles.autoPriorityCheck}>
                        <Ionicons name="checkmark-sharp" size={13} color="#FFFFFF" />
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* OPTIONAL ADVANCED CUSTOMIZE TOGGLE */}
              <Pressable
                onPress={() => setShowCustomizePriorities((v) => !v)}
                style={styles.customizeToggleBtn}
              >
                <Ionicons
                  name={showCustomizePriorities ? "chevron-up" : "options-outline"}
                  size={15}
                  color="#7DD3FC"
                />
                <Text style={styles.customizeToggleText}>
                  {showCustomizePriorities ? "Hide custom priorities" : "Customize priorities (Advanced)"}
                </Text>
              </Pressable>

              {showCustomizePriorities && (
                <View style={[styles.priorityGrid, { marginTop: 4, marginBottom: 16 }]}>
                  {PRIORITIES.map((item) => {
                    const id = Array.isArray(item) ? item[0] : item.id;
                    const label = Array.isArray(item) ? item[1] : item.label;
                    const icon = Array.isArray(item) ? item[2] : item.icon;
                    const active = priorities.includes(id);

                    return (
                      <Pressable
                        key={id}
                        onPress={() => togglePriority(id)}
                        style={[
                          styles.priorityGlass,
                          active && styles.priorityGlassActive,
                        ]}
                      >
                        <Text style={styles.priorityIcon}>{icon}</Text>
                        <Text
                          style={[
                            styles.priorityTextLight,
                            active && styles.priorityTextBlue,
                          ]}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </>
          );
        })()}


        <View
          style={{
            height: 30,
          }}
        />

      </ScrollView>


      {/* =================================================
          BOTTOM GLASS
      ================================================= */}

      <View
        style={styles.bottomGlass}
      >

        <Pressable
          onPress={handleContinue}
          hitSlop={10}
          style={({ pressed }) => [
            styles.bottomButton,
            pressed &&
              styles.buttonPressed,
          ]}
        >

          <Text
            style={
              styles.bottomButtonText
            }
          >
            {step === 4
              ? "Build my Mausam"
              : "Continue"}
          </Text>


          <View
            style={styles.bottomArrow}
          >

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#08243A"
            />

          </View>

        </Pressable>


        <View
          style={styles.bottomPrivacy}
        >

          <Ionicons
            name="shield-checkmark-outline"
            size={13}
            color="#29A9FF"
          />

          <Text
            style={
              styles.bottomPrivacyText
            }
          >
            Your choices stay private.
          </Text>

        </View>

      </View>

    </View>

  );
}


/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({

  /* =======================================================
     FIRST SCREEN
  ======================================================= */

  firstScreen: {
    flex: 1,
    backgroundColor: "#071827",
    overflow: "hidden",
  },

  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(4,15,24,0.38)",
  },


  /* =======================================================
     FIRST HEADER
  ======================================================= */

  firstHeader: {
    height: 70,
    paddingHorizontal: 22,
    paddingTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },

  firstBack: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor:
      "rgba(5,20,32,0.52)",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  brandContainer: {
    alignItems: "center",
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 4.5,
  },

  logoSub: {
    color:
      "rgba(255,255,255,0.58)",
    fontSize: 6,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginTop: 3,
  },

  counter: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },


  /* =======================================================
     FIRST PROGRESS
  ======================================================= */

  firstProgress: {
    height: 2,
    marginHorizontal: 22,
    backgroundColor:
      "rgba(255,255,255,0.25)",
    zIndex: 20,
  },

  firstProgressFill: {
    width: "20%",
    height: 2,
    backgroundColor: "#D99A3D",
  },


  /* =======================================================
     FIRST HERO
  ======================================================= */

  hero: {
    position: "absolute",
    left: 27,
    right: 27,
    top: "25%",
    zIndex: 4,
  },

  heroKicker: {
    color: "#D99A3D",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 11,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 43,
    lineHeight: 46,
    fontWeight: "900",
    letterSpacing: -1.6,
  },

  heroAccent: {
    color: "#D99A3D",
  },

  heroText: {
    color:
      "rgba(255,255,255,0.79)",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 14,
    maxWidth: 340,
  },

  heroLine: {
    width: 50,
    height: 2,
    backgroundColor: "#D99A3D",
    marginTop: 18,
  },

  heroSmall: {
    color:
      "rgba(255,255,255,0.53)",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginTop: 8,
  },


  /* =======================================================
     NAME PANEL
  ======================================================= */

  namePanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 24,
    paddingTop: 21,
    paddingBottom: 15,

    backgroundColor:
      "rgba(7,22,34,0.55)",

    borderTopWidth: 1,
    borderTopColor:
      "rgba(255,255,255,0.30)",

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    zIndex: 15,
  },

  nameKicker: {
    color: "#D99A3D",
    fontSize: 8,
    letterSpacing: 2,
    fontWeight: "900",
  },

  nameTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },

  nameDescription: {
    color:
      "rgba(255,255,255,0.70)",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
    marginBottom: 11,
  },

  nameInput: {
    height: 54,
    borderRadius: 16,

    backgroundColor:
      "rgba(255,255,255,0.10)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.38)",

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",
  },

  inputDivider: {
    width: 1,
    height: 23,
    backgroundColor:
      "rgba(255,255,255,0.20)",
    marginHorizontal: 11,
  },

  nameTextInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    outlineStyle: "none",
  },


  /* =======================================================
     BLUE BUTTON
  ======================================================= */

  blueButton: {
    height: 55,
    borderRadius: 17,

    backgroundColor:
      "rgba(19,148,235,0.82)",

    borderWidth: 1,
    borderColor:
      "rgba(120,211,255,0.72)",

    marginTop: 12,

    paddingLeft: 19,
    paddingRight: 7,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    zIndex: 30,
  },

  blueButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  arrowCircle: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor:
      "rgba(239,249,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  privateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  privateText: {
    color:
      "rgba(255,255,255,0.64)",
    fontSize: 8,
    marginLeft: 5,
  },


  /* =======================================================
     OTHER SCREEN
  ======================================================= */

  otherScreen: {
    flex: 1,
    backgroundColor: "#071827",
    overflow: "hidden",
  },

  otherBackgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(4,15,24,0.54)",
  },


  /* =======================================================
     OTHER HEADER
  ======================================================= */

  otherHeader: {
    height: 68,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor:
      "rgba(5,20,32,0.18)",

    zIndex: 20,
  },

  otherBack: {
    width: 40,
    height: 40,
    borderRadius: 20,

    backgroundColor:
      "rgba(5,20,32,0.48)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.30)",

    alignItems: "center",
    justifyContent: "center",
  },

  otherBrand: {
    alignItems: "center",
  },

  otherLogo: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 4,
  },

  otherLogoSub: {
    color:
      "rgba(255,255,255,0.50)",
    fontSize: 5.5,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 3,
  },

  otherCounter: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },


  /* =======================================================
     OTHER PROGRESS
  ======================================================= */

  otherProgress: {
    height: 2,
    marginHorizontal: 22,
    backgroundColor:
      "rgba(255,255,255,0.23)",
    zIndex: 20,
  },

  otherProgressFill: {
    height: 2,
    backgroundColor: "#D99A3D",
  },


  /* =======================================================
     SCROLL
  ======================================================= */

  otherScroll: {
    flex: 1,
    zIndex: 5,
  },

  otherContent: {
    paddingHorizontal: 22,
    paddingTop: 27,
    paddingBottom: 25,
  },


  /* =======================================================
     GLASS ICON
  ======================================================= */

  glassIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,

    backgroundColor:
      "rgba(255,255,255,0.11)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.30)",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 18,
  },


  /* =======================================================
     LIGHT TEXT
  ======================================================= */

  kickerLight: {
    color: "#D99A3D",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 2,
  },

  headingLight: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginTop: 8,
  },

  descriptionLight: {
    color:
      "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },


  /* =======================================================
     CURRENT LOCATION GLASS
  ======================================================= */

  locationButtonGlass: {
    minHeight: 70,
    marginTop: 21,

    paddingHorizontal: 13,

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.10)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.32)",

    flexDirection: "row",
    alignItems: "center",
  },

  locationIconGlass: {
    width: 41,
    height: 41,
    borderRadius: 13,

    backgroundColor:
      "rgba(255,255,255,0.13)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  locationTitleLight: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  locationSubLight: {
    color:
      "rgba(255,255,255,0.57)",
    fontSize: 9,
    marginTop: 3,
  },


  /* =======================================================
     OR
  ======================================================= */

  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 17,
  },

  orLineLight: {
    flex: 1,
    height: 1,
    backgroundColor:
      "rgba(255,255,255,0.22)",
  },

  orTextLight: {
    color:
      "rgba(255,255,255,0.56)",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginHorizontal: 9,
  },


  /* =======================================================
     SEARCH GLASS
  ======================================================= */

  searchBoxGlass: {
    height: 54,
    borderRadius: 16,

    backgroundColor:
      "rgba(255,255,255,0.10)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.32)",

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",
  },

  searchInputLight: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    marginLeft: 9,
    outlineStyle: "none",
  },

  loadingLight: {
    color: "#29A9FF",
    fontWeight: "900",
  },


  /* =======================================================
     LOCATION RESULTS
  ======================================================= */

  resultsGlass: {
    marginTop: 8,

    borderRadius: 16,

    backgroundColor:
      "rgba(5,20,32,0.72)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.25)",

    overflow: "hidden",
  },

  resultGlass: {
    minHeight: 57,

    paddingHorizontal: 13,

    flexDirection: "row",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor:
      "rgba(255,255,255,0.12)",
  },

  resultNameLight: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  resultSubLight: {
    color:
      "rgba(255,255,255,0.55)",
    fontSize: 9,
    marginTop: 3,
  },


  /* =======================================================
     SELECTED LOCATION
  ======================================================= */

  selectedLocationGlass: {
    minHeight: 61,

    marginTop: 10,

    paddingHorizontal: 13,

    borderRadius: 16,

    backgroundColor:
      "rgba(29,164,239,0.18)",

    borderWidth: 1,
    borderColor:
      "rgba(87,198,255,0.58)",

    flexDirection: "row",
    alignItems: "center",
  },

  selectedNameLight: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  selectedSubLight: {
    color:
      "rgba(255,255,255,0.60)",
    fontSize: 9,
    marginTop: 3,
  },

  errorLight: {
    color: "#FFB1A6",
    fontSize: 10,
    marginTop: 8,
  },


  /* =======================================================
     LIFE MODE
  ======================================================= */

  lifeModes: {
    marginTop: 20,
  },

  lifeModeGlass: {
    minHeight: 70,

    paddingHorizontal: 11,

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.10)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.27)",

    flexDirection: "row",
    alignItems: "center",

    marginBottom: 8,
  },

  lifeModeGlassSelected: {
    backgroundColor:
      "rgba(30,164,239,0.19)",

    borderColor:
      "rgba(85,201,255,0.65)",

    borderWidth: 1.5,
  },

  modeIconGlass: {
    width: 42,
    height: 42,
    borderRadius: 13,

    backgroundColor:
      "rgba(255,255,255,0.11)",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  modeIconGlassSelected: {
    backgroundColor:
      "rgba(40,170,240,0.20)",
  },

  modeEmoji: {
    fontSize: 20,
  },

  modeContent: {
    flex: 1,
  },

  modeTitleLight: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  modeSubLight: {
    color:
      "rgba(255,255,255,0.55)",
    fontSize: 9,
    marginTop: 3,
  },

  radioLight: {
    width: 21,
    height: 21,
    borderRadius: 11,

    borderWidth: 1.5,
    borderColor:
      "rgba(255,255,255,0.45)",

    alignItems: "center",
    justifyContent: "center",
  },

  radioLightSelected: {
    borderColor: "#29A9FF",
  },

  radioDotBlue: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#29A9FF",
  },


  /* =======================================================
     CUSTOM LIFE
  ======================================================= */

  customBoxGlass: {
    marginTop: 5,

    padding: 14,

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.10)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.28)",
  },

  customTitleLight: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 9,
  },

  customInputGlass: {
    minHeight: 80,

    borderRadius: 13,

    backgroundColor:
      "rgba(255,255,255,0.09)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.25)",

    padding: 12,

    color: "#FFFFFF",
    fontSize: 11,

    outlineStyle: "none",
  },


  /* =======================================================
     INFO GLASS
  ======================================================= */

  infoGlass: {
    marginTop: 12,

    padding: 14,

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.09)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.25)",

    flexDirection: "row",
    gap: 10,
  },

  infoTitleLight: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  infoTextLight: {
    color:
      "rgba(255,255,255,0.57)",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },


  /* =======================================================
     ROUTINE
  ======================================================= */

  labelLight: {
    color:
      "rgba(255,255,255,0.70)",

    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: "900",

    marginTop: 19,
    marginBottom: 6,
  },

  inputGlass: {
    height: 54,

    borderRadius: 16,

    backgroundColor:
      "rgba(255,255,255,0.10)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.30)",

    paddingHorizontal: 14,

    color: "#FFFFFF",
    fontSize: 13,

    outlineStyle: "none",
  },

  timeRow: {
    flexDirection: "row",
    gap: 12,
  },

  timeCol: {
    flex: 1,
  },

  inputWithIconRow: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  inputWithIcon: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    outlineStyle: "none",
  },

  subLabelLight: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 8,
    letterSpacing: 1.2,
    fontWeight: "900",
    marginBottom: 6,
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },

  chipGlass: {
    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 20,

    backgroundColor:
      "rgba(255,255,255,0.10)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.27)",

    marginRight: 7,
    marginBottom: 7,
  },

  chipGlassActive: {
    backgroundColor:
      "rgba(30,164,239,0.22)",

    borderColor:
      "rgba(85,201,255,0.65)",
  },

  chipTextLight: {
    color:
      "rgba(255,255,255,0.68)",
    fontSize: 10,
    fontWeight: "700",
  },

  chipTextBlue: {
    color: "#FFFFFF",
    fontWeight: "900",
  },


  /* =======================================================
     PRIORITIES
  ======================================================= */

  priorityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
  },

  priorityGlass: {
    width: "48%",

    minHeight: 70,

    marginRight: "2%",
    marginBottom: 8,

    paddingHorizontal: 12,

    borderRadius: 17,

    backgroundColor:
      "rgba(255,255,255,0.10)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.27)",

    flexDirection: "row",
    alignItems: "center",
  },

  priorityGlassActive: {
    backgroundColor:
      "rgba(30,164,239,0.20)",

    borderColor:
      "rgba(85,201,255,0.65)",
  },

  priorityIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  priorityTextLight: {
    color:
      "rgba(255,255,255,0.68)",
    fontSize: 10,
    fontWeight: "700",
  },

  priorityTextBlue: {
    color: "#FFFFFF",
    fontWeight: "900",
  },


  /* =======================================================
     AUTOMATIC PROFILE CARD (Step 4)
  ======================================================= */

  autoProfileCard: {
    marginTop: 18,
    marginBottom: 16,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(8, 20, 34, 0.75)",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.32)",
  },

  autoProfileHeader: {
    marginBottom: 4,
  },

  autoProfileBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 7,
    backgroundColor: "rgba(56, 189, 248, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.40)",
    marginBottom: 8,
  },

  autoProfileBadgeText: {
    color: "#38BDF8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  autoProfileTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  autoProfileSubtitle: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 12.5,
    lineHeight: 18,
  },

  autoProfileDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    marginVertical: 14,
  },

  autoPrioritiesHeader: {
    color: "rgba(255, 255, 255, 0.50)",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: "uppercase",
  },

  autoPrioritiesList: {
    gap: 8,
  },

  autoPriorityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },

  autoPriorityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  autoPriorityLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  autoPriorityCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
  },

  customizeToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    alignSelf: "center",
    marginBottom: 14,
  },

  customizeToggleText: {
    color: "#E0F2FE",
    fontSize: 12,
    fontWeight: "700",
  },

  /* Legacy fallback */
  readyCardGlass: {
    marginTop: 12,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.27)",
  },


  /* =======================================================
     BOTTOM GLASS
  ======================================================= */

  bottomGlass: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 13,

    backgroundColor:
      "rgba(5,20,32,0.58)",

    borderTopWidth: 1,
    borderTopColor:
      "rgba(255,255,255,0.22)",

    zIndex: 20,
  },

  bottomButton: {
    height: 55,
    borderRadius: 17,

    backgroundColor:
      "rgba(19,148,235,0.88)",

    borderWidth: 1,
    borderColor:
      "rgba(120,211,255,0.68)",

    paddingLeft: 19,
    paddingRight: 7,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bottomButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  bottomArrow: {
    width: 41,
    height: 41,
    borderRadius: 21,

    backgroundColor:
      "rgba(239,249,255,0.96)",

    alignItems: "center",
    justifyContent: "center",
  },

  bottomPrivacy: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  bottomPrivacyText: {
    color:
      "rgba(255,255,255,0.60)",
    fontSize: 8,
    marginLeft: 5,
  },

});