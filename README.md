# Weather Calendar

[![CI](https://github.com/SpainTrain/weather-cal/actions/workflows/ci.yml/badge.svg)](https://github.com/SpainTrain/weather-cal/actions/workflows/ci.yml)

Use for free at [https://calendars.raodix.com](https://calendars.raodix.com)

To run your own version, here are the high level steps:

1. Create an API key at [https://home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys)
1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
1. `firebase init` in this directory (you will need emulators, auth, firestore, and hosting)

If there is interest in more specific directions to run your own, feel free to open a Github issue here.

Report bugs via Github issues.

PRs Welcome!

## Development

This repo has two independent npm packages: `functions/` and `frontend/`. Run tests with:

```
cd functions && npm ci && npm test
cd frontend && npm ci && npm test
```

The Firestore security rules have their own emulator-backed suite (requires Java and the Firebase CLI):

```
npm ci && npm run test:rules   # repo root; Firebase CLI is a root devDependency
```

CI runs lint, build, and tests for both packages plus the rules suite on every push and PR, so a green check on a Renovate PR means it's safe to merge.
