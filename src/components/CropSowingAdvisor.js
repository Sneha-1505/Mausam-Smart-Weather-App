import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMausam } from '../context/MausamContext';
import { analyzeSowingSuitability } from '../services/cropAdvisor';
import { CROP_RULES } from '../data/cropRules';
import { GlassCard } from './UI';

const CROP_OPTIONS = [
  { id: 'wheat', label: 'Wheat (गेहूं / ਕਣਕ)' },
  { id: 'rice', label: 'Rice (चावल / ਝੋਨਾ)' },
  { id: 'maize', label: 'Maize (मक्का / ਮੱਕੀ)' },
  { id: 'cotton', label: 'Cotton (कपास / ਨਰਮਾ)' },
  { id: 'mustard', label: 'Mustard (सरसों / ਸਰ੍ਹੋਂ)' },
  { id: 'potato', label: 'Potato (आलू / ਆਲੂ)' },
  { id: 'sugarcane', label: 'Sugarcane (गन्ना / ਗੰਨਾ)' },
  { id: 'pulses', label: 'Pulses (दालें / ਦਾਲਾਂ)' },
  { id: 'vegetables', label: 'Vegetables (सब्जियां / ਸਬਜ਼ੀਆਂ)' },
  { id: 'other', label: 'Other (अन्य / ਹੋਰ)' },
];

export default function CropSowingAdvisor({ compact = false }) {
  const { weather, personaContext, profile, updateProfile, colors, isDark } = useMausam();
  const [selectedCrop, setSelectedCrop] = useState(profile?.selectedCrop || 'wheat');
  const [customCropName, setCustomCropName] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSelectCrop = (cropId) => {
    setSelectedCrop(cropId);
    updateProfile({ selectedCrop: cropId });
    setShowPicker(false);
  };

  const analysis = useMemo(() => {
    return analyzeSowingSuitability(selectedCrop, weather, personaContext, profile);
  }, [selectedCrop, weather, personaContext, profile]);

  const activeCropLabel = useMemo(() => {
    if (selectedCrop === 'other' && customCropName) {
      return customCropName;
    }
    const found = CROP_OPTIONS.find((c) => c.id === selectedCrop);
    return found ? found.label.split(' (')[0] : 'Wheat';
  }, [selectedCrop, customCropName]);

  const getStatusColor = (st) => {
    if (st === 'good' || st === 'suitable') return '#4ADE80';
    if (st === 'wait' || st === 'caution') return '#FBBF24';
    return '#F87171';
  };

  return (
    <GlassCard style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.kicker}>🌾 FARMER ADVISOR</Text>
          <Text style={[styles.title, { color: colors.text }]}>🌱 Crop Sowing Advisor</Text>
        </View>
        <Pressable
          style={[styles.cropSelectorBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderColor: colors.accent }]}
          onPress={() => setShowPicker(true)}
        >
          <Text style={[styles.cropSelectorText, { color: colors.text }]}>{activeCropLabel}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.accent} />
        </Pressable>
      </View>

      {selectedCrop === 'other' && (
        <View style={styles.customCropContainer}>
          <TextInput
            placeholder="Enter crop name..."
            placeholderTextColor={colors.textSecondary}
            value={customCropName}
            onChangeText={setCustomCropName}
            style={[styles.customCropInput, { color: colors.text, borderColor: colors.border }]}
          />
        </View>
      )}

      {/* Main Status Badge */}
      <View style={[styles.statusBanner, { backgroundColor: getStatusColor(analysis.status) + '1A', borderColor: getStatusColor(analysis.status) + '44' }]}>
        <Text style={styles.statusEmoji}>{analysis.statusEmoji}</Text>
        <View style={styles.statusTextContainer}>
          <Text style={[styles.statusTitle, { color: getStatusColor(analysis.status) }]}>
            {analysis.statusLabel}
          </Text>
          <Text style={[styles.statusSub, { color: colors.textSecondary }]}>
            {analysis.recommendedAction}
          </Text>
        </View>
      </View>

      {/* Factors Summary */}
      <View style={styles.factorsList}>
        {analysis.factors.map((factor, idx) => (
          <View key={idx} style={[styles.factorRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
            <View style={styles.factorLeft}>
              <Text style={styles.factorIcon}>{factor.icon}</Text>
              <Text style={[styles.factorName, { color: colors.text }]}>{factor.name}</Text>
            </View>
            <View style={styles.factorRight}>
              <Text style={[styles.factorValue, { color: colors.textSecondary }]}>{factor.value}</Text>
              <Text style={[styles.factorStatus, { color: getStatusColor(factor.status) }]}>
                {factor.status === 'suitable' ? '✓ Suitable' : factor.status === 'caution' ? '⚠ Caution' : '✕ Unsuitable'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Best Window Notice */}
      {analysis.bestUpcomingWindow && (
        <View style={[styles.windowBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
          <View style={styles.windowHeader}>
            <Ionicons name="time-outline" size={16} color={colors.accent} />
            <Text style={[styles.windowTitle, { color: colors.accent }]}>Potential Sowing Window</Text>
          </View>
          <Text style={[styles.windowTime, { color: colors.text }]}>
            {analysis.bestUpcomingWindow.date} at {analysis.bestUpcomingWindow.time}
          </Text>
          <Text style={[styles.windowReasons, { color: colors.textSecondary }]}>
            ✓ {analysis.bestUpcomingWindow.reasons.join('  •  ✓ ')}
          </Text>
        </View>
      )}

      {/* Action to Toggle Details */}
      <Pressable
        style={[styles.detailsBtn, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}
        onPress={() => setShowDetails(true)}
      >
        <Text style={[styles.detailsBtnText, { color: colors.accent }]}>View Detailed Agricultural Analysis</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.accent} />
      </Pressable>

      <Text style={[styles.disclaimer, { color: colors.textMuted || '#8E9BAE' }]}>
        {analysis.disclaimer}
      </Text>

      {/* Crop Picker Modal */}
      <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#141A24' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Your Crop</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {CROP_OPTIONS.map((c) => (
                <Pressable
                  key={c.id}
                  style={[
                    styles.modalOption,
                    selectedCrop === c.id && { backgroundColor: colors.accent + '22' }
                  ]}
                  onPress={() => handleSelectCrop(c.id)}
                >
                  <Text style={[styles.modalOptionText, { color: colors.text }]}>{c.label}</Text>
                  {selectedCrop === c.id && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Detailed Analysis Modal */}
      <Modal visible={showDetails} transparent animationType="slide" onRequestClose={() => setShowDetails(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.detailedModalBox, { backgroundColor: isDark ? '#121822' : '#FFFFFF' }]}>
            <View style={styles.detailedHeader}>
              <Text style={[styles.detailedModalTitle, { color: colors.text }]}>
                🌱 {activeCropLabel} Sowing Analysis
              </Text>
              <Pressable onPress={() => setShowDetails(false)}>
                <Ionicons name="close-circle" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={[styles.sectionHeading, { color: colors.accent }]}>Agricultural Guidelines</Text>
              <Text style={[styles.guidanceText, { color: colors.textSecondary }]}>
                {CROP_RULES[selectedCrop]?.guidance || CROP_RULES.other.guidance}
              </Text>

              <Text style={[styles.sectionHeading, { color: colors.accent, marginTop: 16 }]}>Factor Details</Text>
              {analysis.factors.map((f, i) => (
                <View key={i} style={styles.detailedFactorItem}>
                  <Text style={[styles.detailedFactorName, { color: colors.text }]}>
                    {f.icon} {f.name}: <Text style={{ color: getStatusColor(f.status) }}>{f.value}</Text>
                  </Text>
                  <Text style={[styles.detailedFactorDetail, { color: colors.textSecondary }]}>
                    {f.detail}
                  </Text>
                </View>
              ))}

              <Text style={[styles.disclaimer, { color: colors.textMuted || '#8E9BAE', marginTop: 20 }]}>
                {analysis.disclaimer}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  cropSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  cropSelectorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  customCropContainer: {
    marginBottom: 12,
  },
  customCropInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusEmoji: {
    fontSize: 26,
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  factorsList: {
    marginBottom: 14,
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  factorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorIcon: {
    fontSize: 16,
  },
  factorName: {
    fontSize: 13,
    fontWeight: '600',
  },
  factorRight: {
    alignItems: 'flex-end',
  },
  factorValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  factorStatus: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  windowBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  windowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  windowTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  windowTime: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  windowReasons: {
    fontSize: 11,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    marginBottom: 8,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 2,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailedModalBox: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    padding: 20,
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailedModalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  guidanceText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  detailedFactorItem: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  detailedFactorName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailedFactorDetail: {
    fontSize: 12,
    lineHeight: 16,
  },
});
