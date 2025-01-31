import { z } from 'zod'

const UnitsSchema = z.enum(['imperial', 'metric'])

export type Units = z.infer<typeof UnitsSchema>

const LocationSchema = z.object({
  friendlyName: z.string(),
  lat: z.number(),
  lon: z.number(),
})

export type Location = z.infer<typeof LocationSchema>

export const UserRecordSchema = z.object({
  location: LocationSchema,
  units: UnitsSchema,
})

export type UserRecord = z.infer<typeof UserRecordSchema>
