import {useEffect, useState} from 'react';
export type DailyWeather = {
  date: string;
  high: number;
  low: number;
  code: number;
};
export function weatherLabel(code: number) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Fog';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow showers';
  return 'Thunderstorms';
}
export function useWeather() {
  const [days, setDays] = useState<DailyWeather[]>([]);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const timer = setTimeout(() => controller.abort(), 15000);
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=40.43&longitude=-74.42&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America%2FNew_York&forecast_days=16&past_days=7',
      {signal: controller.signal},
    )
      .then(async response => {
        if (!response.ok) throw new Error('Weather unavailable');
        return response.json();
      })
      .then(data => {
        if (controller.signal.aborted) return;
        setDays(
          data.daily.time
            .map((date: string, i: number) => ({
              date,
              high: data.daily.temperature_2m_max[i],
              low: data.daily.temperature_2m_min[i],
              code: data.daily.weather_code[i],
            }))
            .filter(
              (day: DailyWeather) =>
                Number.isFinite(day.high) &&
                Number.isFinite(day.low) &&
                Number.isFinite(day.code),
            ),
        );
        setError('');
      })
      .catch(() => {
        if (!cancelled) setError('Weather unavailable.');
      })
      .finally(() => clearTimeout(timer));
    const refresh = setInterval(
      () => setAttempt(value => value + 1),
      30 * 60 * 1000,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(refresh);
      controller.abort();
    };
  }, [attempt]);
  return {days, error, retry: () => setAttempt(value => value + 1)};
}
