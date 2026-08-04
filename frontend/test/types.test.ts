import { describe, it, expect } from 'vitest'

import { UserRecordSchema } from '../src/types'

describe('UserRecordSchema', () => {
  it('accepts a valid record', () => {
    const record = {
      location: { friendlyName: 'Boone NC', lat: 36.2168, lon: -81.6746 },
      units: 'imperial',
    }

    const result = UserRecordSchema.safeParse(record)

    expect(result.success).toBe(true)
  })

  it('rejects an invalid units value', () => {
    const record = {
      location: { friendlyName: 'Boone NC', lat: 36.2168, lon: -81.6746 },
      units: 'kelvin',
    }

    const result = UserRecordSchema.safeParse(record)

    expect(result.success).toBe(false)
  })

  it('rejects a record missing location', () => {
    const record = {
      units: 'imperial',
    }

    const result = UserRecordSchema.safeParse(record)

    expect(result.success).toBe(false)
  })

  it('strips unknown keys', () => {
    const record = {
      location: { friendlyName: 'Boone NC', lat: 36.2168, lon: -81.6746 },
      units: 'imperial',
      extra: 'unexpected',
    }

    const result = UserRecordSchema.parse(record)

    expect(result).not.toHaveProperty('extra')
    expect(result).toEqual({
      location: { friendlyName: 'Boone NC', lat: 36.2168, lon: -81.6746 },
      units: 'imperial',
    })
  })
})
