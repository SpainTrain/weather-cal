import { OpenWeatherData, OpenWeatherDay, UserRecord } from '../../src/types'

export const clearDay: OpenWeatherDay = {
  dt: 1736938800, // 2025-01-15T11:00:00Z
  summary: 'Clear sky throughout the day',
  temp: { min: 30.4, max: 45.6 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
}

export const rainyDay: OpenWeatherDay = {
  dt: 1737025200, // 2025-01-16T11:00:00Z
  summary: 'Light rain in the morning',
  temp: { min: -2.6, max: 10.5 },
  weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }],
}

export const openWeatherData: OpenWeatherData = {
  lat: 36.2168,
  lon: -81.6746,
  timezone: 'America/New_York',
  timezone_offset: -18000,
  daily: [clearDay, rainyDay],
}

export const userRecord: UserRecord = {
  location: { friendlyName: 'Boone NC', lat: 36.2168, lon: -81.6746 },
  units: 'imperial',
}
