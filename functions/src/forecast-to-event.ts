import { ICalEventData, ICalEventBusyStatus } from 'ical-generator'
import { weatherCodeToEmoji } from './code-to-emoji'
import { Coordinates, OpenWeatherDay } from './types'

const openWeatherAttribution =
  'Weather data provided by OpenWeather - https://openweathermap.org/'

interface OpenWeatherDayToEventArgs {
  day: OpenWeatherDay
  locationFriendlyName: string
  coordinates: Coordinates
}

export const openWeatherDayToEvent = ({
  day,
  locationFriendlyName,
  coordinates,
}: OpenWeatherDayToEventArgs): ICalEventData => {
  const start = new Date(day.dt * 1000)
  const tempLow = Math.round(day.temp.min)
  const tempHigh = Math.round(day.temp.max)
  const weatherEmoji = weatherCodeToEmoji[day.weather[0].id]

  const summary = `${weatherEmoji} ${tempHigh}°/${tempLow}° F`

  const description = `${locationFriendlyName}
  
  ${day.summary}
  
  ${openWeatherAttribution}`

  return {
    start,
    allDay: true,
    description,
    summary,
    busystatus: ICalEventBusyStatus.FREE,
    location: {
      title: locationFriendlyName,
      geo: {
        lat: coordinates.lat,
        lon: coordinates.lon,
      },
    },
  }
}
