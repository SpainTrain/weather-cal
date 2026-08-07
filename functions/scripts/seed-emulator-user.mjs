// Seeds a test user into the EMULATED Firestore (FIRESTORE_EMULATOR_HOST must be set).
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('Refusing to run: FIRESTORE_EMULATOR_HOST is not set (would write to prod!)')
  process.exit(1)
}

initializeApp({ projectId: 'weather-cal-spainhower' })
const db = getFirestore()
await db.doc('users/local-test-user').set({
  location: { friendlyName: 'Boone NC', lat: 36.2168, lon: -81.6746 },
  units: 'imperial',
})
console.log('Seeded users/local-test-user')
