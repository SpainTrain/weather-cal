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

The repo has three independent npm packages (root = Firebase CLI + scripts, `functions/`, `frontend/`) and uses [mise](https://mise.jdx.dev) for single-command workflows — it also provisions the pinned Node 24 and Java 21 (needed by the Firestore emulator):

```
mise trust && mise install   # once per clone
mise run setup               # npm ci in all three packages
mise run check               # everything CI checks: lint, build, all test suites
```

`mise tasks` lists the rest (`test`, `test:rules`, `emulators`, `deploy*`). Without mise, the underlying npm equivalents work directly — see `mise.toml` for the mapping.

CI runs lint, build, and tests for both packages plus the rules suite on every push and PR, so a green check on a Renovate PR means it's safe to merge.
