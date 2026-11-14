import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const STORAGE_KEY = 'national-parks-explorer:saved:v1';

interface SavedParksContextValue {
  savedCodes: string[];
  isReady: boolean;
  loadError: boolean;
  toggleSavedPark: (parkCode: string) => Promise<void>;
}

const SavedParksContext = createContext<SavedParksContextValue | null>(null);

export function SavedParksProvider({ children }: { children: ReactNode }) {
  const [savedCodes, setSavedCodes] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const savedCodesRef = useRef<string[]>([]);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((storedValue) => {
        if (!mounted || !storedValue) return;
        const parsed: unknown = JSON.parse(storedValue);
        if (Array.isArray(parsed) && parsed.every((value) => typeof value === 'string')) {
          savedCodesRef.current = parsed;
          setSavedCodes(parsed);
        }
      })
      .catch(() => {
        if (mounted) setLoadError(true);
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleSavedPark = useCallback(
    async (parkCode: string) => {
      if (!isReady) return;
      const previous = savedCodesRef.current;
      const next = previous.includes(parkCode)
        ? previous.filter((code) => code !== parkCode)
        : [...previous, parkCode];

      savedCodesRef.current = next;
      setSavedCodes(next);

      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        savedCodesRef.current = previous;
        setSavedCodes(previous);
        throw error;
      }
    },
    [isReady],
  );

  const value = useMemo(
    () => ({ savedCodes, isReady, loadError, toggleSavedPark }),
    [savedCodes, isReady, loadError, toggleSavedPark],
  );

  return (
    <SavedParksContext.Provider value={value}>
      {children}
    </SavedParksContext.Provider>
  );
}

export function useSavedParks() {
  const context = useContext(SavedParksContext);
  if (!context) {
    throw new Error('useSavedParks must be used inside SavedParksProvider');
  }
  return context;
}
