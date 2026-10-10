#!/bin/sh
# Checks stamp matching (STAMPS.md v2.1) against real places: ./scripts/stamps/test-library.sh
# Joins the library + data + cases into one file and runs it with Node's built-in TypeScript support.
set -e
cd "$(dirname "$0")/../.."
tmp="$(mktemp -d)/stamp-test.ts"
{ grep -v '^import' app/src/lib/stamp-library-data.ts | sed 's/^export const STAMPS: StampEntry\[\]/const STAMPS: any[]/'
  grep -v '^import' app/src/lib/stamp-library.ts
  cat scripts/stamps/library-cases.ts.txt; } > "$tmp"
node "$tmp" 2>&1 | grep -v ExperimentalWarning
