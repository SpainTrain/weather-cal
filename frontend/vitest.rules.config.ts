import { defineConfig } from 'vitest/config'

// Firestore security-rules tests. Requires the Firestore emulator:
//   firebase emulators:exec --only firestore "npm --prefix frontend run test:rules"
export default defineConfig({
  test: {
    include: ['test-rules/**/*.test.ts'],
    testTimeout: 15000,
    hookTimeout: 30000,
  },
})
