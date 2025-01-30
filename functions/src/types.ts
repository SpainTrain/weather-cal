import { z } from 'zod'

export interface Coordinates {
  lat: number
  lon: number
}

export const OpenWeatherDaySchema = z.object({
  dt: z.number(),
  summary: z.string(),
  temp: z.object({
    min: z.number(),
    max: z.number(),
  }),
  weather: z.array(
    z.object({
      id: z.number(),
      main: z.string(),
      description: z.string(),
      icon: z.string(),
    }),
  ),
})

export type OpenWeatherDay = z.infer<typeof OpenWeatherDaySchema>

export const OpenWeatherDataSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  timezone: z.string(),
  timezone_offset: z.number(),
  daily: z.array(OpenWeatherDaySchema),
})

export type OpenWeatherData = z.infer<typeof OpenWeatherDataSchema>

export const ForecastRecordSchema = z.object({
  lastUpdated: z.date(),
  openWeatherData: OpenWeatherDataSchema,
})

export type ForecastRecord = z.infer<typeof ForecastRecordSchema>

const LocationSchema = z.object({
  friendlyName: z.string(),
  lat: z.number(),
  lon: z.number(),
})

export type Location = z.infer<typeof LocationSchema>

export const UserRecordSchema = z.object({
  location: LocationSchema,
})

export type UserRecord = z.infer<typeof UserRecordSchema>
