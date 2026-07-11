#!/usr/bin/env bash
# Vercel build for the marketing site (Root Directory = quorum).
# Copies the static site into dist/, matching the project's existing
# buildCommand ("bash build.sh") and outputDirectory ("dist") settings.
set -euo pipefail
mkdir -p dist/shots
cp *.html dist/
cp *.css dist/ 2>/dev/null || true
rm -f dist/preview.html
cp shots/*.png dist/shots/ 2>/dev/null || true
cp shots/*.jpg dist/shots/ 2>/dev/null || true
# Explainer/tutorial videos (drop MP4s into videos/ to publish them)
if [ -d videos ]; then mkdir -p dist/videos && cp videos/*.mp4 dist/videos/ 2>/dev/null || true; fi
echo "Site staged:" && ls -laR dist
