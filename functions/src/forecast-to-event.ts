import { ICalEventData } from 'ical-generator'
import { weatherCodeToEmoji } from './code-to-emoji'
import { OpenWeatherDay } from './types'

export const openWeatherDayToEvent = (day: OpenWeatherDay): ICalEventData => {
  const start = new Date(day.dt * 1000)
  const tempLow = Math.round(day.temp.min)
  const tempHigh = Math.round(day.temp.max)
  const weatherEmoji = weatherCodeToEmoji[day.weather[0].id]

  const summary = `${weatherEmoji} ${tempHigh}°/${tempLow}° F`

  return {
    start,
    allDay: true,
    description: day.summary,
    summary,
  }
}
