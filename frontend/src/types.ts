import { z } from 'zod'

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
