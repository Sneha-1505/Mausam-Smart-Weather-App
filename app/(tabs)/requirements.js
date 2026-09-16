import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMausam } from '../../src/context/MausamContext';
import {
  getWhatYouNeedToday,
  getClothingRecommendations,
  getOtherUsefulInfo,
} from '../../src/services/whatToCarry';
import { GlassCard } from '../../src/components/UI';

export default function RequirementsScreen() {
  const { weather, personaContext, profile, colors, isDark } = useMausam();
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'gear' | 'clothing' | 'env'

  const items = useMemo(() => {
    return getWhatYouNeedToday({ weather, personaContext, profile });
  }, [weather, personaContext, profile]);

  const clothing = useMemo(() => {
    return getClothingRecommendations({ weather, personaContext, profile });
  }, [weather, personaContext, profile]);

  const otherInfo = useMemo(() => {
    return getOtherUsefulInfo({ weather, personaContext });
  }, [weather, personaContext]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#090D14' : '#F6F4EE' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.kicker, { color: colors.accent }]}>LIVE WEATHER INTELLIGENCE</Text>
          <Text style={[styles.title, { color: colors.text }]}>What You Need Today</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tailored gear, clothing recommendations, and environmental safety for {profile?.location || 'your location'}.
          </Text>
        </View>

        {/* Category Navigation Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {[
            { id: 'all', label: 'All Recommendations', icon: 'sparkles' },
            { id: 'gear', label: 'Gear Essentials', icon: 'bag-handle' },
            { id: 'clothing', label: 'What to Wear', icon: 'shirt' },
            { id: 'env', label: 'Environment', icon: 'leaf' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: active
                      ? colors.accent
                      : isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(0, 0, 0, 0.05)',
                    borderColor: active
                      ? colors.accent
                      : isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.08)',
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={active ? '#090D14' : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabChipText,
                    {
                      color: active ? '#090D14' : colors.text,
                      fontWeight: active ? '800' : '600',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ========================================================
            SECTION 1: GEAR & ESSENTIALS (WHAT YOU NEED TODAY)
        ======================================================== */}
        {(activeTab === 'all' || activeTab === 'gear') && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="bag-handle-outline" size={18} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Gear & Safety Essentials</Text>
              </View>
              <Text style={[styles.sectionSubtitleBadge, { color: colors.textSecondary }]}>
                {items.length} items
              </Text>
            </View>

            {/* Requirements Grid */}
            <View style={styles.grid}>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.gridItem,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  onPress={() => setSelectedItem(item)}
                >
                  <View style={styles.iconWrapper}>
                    <Text style={styles.itemEmoji}>{item.icon}</Text>
                  </View>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemReasonSnippet, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.reason}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================
            SECTION 2: CLOTHING & ATTIRE RECOMMENDATIONS
        ======================================================== */}
        {(activeTab === 'all' || activeTab === 'clothing') && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="shirt-outline" size={18} color="#38BDF8" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Attire</Text>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: `${clothing.badgeColor}25`, borderColor: clothing.badgeColor }]}>
                <Text style={[styles.categoryBadgeText, { color: clothing.badgeColor }]}>
                  {clothing.category}
                </Text>
              </View>
            </View>

            {/* Outfit Hero Card */}
            <GlassCard style={styles.outfitHeroCard}>
              <View style={styles.outfitHeroHeader}>
                <View style={styles.outfitHeroIconWrap}>
                  <Text style={{ fontSize: 24 }}>👔</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.outfitHeroTitle, { color: colors.text }]}>
                    Today's Outfit Guidance
                  </Text>
                  <Text style={[styles.outfitHeroSummary, { color: colors.textSecondary }]}>
                    {clothing.summary}
                  </Text>
                </View>
              </View>

              {/* Best Fabrics */}
              <View style={styles.fabricsContainer}>
                <Text style={[styles.fabricsLabel, { color: colors.textSecondary }]}>
                  RECOMMENDED FABRICS:
                </Text>
                <View style={styles.fabricChipsRow}>
                  {clothing.fabrics.map((fabric, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.fabricChip,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                        },
                      ]}
                    >
                      <Ionicons name="checkmark-sharp" size={12} color="#38BDF8" style={{ marginRight: 4 }} />
                      <Text style={[styles.fabricChipText, { color: colors.text }]}>{fabric}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </GlassCard>

            {/* 4 Clothing Layer Breakdown (2x2 Grid) */}
            <View style={styles.clothingGrid}>
              {clothing.layers.map((layer, idx) => (
                <GlassCard key={idx} style={styles.clothingCard}>
                  <View style={styles.clothingCardTop}>
                    <View style={styles.clothingIconCircle}>
                      <Text style={{ fontSize: 22 }}>{layer.icon}</Text>
                    </View>
                    <View style={styles.layerTagBadge}>
                      <Text style={styles.layerTagBadgeText}>{layer.tag}</Text>
                    </View>
                  </View>

                  <Text style={[styles.layerTypeLabel, { color: colors.accent }]}>
                    {layer.type.toUpperCase()}
                  </Text>
                  <Text style={[styles.layerTitle, { color: colors.text }]} numberOfLines={2}>
                    {layer.title}
                  </Text>
                  <Text style={[styles.layerDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                    {layer.description}
                  </Text>
                </GlassCard>
              ))}
            </View>

            {/* Pro Dressing Tips */}
            {clothing.tips?.length > 0 && (
              <GlassCard style={styles.tipsCard}>
                <View style={styles.tipsHeaderRow}>
                  <Ionicons name="bulb-outline" size={16} color="#FBBF24" />
                  <Text style={[styles.tipsHeaderTitle, { color: '#FBBF24' }]}>Weather Dressing Tips</Text>
                </View>
                {clothing.tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipItemRow}>
                    <Text style={[styles.tipBullet, { color: colors.accent }]}>•</Text>
                    <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
                  </View>
                ))}
              </GlassCard>
            )}
          </View>
        )}

        {/* ========================================================
            SECTION 3: OTHER USEFUL INFO (ENVIRONMENT)
        ======================================================== */}
        {(activeTab === 'all' || activeTab === 'env') && otherInfo && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="leaf-outline" size={18} color="#4ADE80" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Environmental Diagnostics</Text>
              </View>
            </View>

            <GlassCard style={styles.infoCard}>
              {/* UV Index */}
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Text style={styles.rowIcon}>☀️</Text>
                  <Text style={[styles.infoRowLabel, { color: colors.text }]}>UV Index</Text>
                </View>
                <View style={styles.infoRowRight}>
                  <Text style={[styles.infoRowValue, { color: colors.text }]}>{otherInfo.uv.label}</Text>
                  <Text style={[styles.infoRowAdvice, { color: colors.textSecondary }]}>{otherInfo.uv.advice}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

              {/* Air Quality */}
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Text style={styles.rowIcon}>🌲</Text>
                  <Text style={[styles.infoRowLabel, { color: colors.text }]}>Air Quality</Text>
                </View>
                <View style={styles.infoRowRight}>
                  <Text style={[styles.infoRowValue, { color: colors.text }]}>{otherInfo.aqi.label}</Text>
                  <Text style={[styles.infoRowAdvice, { color: colors.textSecondary }]}>{otherInfo.aqi.advice}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

              {/* Humidity */}
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Text style={styles.rowIcon}>💧</Text>
                  <Text style={[styles.infoRowLabel, { color: colors.text }]}>Humidity</Text>
                </View>
                <View style={styles.infoRowRight}>
                  <Text style={[styles.infoRowValue, { color: colors.text }]}>{otherInfo.humidity.label}</Text>
                  <Text style={[styles.infoRowAdvice, { color: colors.textSecondary }]}>{otherInfo.humidity.advice}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

              {/* Visibility */}
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Text style={styles.rowIcon}>👁️</Text>
                  <Text style={[styles.infoRowLabel, { color: colors.text }]}>Visibility</Text>
                </View>
                <View style={styles.infoRowRight}>
                  <Text style={[styles.infoRowValue, { color: colors.text }]}>{otherInfo.visibility.label}</Text>
                  <Text style={[styles.infoRowAdvice, { color: colors.textSecondary }]}>{otherInfo.visibility.advice}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

              {/* Sunrise / Sunset */}
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Text style={styles.rowIcon}>🌅</Text>
                  <Text style={[styles.infoRowLabel, { color: colors.text }]}>Sunrise / Sunset</Text>
                </View>
                <View style={styles.infoRowRight}>
                  <Text style={[styles.infoRowValue, { color: colors.text }]}>{otherInfo.sun.label}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]} />

              {/* Moon Phase */}
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Text style={styles.rowIcon}>🌙</Text>
                  <Text style={[styles.infoRowLabel, { color: colors.text }]}>Moon Phase</Text>
                </View>
                <View style={styles.infoRowRight}>
                  <Text style={[styles.infoRowValue, { color: colors.text }]}>{otherInfo.moon.label}</Text>
                </View>
              </View>
            </GlassCard>
          </View>
        )}
      </ScrollView>

      {/* Item Detail Modal */}
      <Modal visible={!!selectedItem} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedItem(null)}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#141A24' : '#FFFFFF' }]}>
            {selectedItem && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalEmoji}>{selectedItem.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalItemTitle, { color: colors.text }]}>{selectedItem.name}</Text>
                    <Text style={[styles.modalPriority, { color: selectedItem.priority === 'high' ? '#F87171' : colors.accent }]}>
                      {selectedItem.priority === 'high' ? 'High Priority' : 'Recommended'}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSelectedItem(null)}>
                    <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
                  </Pressable>
                </View>

                <View style={styles.modalBody}>
                  <Text style={[styles.modalReasonTitle, { color: colors.textSecondary }]}>Why is this needed?</Text>
                  <Text style={[styles.modalReasonText, { color: colors.text }]}>{selectedItem.reason}</Text>

                  <Text style={[styles.modalWhyTitle, { color: colors.textSecondary, marginTop: 12 }]}>Details & Tip</Text>
                  <Text style={[styles.modalWhyText, { color: colors.textSecondary }]}>{selectedItem.why}</Text>
                </View>

                <Pressable
                  style={[styles.modalDismissBtn, { backgroundColor: colors.accent }]}
                  onPress={() => setSelectedItem(null)}
                >
                  <Text style={styles.modalDismissText}>Got it</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },

  /* Category Tab Scroll */
  tabScroll: {
    gap: 8,
    marginBottom: 20,
    paddingRight: 20,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 12,
  },

  /* Section Block */
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitleBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  /* Requirements Grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  itemReasonSnippet: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },

  /* Clothing Section Styling */
  outfitHeroCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  outfitHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  outfitHeroIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outfitHeroTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  outfitHeroSummary: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  fabricsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
  },
  fabricsLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  fabricChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  fabricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  fabricChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  clothingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  clothingCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
  },
  clothingCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  clothingIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerTagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  layerTagBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
  },
  layerTypeLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  layerTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    marginBottom: 4,
  },
  layerDesc: {
    fontSize: 11,
    lineHeight: 15,
  },

  tipsCard: {
    borderRadius: 18,
    padding: 14,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tipsHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  tipItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  tipBullet: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },

  /* Environmental Info */
  infoCard: {
    borderRadius: 20,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowIcon: {
    fontSize: 18,
  },
  infoRowLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRowRight: {
    alignItems: 'flex-end',
  },
  infoRowValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoRowAdvice: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    width: '100%',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalEmoji: {
    fontSize: 32,
  },
  modalItemTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalPriority: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  modalBody: {
    marginBottom: 20,
  },
  modalReasonTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalReasonText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  modalWhyTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modalWhyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalDismissBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalDismissText: {
    color: '#090D14',
    fontSize: 14,
    fontWeight: '700',
  },
});
