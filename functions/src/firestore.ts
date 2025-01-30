import { createHash } from 'node:crypto'
import { once } from 'lodash'

import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import {
  Coordinates,
  ForecastRecord,
  ForecastRecordSchema,
  UserRecordSchema,
} from './types'

const roundToFour = (num: number) => Math.round(num * 10000) / 10000

const getDB = once(() => {
  try {
    initializeApp()
    return getFirestore()
  } catch {
    return getFirestore()
  }
})

export const getUserRecord = async (uid: string) => {
  const db = getDB()
  const usersCol = db.collection('users')
  const docRef = usersCol.doc(uid)
  const data = await docRef.get()
  const userRecord = UserRecordSchema.parse(data.data())

  return userRecord
}

const getForecastId = ({ lat, lon }: Coordinates) => {
  const data = `${roundToFour(lat)},${roundToFour(lon)}`
  // URL-safe base64
  const hash = createHash('sha256').update(data).digest('base64url')
  // Trim to 28 chars (default firestore ID length)
  return hash.substring(0, 28)
}

export const getExistingForecast = async ({ lat, lon }: Coordinates) => {
  const db = getDB()
  const locationId = getForecastId({ lat, lon })
  const locationsCol = db.collection('forecasts')
  const locationRef = locationsCol.doc(locationId)
  const data = (await locationRef.get()).data()
  return data === undefined
    ? null
    : ForecastRecordSchema.parse({
        lastUpdated: (data.lastUpdated as Timestamp).toDate(),
        openWeatherData: data.openWeatherData,
      })
}

export const saveForecast = async (forecast: ForecastRecord) => {
  const db = getDB()
  const locationId = getForecastId({
    lat: forecast.openWeatherData.lat,
    lon: forecast.openWeatherData.lon,
  })
  const locationsCol = db.collection('forecasts')
  const locationRef = locationsCol.doc(locationId)
  await locationRef.set({
    lastUpdated: Timestamp.fromDate(forecast.lastUpdated),
    openWeatherData: forecast.openWeatherData,
  })
}
