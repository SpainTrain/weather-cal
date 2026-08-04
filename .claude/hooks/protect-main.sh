#!/bin/bash
# PreToolUse guard: everything goes through PR — no commits, merges, or pushes
# on/to main from agent sessions. Server-side GitHub ruleset "main-pr-only" is
# the backstop; this hook gives fast local feedback.

input=$(cat)
cmd=$(jq -r '.tool_input.command // empty' <<<"$input" 2>/dev/null)
[ -z "$cmd" ] && exit 0

deny() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

if [ "$branch" = "main" ] &&
  grep -qE '(^|[;&|[:space:]])git[[:space:]]+(commit|merge|cherry-pick|revert|am)([[:space:]]|$)' <<<"$cmd"; then
  deny "You are on main. All changes go through PRs: git checkout -b <branch>, commit there, then open a PR with gh."
fi

if grep -qE '(^|[;&|[:space:]])git[[:space:]]+push' <<<"$cmd"; then
  if [ "$branch" = "main" ] ||
    grep -qE '([[:space:]]|:)main([[:space:]]|$)' <<<"$cmd"; then
    deny "Pushing to main is prohibited (and blocked server-side by the main-pr-only ruleset). Push a feature branch and open a PR instead."
  fi
fi

exit 0
