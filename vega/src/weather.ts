export interface WeatherDay {
  date: string;
  high: number;
  low: number;
  code: number;
}
export const WEATHER_LOCATION = 'East Brunswick, NJ · 08816';
export const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=40.43&longitude=-74.42&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America%2FNew_York&forecast_days=7';
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
export function parseWeather(value: unknown): WeatherDay[] {
  const daily = (value as {daily?: Record<string, unknown>} | null)?.daily;
  if (
    !daily ||
    !Array.isArray(daily.time) ||
    !Array.isArray(daily.temperature_2m_max) ||
    !Array.isArray(daily.temperature_2m_min) ||
    !Array.isArray(daily.weather_code)
  )
    throw new Error('Invalid weather response');
  const highs = daily.temperature_2m_max,
    lows = daily.temperature_2m_min,
    codes = daily.weather_code;
  const days = daily.time
    .map((date, index) => ({
      date,
      high: highs[index],
      low: lows[index],
      code: codes[index],
    }))
    .filter(
      (day) =>
        typeof day.date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
        Number.isFinite(day.high) &&
        Number.isFinite(day.low) &&
        Number.isFinite(day.code),
    );
  if (!days.length) throw new Error('Weather unavailable');
  return days as WeatherDay[];
}
export function weatherDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
