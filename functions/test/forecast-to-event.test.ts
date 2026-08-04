import { describe, it, expect } from 'vitest'
import { ICalEventBusyStatus } from 'ical-generator'
import { openWeatherDayToEvent } from '../src/forecast-to-event'
import { clearDay, rainyDay } from './fixtures/open-weather'

const coordinates = { lat: 36.2168, lon: -81.6746 }
const locationFriendlyName = 'Boone NC'

describe('openWeatherDayToEvent', () => {
  it('builds an imperial summary for a clear day', () => {
    const event = openWeatherDayToEvent({
      day: clearDay,
      locationFriendlyName,
      coordinates,
      units: 'imperial',
    })

    expect(event.summary).toBe('☀️ 46°/30° F')
  })

  it('builds a metric summary for a clear day', () => {
    const event = openWeatherDayToEvent({
      day: clearDay,
      locationFriendlyName,
      coordinates,
      units: 'metric',
    })

    expect(event.summary).toBe('☀️ 46°/30° C')
  })

  it('builds a metric summary for a rainy day', () => {
    const event = openWeatherDayToEvent({
      day: rainyDay,
      locationFriendlyName,
      coordinates,
      units: 'metric',
    })

    expect(event.summary).toBe('🌧️ 11°/-3° C')
  })

  it('sets start to the day timestamp', () => {
    const event = openWeatherDayToEvent({
      day: clearDay,
      locationFriendlyName,
      coordinates,
      units: 'imperial',
    })

    expect(event.start).toEqual(new Date(clearDay.dt * 1000))
  })

  it('marks the event as an all-day, free-busy event', () => {
    const event = openWeatherDayToEvent({
      day: clearDay,
      locationFriendlyName,
      coordinates,
      units: 'imperial',
    })

    expect(event.allDay).toBe(true)
    expect(event.busystatus).toBe(ICalEventBusyStatus.FREE)
  })

  it('includes location name, day summary, and attribution in the description', () => {
    const event = openWeatherDayToEvent({
      day: clearDay,
      locationFriendlyName,
      coordinates,
      units: 'imperial',
    })

    expect(event.description).toContain('Boone NC')
    expect(event.description).toContain(clearDay.summary)
    expect(event.description).toContain('https://openweathermap.org/')
  })

  it('sets location to the friendly name and coordinates', () => {
    const event = openWeatherDayToEvent({
      day: clearDay,
      locationFriendlyName,
      coordinates,
      units: 'imperial',
    })

    expect(event.location).toEqual({
      title: 'Boone NC',
      geo: { lat: 36.2168, lon: -81.6746 },
    })
  })
})
