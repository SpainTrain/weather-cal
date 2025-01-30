import * as logger from 'firebase-functions/logger'

import { getExistingForecast, saveForecast } from './firestore'
import { fetchOpenWeather } from './open-weather-api'
import { OpenWeatherData } from './types'

interface GetWeatherForecastArgs {
  openWeatherKey: string
  lat: number
  lon: number
}

export const getWeatherForecast = async ({
  lat,
  lon,
  openWeatherKey,
}: GetWeatherForecastArgs): Promise<OpenWeatherData> => {
  // Check cache (firestore forecasts, check whether fresh)
  // Return if cached
  const existingForecast = await getExistingForecast({ lat, lon })
  if (
    existingForecast !== null &&
    existingForecast.lastUpdated.toDateString() === new Date().toDateString()
  ) {
    logger.info('Found cached entry', {
      lat,
      lon,
      date: existingForecast.lastUpdated.toDateString(),
    })
    return existingForecast.openWeatherData
  }

  // API call to open weather
  logger.info('Fetching new forecast', { lat, lon })
  const forecast = await fetchOpenWeather({ openWeatherKey, lat, lon })
  // Save result to cache
  await saveForecast({
    lastUpdated: new Date(),
    openWeatherData: forecast,
  })

  // return result
  return forecast
}
