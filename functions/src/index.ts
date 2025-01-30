/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import { defineSecret } from 'firebase-functions/params'

import ical, { ICalCalendarMethod } from 'ical-generator'

import { z } from 'zod'

import { openWeatherDayToEvent } from './forecast-to-event'
import { getWeatherForecast } from './get-forecast-with-caching'
import { getUserRecord } from './firestore'

const openWeatherKeySecret = defineSecret('OPEN_WEATHER_KEY')

export const forecast = onRequest(
  {
    secrets: ['OPEN_WEATHER_KEY'],
  },
  async (request, response) => {
    const uid = z.string().min(1).parse(request.query['calid'])
    const userRecord = await getUserRecord(uid)
    const { friendlyName, lat, lon } = userRecord.location

    const openWeatherKey = openWeatherKeySecret.value()

    const forecast = await getWeatherForecast({ openWeatherKey, lat, lon })

    const calendar = ical({
      method: ICalCalendarMethod.PUBLISH,
      name: `Weather Forecast for ${friendlyName}`,
    })

    forecast.daily.forEach((day) =>
      calendar.createEvent(
        openWeatherDayToEvent({ day, locationFriendlyName: friendlyName }),
      ),
    )

    logger.info('completed', { structuredData: true })
    response.set('Content-Type', 'text/calendar; charset=utf-8')
    response.set('Content-Disposition', 'attachment; filename="forecast.ics"')
    response.send(calendar.toString())
  },
)
