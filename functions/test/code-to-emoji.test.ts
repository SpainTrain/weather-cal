import { describe, it, expect } from 'vitest'
import { weatherCodeToEmoji } from '../src/code-to-emoji'

const allDocumentedCodes = [
  200, 201, 202, 210, 211, 212, 221, 230, 231, 232, 300, 301, 302, 310, 311,
  312, 313, 314, 321, 500, 501, 502, 503, 504, 511, 520, 521, 522, 531, 600,
  601, 602, 611, 612, 613, 615, 616, 620, 621, 622, 701, 711, 721, 731, 741,
  751, 761, 762, 771, 781, 800, 801, 802, 803, 804,
]

describe('weatherCodeToEmoji', () => {
  it.each([
    [200, '⛈️'],
    [500, '🌧️'],
    [600, '🌨️'],
    [741, '🌫️'],
    [800, '☀️'],
    [801, '🌤️'],
    [802, '⛅️'],
    [803, '☁️'],
    [804, '☁️'],
  ])('maps code %i to %s', (code, emoji) => {
    expect(weatherCodeToEmoji[code]).toBe(emoji)
  })

  it('maps every code to a non-empty string', () => {
    Object.values(weatherCodeToEmoji).forEach((emoji) => {
      expect(typeof emoji).toBe('string')
      expect(emoji.length).toBeGreaterThan(0)
    })
  })

  it.each(allDocumentedCodes)(
    'includes documented OpenWeather condition code %i',
    (code) => {
      expect(weatherCodeToEmoji).toHaveProperty(String(code))
    },
  )
})
