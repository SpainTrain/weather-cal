import { describe, it, expect } from 'vitest'
import {
  OpenWeatherDataSchema,
  UserRecordSchema,
  ForecastRecordSchema,
} from '../src/types'
import { openWeatherData, userRecord } from './fixtures/open-weather'

describe('OpenWeatherDataSchema', () => {
  it('round-trips valid data', () => {
    expect(OpenWeatherDataSchema.parse(openWeatherData)).toEqual(
      openWeatherData,
    )
  })

  it('strips unknown keys', () => {
    const withExtra = { ...openWeatherData, extraKey: 'should be stripped' }
    const parsed = OpenWeatherDataSchema.parse(withExtra)

    expect(parsed).not.toHaveProperty('extraKey')
  })

  it('rejects an object missing daily', () => {
    const { daily, ...withoutDaily } = openWeatherData
    const result = OpenWeatherDataSchema.safeParse(withoutDaily)

    expect(result.success).toBe(false)
  })
})

describe('UserRecordSchema', () => {
  it('accepts a valid user record', () => {
    const result = UserRecordSchema.safeParse(userRecord)

    expect(result.success).toBe(true)
  })

  it('rejects an invalid units value', () => {
    const result = UserRecordSchema.safeParse({
      ...userRecord,
      units: 'kelvin',
    })

    expect(result.success).toBe(false)
  })

  it('rejects a record missing location.lat', () => {
    const { lat, ...locationWithoutLat } = userRecord.location
    const result = UserRecordSchema.safeParse({
      ...userRecord,
      location: locationWithoutLat,
    })

    expect(result.success).toBe(false)
  })
})

describe('ForecastRecordSchema', () => {
  it('accepts a valid forecast record', () => {
    const result = ForecastRecordSchema.safeParse({
      lastUpdated: new Date(),
      units: 'metric',
      openWeatherData,
    })

    expect(result.success).toBe(true)
  })

  it('rejects a string lastUpdated', () => {
    const result = ForecastRecordSchema.safeParse({
      lastUpdated: new Date().toISOString(),
      units: 'metric',
      openWeatherData,
    })

    expect(result.success).toBe(false)
  })
})
