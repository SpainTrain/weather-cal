import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
} from 'vitest'
import type { Request, Response } from 'firebase-functions/v2/https'
import { getUserRecord } from '../src/firestore'
import { getWeatherForecast } from '../src/get-forecast-with-caching'
import { openWeatherData, userRecord } from './fixtures/open-weather'

vi.mock('../src/firestore', () => ({ getUserRecord: vi.fn() }))
vi.mock('../src/get-forecast-with-caching', () => ({
  getWeatherForecast: vi.fn(),
}))
vi.mock('firebase-functions/logger', () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}))

// vi.mock calls above are hoisted above this import by Vitest, so
// `forecast` is wired up against the mocked firestore/caching modules.
import { forecast } from '../src/index'

const invoke = async (query: Record<string, unknown>) => {
  const res = {
    set: vi.fn(),
    send: vi.fn(),
    status: vi.fn().mockReturnThis(),
  }
  await forecast({ query } as unknown as Request, res as unknown as Response)
  return res
}

describe('forecast', () => {
  beforeAll(() => {
    process.env.OPEN_WEATHER_KEY = 'test-key'
  })

  beforeEach(() => {
    vi.mocked(getUserRecord).mockReset()
    vi.mocked(getWeatherForecast).mockReset()
    vi.mocked(getUserRecord).mockResolvedValue(userRecord)
    vi.mocked(getWeatherForecast).mockResolvedValue(openWeatherData)
  })

  it('sets calendar content-type and attachment headers', async () => {
    const res = await invoke({ calid: 'user-1' })

    expect(res.set).toHaveBeenCalledWith(
      'Content-Type',
      'text/calendar; charset=utf-8',
    )
    expect(res.set).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="forecast.ics"',
    )
  })

  it('sends a well-formed ICS body', async () => {
    const res = await invoke({ calid: 'user-1' })
    const body = res.send.mock.calls[0][0] as string

    expect(body.startsWith('BEGIN:VCALENDAR')).toBe(true)
    expect(body).toContain('END:VCALENDAR')
  })

  it('names the calendar after the user location', async () => {
    const res = await invoke({ calid: 'user-1' })
    const body = res.send.mock.calls[0][0] as string

    expect(body).toContain('Weather Forecast for Boone NC')
  })

  it('creates one event per daily forecast entry', async () => {
    const res = await invoke({ calid: 'user-1' })
    const body = res.send.mock.calls[0][0] as string

    expect(body.match(/BEGIN:VEVENT/g)).toHaveLength(2)
  })

  it('summarizes each day with emoji, temps, and units, on its own date', async () => {
    const res = await invoke({ calid: 'user-1' })
    const body = res.send.mock.calls[0][0] as string

    expect(body).toContain('SUMMARY:☀️ 46°/30° F')
    expect(body).toContain('SUMMARY:🌧️ 11°/-3° F')
    expect(body.match(/DTSTART;VALUE=DATE:/g)).toHaveLength(2)
  })

  it('fetches the user record and forecast with the right arguments', async () => {
    await invoke({ calid: 'user-1' })

    expect(getUserRecord).toHaveBeenCalledWith('user-1')
    expect(getWeatherForecast).toHaveBeenCalledWith({
      openWeatherKey: 'test-key',
      lat: 36.2168,
      lon: -81.6746,
      units: 'imperial',
    })
  })

  it('errors without sending a calendar when calid is missing', async () => {
    const res = {
      set: vi.fn(),
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    }

    // Since firebase-functions v7, unhandled errors in async onRequest
    // handlers are caught by the framework and answered with a 500 instead
    // of propagating as a rejection.
    await forecast(
      { query: {} } as unknown as Request,
      res as unknown as Response,
    )
    const sentCalendar = res.send.mock.calls.some(
      (call) => typeof call[0] === 'string' && call[0].includes('BEGIN:VCALENDAR'),
    )
    expect(sentCalendar).toBe(false)
    expect(res.status).toHaveBeenCalledWith(500)
  })
})
