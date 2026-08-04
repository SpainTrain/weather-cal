import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { getWeatherForecast } from '../src/get-forecast-with-caching'
import { getExistingForecast, saveForecast } from '../src/firestore'
import { fetchOpenWeather } from '../src/open-weather-api'
import { openWeatherData } from './fixtures/open-weather'

vi.mock('../src/firestore', () => ({
  getExistingForecast: vi.fn(),
  saveForecast: vi.fn(),
}))
vi.mock('../src/open-weather-api', () => ({
  fetchOpenWeather: vi.fn(),
}))
vi.mock('firebase-functions/logger', () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}))

const mockGetExistingForecast = vi.mocked(getExistingForecast)
const mockSaveForecast = vi.mocked(saveForecast)
const mockFetchOpenWeather = vi.mocked(fetchOpenWeather)

const args = {
  openWeatherKey: 'key-123',
  lat: 36.2168,
  lon: -81.6746,
  units: 'imperial' as const,
}

describe('getWeatherForecast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 15, 12))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('returns the cached forecast when it was updated the same calendar day', async () => {
    mockGetExistingForecast.mockResolvedValue({
      lastUpdated: new Date(2025, 0, 15, 8),
      units: 'imperial',
      openWeatherData,
    })

    const result = await getWeatherForecast(args)

    expect(result).toBe(openWeatherData)
    expect(mockFetchOpenWeather).not.toHaveBeenCalled()
    expect(mockSaveForecast).not.toHaveBeenCalled()
  })

  it('fetches and saves a fresh forecast when the cache is stale', async () => {
    mockGetExistingForecast.mockResolvedValue({
      lastUpdated: new Date(2025, 0, 14, 23),
      units: 'imperial',
      openWeatherData,
    })
    mockFetchOpenWeather.mockResolvedValue(openWeatherData)

    const result = await getWeatherForecast(args)

    expect(mockFetchOpenWeather).toHaveBeenCalled()
    expect(mockSaveForecast).toHaveBeenCalledWith({
      lastUpdated: new Date(2025, 0, 15, 12),
      units: 'imperial',
      openWeatherData,
    })
    expect(result).toBe(openWeatherData)
  })

  it('fetches and saves a fresh forecast when there is no cached entry', async () => {
    mockGetExistingForecast.mockResolvedValue(null)
    mockFetchOpenWeather.mockResolvedValue(openWeatherData)

    const result = await getWeatherForecast(args)

    expect(mockFetchOpenWeather).toHaveBeenCalled()
    expect(mockSaveForecast).toHaveBeenCalled()
    expect(result).toBe(openWeatherData)
  })

  it('calls fetchOpenWeather with the exact request args', async () => {
    mockGetExistingForecast.mockResolvedValue(null)
    mockFetchOpenWeather.mockResolvedValue(openWeatherData)

    await getWeatherForecast(args)

    expect(mockFetchOpenWeather).toHaveBeenCalledWith({
      openWeatherKey: 'key-123',
      lat: 36.2168,
      lon: -81.6746,
      units: 'imperial',
    })
  })
})
