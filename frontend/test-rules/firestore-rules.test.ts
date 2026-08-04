import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const ALICE = 'alice-uid'
const MALLORY = 'mallory-uid'

const aliceRecord = {
  location: { friendlyName: 'Boone NC', lat: 36.2168, lon: -81.6746 },
  units: 'imperial',
}

const [host, port] = (
  process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080'
).split(':')

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'weather-cal-spainhower',
    firestore: {
      rules: readFileSync(
        new URL('../../firestore.rules', import.meta.url),
        'utf8',
      ),
      host,
      port: Number(port),
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

const seedAliceRecord = () =>
  testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users', ALICE), aliceRecord)
  })

describe('users collection', () => {
  it('allows a user to create their own record', async () => {
    const db = testEnv.authenticatedContext(ALICE).firestore()
    await assertSucceeds(setDoc(doc(db, 'users', ALICE), aliceRecord))
  })

  it('denies creating a record under another uid', async () => {
    const db = testEnv.authenticatedContext(MALLORY).firestore()
    await assertFails(setDoc(doc(db, 'users', ALICE), aliceRecord))
  })

  it('allows a user to read their own record', async () => {
    await seedAliceRecord()
    const db = testEnv.authenticatedContext(ALICE).firestore()
    await assertSucceeds(getDoc(doc(db, 'users', ALICE)))
  })

  it('allows a user to update their own record', async () => {
    await seedAliceRecord()
    const db = testEnv.authenticatedContext(ALICE).firestore()
    await assertSucceeds(
      updateDoc(doc(db, 'users', ALICE), { units: 'metric' }),
    )
  })

  it('allows a user to delete their own record', async () => {
    await seedAliceRecord()
    const db = testEnv.authenticatedContext(ALICE).firestore()
    await assertSucceeds(deleteDoc(doc(db, 'users', ALICE)))
  })

  it("denies reading another user's record", async () => {
    await seedAliceRecord()
    const db = testEnv.authenticatedContext(MALLORY).firestore()
    await assertFails(getDoc(doc(db, 'users', ALICE)))
  })

  it("denies writing another user's record", async () => {
    await seedAliceRecord()
    const db = testEnv.authenticatedContext(MALLORY).firestore()
    await assertFails(
      updateDoc(doc(db, 'users', ALICE), { units: 'metric' }),
    )
  })

  it('denies unauthenticated reads and creates', async () => {
    await seedAliceRecord()
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, 'users', ALICE)))
    await assertFails(setDoc(doc(db, 'users', 'anon'), aliceRecord))
  })
})

describe('forecasts collection (backend-only)', () => {
  it('denies authenticated client reads', async () => {
    const db = testEnv.authenticatedContext(ALICE).firestore()
    await assertFails(getDoc(doc(db, 'forecasts', 'some-forecast-id')))
  })

  it('denies authenticated client writes', async () => {
    const db = testEnv.authenticatedContext(ALICE).firestore()
    await assertFails(
      setDoc(doc(db, 'forecasts', 'some-forecast-id'), { any: 'data' }),
    )
  })
})

describe('any other path', () => {
  it('denies reads and writes', async () => {
    const db = testEnv.authenticatedContext(ALICE).firestore()
    await assertFails(getDoc(doc(db, 'admin', 'settings')))
    await assertFails(setDoc(doc(db, 'admin', 'settings'), { a: 1 }))
  })
})
