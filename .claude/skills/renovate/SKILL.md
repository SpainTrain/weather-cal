---
name: renovate
description: Process open Renovate dependency PRs — triage risk, verify CI, and merge what's authorized. Use for dependency maintenance passes.
argument-hint: "[merge policy, e.g. 'report only' or 'merge green patch/minor']"
context: fork
agent: renovate-maintainer
---

Process the open Renovate PRs in this repository per your agent instructions.

Arguments given by the user (their merge authorization for this run): $ARGUMENTS

If no arguments were given, run in **report-only** mode: produce the triage
table and recommendations, merge nothing.
