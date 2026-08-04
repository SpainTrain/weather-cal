import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { fetchOpenWeather } from '../src/open-weather-api'

const callArgs = {
  openWeatherKey: 'key-123',
  lat: 36.2168,
  lon: -81.6746,
  units: 'imperial' as const,
}

describe('fetchOpenWeather', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn(async () => ({ json: async () => ({ mocked: true }) }))
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests the OpenWeather onecall endpoint', async () => {
    await fetchOpenWeather(callArgs)

    const url = new URL(mockFetch.mock.calls[0][0])
    expect(`${url.origin}${url.pathname}`).toBe(
      'https://api.openweathermap.org/data/3.0/onecall',
    )
  })

  it('passes lat, lon, appid, and units as query params', async () => {
    await fetchOpenWeather(callArgs)

    const url = new URL(mockFetch.mock.calls[0][0])
    expect(url.searchParams.get('lat')).toBe('36.2168')
    expect(url.searchParams.get('lon')).toBe('-81.6746')
    expect(url.searchParams.get('appid')).toBe('key-123')
    expect(url.searchParams.get('units')).toBe('imperial')
  })

  it('defaults the exclude param to current,minutely,hourly,alerts', async () => {
    await fetchOpenWeather(callArgs)

    const url = new URL(mockFetch.mock.calls[0][0])
    expect(url.searchParams.get('exclude')).toBe('current,minutely,hourly,alerts')
  })

  it('uses a custom exclude list when provided', async () => {
    await fetchOpenWeather({ ...callArgs, exclude: ['minutely'] })

    const url = new URL(mockFetch.mock.calls[0][0])
    expect(url.searchParams.get('exclude')).toBe('minutely')
  })

  it('resolves with the parsed JSON body', async () => {
    const result = await fetchOpenWeather(callArgs)

    expect(result).toEqual({ mocked: true })
  })
})
