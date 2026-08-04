import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ZodError } from 'zod'

import { getUserRecord, getExistingForecast, saveForecast } from '../src/firestore'
import { ForecastRecord } from '../src/types'
import { userRecord, openWeatherData } from './fixtures/open-weather'

const { store, docIds, FakeTimestamp } = vi.hoisted(() => {
  class FakeTimestamp {
    constructor(private d: Date) {}
    toDate() {
      return this.d
    }
    static fromDate(d: Date) {
      return new FakeTimestamp(d)
    }
  }
  return {
    store: new Map<string, Record<string, unknown>>(),
    docIds: [] as string[],
    FakeTimestamp,
  }
})

vi.mock('firebase-admin/app', () => ({ initializeApp: vi.fn() }))
vi.mock('firebase-admin/firestore', () => ({
  Timestamp: FakeTimestamp,
  getFirestore: () => ({
    collection: (name: string) => ({
      doc: (id: string) => {
        docIds.push(`${name}/${id}`)
        return {
          get: async () => ({ data: () => store.get(`${name}/${id}`) }),
          set: async (data: Record<string, unknown>) => {
            store.set(`${name}/${id}`, data)
          },
        }
      },
    }),
  }),
}))

beforeEach(() => {
  store.clear()
  docIds.length = 0
})

describe('getUserRecord', () => {
  it('resolves a stored user record', async () => {
    store.set('users/uid-1', userRecord)

    const result = await getUserRecord('uid-1')

    expect(result).toEqual(userRecord)
    expect(docIds).toContain('users/uid-1')
  })

  it('rejects when the stored data does not match the schema', async () => {
    store.set('users/uid-2', {
      location: { friendlyName: 'Nope' },
      units: 'bogus',
    })

    await expect(getUserRecord('uid-2')).rejects.toBeInstanceOf(ZodError)
  })
})

describe('getExistingForecast', () => {
  it('resolves null when no forecast is cached for the coordinates', async () => {
    const result = await getExistingForecast({
      units: 'imperial',
      coordinates: { lat: 36.2168, lon: -81.6746 },
    })

    expect(result).toBeNull()
  })

  it('round-trips a saved forecast using the same doc id for save and get', async () => {
    const record: ForecastRecord = {
      lastUpdated: new Date(),
      units: 'imperial',
      openWeatherData,
    }

    await saveForecast(record)
    const saveDocId = docIds[docIds.length - 1]

    const result = await getExistingForecast({
      units: 'imperial',
      coordinates: { lat: openWeatherData.lat, lon: openWeatherData.lon },
    })
    const getDocId = docIds[docIds.length - 1]

    expect(result).toEqual(record)
    expect(getDocId).toBe(saveDocId)
  })
})

describe('forecast doc id', () => {
  it('prefixes with the unit and shares the same hash suffix across units', async () => {
    await saveForecast({
      lastUpdated: new Date(),
      units: 'imperial',
      openWeatherData,
    })
    const impDocId = docIds[docIds.length - 1].replace('forecasts/', '')

    await saveForecast({
      lastUpdated: new Date(),
      units: 'metric',
      openWeatherData,
    })
    const metDocId = docIds[docIds.length - 1].replace('forecasts/', '')

    expect(impDocId).toMatch(/^imp[A-Za-z0-9_-]{25}$/)
    expect(metDocId).toMatch(/^met[A-Za-z0-9_-]{25}$/)
    expect(impDocId.slice(3)).toBe(metDocId.slice(3))
  })

  it('rounds coordinates to 4 decimal places when computing the cache key', async () => {
    await saveForecast({
      lastUpdated: new Date(),
      units: 'imperial',
      openWeatherData: { ...openWeatherData, lat: 40.12341, lon: -80 },
    })
    const firstDocId = docIds[docIds.length - 1]

    await saveForecast({
      lastUpdated: new Date(),
      units: 'imperial',
      openWeatherData: { ...openWeatherData, lat: 40.123412, lon: -80 },
    })
    const secondDocId = docIds[docIds.length - 1]

    expect(secondDocId).toBe(firstDocId)

    await saveForecast({
      lastUpdated: new Date(),
      units: 'imperial',
      openWeatherData: { ...openWeatherData, lat: 40.2, lon: -80 },
    })
    const thirdDocId = docIds[docIds.length - 1]

    expect(thirdDocId).not.toBe(firstDocId)
  })
})
