import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Platform,
  useColorScheme,
  ViewStyle,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';
const palettes = {
  light: {
    background: '#F6F5F5',
    surface: '#FFFFFF',
    sidebar: '#EEEAEA',
    text: '#302829',
    muted: '#6A5D60',
    accent: '#934F57',
    accentSoft: '#EEDFE0',
    rose: '#934F57',
    border: '#E2DADB',
    error: '#AD3549',
    glass: 'rgba(255,255,255,0.58)',
    glassBorder: 'rgba(255,255,255,0.55)',
  },
  dark: {
    background: '#141315',
    surface: '#2B2628',
    sidebar: '#211E20',
    text: '#F7F1F2',
    muted: '#D0C4C7',
    accent: '#D4A0A4',
    accentSoft: '#493438',
    rose: '#D4A0A4',
    border: '#4B3D41',
    error: '#FFA7B6',
    glass: 'rgba(36,29,32,0.72)',
    glassBorder: 'rgba(255,255,255,0.20)',
  },
};
export type Colors = typeof palettes.light;
const key = 'planoramic.appearance';
const ThemeContext = createContext<{
  mode: ThemeMode;
  dark: boolean;
  colors: Colors;
  setMode: (mode: ThemeMode) => void;
  storageError: string;
  reduceMotion: boolean;
  flameText: boolean;
  setFlameText: (enabled: boolean) => void;
}>({
  mode: 'system',
  dark: false,
  colors: palettes.light,
  setMode: () => {},
  storageError: '',
  reduceMotion: true,
  flameText: true,
  setFlameText: () => {},
});

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [flameText, setFlameText] = useState(true);
  const system = useColorScheme();
  const [mode, updateMode] = useState<ThemeMode>('system');
  const [storageError, setStorageError] = useState('');
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let active = true;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (active) setReduceMotion(value);
      })
      .catch(() => {});
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  const changed = useRef(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const saved =
          Platform.OS === 'web'
            ? localStorage.getItem(key)
            : await SecureStore.getItemAsync(key);
        if (
          active &&
          !changed.current &&
          ['light', 'dark', 'system'].includes(saved || '')
        )
          updateMode(saved as ThemeMode);
      } catch {
        if (active)
          setStorageError('Appearance will only be saved for this session.');
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const setMode = (value: ThemeMode) => {
    changed.current = true;
    updateMode(value);
    writes.current = writes.current.then(async () => {
      try {
        if (Platform.OS === 'web') localStorage.setItem(key, value);
        else await SecureStore.setItemAsync(key, value);
        setStorageError('');
      } catch {
        setStorageError('Appearance will only be saved for this session.');
      }
    });
  };
  const dark = mode === 'dark' || (mode === 'system' && system === 'dark');
  return (
    <ThemeContext.Provider
      value={{
        mode,
        dark,
        colors: palettes[dark ? 'dark' : 'light'],
        setMode,
        storageError,
        reduceMotion,
        flameText,
        setFlameText,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

export function glassStyle(
  colors: Colors,
  dark: boolean,
  active = false,
): ViewStyle {
  const web =
    Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          backgroundImage: dark
            ? 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.01) 42%, rgba(212,160,164,0.05) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.18) 42%, rgba(147,79,87,0.08) 100%)',
          boxShadow: dark
            ? '0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.20), inset 1px 0 0 rgba(255,255,255,0.08)'
            : '0 8px 20px rgba(80,34,42,0.10), inset 0 1px 0 rgba(255,255,255,0.6), inset 1px 0 0 rgba(255,255,255,0.25)',
        }
      : {};
  return {
    backgroundColor: active
      ? dark
        ? 'rgba(212,160,164,0.18)'
        : 'rgba(147,79,87,0.14)'
      : dark
        ? colors.glass
        : 'rgba(255,255,255,0.22)',
    borderColor: dark ? colors.glassBorder : 'rgba(170,115,125,0.35)',
    borderWidth: 1,
    ...web,
  };
}

export function focusStyle(
  colors: Colors,
  dark: boolean,
  focused: boolean,
  reduceMotion: boolean,
  scale = 1.05,
): ViewStyle {
  const web =
    Platform.OS === 'web'
      ? {
          transition: reduceMotion
            ? 'none'
            : 'transform 160ms ease-out, box-shadow 160ms ease-out',
          ...(focused
            ? {
                boxShadow: dark
                  ? '0 0 12px rgba(212,160,164,0.20), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)'
                  : '0 0 10px rgba(147,79,87,0.18), 0 6px 18px rgba(80,34,42,0.12), inset 0 1px 0 white',
              }
            : {}),
        }
      : {};
  return {
    transform: [{scale: focused && !reduceMotion ? scale : 1}],
    ...(focused
      ? {
          borderColor: dark ? '#FFF0F2' : colors.accent,
          backgroundColor: dark
            ? 'rgba(64,35,41,0.95)'
            : 'rgba(247,225,228,0.95)',
          zIndex: 2,
          elevation: 8,
        }
      : {}),
    ...web,
  };
}
