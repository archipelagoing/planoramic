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
  {
    id: 'averia',
    label: 'Averia Light Italic',
    family: 'AveriaSerifLibre_300Light_Italic',
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
});

export function FontProvider({children}: {children: React.ReactNode}) {
  const [font, update] = useState<FontId>('montserrat');
  const [error, setError] = useState('');
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
        if (active && !changed.current && valid(saved)) update(saved);
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
        error,
      }}>
      {children}
    </Context.Provider>
  );
}
export const useFont = () => useContext(Context);
