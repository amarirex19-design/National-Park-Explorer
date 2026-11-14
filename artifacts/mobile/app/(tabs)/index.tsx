import React, { useMemo, useState } from 'react';
import {
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PARKS } from '@/data/parks';
import { useColors } from '@/hooks/useColors';
import { useSavedParks } from '@/context/SavedParksContext';
import ParkRow, { formatCompact } from '@/components/ParkRow';

const FEATURE_CODES = ['acad', 'arch'];
const FEATURE_COPY: Record<string, { label: string; note: string }> = {
  acad: { label: 'SEA & GRANITE', note: 'Where the mountains meet the Atlantic' },
  arch: { label: 'RED ROCK COUNTRY', note: 'A landscape shaped by time' },
};

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { savedCodes, toggleSavedPark } = useSavedParks();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [alphabetical, setAlphabetical] = useState(false);

  const stateCount = useMemo(
    () => new Set(PARKS.flatMap((park) => park.states.split('|').filter(Boolean))).size,
    [],
  );
  const totalVisits = useMemo(
    () => PARKS.reduce((total, park) => total + (park.visitors_2025 ?? 0), 0),
    [],
  );
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(PARKS.map((park) => park.unit_type))).sort()],
    [],
  );
  const filteredParks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const results = PARKS.filter((park) => {
      const matchesType = activeType === 'All' || park.unit_type === activeType;
      const matchesQuery =
        !query ||
        `${park.name} ${park.designation} ${park.unit_type} ${park.states}`
          .toLowerCase()
          .includes(query);
      return matchesType && matchesQuery;
    });

    return results.sort((first, second) =>
      alphabetical
        ? first.name.localeCompare(second.name)
        : (second.visitors_2025 ?? 0) - (first.visitors_2025 ?? 0),
    );
  }, [activeType, alphabetical, search]);

  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = Platform.OS === 'web' ? 118 : insets.bottom + 96;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 10, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandLine}>
          <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
            <Feather name="compass" size={15} color={colors.primaryForeground} />
          </View>
          <Text style={[styles.brand, { color: colors.mutedForeground }]}>
            FIELD NOTES  /  PARKS & PLACES
          </Text>
          <View style={styles.brandSpacer} />
          <Text
            style={[
              styles.dataBadge,
              { backgroundColor: colors.secondary, color: colors.secondaryForeground },
            ]}
          >
            2025 DATA
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          Find your{'\n'}next outside.
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          A pocket guide to {PARKS.length} parks and historic places across {stateCount} states.
        </Text>

        <View style={styles.statsRow}>
          <Stat value={String(PARKS.length)} label="places" />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Stat value={String(stateCount)} label="states" />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Stat value={formatCompact(totalVisits)} label="visits in 2025" />
        </View>

        <View style={styles.sectionTop}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            START WITH A SCENIC FAVORITE
          </Text>
          <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featureList}
        >
          {FEATURE_CODES.map((code) => {
            const park = PARKS.find((item) => item.park_code === code);
            if (!park) return null;
            const feature = FEATURE_COPY[code];
            const image =
              code === 'acad'
                ? require('../../assets/images/acadia-coast.jpg')
                : require('../../assets/images/arches-desert.jpg');

            return (
              <Pressable
                key={code}
                testID={`feature-${code}`}
                accessibilityRole="button"
                accessibilityLabel={`Explore ${park.name}`}
                onPress={() =>
                  router.push({
                    pathname: '/park/[code]',
                    params: { code: park.park_code },
                  })
                }
                style={({ pressed }) => [styles.featureCard, pressed && styles.pressed]}
              >
                <ImageBackground
                  source={image}
                  resizeMode="cover"
                  style={styles.featureImage}
                  imageStyle={styles.featureImageRound}
                >
                  <LinearGradient
                    colors={['transparent', colors.primary]}
                    locations={[0.12, 1]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureLabel, { color: colors.accent }]}>
                      {feature.label}
                    </Text>
                    <Text
                      style={[styles.featureTitle, { color: colors.primaryForeground }]}
                      numberOfLines={2}
                    >
                      {park.name}
                    </Text>
                    <Text
                      style={[styles.featureNote, { color: colors.primaryForeground }]}
                      numberOfLines={1}
                    >
                      {feature.note}
                    </Text>
                  </View>
                  <View style={[styles.featureArrow, { backgroundColor: colors.card }]}>
                    <Feather name="arrow-up-right" size={16} color={colors.primary} />
                  </View>
                </ImageBackground>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.exploreHeading}>
          <View>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              THE FIELD GUIDE
            </Text>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Explore places
            </Text>
          </View>
          <Pressable
            testID="sort-parks"
            accessibilityRole="button"
            accessibilityLabel={alphabetical ? 'Sort by popularity' : 'Sort alphabetically'}
            onPress={() => setAlphabetical((value) => !value)}
            style={styles.sortButton}
          >
            <Feather name="sliders" size={14} color={colors.primary} />
            <Text style={[styles.sortText, { color: colors.primary }]}>
              {alphabetical ? 'A–Z' : 'Popular'}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            testID="park-search"
            accessibilityLabel="Search parks by name, state, or type"
            value={search}
            onChangeText={setSearch}
            placeholder="Search a park, state, or type"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
            autoCorrect={false}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 ? (
            <Pressable
              testID="clear-search"
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch('')}
              hitSlop={8}
              style={styles.clearButton}
            >
              <Feather name="x" size={17} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const selected = activeType === category;
            return (
              <Pressable
                key={category}
                testID={`category-${category}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setActiveType(category)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: selected ? colors.primaryForeground : colors.secondaryForeground },
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
          {filteredParks.length} {filteredParks.length === 1 ? 'place' : 'places'}
          {activeType !== 'All' ? ` · ${activeType}` : ''}
        </Text>
        {filteredParks.length > 0 ? (
          filteredParks.map((park) => (
            <ParkRow
              key={park.park_code}
              park={park}
              saved={savedCodes.includes(park.park_code)}
              onOpen={() =>
                router.push({
                  pathname: '/park/[code]',
                  params: { code: park.park_code },
                })
              }
              onToggleSaved={() => toggleSavedPark(park.park_code)}
            />
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={24} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No places found</Text>
            <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
              Try another name, state, or category.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  brandLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  brandMark: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1.15,
  },
  brandSpacer: {
    flex: 1,
  },
  dataBadge: {
    overflow: 'hidden',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    lineHeight: 41,
    letterSpacing: -1.6,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 310,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: 29,
    marginRight: 16,
  },
  sectionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1.15,
  },
  featureList: {
    gap: 12,
    paddingRight: 20,
    marginBottom: 28,
  },
  featureCard: {
    width: 262,
    height: 188,
    borderRadius: 22,
  },
  featureImage: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 22,
  },
  featureImageRound: {
    borderRadius: 22,
  },
  featureContent: {
    padding: 16,
    paddingRight: 42,
    gap: 4,
  },
  featureLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    letterSpacing: 1.1,
  },
  featureTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 19,
    lineHeight: 23,
  },
  featureNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    opacity: 0.9,
  },
  featureArrow: {
    position: 'absolute',
    right: 12,
    bottom: 13,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 23,
    letterSpacing: -0.6,
    marginTop: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sortText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  searchBox: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 11,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  clearButton: {
    padding: 2,
  },
  categoryList: {
    gap: 8,
    paddingVertical: 12,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  categoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  resultCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    marginBottom: 9,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  emptyCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
