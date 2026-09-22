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
    background: '#F8F5F1',
    surface: '#FFFFFF',
    sidebar: '#EEECE9',
    text: '#292522',
    muted: '#68615C',
    accent: '#A82302',
    accentSoft: 'rgba(255,255,255,0.5)',
    rose: '#292522',
    border: 'rgba(255,255,255,0.5)',
    error: '#AD3549',
    glass: 'rgba(255,255,255,0.34)',
    glassBorder: 'rgba(255,255,255,0.55)',
  },
  dark: {
    background: '#11100F',
    surface: '#23211F',
    sidebar: '#181716',
    text: '#F1ECE5',
    muted: '#AAA29A',
    accent: '#F79A22',
    accentSoft: 'rgba(255,255,255,0.06)',
    rose: '#F1ECE5',
    border: 'rgba(255,255,255,0.12)',
    error: '#FFA7B6',
    glass: 'rgba(25,23,22,0.5)',
    glassBorder: 'rgba(255,255,255,0.12)',
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
          backdropFilter: dark ? 'blur(15px)' : 'blur(20px) saturate(120%)',
          WebkitBackdropFilter: dark ? 'blur(15px)' : 'blur(20px) saturate(120%)',
          backgroundImage: 'none',
          boxShadow: dark
            ? '0 6px 18px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'
            : '0 10px 30px rgba(45,35,30,0.05), inset 0 1px 0 rgba(255,255,255,0.70)',
        }
      : {};
  return {
    backgroundColor: active
      ? dark
        ? 'rgba(55,52,49,0.65)'
        : 'rgba(255,255,255,0.52)'
      : colors.glass,
    borderColor: colors.glassBorder,
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
                  ? '0 6px 18px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)'
                  : '0 10px 30px rgba(45,35,30,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
              }
            : {}),
        }
      : {};
  return {
    transform: [{scale: focused && !reduceMotion ? scale : 1}],
    ...(focused
      ? {
          borderColor: dark ? '#F1ECE5' : colors.text,
          backgroundColor: dark
            ? 'rgba(45,43,40,0.8)'
            : 'rgba(255,255,255,0.52)',
          zIndex: 2,
          elevation: 8,
        }
      : {}),
    ...web,
  };
}
