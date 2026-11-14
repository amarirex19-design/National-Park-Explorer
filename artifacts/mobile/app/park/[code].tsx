import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSavedParks } from '@/context/SavedParksContext';
import { PARKS } from '@/data/parks';
import { useColors } from '@/hooks/useColors';
import { formatCompact, formatStates } from '@/components/ParkRow';

export default function ParkDetailsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { savedCodes, isReady, toggleSavedPark } = useSavedParks();
  const park = PARKS.find((item) => item.park_code === code);
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const isSaved = park ? savedCodes.includes(park.park_code) : false;

  const handleSave = async () => {
    if (!park || !isReady) return;
    await Haptics.selectionAsync();
    try {
      await toggleSavedPark(park.park_code);
    } catch {
      Alert.alert('Could not update saved parks', 'Please try again.');
    }
  };

  const openDirections = async () => {
    if (!park || park.latitude === null || park.longitude === null) return;
    const query = encodeURIComponent(`${park.latitude},${park.longitude}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open directions', 'Please try again from your maps app.');
    }
  };

  if (!park) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background, paddingTop: topInset + 20 }]}>
        <Feather name="map" size={30} color={colors.mutedForeground} />
        <Text style={[styles.missingTitle, { color: colors.foreground }]}>Place not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={[styles.backLinkText, { color: colors.primary }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const heroImage =
    park.park_code === 'acad'
      ? require('../../assets/images/acadia-coast.jpg')
      : park.park_code === 'arch'
        ? require('../../assets/images/arches-desert.jpg')
        : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomInset + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.cover, { paddingTop: topInset + 10 }]}>
          {heroImage ? (
            <ImageBackground
              source={heroImage}
              resizeMode="cover"
              style={StyleSheet.absoluteFill}
            >
              <LinearGradient
                colors={['transparent', colors.primary]}
                locations={[0.3, 1]}
                style={StyleSheet.absoluteFill}
              />
            </ImageBackground>
          ) : (
            <LinearGradient
              colors={[colors.primary, colors.secondaryForeground]}
              style={StyleSheet.absoluteFill}
            >
              <View style={[styles.orbit, { borderColor: colors.primaryForeground }]} />
              <Feather name="compass" size={88} color={colors.accent} style={styles.coverCompass} />
            </LinearGradient>
          )}
          <View style={styles.coverToolbar}>
            <Pressable
              testID="park-back"
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={styles.toolbarButton}
            >
              <Feather name="arrow-left" size={22} color={colors.primaryForeground} />
            </Pressable>
            <Text style={[styles.coverEyebrow, { color: colors.primaryForeground }]}>PARK FIELD GUIDE</Text>
            <Pressable
              testID={`detail-save-${park.park_code}`}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? 'Remove from saved places' : 'Save this place'}
              disabled={!isReady}
              onPress={handleSave}
              style={styles.toolbarButton}
            >
              {!isReady ? (
                <ActivityIndicator color={colors.primaryForeground} size="small" />
              ) : (
                <Feather
                  name={isSaved ? 'bookmark' : 'bookmark'}
                  size={21}
                  color={isSaved ? colors.accent : colors.primaryForeground}
                />
              )}
            </Pressable>
          </View>
          <View style={styles.coverBottom}>
            <Text style={[styles.coverType, { color: colors.accent }]}>{park.unit_type.toUpperCase()}</Text>
            <Text style={[styles.coverTitle, { color: colors.primaryForeground }]} numberOfLines={3}>
              {park.name}
            </Text>
            <View style={styles.coverLocation}>
              <Feather name="map-pin" size={14} color={colors.primaryForeground} />
              <Text style={[styles.coverLocationText, { color: colors.primaryForeground }]}>
                {formatStates(park.states)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.dataNote}>
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[styles.dataNoteText, { color: colors.mutedForeground }]}>
              Quick facts from the supplied 2025 dataset
            </Text>
          </View>

          <View style={[styles.statsPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <DetailStat value={formatCompact(park.visitors_2025)} label="2025 visits" />
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <DetailStat value={park.bird_species === null ? '—' : park.bird_species.toLocaleString('en-US')} label="bird species" />
            <View style={[styles.statsDivider, { backgroundColor: colors.border }]} />
            <DetailStat value={String(park.alerts_active)} label="active alerts" />
          </View>

          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Plan with the essentials</Text>
          <View style={[styles.essentialsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <EssentialRow label="Timed entry required" value={park.timed_entry_required} />
            <EssentialRow label="Entrance fees" value={park.has_entrance_fees} />
            <EssentialRow label="Dark sky certified" value={park.dark_sky_certified} />
            <EssentialRow label="Fee-free status" value={park.fee_free} last />
          </View>

          {park.alerts_active > 0 ? (
            <View style={[styles.alertCard, { backgroundColor: colors.secondary }]}>
              <Feather name="alert-circle" size={18} color={colors.secondaryForeground} />
              <View style={styles.alertCopy}>
                <Text style={[styles.alertTitle, { color: colors.secondaryForeground }]}>
                  {park.alerts_active} active {park.alerts_active === 1 ? 'alert' : 'alerts'} listed
                </Text>
                <Text style={[styles.alertText, { color: colors.secondaryForeground }]}>
                  Check current park notices before your visit.
                </Text>
              </View>
            </View>
          ) : null}

          <Pressable
            testID="open-directions"
            accessibilityRole="button"
            onPress={openDirections}
            style={({ pressed }) => [
              styles.directionsButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Feather name="navigation" size={17} color={colors.primaryForeground} />
            <Text style={[styles.directionsText, { color: colors.primaryForeground }]}>Open directions</Text>
            <Feather name="arrow-up-right" size={16} color={colors.primaryForeground} />
          </Pressable>

          <Text style={[styles.sourceCaption, { color: colors.mutedForeground }]}>
            Facts reflect the attached dataset and may change. Confirm current conditions with the park before traveling.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailStat({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  return (
    <View style={styles.detailStat}>
      <Text style={[styles.detailStatValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.detailStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function EssentialRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: boolean;
  last?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.essentialRow,
        !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <Text style={[styles.essentialLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.essentialValue}>
        <Feather
          name={value ? 'check' : 'minus'}
          size={15}
          color={value ? colors.primary : colors.mutedForeground}
        />
        <Text style={[styles.essentialText, { color: value ? colors.primary : colors.mutedForeground }]}>
          {value ? 'Yes' : 'No'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  cover: {
    height: 348,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  coverToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarButton: {
    width: 38,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEyebrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1.2,
  },
  coverBottom: { gap: 6 },
  coverType: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1.1,
  },
  coverTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.8,
  },
  coverLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  coverLocationText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  orbit: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderWidth: 1,
    borderRadius: 120,
    opacity: 0.16,
    top: 10,
    right: -60,
  },
  coverCompass: {
    position: 'absolute',
    top: 84,
    right: 40,
    opacity: 0.9,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 17,
  },
  dataNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
  },
  dataNoteText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
  },
  statsPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 17,
  },
  detailStat: { flex: 1, alignItems: 'center', gap: 4 },
  detailStatValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  detailStatLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    textAlign: 'center',
  },
  statsDivider: {
    width: 1,
    height: 29,
  },
  sectionHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
    marginTop: 26,
    marginBottom: 12,
  },
  essentialsCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
  },
  essentialRow: {
    minHeight: 51,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  essentialLabel: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  essentialValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  essentialText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  alertCopy: { flex: 1, gap: 3 },
  alertTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  alertText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
  },
  directionsButton: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
  },
  directionsText: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  sourceCaption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 13,
    paddingHorizontal: 6,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  missingTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
  },
  backLink: { padding: 10 },
  backLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  pressed: { opacity: 0.82 },
});
