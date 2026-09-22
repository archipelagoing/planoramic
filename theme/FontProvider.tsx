import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Platform} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const fontOptions = [
  {id: 'montserrat', label: 'Montserrat', family: 'Montserrat_500Medium'},
  {
    id: 'instrument',
    label: 'Instrument Serif',
    family: 'InstrumentSerif_400Regular',
  },
  {
    id: 'garamond',
    label: 'Cormorant Garamond',
    family: 'CormorantGaramond_500Medium',
  },
  {
    id: 'infant',
    label: 'Cormorant Infant',
    family: 'CormorantInfant_500Medium',
  },
  {
    id: 'averia-light',
    label: 'Averia Light',
    family: 'AveriaSerifLibre_300Light',
  },
] as const;
type FontId = (typeof fontOptions)[number]['id'];
const key = 'planoramic.font';
const valid = (value: string | null): value is FontId =>
  fontOptions.some(font => font.id === value);
const Context = createContext({
  font: 'montserrat' as FontId,
  family: 'Montserrat_500Medium' as string,
  setFont: (_font: FontId) => {},
  error: '',
  fontScale: 1,
  setFontScale: (_scale: number) => {},
});

export function FontProvider({children}: {children: React.ReactNode}) {
  const [font, update] = useState<FontId>('montserrat');
  const [error, setError] = useState('');
  const [fontScale, updateScale] = useState(1);
  const [scaleError, setScaleError] = useState('');
  const scaleChanged = useRef(false);
  const changed = useRef(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const saved = Platform.OS === 'web'
          ? localStorage.getItem('planoramic.fontScale')
          : await SecureStore.getItemAsync('planoramic.fontScale');
        const scale = Number(saved);
        if (active && !scaleChanged.current && saved && Number.isFinite(scale) && scale >= 0.9 && scale <= 1.3) updateScale(scale);
      } catch {
        if (active) setScaleError('Font size will only be saved for this session.');
      }
    })();
    return () => {active = false;};
  }, []);
  const setFontScale = (value: number) => {
    if (!Number.isFinite(value)) return;
    const scale = Math.min(1.3, Math.max(0.9, Math.round(value * 10) / 10));
    scaleChanged.current = true;
    updateScale(scale);
    writes.current = writes.current.then(async () => {
      try {
        if (Platform.OS === 'web') localStorage.setItem('planoramic.fontScale', String(scale));
        else await SecureStore.setItemAsync('planoramic.fontScale', String(scale));
        setScaleError('');
      } catch {setScaleError('Font size will only be saved for this session.');}
    });
  };
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const saved =
          Platform.OS === 'web'
            ? localStorage.getItem(key)
            : await SecureStore.getItemAsync(key);
        const restored = saved === 'averia' ? 'averia-light' : saved;
        if (active && !changed.current && valid(restored)) update(restored);
      } catch {
        if (active) setError('Font will only be saved for this session.');
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const setFont = (value: FontId) => {
    changed.current = true;
    update(value);
    writes.current = writes.current.then(async () => {
      try {
        if (Platform.OS === 'web') localStorage.setItem(key, value);
        else await SecureStore.setItemAsync(key, value);
        setError('');
      } catch {
        setError('Font will only be saved for this session.');
      }
    });
  };
  return (
    <Context.Provider
      value={{
        font,
        family: fontOptions.find(item => item.id === font)!.family,
        setFont,
        error: error || scaleError,
        fontScale,
        setFontScale,
      }}>
      {children}
    </Context.Provider>
  );
}
export const useFont = () => useContext(Context);
