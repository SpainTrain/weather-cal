import * as logger from 'firebase-functions/logger'

import { getExistingForecast, saveForecast } from './firestore'
import { fetchOpenWeather } from './open-weather-api'
import { OpenWeatherData, Units } from './types'

interface GetWeatherForecastArgs {
  openWeatherKey: string
  lat: number
  lon: number
  units: Units
}

export const getWeatherForecast = async ({
  lat,
  lon,
  openWeatherKey,
  units,
}: GetWeatherForecastArgs): Promise<OpenWeatherData> => {
  // Check cache (firestore forecasts, check whether fresh)
  // Return if cached
  const existingForecast = await getExistingForecast({
    units,
    coordinates: { lat, lon },
  })
  if (
    existingForecast !== null &&
    existingForecast.lastUpdated.toDateString() === new Date().toDateString()
  ) {
    logger.info('Found cached entry', {
      lat,
      lon,
      units,
      date: existingForecast.lastUpdated.toDateString(),
    })
    return existingForecast.openWeatherData
  }

  // API call to open weather
  logger.info('Fetching new forecast', { lat, lon, units })
  const forecast = await fetchOpenWeather({ openWeatherKey, lat, lon, units })
  // Save result to cache
  await saveForecast({
    lastUpdated: new Date(),
    units,
    openWeatherData: forecast,
  })

  // return result
  return forecast
}
