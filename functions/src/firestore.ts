import { createHash } from 'node:crypto'
import { once } from 'lodash'

import { initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import {
  Coordinates,
  ForecastRecord,
  ForecastRecordSchema,
  Units,
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

interface GetForecastArgs {
  coordinates: Coordinates
  units: Units
}

const getForecastId = ({
  units,
  coordinates: { lat, lon },
}: GetForecastArgs) => {
  const data = `${roundToFour(lat)},${roundToFour(lon)}`

  // URL-safe base64
  const hash = createHash('sha256').update(data).digest('base64url')

  // Trim to 25 chars (default firestore ID length is 28)
  const trimmedHash = hash.substring(0, 25)
  const unitPrefix = units.substring(0, 3)

  return `${unitPrefix}${trimmedHash}`
}

export const getExistingForecast = async (getForecastArgs: GetForecastArgs) => {
  const db = getDB()
  const locationId = getForecastId(getForecastArgs)
  const locationsCol = db.collection('forecasts')
  const locationRef = locationsCol.doc(locationId)
  const data = (await locationRef.get()).data()
  return data === undefined
    ? null
    : ForecastRecordSchema.parse({
        ...data,
        lastUpdated: (data.lastUpdated as Timestamp).toDate(),
      })
}

export const saveForecast = async (forecast: ForecastRecord) => {
  const db = getDB()
  const locationId = getForecastId({
    units: forecast.units,
    coordinates: {
      lat: forecast.openWeatherData.lat,
      lon: forecast.openWeatherData.lon,
    },
  })
  const locationsCol = db.collection('forecasts')
  const locationRef = locationsCol.doc(locationId)
  await locationRef.set({
    ...forecast,
    lastUpdated: Timestamp.fromDate(forecast.lastUpdated),
  })
}
