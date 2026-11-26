#!/usr/bin/env bash
# Serve dist/ with the Vite preview and run scripts/check-browser.js in the pinned Playwright CLI.
# Run `npm run build` first. PORT (default 4173) selects the preview port; the Playwright CLI uses
# its default browser (Google Chrome) unless PLAYWRIGHT_MCP_BROWSER names another.
set -euo pipefail

cd "$(dirname "$0")/.."
port="${PORT:-4173}"
session="site-check-$$"
[[ -f dist/index.html ]] || { echo "dist/index.html is missing: run npm run build first." >&2; exit 2; }

node_modules/.bin/vite preview --host 127.0.0.1 --port "$port" --strictPort >/dev/null 2>&1 &
preview=$!
cleanup() {
  npx playwright-cli -s="$session" close >/dev/null 2>&1 || true
  kill "$preview" 2>/dev/null || true
}
trap cleanup EXIT

for _ in $(seq 1 50); do
  curl -fsS -o /dev/null "http://127.0.0.1:$port/" 2>/dev/null && break
  kill -0 "$preview" 2>/dev/null || { echo "The preview server exited; is port $port in use?" >&2; exit 1; }
  sleep 0.2
done

npx playwright-cli -s="$session" open "http://127.0.0.1:$port/" >/dev/null
output="$(npx playwright-cli -s="$session" run-code --filename scripts/check-browser.js)" || { printf '%s\n' "$output" >&2; exit 1; }
printf '%s\n' "$output" | sed -n '/^### Result/{n;p;q}'
