#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
INPUT="$ROOT/stories/resebrev/translations/svenska/kapitel"
OUT="$ROOT/dist/stories/resebrev/audio/sv"
READER="$ROOT/tools/voice-renderer/reader.py"

cmd="${1:-chunks}"
shift || true

case "$cmd" in
  chunks)
    python3 "$READER" chunks --language sv --input "$INPUT" "$@"
    ;;
  preview)
    python3 "$READER" synth --language sv --input "$INPUT" --out "$OUT" --also-wav --limit-chunks 1 "$@"
    ;;
  synth)
    python3 "$READER" synth --language sv --input "$INPUT" --out "$OUT" --also-wav "$@"
    ;;
  concat)
    python3 "$READER" concat --language sv --input "$INPUT" --out "$OUT" --wav --gap-ms 450 "$@"
    ;;
  book)
    python3 "$READER" book --out "$OUT" --wav --chapter-gap-ms 1800 --output-name resebrev-svenska "$@"
    ;;
  *)
    echo "usage: $0 {chunks|preview|synth|concat|book} [reader args...]" >&2
    exit 2
    ;;
esac
