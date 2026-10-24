import React, {createContext, useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  parseWeather,
  WeatherDay,
  weatherDate,
  weatherLabel,
  WEATHER_LOCATION,
  WEATHER_URL,
} from './weather';
import {palette, TVButton} from './ui';

const WeatherContext = createContext<{
  days: WeatherDay[];
  error: string;
  loading: boolean;
  retry: () => void;
}>({days: [], error: '', loading: true, retry: () => {}});
export function WeatherProvider({children}: {children: React.ReactNode}) {
  const [days, setDays] = useState<WeatherDay[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setLoading(true);
    void fetch(WEATHER_URL, {signal: controller.signal})
      .then(async (response) => {
        if (!response.ok) throw new Error('Weather unavailable');
        return parseWeather(await response.json());
      })
      .then((result) => {
        if (active) {
          setDays(result);
          setError('');
        }
      })
      .catch(() => {
        if (active) setError('Weather unavailable. Try again.');
      })
      .finally(() => {
        clearTimeout(timeout);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);
  useEffect(() => {
    const interval = setInterval(
      () => setAttempt((value) => value + 1),
      30 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, []);
  return (
    <WeatherContext.Provider
      value={{
        days,
        error,
        loading,
        retry: () => setAttempt((value) => value + 1),
      }}>
      {children}
    </WeatherContext.Provider>
  );
}
export function WeatherPreview() {
  const {days, error, loading} = useContext(WeatherContext);
  const today = days[0];
  return (
    <View style={styles.preview}>
      <Text style={styles.eyebrow}>WEATHER · 08816</Text>
      <Text style={styles.heading}>
        {today
          ? weatherLabel(today.code)
          : loading
          ? 'Loading weather…'
          : 'Weather unavailable'}
      </Text>
      {today && (
        <Text style={styles.body}>
          {Math.round(today.high)}° / {Math.round(today.low)}°F
        </Text>
      )}
      {!!error && (
        <Text style={styles.error}>
          {error}
          {today ? ' Showing the last forecast.' : ''}
        </Text>
      )}
      <Text style={styles.muted}>{WEATHER_LOCATION}</Text>
    </View>
  );
}
export function WeatherScreen() {
  const {days, error, loading, retry} = useContext(WeatherContext);
  const [focused, setFocused] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);
  const day = days.find((item) => item.date === chosen) || days[0];
  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <View>
          <Text style={styles.heading}>Daily weather</Text>
          <Text style={styles.muted}>{WEATHER_LOCATION} · Fahrenheit</Text>
        </View>
        <TVButton
          label={loading ? 'Refreshing…' : 'Refresh weather'}
          disabled={loading}
          onPress={retry}
        />
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
          {days.length ? ' Showing the last forecast.' : ''}
        </Text>
      )}
      {loading && !days.length && (
        <ActivityIndicator color={palette.accent} size="large" />
      )}
      <View style={styles.content}>
        <FlatList
          style={{flex: 1.5}}
          data={days}
          keyExtractor={(item) => item.date}
          renderItem={({item}) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${weatherDate(item.date)}, ${weatherLabel(
                item.code,
              )}, high ${Math.round(item.high)}, low ${Math.round(
                item.low,
              )} Fahrenheit`}
              onFocus={() => {
                setFocused(item.date);
                setChosen(item.date);
              }}
              onBlur={() => setFocused('')}
              onPress={() => setChosen(item.date)}
              style={[styles.day, focused === item.date && styles.focus]}>
              <Text style={styles.dayTitle}>{weatherDate(item.date)}</Text>
              <Text style={styles.body}>
                {weatherLabel(item.code)} · {Math.round(item.high)}° /{' '}
                {Math.round(item.low)}°F
              </Text>
            </Pressable>
          )}
        />
        <View style={styles.summary}>
          {day ? (
            <>
              <Text style={styles.eyebrow}>{weatherDate(day.date)}</Text>
              <Text style={styles.heading}>{weatherLabel(day.code)}</Text>
              <Text style={styles.temperature}>{Math.round(day.high)}°</Text>
              <Text style={styles.body}>Low {Math.round(day.low)}°F</Text>
            </>
          ) : (
            <Text style={styles.body}>
              {loading
                ? 'Loading forecast…'
                : 'Select Refresh weather to try again.'}
            </Text>
          )}
          <Text style={styles.muted}>Forecast from Open-Meteo</Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {flex: 1},
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  content: {flex: 1, flexDirection: 'row', gap: 20},
  heading: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  body: {color: palette.text, fontSize: 18, marginTop: 6},
  muted: {color: palette.muted, fontSize: 14, lineHeight: 22},
  eyebrow: {
    color: palette.accent,
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 8,
  },
  day: {
    padding: 16,
    borderWidth: 3,
    borderColor: 'transparent',
    backgroundColor: palette.card,
    borderRadius: 12,
    marginBottom: 10,
  },
  dayTitle: {color: palette.accent, fontSize: 18},
  focus: {borderColor: palette.accent, backgroundColor: palette.focus},
  summary: {
    flex: 1,
    padding: 24,
    borderRadius: 14,
    backgroundColor: palette.card,
  },
  preview: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderColor: '#516154',
  },
  error: {color: palette.error, fontSize: 15, marginVertical: 8},
  temperature: {color: palette.accent, fontSize: 74, marginVertical: 14},
});
