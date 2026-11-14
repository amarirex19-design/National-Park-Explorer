import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ParkRow from '@/components/ParkRow';
import { useSavedParks } from '@/context/SavedParksContext';
import { PARKS } from '@/data/parks';
import { useColors } from '@/hooks/useColors';

export default function SavedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { savedCodes, isReady, loadError, toggleSavedPark } = useSavedParks();
  const savedParks = PARKS.filter((park) => savedCodes.includes(park.park_code)).sort(
    (first, second) => first.name.localeCompare(second.name),
  );
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = Platform.OS === 'web' ? 118 : insets.bottom + 96;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: topInset + 16, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconMark, { backgroundColor: colors.secondary }]}>
          <Feather name="bookmark" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>YOUR FIELD NOTES</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Saved places</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Keep the places you want to come back to close by.
        </Text>

        {loadError ? (
          <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="alert-circle" size={22} color={colors.destructive} />
            <Text style={[styles.messageTitle, { color: colors.foreground }]}>Saved places could not load</Text>
            <Text style={[styles.messageCopy, { color: colors.mutedForeground }]}>
              Your saved list is stored on this device. Please restart the app and try again.
            </Text>
          </View>
        ) : !isReady ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.messageCopy, { color: colors.mutedForeground }]}>Loading your saved places…</Text>
          </View>
        ) : savedParks.length > 0 ? (
          <>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {savedParks.length} {savedParks.length === 1 ? 'place' : 'places'}
            </Text>
            {savedParks.map((park) => (
              <ParkRow
                key={park.park_code}
                park={park}
                saved
                onOpen={() =>
                  router.push({
                    pathname: '/park/[code]',
                    params: { code: park.park_code },
                  })
                }
                onToggleSaved={() => toggleSavedPark(park.park_code)}
              />
            ))}
          </>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="bookmark" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your list starts here</Text>
            <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>
              Save parks and places as you explore, and they’ll be waiting for you here.
            </Text>
            <Pressable
              testID="browse-parks"
              accessibilityRole="button"
              onPress={() => router.navigate('/')}
              style={({ pressed }) => [
                styles.browseButton,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.browseText, { color: colors.primaryForeground }]}>Explore places</Text>
              <Feather name="arrow-right" size={16} color={colors.primaryForeground} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  iconMark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  kicker: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 31,
    letterSpacing: -1,
    marginTop: 5,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 27,
  },
  count: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    marginBottom: 10,
  },
  loading: {
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  messageCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    gap: 9,
  },
  messageTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    textAlign: 'center',
  },
  messageCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 29,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  emptyCopy: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 250,
    marginTop: 7,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
  },
  browseText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  pressed: { opacity: 0.82 },
});
