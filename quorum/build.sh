#!/usr/bin/env bash
# Vercel build for the marketing site (Root Directory = quorum).
# Copies the static site into dist/, matching the project's existing
# buildCommand ("bash build.sh") and outputDirectory ("dist") settings.
set -euo pipefail
mkdir -p dist/shots
cp index.html dist/
cp shots/*.png dist/shots/ 2>/dev/null || true
cp shots/*.jpg dist/shots/ 2>/dev/null || true
echo "Site staged:" && ls -laR dist
