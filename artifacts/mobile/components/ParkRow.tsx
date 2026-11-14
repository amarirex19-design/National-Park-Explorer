import React from 'react';
import {
  Alert,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Park } from '@/data/parks';
import { useColors } from '@/hooks/useColors';

interface ParkRowProps {
  park: Park;
  saved: boolean;
  onOpen: () => void;
  onToggleSaved: () => Promise<void>;
}

export function formatCompact(value: number | null) {
  if (value === null) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}K`;
  return value.toLocaleString('en-US');
}

export function formatStates(states: string) {
  const stateList = states.split('|').filter(Boolean);
  if (stateList.length > 3) return `Across ${stateList.length} states`;
  return stateList.join(' · ');
}

export default function ParkRow({
  park,
  saved,
  onOpen,
  onToggleSaved,
}: ParkRowProps) {
  const colors = useColors();

  const handleToggleSaved = async (event: GestureResponderEvent) => {
    event.stopPropagation();
    await Haptics.selectionAsync();
    try {
      await onToggleSaved();
    } catch {
      Alert.alert('Could not update saved parks', 'Please try again.');
    }
  };

  return (
    <Pressable
      testID={`park-${park.park_code}`}
      accessibilityRole="button"
      accessibilityLabel={`Open ${park.name} details`}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
        <Feather name="map" size={19} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.type, { color: colors.primary }]} numberOfLines={1}>
          {park.unit_type.toUpperCase()}
        </Text>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
          {park.name}
        </Text>
        <View style={styles.meta}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {formatStates(park.states)}
          </Text>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {formatCompact(park.visitors_2025)} visits
          </Text>
        </View>
      </View>
      <Pressable
        testID={`save-${park.park_code}`}
        accessibilityRole="button"
        accessibilityLabel={saved ? `Remove ${park.name} from saved` : `Save ${park.name}`}
        hitSlop={10}
        onPress={handleToggleSaved}
        style={styles.saveButton}
      >
        <Feather
          name={saved ? 'bookmark' : 'bookmark'}
          size={19}
          color={saved ? colors.primary : colors.mutedForeground}
        />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 106,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  type: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1.1,
  },
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    flexShrink: 1,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  saveButton: {
    width: 34,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
